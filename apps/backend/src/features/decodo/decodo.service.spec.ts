import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { DecodoService } from './decodo.service';
import { SettingsService } from '../settings/settings.service';
import type { EffectiveConfig } from '../settings/settings.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeConfig(overrides: Partial<EffectiveConfig> = {}): EffectiveConfig {
  return {
    provider: 'claude',
    model: '',
    decodoApiKey: 'test-decodo-key',
    anthropicApiKey: '',
    openaiApiKey: '',
    geminiApiKey: '',
    ...overrides,
  };
}

/** Build a mock fetch Response that mimics Decodo v2 shape */
function makeDecodoFetch(content: unknown, status_code = 200): Response {
  return {
    ok: true,
    json: () => Promise.resolve({ results: [{ content, status_code }] }),
  } as unknown as Response;
}

function makePostListingJson(posts: Array<{ id: string; ups?: number; subreddit?: string }>) {
  return JSON.stringify({
    data: {
      children: posts.map((p) => ({
        data: {
          id: p.id,
          title: `Post ${p.id}`,
          subreddit: p.subreddit ?? 'test',
          author: 'user',
          ups: p.ups ?? 10,
          num_comments: 5,
          url: `https://reddit.com`,
          permalink: `/r/test/comments/${p.id}`,
          selftext: '',
          created_utc: 1700000000,
        },
      })),
    },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DecodoService', () => {
  let service: DecodoService;
  let settingsService: jest.Mocked<SettingsService>;
  let fetchSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecodoService,
        {
          provide: SettingsService,
          useValue: {
            getEffectiveConfig: jest.fn().mockResolvedValue(makeConfig()),
          },
        },
      ],
    }).compile();

    service = module.get<DecodoService>(DecodoService);
    settingsService = module.get(SettingsService);

    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    jest.clearAllMocks();
    fetchSpy.mockRestore();
  });

  // ---------------------------------------------------------------------------
  // scrape()
  // ---------------------------------------------------------------------------

  describe('scrape()', () => {
    it('sends Authorization: Basic ${apiKey} header', async () => {
      fetchSpy.mockResolvedValue(makeDecodoFetch('{"data":{"children":[]}}', 200));

      await service.scrape({ target: 'universal', url: 'https://reddit.com' });

      const headers = (fetchSpy.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
      expect(headers['Authorization']).toBe('Basic test-decodo-key');
    });

    it('defaults locale to "en" in the request body', async () => {
      fetchSpy.mockResolvedValue(makeDecodoFetch('{"data":{"children":[]}}', 200));

      await service.scrape({ target: 'universal', url: 'https://reddit.com' });

      const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
      expect(body.locale).toBe('en');
    });

    it('throws BadRequestException when decodoApiKey is empty', async () => {
      settingsService.getEffectiveConfig.mockResolvedValue(makeConfig({ decodoApiKey: '' }));

      await expect(
        service.scrape({ target: 'universal', url: 'https://reddit.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws HttpException with status 429 when upstream returns 429', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      } as unknown as Response);

      await expect(
        service.scrape({ target: 'universal', url: 'https://reddit.com' }),
      ).rejects.toMatchObject({ status: 429 });
    });

    it('throws ServiceUnavailableException when upstream returns a non-429 error', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as unknown as Response);

      await expect(
        service.scrape({ target: 'universal', url: 'https://reddit.com' }),
      ).rejects.toThrow(ServiceUnavailableException);
    });

    it('throws ServiceUnavailableException when response has no results array', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ error: 'something went wrong' }),
      } as unknown as Response);

      await expect(
        service.scrape({ target: 'universal', url: 'https://reddit.com' }),
      ).rejects.toThrow(ServiceUnavailableException);
    });

    it('includes headless in request body when provided', async () => {
      fetchSpy.mockResolvedValue(makeDecodoFetch('{"data":{"children":[]}}', 200));

      await service.scrape({
        target: 'universal',
        url: 'https://www.reddit.com/search.json?q=test',
        headless: 'html',
      });

      const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
      expect(body.headless).toBe('html');
    });

    it('returns { status, content, url, target } from results[0]', async () => {
      const content = '{"data":{"children":[]}}';
      fetchSpy.mockResolvedValue(makeDecodoFetch(content, 200));

      const result = await service.scrape({
        target: 'universal',
        url: 'https://www.reddit.com/search.json?q=test',
      });

      expect(result.status).toBe(200);
      expect(result.content).toBe(content);
      expect(result.url).toBe('https://www.reddit.com/search.json?q=test');
      expect(result.target).toBe('universal');
    });
  });

  // ---------------------------------------------------------------------------
  // searchReddit()
  // ---------------------------------------------------------------------------

  describe('searchReddit()', () => {
    it('sends headless: html for Reddit JSON search URLs', async () => {
      fetchSpy.mockResolvedValue(makeDecodoFetch(makePostListingJson([{ id: 'p1' }]), 200));

      await service.searchReddit({ query: 'test', timeRange: 'week' });

      const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
      expect(body.headless).toBe('html');
    });

    it('builds URL with encoded query and correct t= timeRange param', async () => {
      fetchSpy.mockResolvedValue(makeDecodoFetch(makePostListingJson([{ id: 'p1' }]), 200));

      await service.searchReddit({ query: 'hello world', timeRange: 'week' });

      const calledUrl: string = (fetchSpy.mock.calls[0][1] as RequestInit).body
        ? JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string).url
        : '';

      expect(calledUrl).toContain('hello%20world');
      expect(calledUrl).toContain('t=week');
    });

    it('passes target: universal to Decodo API', async () => {
      fetchSpy.mockResolvedValue(makeDecodoFetch(makePostListingJson([{ id: 'p1' }]), 200));

      await service.searchReddit({ query: 'test', timeRange: 'month' });

      const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
      expect(body.target).toBe('universal');
    });

    it('returns parsed posts from data.children', async () => {
      fetchSpy.mockResolvedValue(
        makeDecodoFetch(
          makePostListingJson([
            { id: 'abc', ups: 100 },
            { id: 'def', ups: 50 },
          ]),
          200,
        ),
      );

      const posts = await service.searchReddit({ query: 'test', timeRange: 'day' });

      expect(posts).toHaveLength(2);
      expect(posts[0].id).toBe('abc');
      expect(posts[1].id).toBe('def');
    });

    it('returns [] when content is unparseable', async () => {
      fetchSpy.mockResolvedValue(makeDecodoFetch('not valid json', 200));

      const posts = await service.searchReddit({ query: 'test', timeRange: 'week' });

      expect(posts).toEqual([]);
    });

    it('omits subreddit operator when subreddits param is empty', async () => {
      fetchSpy.mockResolvedValue(makeDecodoFetch(makePostListingJson([{ id: 'p1' }]), 200));

      await service.searchReddit({ query: 'react problems', timeRange: 'week' });

      const calledUrl: string = JSON.parse(
        (fetchSpy.mock.calls[0][1] as RequestInit).body as string,
      ).url;
      expect(calledUrl).not.toContain('subreddit%3A');
    });

    it('strips `r/` prefix from subreddit names before building the OR clause', async () => {
      fetchSpy.mockResolvedValue(makeDecodoFetch(makePostListingJson([{ id: 'p1' }]), 200));

      await service.searchReddit({
        query: 'ai coding tools',
        timeRange: 'month',
        subreddits: ['r/programming', '/r/webdev', 'MachineLearning'],
      });

      const calledUrl: string = JSON.parse(
        (fetchSpy.mock.calls[0][1] as RequestInit).body as string,
      ).url;
      const decoded = decodeURIComponent(calledUrl);

      // No double r/ in the clause
      expect(decoded).not.toContain('subreddit:r/');
      expect(decoded).toContain('subreddit:programming');
      expect(decoded).toContain('subreddit:webdev');
      expect(decoded).toContain('subreddit:MachineLearning');
    });

    it('appends `subreddit:` OR clause when subreddits param is provided', async () => {
      fetchSpy.mockResolvedValue(makeDecodoFetch(makePostListingJson([{ id: 'p1' }]), 200));

      await service.searchReddit({
        query: 'react problems',
        timeRange: 'year',
        subreddits: ['reactjs', 'webdev'],
      });

      const calledUrl: string = JSON.parse(
        (fetchSpy.mock.calls[0][1] as RequestInit).body as string,
      ).url;

      const decoded = decodeURIComponent(calledUrl);
      expect(decoded).toContain('react problems');
      expect(decoded).toContain('(subreddit:reactjs OR subreddit:webdev)');
    });

    it('maps Reddit field names: ups→upvotes, num_comments→commentCount, created_utc→createdAt', async () => {
      const content = JSON.stringify({
        data: {
          children: [
            {
              data: {
                id: 'mapped',
                title: 'Mapping test',
                subreddit: 'test',
                author: 'user',
                ups: 999,
                num_comments: 77,
                url: 'https://reddit.com',
                permalink: '/r/test/comments/mapped',
                selftext: 'body',
                created_utc: 1700001234,
              },
            },
          ],
        },
      });
      fetchSpy.mockResolvedValue(makeDecodoFetch(content, 200));

      const posts = await service.searchReddit({ query: 'test', timeRange: 'week' });

      expect(posts[0].upvotes).toBe(999);
      expect(posts[0].commentCount).toBe(77);
      expect(posts[0].createdAt).toBe(1700001234);
    });
  });

  // ---------------------------------------------------------------------------
  // scrapeSubreddit()
  // ---------------------------------------------------------------------------

  describe('scrapeSubreddit()', () => {
    it('handles content as an already-parsed object (not a JSON string)', async () => {
      const parsedObject = {
        data: {
          children: [
            {
              data: {
                id: 'obj1',
                title: 'Object post',
                subreddit: 'programming',
                author: 'user',
                ups: 200,
                num_comments: 10,
                url: 'https://reddit.com',
                permalink: '/r/programming/comments/obj1',
                selftext: '',
                created_utc: 1700000000,
              },
            },
          ],
        },
      };

      // content is already a parsed object, not a string
      fetchSpy.mockResolvedValue(makeDecodoFetch(parsedObject, 200));

      const posts = await service.scrapeSubreddit({ subreddit: 'programming' });

      expect(posts).toHaveLength(1);
      expect(posts[0].id).toBe('obj1');
      expect(posts[0].subreddit).toBe('programming');
    });

    it('returns posts from data.children', async () => {
      fetchSpy.mockResolvedValue(
        makeDecodoFetch(makePostListingJson([{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }]), 200),
      );

      const posts = await service.scrapeSubreddit({ subreddit: 'javascript' });

      expect(posts).toHaveLength(3);
      expect(posts.map((p) => p.id)).toEqual(['r1', 'r2', 'r3']);
    });

    it('builds hot.json URL and uses universal target with headless html', async () => {
      fetchSpy.mockResolvedValue(makeDecodoFetch(makePostListingJson([{ id: 'r1' }]), 200));

      await service.scrapeSubreddit({ subreddit: 'javascript' });

      const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
      expect(body.target).toBe('universal');
      expect(body.headless).toBe('html');
      expect(body.url).toContain('/r/javascript/hot.json');
    });

    it('strips `r/` prefix from subreddit param so URL is not /r/r/foo', async () => {
      fetchSpy.mockResolvedValue(makeDecodoFetch(makePostListingJson([{ id: 'r1' }]), 200));

      await service.scrapeSubreddit({ subreddit: 'r/programming' });

      const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
      expect(body.url).toContain('/r/programming/hot.json');
      expect(body.url).not.toContain('/r/r/');
    });

    it('throws ServiceUnavailableException when Reddit returns an HTML block page', async () => {
      fetchSpy.mockResolvedValue(
        makeDecodoFetch('<!DOCTYPE html><html><body>Access denied</body></html>', 200),
      );

      await expect(service.scrapeSubreddit({ subreddit: 'programming' })).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });

  // ---------------------------------------------------------------------------
  // scrapePost()
  // ---------------------------------------------------------------------------

  describe('scrapePost()', () => {
    it('uses target: universal in the request body (NOT reddit_post)', async () => {
      const postJson = JSON.stringify([
        {
          data: {
            children: [
              {
                data: {
                  id: 'post1',
                  title: 'Test Post',
                  subreddit: 'test',
                  author: 'user',
                  ups: 99,
                  num_comments: 7,
                  url: 'https://reddit.com',
                  permalink: '/r/test/comments/post1',
                  selftext: 'body text',
                  created_utc: 1700000000,
                },
              },
            ],
          },
        },
        { data: { children: [] } },
      ]);

      fetchSpy.mockResolvedValue(makeDecodoFetch(postJson, 200));

      await service.scrapePost({ subreddit: 'test', postId: 'post1' });

      const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
      expect(body.target).toBe('universal');
      expect(body.headless).toBe('html');
    });

    it('returns { id: postId, comments: [] } when status is 404', async () => {
      fetchSpy.mockResolvedValue(makeDecodoFetch('', 404));

      const result = await service.scrapePost({ subreddit: 'test', postId: 'missing-post' });

      expect(result.id).toBe('missing-post');
      expect(result.comments).toEqual([]);
    });

    it('builds URL containing postId in the path', async () => {
      const postJson = JSON.stringify([
        {
          data: {
            children: [
              {
                data: {
                  id: 'abc123',
                  title: 'T',
                  subreddit: 'test',
                  author: 'u',
                  ups: 1,
                  num_comments: 0,
                  url: '',
                  permalink: '',
                  selftext: '',
                  created_utc: 0,
                },
              },
            ],
          },
        },
        { data: { children: [] } },
      ]);
      fetchSpy.mockResolvedValue(makeDecodoFetch(postJson, 200));

      await service.scrapePost({ subreddit: 'test', postId: 'abc123' });

      const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
      expect(body.url).toContain('abc123');
    });

    it('filters out comments that have no body field', async () => {
      const postJson = JSON.stringify([
        {
          data: {
            children: [
              {
                data: {
                  id: 'p1',
                  title: 'Post',
                  subreddit: 'test',
                  author: 'user',
                  ups: 10,
                  num_comments: 3,
                  url: '',
                  permalink: '',
                  selftext: '',
                  created_utc: 0,
                },
              },
            ],
          },
        },
        {
          data: {
            children: [
              {
                data: { id: 'c1', author: 'a', body: 'Valid comment', ups: 5, permalink: '/c/c1' },
              },
              { data: { id: 'c2', author: 'b', ups: 1, permalink: '/c/c2' } }, // no body
              {
                data: { id: 'c3', author: 'c', body: 'Another valid', ups: 2, permalink: '/c/c3' },
              },
            ],
          },
        },
      ]);
      fetchSpy.mockResolvedValue(makeDecodoFetch(postJson, 200));

      const result = await service.scrapePost({ subreddit: 'test', postId: 'p1' });

      expect(result.comments).toHaveLength(2);
      expect(result.comments.map((c) => c.id)).toEqual(['c1', 'c3']);
    });

    it('parses post + comments from two-element array response when status is 200', async () => {
      const postJson = JSON.stringify([
        {
          data: {
            children: [
              {
                data: {
                  id: 'post2',
                  title: 'Real Post',
                  subreddit: 'news',
                  author: 'journalist',
                  ups: 500,
                  num_comments: 3,
                  url: 'https://reddit.com/r/news/comments/post2',
                  permalink: '/r/news/comments/post2',
                  selftext: 'Some content',
                  created_utc: 1700000001,
                },
              },
            ],
          },
        },
        {
          data: {
            children: [
              {
                data: {
                  id: 'c1',
                  author: 'commenter',
                  body: 'Great post!',
                  ups: 10,
                  permalink: '/r/news/comments/post2/c1',
                },
              },
              {
                data: {
                  id: 'c2',
                  author: 'commenter2',
                  body: 'Interesting.',
                  ups: 5,
                  permalink: '/r/news/comments/post2/c2',
                },
              },
            ],
          },
        },
      ]);

      fetchSpy.mockResolvedValue(makeDecodoFetch(postJson, 200));

      const result = await service.scrapePost({ subreddit: 'news', postId: 'post2' });

      expect(result.id).toBe('post2');
      expect(result.title).toBe('Real Post');
      expect(result.upvotes).toBe(500);
      expect(result.comments).toHaveLength(2);
      expect(result.comments[0].id).toBe('c1');
      expect(result.comments[0].body).toBe('Great post!');
      expect(result.comments[1].id).toBe('c2');
    });
  });
});
