import { Test, TestingModule } from '@nestjs/testing';
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

function makePost(id: string, upvotes = 10, subreddit = 'test'): RedditPost {
  return {
    id,
    title: `Post ${id}`,
    subreddit,
    author: 'user',
    upvotes,
    commentCount: 3,
    url: `https://reddit.com/r/${subreddit}/comments/${id}`,
    permalink: `/r/${subreddit}/comments/${id}`,
    selftext: '',
    createdAt: 1700000000,
  };
}

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

    it('calls searchReddit for each query and scrapeSubreddit for each subreddit', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);
      decodoService.searchReddit.mockResolvedValue([makePost('s1')]);
      decodoService.scrapeSubreddit.mockResolvedValue([makePost('r1')]);

      await service.analyzePlan(baseDto);

      expect(decodoService.searchReddit).toHaveBeenCalledTimes(1);
      expect(decodoService.searchReddit).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'react performance tips' }),
      );
      expect(decodoService.scrapeSubreddit).toHaveBeenCalledTimes(2);
      expect(decodoService.scrapeSubreddit).toHaveBeenCalledWith(
        expect.objectContaining({ subreddit: 'reactjs' }),
      );
      expect(decodoService.scrapeSubreddit).toHaveBeenCalledWith(
        expect.objectContaining({ subreddit: 'webdev' }),
      );
    });

    it('returns { id, posts, report } with id from QueriesService.create', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);
      decodoService.searchReddit.mockResolvedValue([makePost('s1')]);
      decodoService.scrapeSubreddit.mockResolvedValue([]);

      const result = await service.analyzePlan(baseDto);

      expect(result.id).toBe('test-id-123');
      expect(result.report).toBe(mockReport);
      expect(Array.isArray(result.posts)).toBe(true);
    });

    it('deduplicates posts with the same id', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      // Same post id returned by both search and subreddit
      const sharedPost = makePost('shared', 50, 'reactjs');
      decodoService.searchReddit.mockResolvedValue([sharedPost]);
      decodoService.scrapeSubreddit.mockResolvedValue([sharedPost]);

      decodoService.scrapePost.mockResolvedValue({ ...sharedPost, comments: [] });

      const result = await service.analyzePlan(baseDto);

      const ids = result.posts.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
      expect(ids.filter((id) => id === 'shared')).toHaveLength(1);
    });

    it('prefers search result posts for deep dive over higher-upvote subreddit posts', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      const searchPost1 = makePost('s1', 10, 'reactjs');
      const searchPost2 = makePost('s2', 20, 'reactjs');
      // Subreddit posts have much higher upvotes but are not search results
      const subredditPost1 = makePost('r1', 9999, 'reactjs');
      const subredditPost2 = makePost('r2', 8888, 'reactjs');

      decodoService.searchReddit.mockResolvedValue([searchPost1, searchPost2]);
      decodoService.scrapeSubreddit.mockResolvedValue([subredditPost1, subredditPost2]);
      decodoService.scrapePost.mockResolvedValue({ ...searchPost1, comments: [] });

      await service.analyzePlan(baseDto);

      const scrapePostCalls = decodoService.scrapePost.mock.calls.map((call) => call[0].postId);

      // Deep dive should use search post ids, not the high-upvote subreddit posts
      expect(scrapePostCalls).toContain('s1');
      expect(scrapePostCalls).toContain('s2');
      expect(scrapePostCalls).not.toContain('r1');
      expect(scrapePostCalls).not.toContain('r2');
    });

    it('falls back to all posts for deep dive when search returns no results', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      const subredditPost1 = makePost('r1', 500, 'reactjs');
      const subredditPost2 = makePost('r2', 300, 'reactjs');

      decodoService.searchReddit.mockResolvedValue([]); // no search results
      decodoService.scrapeSubreddit
        .mockResolvedValueOnce([subredditPost1])
        .mockResolvedValueOnce([subredditPost2]);

      decodoService.scrapePost.mockResolvedValue({ ...subredditPost1, comments: [] });

      await service.analyzePlan(baseDto);

      const scrapePostCalls = decodoService.scrapePost.mock.calls.map((call) => call[0].postId);

      // Falls back to subreddit posts
      expect(scrapePostCalls.length).toBeGreaterThan(0);
      expect(scrapePostCalls.some((id) => id === 'r1' || id === 'r2')).toBe(true);
    });

    it('deduplicates posts and sorts remaining ones by upvotes descending', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      const posts = [
        makePost('p1', 100, 'reactjs'),
        makePost('p2', 500, 'webdev'),
        makePost('p1', 100, 'reactjs'), // duplicate
        makePost('p3', 200, 'reactjs'),
      ];

      decodoService.searchReddit.mockResolvedValue(posts);
      decodoService.scrapeSubreddit.mockResolvedValue([]);
      decodoService.scrapePost.mockResolvedValue({ ...makePost('p2'), comments: [] });

      const result = await service.analyzePlan(baseDto);

      const ids = result.posts.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length); // no duplicates
      expect(ids[0]).toBe('p2'); // highest upvotes first
      expect(ids[1]).toBe('p3');
      expect(ids[2]).toBe('p1');
    });

    it('caps total collected posts at MAX_POSTS_TOTAL (30)', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      // 20 unique search posts + 20 unique subreddit posts per sub = 60 total, capped at 30
      const searchPosts = Array.from({ length: 20 }, (_, i) => makePost(`s${i}`, i, 'reactjs'));
      const subredditPosts = Array.from({ length: 20 }, (_, i) =>
        makePost(`r${i}`, i + 100, 'webdev'),
      );

      decodoService.searchReddit.mockResolvedValue(searchPosts);
      decodoService.scrapeSubreddit.mockResolvedValue(subredditPosts);
      decodoService.scrapePost.mockResolvedValue({ ...makePost('s0'), comments: [] });

      const result = await service.analyzePlan(baseDto);

      expect(result.posts.length).toBeLessThanOrEqual(30);
    });

    it('deep-dives at most MAX_POSTS_DEEP_DIVE (8) posts', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      // 12 unique search results — only 8 should get deep-dived
      const searchPosts = Array.from({ length: 12 }, (_, i) => makePost(`s${i}`, i, 'reactjs'));

      decodoService.searchReddit.mockResolvedValue(searchPosts);
      decodoService.scrapeSubreddit.mockResolvedValue([]);
      decodoService.scrapePost.mockResolvedValue({ ...makePost('s0'), comments: [] });

      await service.analyzePlan(baseDto);

      expect(decodoService.scrapePost).toHaveBeenCalledTimes(8);
    });

    it('filters out posts with empty id during deduplication', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      const postsWithEmpty = [
        makePost('valid1', 10),
        { ...makePost('empty', 5), id: '' },
        makePost('valid2', 20),
        { ...makePost('empty2', 3), id: '' },
      ];

      decodoService.searchReddit.mockResolvedValue(postsWithEmpty);
      decodoService.scrapeSubreddit.mockResolvedValue([]);
      decodoService.scrapePost.mockResolvedValue({ ...makePost('valid2'), comments: [] });

      const result = await service.analyzePlan(baseDto);

      expect(result.posts.every((p) => p.id !== '')).toBe(true);
      expect(result.posts).toHaveLength(2);
    });

    it('calls QueriesService.create with { prompt, plan, posts, report }', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);
      decodoService.searchReddit.mockResolvedValue([makePost('s1')]);
      decodoService.scrapeSubreddit.mockResolvedValue([]);

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

    it('handles individual scraping errors gracefully and continues with partial results', async () => {
      llmService.parseJsonResponse.mockReturnValue(mockReport);

      // One query throws, others succeed
      const dtoMultiQuery: AnalyzePlanDto = {
        ...baseDto,
        queries: ['query-ok', 'query-fail', 'query-ok-2'],
        subreddits: ['reactjs'],
      };

      decodoService.searchReddit
        .mockResolvedValueOnce([makePost('ok1')])
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([makePost('ok2')]);

      decodoService.scrapeSubreddit.mockResolvedValue([]);
      decodoService.scrapePost.mockResolvedValue({ ...makePost('ok1'), comments: [] });

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
      decodoService.scrapeSubreddit.mockImplementation(trackingTask);

      const dto: AnalyzePlanDto = {
        prompt: 'Concurrency test',
        subreddits: ['sub1', 'sub2', 'sub3', 'sub4', 'sub5'],
        queries: ['q1', 'q2', 'q3', 'q4', 'q5'],
        timeRange: 'week',
      };

      // Total tasks = 5 queries + 5 subreddits = 10
      await service.analyzePlan(dto);

      expect(maxConcurrency).toBeLessThanOrEqual(4);
    });
  });
});
