import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import type {
  DecodoScrapeRequest,
  DecodoScrapeResponse,
  DecodoTarget,
  RedditPost,
  RedditComment,
  RedditPostWithComments,
  ScrapeSearchParams,
  ScrapeSubredditParams,
  ScrapePostParams,
} from './decodo.types';

@Injectable()
export class DecodoService {
  private readonly logger = new Logger(DecodoService.name);

  constructor(private readonly settingsService: SettingsService) {}

  // ---------------------------------------------------------------------------
  // Core Decodo API call
  // ---------------------------------------------------------------------------

  async scrape(request: DecodoScrapeRequest): Promise<DecodoScrapeResponse> {
    const config = await this.settingsService.getEffectiveConfig();
    const { decodoApiKey } = config;

    if (!decodoApiKey) {
      throw new BadRequestException('DECODO_API_KEY is not configured');
    }

    this.logger.log(`Scraping [${request.target}] ${request.url}`);

    const response = await fetch('https://scraper-api.decodo.com/v2/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${decodoApiKey}`,
      },
      body: JSON.stringify({
        target: request.target,
        url: request.url,
        locale: request.locale ?? 'en',
      }),
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Decodo API error: ${response.status} ${response.statusText}`,
      );
    }

    // Decodo v2 response: { results: [{ content, status_code, ... }] }
    const raw = (await response.json()) as Record<string, unknown>;
    const results = raw['results'] as Array<{ content: string; status_code: number }> | undefined;
    const first = results?.[0];

    if (!first) {
      this.logger.warn(
        `[Decodo] Unexpected response shape (keys: ${Object.keys(raw).join(', ')}): ` +
        JSON.stringify(raw).slice(0, 300),
      );
      throw new ServiceUnavailableException('Decodo API returned unexpected response structure');
    }

    const contentType = typeof first.content;
    const contentPreview =
      contentType === 'string'
        ? `${(first.content as string).length} chars`
        : `[${contentType}] ${JSON.stringify(first.content).slice(0, 120)}`;

    this.logger.log(
      `[Decodo] ✓ ${request.target} status=${first.status_code} content=${contentPreview}`,
    );

    return {
      status: first.status_code,
      url: request.url,
      content: first.content as unknown,
      target: request.target,
    };
  }

  // ---------------------------------------------------------------------------
  // Target: universal — global Reddit search
  // ---------------------------------------------------------------------------

  async searchReddit(params: ScrapeSearchParams): Promise<RedditPost[]> {
    const { query, timeRange, limit = 25 } = params;
    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.reddit.com/search.json?q=${encodedQuery}&sort=relevance&t=${timeRange}&limit=${limit}`;

    const result = await this.scrape({ target: 'universal', url });
    return this.parsePostListing(result.content as string | object, 'universal');
  }

  // ---------------------------------------------------------------------------
  // Target: reddit_subreddit — subreddit feed
  // ---------------------------------------------------------------------------

  async scrapeSubreddit(params: ScrapeSubredditParams): Promise<RedditPost[]> {
    const { subreddit, limit = 25 } = params;
    const url = `https://www.reddit.com/r/${subreddit}.json?sort=hot&limit=${limit}`;

    const result = await this.scrape({ target: 'reddit_subreddit', url });
    return this.parsePostListing(result.content as string | object, 'reddit_subreddit');
  }

  // ---------------------------------------------------------------------------
  // Target: reddit_post — full comment thread
  // ---------------------------------------------------------------------------

  async scrapePost(params: ScrapePostParams): Promise<RedditPostWithComments> {
    const { subreddit, postId } = params;
    const url = `https://www.reddit.com/r/${subreddit}/comments/${postId}.json`;

    // Use universal target: reddit_post returns 404 for .json URLs;
    // universal fetches the raw JSON string which our parser already handles correctly.
    const result = await this.scrape({ target: 'universal', url });

    if (result.status !== 200) {
      this.logger.warn(`[scrapePost] Skipping post ${postId} — status ${result.status}`);
      return { id: postId, title: '', subreddit, author: '', upvotes: 0, commentCount: 0, url, permalink: '', selftext: '', createdAt: 0, comments: [] };
    }

    return this.parsePostWithComments(result.content as string | object);
  }

  // ---------------------------------------------------------------------------
  // Parsers
  // ---------------------------------------------------------------------------

  private parseContent<T>(content: string | object): T {
    if (typeof content === 'string') {
      return JSON.parse(content) as T;
    }
    return content as T;
  }

  private parsePostListing(
    content: string | object,
    _target: DecodoTarget,
  ): RedditPost[] {
    try {
      const json = this.parseContent<{
        data?: {
          children?: Array<{ data: Record<string, unknown> }>;
        };
      }>(content);

      const children = json?.data?.children ?? [];
      this.logger.log(`[Parser] parsePostListing found ${children.length} children`);
      return children.map((child) => this.mapPost(child.data));
    } catch (err) {
      this.logger.warn(`Failed to parse post listing: ${String(err)}`);
      return [];
    }
  }

  private parsePostWithComments(content: string | object): RedditPostWithComments {
    try {
      const json = this.parseContent<Array<{
        data?: { children?: Array<{ data: Record<string, unknown> }> };
      }>>(content);

      const [postListing, commentListing] = json;
      const postData = postListing?.data?.children?.[0]?.data ?? {};
      const post = this.mapPost(postData);

      const comments = (commentListing?.data?.children ?? [])
        .filter((c) => c.data?.body)
        .map((c) => this.mapComment(c.data));

      return { ...post, comments };
    } catch (err) {
      this.logger.warn(`Failed to parse post with comments: ${String(err)}`);
      return {
        id: '',
        title: '',
        subreddit: '',
        author: '',
        upvotes: 0,
        commentCount: 0,
        url: '',
        permalink: '',
        selftext: '',
        createdAt: 0,
        comments: [],
      };
    }
  }

  private mapPost(data: Record<string, unknown>): RedditPost {
    const permalink = String(data['permalink'] ?? '');
    return {
      id: String(data['id'] ?? ''),
      title: String(data['title'] ?? ''),
      subreddit: String(data['subreddit'] ?? ''),
      author: String(data['author'] ?? ''),
      upvotes: Number(data['ups'] ?? 0),
      commentCount: Number(data['num_comments'] ?? 0),
      url: String(data['url'] ?? ''),
      permalink,
      selftext: String(data['selftext'] ?? ''),
      createdAt: Number(data['created_utc'] ?? 0),
    };
  }

  private mapComment(data: Record<string, unknown>): RedditComment {
    return {
      id: String(data['id'] ?? ''),
      author: String(data['author'] ?? ''),
      body: String(data['body'] ?? ''),
      upvotes: Number(data['ups'] ?? 0),
      permalink: String(data['permalink'] ?? ''),
    };
  }
}
