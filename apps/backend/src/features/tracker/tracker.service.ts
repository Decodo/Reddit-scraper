import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { DecodoService } from '../decodo/decodo.service';
import { QueriesService } from '../queries/queries.service';
import {
  SCRAPING_PLAN_PROMPT,
  SUMMARIZATION_PROMPT,
} from '../llm/llm.constants';
import type { ScrapingPlan, RedditReport } from '../llm/llm.types';
import type { RedditPost, RedditPostWithComments } from '../decodo/decodo.types';
import type { GeneratePlanDto } from './dto/generate-plan.dto';
import type { AnalyzePlanDto } from './dto/analyze-plan.dto';

const MAX_POSTS_TOTAL = 30;
const MAX_POSTS_DEEP_DIVE = 8;
const SCRAPE_CONCURRENCY = 4; // max simultaneous Decodo requests to avoid 429s

// ---------------------------------------------------------------------------
// Progress streaming types
// ---------------------------------------------------------------------------

export type ProgressEvent =
  | { type: 'started'; totalTasks: number; queries: number; subreddits: number }
  | { type: 'task_complete'; completed: number; total: number; label: string }
  | { type: 'deep_diving'; posts: number }
  | { type: 'summarizing' }
  | { type: 'saving' };

export type OnProgress = (event: ProgressEvent) => void;

@Injectable()
export class TrackerService {
  private readonly logger = new Logger(TrackerService.name);

  constructor(
    private readonly llmService: LlmService,
    private readonly decodoService: DecodoService,
    private readonly queriesService: QueriesService,
  ) {}

  // ---------------------------------------------------------------------------
  // Endpoint 1: generate a scraping plan from a natural language prompt
  // ---------------------------------------------------------------------------

  async generatePlan(dto: GeneratePlanDto): Promise<ScrapingPlan> {
    this.logger.log(`[Plan] ▶ Generating plan for: "${dto.prompt}"`);
    const t0 = Date.now();

    const userMessage = [
      `User prompt: "${dto.prompt}"`,
      dto.subreddits?.length
        ? `User-specified subreddits (must include these): ${dto.subreddits.join(', ')}`
        : '',
      dto.timeRange
        ? `User-specified time range: ${dto.timeRange}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    const response = await this.llmService.complete({
      messages: [
        { role: 'user', content: SCRAPING_PLAN_PROMPT },
        { role: 'user', content: userMessage },
      ],
      responseFormat: 'json',
    });

    const plan = this.llmService.parseJsonResponse<ScrapingPlan>(
      response.content,
    );

    // Honour any user overrides
    if (dto.subreddits?.length) {
      const userSubs = dto.subreddits.map((s) => s.toLowerCase());
      const merged = [...new Set([...userSubs, ...plan.subreddits])];
      plan.subreddits = merged;
    }

    if (dto.timeRange) {
      plan.timeRange = dto.timeRange;
    }

    this.logger.log(
      `[Plan] ✓ Done in ${Date.now() - t0}ms — ` +
      `subreddits: [${plan.subreddits.join(', ')}] ` +
      `queries: ${plan.queries.length} ` +
      `timeRange: ${plan.timeRange}`,
    );
    this.logger.log(`[Plan] Rationale: ${plan.rationale}`);

    return plan;
  }

  // ---------------------------------------------------------------------------
  // Endpoint 2: execute the plan and return a summarized report
  // ---------------------------------------------------------------------------

  async analyzePlan(dto: AnalyzePlanDto, onProgress?: OnProgress, signal?: AbortSignal): Promise<{
    id: string;
    plan: AnalyzePlanDto;
    posts: RedditPost[];
    report: RedditReport;
  }> {
    const tTotal = Date.now();
    this.logger.log(
      `[Analyze] ▶ Starting — subreddits: [${dto.subreddits.join(', ')}] | queries: [${dto.queries.join(', ')}] | timeRange: ${dto.timeRange}`,
    );

    // Step 1: parallel scraping (concurrency-capped)
    this.logger.log(`[Analyze] Step 1/4 — Scraping (${dto.queries.length} searches + ${dto.subreddits.length} subreddit feeds, max ${SCRAPE_CONCURRENCY} concurrent)...`);
    const t1 = Date.now();
    const { posts, searchPostIds } = await this.scrapeAll(dto, onProgress, signal);
    this.logger.log(`[Analyze] Step 1/4 ✓ — ${posts.length} posts collected in ${Date.now() - t1}ms`);

    if (signal?.aborted) throw new Error('Request was cancelled');

    // Step 2: deep-dive comment threads — prefer search results (topically relevant)
    // over subreddit hot posts (high upvotes but often off-topic)
    const searchPosts = posts.filter((p) => searchPostIds.has(p.id));
    const deepDiveCandidates = searchPosts.length > 0 ? searchPosts : posts;
    const deepDivePosts = deepDiveCandidates.slice(0, MAX_POSTS_DEEP_DIVE);
    this.logger.log(`[Analyze] Step 2/4 — Deep-diving ${deepDivePosts.length} top posts for comments...`);
    onProgress?.({ type: 'deep_diving', posts: deepDivePosts.length });
    const t2 = Date.now();
    const postsWithComments = await this.deepDive(deepDivePosts, signal);
    const totalComments = postsWithComments.reduce((n, p) => n + p.comments.length, 0);
    this.logger.log(`[Analyze] Step 2/4 ✓ — ${totalComments} comments fetched in ${Date.now() - t2}ms`);

    if (signal?.aborted) throw new Error('Request was cancelled');

    // Step 3: LLM summarization
    this.logger.log(`[Analyze] Step 3/4 — Sending ${posts.length} posts to LLM for summarization...`);
    onProgress?.({ type: 'summarizing' });
    const t3 = Date.now();
    const report = await this.summarize(dto.prompt, posts, postsWithComments, signal);
    this.logger.log(`[Analyze] Step 3/4 ✓ — Report generated in ${Date.now() - t3}ms`);
    this.logger.log(`[Analyze] Report sentiment: ${report.sentiment.overall} | themes: ${report.themes.map((t) => t.title).join(', ')}`);

    // Step 4: persist to query history
    this.logger.log(`[Analyze] Step 4/4 — Persisting to MongoDB...`);
    onProgress?.({ type: 'saving' });
    const saved = await this.queriesService.create({
      prompt: dto.prompt,
      plan: {
        subreddits: dto.subreddits,
        queries: dto.queries,
        timeRange: dto.timeRange,
        rationale: '',
      },
      posts,
      report,
    });
    this.logger.log(`[Analyze] Step 4/4 ✓ — Saved as query ID: ${String(saved._id)}`);

    this.logger.log(`[Analyze] ✓ Complete in ${Date.now() - tTotal}ms`);

    return { id: String(saved._id), plan: dto, posts, report };
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  private async scrapeAll(dto: AnalyzePlanDto, onProgress?: OnProgress, signal?: AbortSignal): Promise<{
    posts: RedditPost[];
    searchPostIds: Set<string>;
  }> {
    const totalTasks = dto.queries.length + dto.subreddits.length;
    let completedTasks = 0;

    onProgress?.({ type: 'started', totalTasks, queries: dto.queries.length, subreddits: dto.subreddits.length });

    const searchTasks: (() => Promise<RedditPost[]>)[] = dto.queries.map(
      (query) => async () => {
        const result = await this.decodoService
          .searchReddit({ query, timeRange: dto.timeRange }, signal)
          .catch((err: unknown) => {
            if ((err as Error)?.name === 'AbortError') throw err;
            this.logger.warn(`Search query failed for "${query}": ${String(err)}`);
            return [] as RedditPost[];
          });
        onProgress?.({ type: 'task_complete', completed: ++completedTasks, total: totalTasks, label: `search: "${query}"` });
        return result;
      },
    );

    const subredditTasks: (() => Promise<RedditPost[]>)[] = dto.subreddits.map(
      (subreddit) => async () => {
        const result = await this.decodoService
          .scrapeSubreddit({ subreddit }, signal)
          .catch((err: unknown) => {
            if ((err as Error)?.name === 'AbortError') throw err;
            this.logger.warn(`Subreddit scrape failed for r/${subreddit}: ${String(err)}`);
            return [] as RedditPost[];
          });
        onProgress?.({ type: 'task_complete', completed: ++completedTasks, total: totalTasks, label: `r/${subreddit}` });
        return result;
      },
    );

    const allTasks = [...searchTasks, ...subredditTasks];
    const results = await TrackerService.runWithConcurrency(allTasks, SCRAPE_CONCURRENCY);

    const searchResults = results.slice(0, searchTasks.length).flat();
    const subredditResults = results.slice(searchTasks.length).flat();

    // IDs of search-result posts — used to prioritize deep-dive selection
    const searchPostIds = new Set(searchResults.map((p) => p.id).filter(Boolean));

    const all = [...searchResults, ...subredditResults];
    const ranked = this.deduplicateAndRank(all).slice(0, dto.maxPosts ?? MAX_POSTS_TOTAL);

    this.logger.log(
      `[Scrape] Search: ${searchResults.length} | Subreddits: ${subredditResults.length}` +
      ` → dedup+rank: ${ranked.length} (top: "${ranked[0]?.title?.slice(0, 60) ?? 'none'}")`,
    );

    return { posts: ranked, searchPostIds };
  }

  // Runs tasks with at most `concurrency` in-flight at a time to avoid 429s
  private static async runWithConcurrency<T>(
    tasks: (() => Promise<T>)[],
    concurrency: number,
  ): Promise<T[]> {
    const results: T[] = new Array(tasks.length) as T[];
    let next = 0;

    const worker = async (): Promise<void> => {
      while (next < tasks.length) {
        const i = next++;
        results[i] = await tasks[i]();
      }
    };

    const workers = Array.from(
      { length: Math.min(concurrency, tasks.length) },
      () => worker(),
    );
    await Promise.all(workers);
    return results;
  }

  private async deepDive(
    posts: RedditPost[],
    signal?: AbortSignal,
  ): Promise<RedditPostWithComments[]> {
    const tasks = posts.map((post) =>
      this.decodoService
        .scrapePost({ subreddit: post.subreddit, postId: post.id }, signal)
        .catch((err: unknown) => {
          if ((err as Error)?.name === 'AbortError') throw err;
          this.logger.warn(
            `Comment scrape failed for post ${post.id}: ${String(err)}`,
          );
          return { ...post, comments: [] };
        }),
    );

    return Promise.all(tasks);
  }

  private async summarize(
    prompt: string,
    posts: RedditPost[],
    postsWithComments: RedditPostWithComments[],
    signal?: AbortSignal,
  ): Promise<RedditReport> {
    const contentSummary = this.buildContentSummary(posts, postsWithComments);

    const userMessage = [
      `Research prompt: "${prompt}"`,
      '',
      'Scraped Reddit content:',
      contentSummary,
    ].join('\n');

    const response = await this.llmService.complete({
      messages: [
        { role: 'user', content: SUMMARIZATION_PROMPT },
        { role: 'user', content: userMessage },
      ],
      responseFormat: 'json',
    }, signal);

    return this.llmService.parseJsonResponse<RedditReport>(response.content);
  }

  private buildContentSummary(
    posts: RedditPost[],
    postsWithComments: RedditPostWithComments[],
  ): string {
    const commentMap = new Map(postsWithComments.map((p) => [p.id, p]));

    return posts
      .map((post) => {
        const withComments = commentMap.get(post.id);
        const lines = [
          `POST: ${post.title}`,
          `Subreddit: r/${post.subreddit} | Upvotes: ${post.upvotes} | Comments: ${post.commentCount}`,
          `URL: https://www.reddit.com${post.permalink}`,
          post.selftext ? `Body: ${post.selftext.slice(0, 500)}` : '',
        ];

        if (withComments?.comments.length) {
          lines.push(
            'Top comments:',
            ...withComments.comments.slice(0, 5).map(
              (c) => `  - [${c.upvotes} upvotes] ${c.body.slice(0, 300)}`,
            ),
          );
        }

        return lines.filter(Boolean).join('\n');
      })
      .join('\n\n---\n\n');
  }

  private deduplicateAndRank(posts: RedditPost[]): RedditPost[] {
    const seen = new Set<string>();
    const unique: RedditPost[] = [];

    for (const post of posts) {
      if (post.id && !seen.has(post.id)) {
        seen.add(post.id);
        unique.push(post);
      }
    }

    return unique.sort((a, b) => b.upvotes - a.upvotes);
  }
}
