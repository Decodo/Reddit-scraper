import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { TrackerService } from './tracker.service';
import { LlmService } from '../llm/llm.service';
import { DecodoService } from '../decodo/decodo.service';
import { QueriesService } from '../queries/queries.service';
import type { RedditPost } from '../decodo/decodo.types';
import type { ScrapingPlan, RedditReport } from '../llm/llm.types';
import type { GeneratePlanDto } from './dto/generate-plan.dto';
import type { AnalyzePlanDto } from './dto/analyze-plan.dto';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makePost(
  id: string,
  upvotes = 10,
  subreddit = 'test',
  title = `Post ${id}`,
  selftext = '',
): RedditPost {
  return {
    id,
    title,
    subreddit,
    author: 'user',
    upvotes,
    commentCount: 3,
    url: `https://reddit.com/r/${subreddit}/comments/${id}`,
    permalink: `/r/${subreddit}/comments/${id}`,
    selftext,
    createdAt: 1700000000,
  };
}

const onTopicTitle = 'react performance tips for production apps';

const mockReport: RedditReport = {
  executiveSummary: 'Summary of findings.',
  themes: [{ title: 'Theme 1', description: 'People discuss X' }],
  sentiment: { overall: 'neutral', rationale: 'Mixed opinions' },
  notableQuotes: [],
  topPosts: [],
};

const mockPlan: ScrapingPlan = {
  subreddits: ['programming', 'webdev'],
  queries: ['react hooks', 'nextjs performance'],
  timeRange: 'week',
  rationale: 'These subreddits discuss the topic',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TrackerService', () => {
  let service: TrackerService;
  let llmService: jest.Mocked<LlmService>;
  let decodoService: jest.Mocked<DecodoService>;
  let queriesService: jest.Mocked<QueriesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackerService,
        {
          provide: LlmService,
          useValue: {
            complete: jest.fn().mockResolvedValue({
              content: '{}',
              provider: 'claude',
              model: 'claude-sonnet',
            }),
            parseJsonResponse: jest.fn().mockReturnValue(mockPlan),
          },
        },
        {
          provide: DecodoService,
          useValue: {
            searchReddit: jest.fn().mockResolvedValue([]),
            scrapeSubreddit: jest.fn().mockResolvedValue([]),
            scrapePost: jest.fn().mockResolvedValue({ ...makePost('default'), comments: [] }),
          },
        },
        {
          provide: QueriesService,
          useValue: {
            create: jest.fn().mockResolvedValue({ _id: 'test-id-123' }),
          },
        },
      ],
    }).compile();

    service = module.get<TrackerService>(TrackerService);
    llmService = module.get(LlmService);
    decodoService = module.get(DecodoService);
    queriesService = module.get(QueriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // generatePlan()
  // ---------------------------------------------------------------------------

  describe('generatePlan()', () => {
    it('returns the plan from LLM response', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockPlan);

      const dto: GeneratePlanDto = { prompt: 'Tell me about React hooks' };
      const result = await service.generatePlan(dto);

      expect(llmService.complete).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({
        subreddits: expect.any(Array),
        queries: expect.any(Array),
        timeRange: expect.any(String),
      });
    });

    it('merges and deduplicates user-specified subreddits', async () => {
      llmService.parseJsonResponse.mockReturnValue({
        ...mockPlan,
        subreddits: ['programming', 'webdev'],
      });

      const dto: GeneratePlanDto = {
        prompt: 'React hooks best practices',
        subreddits: ['webdev', 'javascript'], // webdev overlaps with LLM result
      };

      const result = await service.generatePlan(dto);

      // Must contain all three unique subs, no duplicates
      expect(result.subreddits).toContain('webdev');
      expect(result.subreddits).toContain('javascript');
      expect(result.subreddits).toContain('programming');
      // No duplicates
      const unique = new Set(result.subreddits);
      expect(unique.size).toBe(result.subreddits.length);
    });

    it('overrides timeRange when user specifies it', async () => {
      llmService.parseJsonResponse.mockReturnValue({ ...mockPlan, timeRange: 'week' });

      const dto: GeneratePlanDto = {
        prompt: 'Recent React news',
        timeRange: 'day',
      };

      const result = await service.generatePlan(dto);

      expect(result.timeRange).toBe('day');
    });
  });

  // ---------------------------------------------------------------------------
  // analyzePlan()
  // ---------------------------------------------------------------------------

  describe('analyzePlan()', () => {
    const baseDto: AnalyzePlanDto = {
      prompt: 'Research React performance',
      subreddits: ['reactjs', 'webdev'],
      queries: ['react performance tips'],
      timeRange: 'week',
    };

    it('calls searchReddit once per plan query (site-wide, no subreddit scoping)', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);
      decodoService.searchReddit.mockResolvedValue([makePost('s1', 10, 'reactjs', onTopicTitle)]);

      await service.analyzePlan(baseDto);

      expect(decodoService.searchReddit).toHaveBeenCalledTimes(1);
      expect(decodoService.searchReddit).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'react performance tips' }),
        undefined,
      );
      expect(decodoService.scrapeSubreddit).not.toHaveBeenCalled();
    });

    it('returns { id, posts, report } with id from QueriesService.create', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);
      decodoService.searchReddit.mockResolvedValue([makePost('s1', 10, 'reactjs', onTopicTitle)]);

      const result = await service.analyzePlan(baseDto);

      expect(result.id).toBe('test-id-123');
      expect(result.report).toBe(mockReport);
      expect(Array.isArray(result.posts)).toBe(true);
    });

    it('deduplicates posts with the same id', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      // Same post id returned by both search and subreddit
      const sharedPost = makePost('shared', 50, 'reactjs', onTopicTitle);
      decodoService.searchReddit.mockResolvedValue([sharedPost, sharedPost]);

      decodoService.scrapePost.mockResolvedValue({ ...sharedPost, comments: [] });

      const result = await service.analyzePlan(baseDto);

      const ids = result.posts.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
      expect(ids.filter((id) => id === 'shared')).toHaveLength(1);
    });

    it('deep-dives search result posts', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      const searchPost1 = makePost('s1', 10, 'reactjs', onTopicTitle);
      const searchPost2 = makePost('s2', 20, 'reactjs', 'more react performance tips');

      decodoService.searchReddit.mockResolvedValue([searchPost1, searchPost2]);
      decodoService.scrapePost.mockResolvedValue({ ...searchPost1, comments: [] });

      await service.analyzePlan(baseDto);

      const scrapePostCalls = decodoService.scrapePost.mock.calls.map((call) => call[0].postId);
      expect(scrapePostCalls).toContain('s1');
      expect(scrapePostCalls).toContain('s2');
    });

    it('deduplicates posts and sorts remaining ones by upvotes descending', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      const posts = [
        makePost('p1', 100, 'reactjs', onTopicTitle),
        makePost('p2', 500, 'webdev', 'react performance tips benchmark'),
        makePost('p1', 100, 'reactjs', onTopicTitle), // duplicate
        makePost('p3', 200, 'reactjs', 'react performance tips checklist'),
      ];

      decodoService.searchReddit.mockResolvedValue(posts);
      decodoService.scrapePost.mockResolvedValue({
        ...makePost('p2', 500, 'webdev', 'react performance tips benchmark'),
        comments: [],
      });

      const result = await service.analyzePlan(baseDto);

      const ids = result.posts.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length); // no duplicates
      expect(ids[0]).toBe('p2'); // highest upvotes first
      expect(ids[1]).toBe('p3');
      expect(ids[2]).toBe('p1');
    });

    it('caps total collected posts at MAX_POSTS_TOTAL (30)', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      const searchPosts = Array.from({ length: 35 }, (_, i) =>
        makePost(`s${i}`, i, 'reactjs', `react performance tips #${i}`),
      );

      decodoService.searchReddit.mockResolvedValue(searchPosts);
      decodoService.scrapePost.mockResolvedValue({
        ...makePost('s0', 0, 'reactjs', 'react performance tips #0'),
        comments: [],
      });

      const result = await service.analyzePlan(baseDto);

      expect(result.posts.length).toBeLessThanOrEqual(30);
    });

    it('deep-dives at most MAX_POSTS_DEEP_DIVE (8) posts', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      // 12 unique search results — only 8 should get deep-dived
      const searchPosts = Array.from({ length: 12 }, (_, i) =>
        makePost(`s${i}`, i, 'reactjs', `react performance tips thread ${i}`),
      );

      decodoService.searchReddit.mockResolvedValue(searchPosts);
      decodoService.scrapePost.mockResolvedValue({
        ...makePost('s0', 0, 'reactjs', 'react performance tips thread 0'),
        comments: [],
      });

      await service.analyzePlan(baseDto);

      expect(decodoService.scrapePost).toHaveBeenCalledTimes(8);
    });

    it('filters out posts with empty id during deduplication', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      const postsWithEmpty = [
        makePost('valid1', 10, 'reactjs', onTopicTitle),
        { ...makePost('empty', 5, 'reactjs', onTopicTitle), id: '' },
        makePost('valid2', 20, 'reactjs', 'react performance tips guide'),
        { ...makePost('empty2', 3, 'reactjs', onTopicTitle), id: '' },
      ];

      decodoService.searchReddit.mockResolvedValue(postsWithEmpty);
      decodoService.scrapePost.mockResolvedValue({
        ...makePost('valid2', 20, 'reactjs', 'react performance tips guide'),
        comments: [],
      });

      const result = await service.analyzePlan(baseDto);

      expect(result.posts.every((p) => p.id !== '')).toBe(true);
      expect(result.posts).toHaveLength(2);
    });

    it('calls QueriesService.create with { prompt, plan, posts, report }', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);
      decodoService.searchReddit.mockResolvedValue([makePost('s1', 10, 'reactjs', onTopicTitle)]);

      await service.analyzePlan(baseDto);

      expect(queriesService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: baseDto.prompt,
          plan: expect.objectContaining({
            subreddits: baseDto.subreddits,
            queries: baseDto.queries,
            timeRange: baseDto.timeRange,
          }),
          posts: expect.any(Array),
          report: mockReport,
        }),
      );
    });

    it('drops off-topic posts that do not mention the search topic', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      const dramaPost = makePost('drama', 80000, 'AITAH', 'My roommate drama story');
      const onTopicPost = makePost('react1', 300, 'reactjs', onTopicTitle);

      decodoService.searchReddit.mockResolvedValue([dramaPost, onTopicPost]);
      decodoService.scrapePost.mockResolvedValue({ ...onTopicPost, comments: [] });

      const result = await service.analyzePlan(baseDto);

      const ids = result.posts.map((p) => p.id);
      expect(ids).toContain('react1');
      expect(ids).not.toContain('drama');
    });

    it('throws 404 when search returns only off-topic posts (e.g. subreddit hot noise)', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      const offTopic1 = makePost('o1', 100, 'cats', 'Cute cat photo');
      const offTopic2 = makePost('o2', 200, 'AITAH', 'AITAH relationship drama');

      decodoService.searchReddit.mockResolvedValue([offTopic1, offTopic2]);

      await expect(service.analyzePlan(baseDto)).rejects.toMatchObject({ status: 404 });
    });

    it('completes for nonsense product when only a generic query token matches (no false scrape failure)', async () => {
      const nonsenseReport: RedditReport = {
        ...mockReport,
        executiveSummary:
          'No meaningful Reddit presence for Zzyzxblorptron9000. Scraped posts discuss quantum physics, not this product.',
        sentiment: { overall: 'neutral', rationale: 'No product-specific discussion found.' },
        themes: [],
        notableQuotes: [],
        topPosts: [],
      };
      llmService.parseJsonResponse.mockReturnValue(nonsenseReport);

      const nonsenseDto: AnalyzePlanDto = {
        prompt: 'Sentiment for Zzyzxblorptron9000 quantum toaster on Reddit',
        subreddits: ['gadgets', 'shutupandtakemymoney'],
        queries: ['"Zzyzxblorptron9000"', 'quantum toaster', 'Zzyzxblorptron9000 review'],
        timeRange: 'year',
      };

      const quantumViral = makePost(
        'qviral',
        90000,
        'physics',
        'Quantum entanglement breakthrough — ELI5',
      );

      decodoService.searchReddit
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([quantumViral])
        .mockResolvedValueOnce([]);

      decodoService.scrapePost.mockResolvedValue({ ...quantumViral, comments: [] });

      const result = await service.analyzePlan(nonsenseDto);

      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].id).toBe('qviral');
      expect(llmService.complete).toHaveBeenCalled();
      expect(result.report.executiveSummary).toMatch(/no meaningful reddit presence/i);
    });

    it('finds product-specific posts via proper-noun topic extraction (Firecrawl)', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      const firecrawlDto: AnalyzePlanDto = {
        prompt: 'Give me sentiment for Firecrawl on reddit (positive, negative and neutral)',
        subreddits: ['webdev', 'SideProject'],
        queries: ['"Firecrawl"', 'Firecrawl review', 'Firecrawl scraping'],
        timeRange: 'year',
      };

      const onTopic = makePost('fc1', 42, 'webdev', 'Firecrawl vs alternatives for scraping');
      const offTopic = makePost('claude1', 9000, 'programming', 'Claude AI behavior rant');

      decodoService.searchReddit
        .mockResolvedValueOnce([onTopic])
        .mockResolvedValueOnce([onTopic, offTopic])
        .mockResolvedValueOnce([offTopic]);

      decodoService.scrapePost.mockResolvedValue({ ...onTopic, comments: [] });

      const result = await service.analyzePlan(firecrawlDto);

      expect(result.posts.every((p) => p.title.toLowerCase().includes('firecrawl'))).toBe(true);
      expect(result.posts.some((p) => p.id === 'claude1')).toBe(false);
    });

    it('throws HttpException 429 when all scrapes hit Decodo rate limit', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      const rateLimitErr = new HttpException('Decodo API error: 429 Too Many Requests', 429);
      decodoService.searchReddit.mockRejectedValue(rateLimitErr);

      await expect(service.analyzePlan(baseDto)).rejects.toMatchObject({ status: 429 });
      // LLM must not be called when scraping wiped out
      expect(llmService.complete).not.toHaveBeenCalled();
    });

    it('throws HttpException 502 when all scrapes fail for non-429 reasons', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      const genericErr = new Error('Network timeout');
      decodoService.searchReddit.mockRejectedValue(genericErr);

      await expect(service.analyzePlan(baseDto)).rejects.toMatchObject({ status: 502 });
    });

    it('throws HttpException 404 when scrapes succeed but return zero posts', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      // No failures, but every target returned an empty list
      decodoService.searchReddit.mockResolvedValue([]);

      await expect(service.analyzePlan(baseDto)).rejects.toMatchObject({ status: 404 });
    });

    it('handles individual scraping errors gracefully and continues with partial results', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      // One query throws, others succeed
      const dtoMultiQuery: AnalyzePlanDto = {
        ...baseDto,
        queries: ['react ok', 'query-fail', 'react ok 2'],
        subreddits: ['reactjs'],
      };

      decodoService.searchReddit
        .mockResolvedValueOnce([makePost('ok1', 10, 'reactjs', 'react ok thread')])
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([makePost('ok2', 10, 'reactjs', 'react ok 2 thread')]);

      decodoService.scrapePost.mockResolvedValue({
        ...makePost('ok1', 10, 'reactjs', 'react ok thread'),
        comments: [],
      });

      // Should not throw
      await expect(service.analyzePlan(dtoMultiQuery)).resolves.toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // runWithConcurrency (via scrapeAll)
  // ---------------------------------------------------------------------------

  describe('runWithConcurrency — via scrapeAll', () => {
    it('never exceeds SCRAPE_CONCURRENCY=4 concurrent in-flight tasks with 10 queries', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      let currentConcurrency = 0;
      let maxConcurrency = 0;

      const trackingTask = () =>
        new Promise<RedditPost[]>((resolve) => {
          currentConcurrency++;
          if (currentConcurrency > maxConcurrency) {
            maxConcurrency = currentConcurrency;
          }
          // Use setImmediate to yield control so other tasks can start
          setImmediate(() => {
            currentConcurrency--;
            resolve([]);
          });
        });

      decodoService.searchReddit.mockImplementation(trackingTask);

      const dto: AnalyzePlanDto = {
        prompt: 'Concurrency test',
        subreddits: ['sub1', 'sub2', 'sub3', 'sub4', 'sub5'],
        queries: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'],
        timeRange: 'week',
      };

      // 10 search queries. All resolve to [],
      // so analyzePlan throws 404 after scrapeAll — we only care about the
      // peak concurrency observed during scrapeAll, not the final outcome.
      await expect(service.analyzePlan(dto)).rejects.toThrow();

      expect(maxConcurrency).toBeLessThanOrEqual(4);
    });
  });
});
