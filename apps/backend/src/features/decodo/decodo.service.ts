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

    const data = (await response.json()) as { status: number; content: string };

    return {
      status: data.status,
      url: request.url,
      content: data.content,
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
    return this.parsePostListing(result.content, 'universal');
  }

  // ---------------------------------------------------------------------------
  // Target: reddit_subreddit — subreddit feed
  // ---------------------------------------------------------------------------

  async scrapeSubreddit(params: ScrapeSubredditParams): Promise<RedditPost[]> {
    const { subreddit, limit = 25 } = params;
    const url = `https://www.reddit.com/r/${subreddit}.json?sort=hot&limit=${limit}`;

    const result = await this.scrape({ target: 'reddit_subreddit', url });
    return this.parsePostListing(result.content, 'reddit_subreddit');
  }

  // ---------------------------------------------------------------------------
  // Target: reddit_post — full comment thread
  // ---------------------------------------------------------------------------

  async scrapePost(params: ScrapePostParams): Promise<RedditPostWithComments> {
    const { subreddit, postId } = params;
    const url = `https://www.reddit.com/r/${subreddit}/comments/${postId}.json`;

    const result = await this.scrape({ target: 'reddit_post', url });
    return this.parsePostWithComments(result.content);
  }

  // ---------------------------------------------------------------------------
  // Parsers
  // ---------------------------------------------------------------------------

  private parsePostListing(
    content: string,
    _target: DecodoTarget,
  ): RedditPost[] {
    try {
      const json = JSON.parse(content) as {
        data?: {
          children?: Array<{ data: Record<string, unknown> }>;
        };
      };

      const children = json?.data?.children ?? [];
      return children.map((child) => this.mapPost(child.data));
    } catch (err) {
      this.logger.warn(`Failed to parse post listing: ${String(err)}`);
      return [];
    }
  }

  private parsePostWithComments(content: string): RedditPostWithComments {
    try {
      const json = JSON.parse(content) as Array<{
        data?: { children?: Array<{ data: Record<string, unknown> }> };
      }>;

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
