import {
  Injectable,
  Logger,
  BadRequestException,
  HttpException,
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

// Strips "/r/", "r/", and surrounding whitespace from a subreddit name.
// LLM plan output occasionally includes the "r/" prefix; without this,
// URLs like /r/r/foo.json end up 404ing.
function normalizeSubreddit(name: string): string {
  return name.trim().replace(/^\/?r\//i, '');
}

@Injectable()
export class DecodoService {
  private readonly logger = new Logger(DecodoService.name);

  constructor(private readonly settingsService: SettingsService) {}

  // ---------------------------------------------------------------------------
  // Core Decodo API call
  // ---------------------------------------------------------------------------

  async scrape(request: DecodoScrapeRequest, signal?: AbortSignal): Promise<DecodoScrapeResponse> {
    const config = await this.settingsService.getEffectiveConfig();
    const { decodoApiKey } = config;

    if (!decodoApiKey) {
      throw new BadRequestException('DECODO_BASIC_AUTH_TOKEN is not configured');
    }

    this.logger.log(`Scraping [${request.target}] ${request.url}`);

    const response = await fetch('https://scraper-api.decodo.com/v2/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${decodoApiKey}`,
        'x-integration': 'reddit_tracker',
      },
      body: JSON.stringify({
        target: request.target,
        url: request.url,
        locale: request.locale ?? 'en',
        ...(request.headless ? { headless: request.headless } : {}),
      }),
      signal,
    });

    if (!response.ok) {
      const message = `Decodo API error: ${response.status} ${response.statusText}`;
      // Preserve 429 so callers can distinguish rate-limiting from other failures
      // and surface a more accurate error to the user.
      if (response.status === 429) {
        throw new HttpException(message, 429);
      }
      throw new ServiceUnavailableException(message);
    }

    // Decodo v2 response: { results: [{ content, status_code, ... }] }
    const raw = (await response.json()) as Record<string, unknown>;
    const results = raw['results'] as Array<{ content: string; status_code: number }> | undefined;
    const first = results?.[0];

    if (!first) {
      const decodoStatus = raw['status'];
      const decodoStatusCode = raw['status_code'];
      const decodoMessage = raw['message'];

      if (decodoStatus === 'failed') {
        const detail =
          typeof decodoMessage === 'string'
            ? decodoMessage
            : `status code ${String(decodoStatusCode ?? 'unknown')}`;
        this.logger.warn(`[Decodo] Scrape failed: ${detail}`);
        throw new ServiceUnavailableException(`Decodo scrape failed: ${detail}`);
      }

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

  async searchReddit(params: ScrapeSearchParams, signal?: AbortSignal): Promise<RedditPost[]> {
    const { query, timeRange, limit = 25, subreddits } = params;

    // When subreddits are provided, use Reddit's `subreddit:` operator to scope
    // the search. Without this, "react" matches r/AITAH/r/cats posts that
    // happen to contain "react"/"reacts"/"reaction" — viral drama drowns out
    // actual programming discussion.
    const normalizedSubs = subreddits?.map(normalizeSubreddit).filter(Boolean);
    const finalQuery = normalizedSubs?.length
      ? `${query} (${normalizedSubs.map((s) => `subreddit:${s}`).join(' OR ')})`
      : query;

    const encodedQuery = encodeURIComponent(finalQuery);
    const url = `https://www.reddit.com/search.json?q=${encodedQuery}&sort=relevance&t=${timeRange}&limit=${limit}`;

    const result = await this.scrape({ target: 'universal', url, headless: 'html' }, signal);
    return this.parsePostListing(result.content as string | object, 'universal', result.status);
  }

  // ---------------------------------------------------------------------------
  // Target: reddit_subreddit — subreddit feed
  // ---------------------------------------------------------------------------

  async scrapeSubreddit(
    params: ScrapeSubredditParams,
    signal?: AbortSignal,
  ): Promise<RedditPost[]> {
    const { limit = 25 } = params;
    const subreddit = normalizeSubreddit(params.subreddit);
    const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;

    const result = await this.scrape({ target: 'universal', url, headless: 'html' }, signal);
    return this.parsePostListing(result.content as string | object, 'universal', result.status);
  }

  // ---------------------------------------------------------------------------
  // Target: reddit_post — full comment thread
  // ---------------------------------------------------------------------------

  async scrapePost(
    params: ScrapePostParams,
    signal?: AbortSignal,
  ): Promise<RedditPostWithComments> {
    const { postId } = params;
    const subreddit = normalizeSubreddit(params.subreddit);
    const url = `https://www.reddit.com/r/${subreddit}/comments/${postId}.json`;

    // Use universal target: reddit_post returns 404 for .json URLs;
    // universal fetches the raw JSON string which our parser already handles correctly.
    const result = await this.scrape({ target: 'universal', url, headless: 'html' }, signal);

    if (result.status !== 200) {
      this.logger.warn(`[scrapePost] Skipping post ${postId} — status ${result.status}`);
      return {
        id: postId,
        title: '',
        subreddit,
        author: '',
        upvotes: 0,
        commentCount: 0,
        url,
        permalink: '',
        selftext: '',
        createdAt: 0,
        comments: [],
      };
    }

    return this.parsePostWithComments(result.content as string | object);
  }

  // ---------------------------------------------------------------------------
  // Parsers
  // ---------------------------------------------------------------------------

  private parseContent<T>(content: string | object): T {
    if (typeof content === 'string') {
      const trimmed = content.trim();
      if (this.looksLikeBlockedPage(trimmed)) {
        throw new ServiceUnavailableException(
          'Reddit returned a block page instead of JSON. Check your Decodo API key and quota.',
        );
      }
      return JSON.parse(trimmed) as T;
    }
    return content as T;
  }

  private looksLikeBlockedPage(content: string): boolean {
    if (!content) return false;
    const head = content.slice(0, 200).toLowerCase();
    return (
      head.startsWith('<!doctype') ||
      head.startsWith('<html') ||
      head.includes('<body') ||
      head.includes("you've been blocked") ||
      head.includes('access denied')
    );
  }

  private parsePostListing(
    content: string | object,
    _target: DecodoTarget,
    status = 200,
  ): RedditPost[] {
    try {
      if (status !== 200) {
        this.logger.warn(`[Parser] Skipping listing — HTTP status ${status}`);
        return [];
      }

      const json = this.parseContent<{
        data?: {
          children?: Array<{ data: Record<string, unknown> }>;
        };
      }>(content);

      const children = json?.data?.children ?? [];
      this.logger.log(`[Parser] parsePostListing found ${children.length} children`);
      return children.map((child) => this.mapPost(child.data));
    } catch (err) {
      if (err instanceof ServiceUnavailableException) throw err;
      this.logger.warn(`Failed to parse post listing: ${String(err)}`);
      return [];
    }
  }

  private parsePostWithComments(content: string | object): RedditPostWithComments {
    try {
      const json = this.parseContent<
        Array<{
          data?: { children?: Array<{ data: Record<string, unknown> }> };
        }>
      >(content);

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
