import { HttpException, Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { DecodoService } from '../decodo/decodo.service';
import { QueriesService } from '../queries/queries.service';
import { SCRAPING_PLAN_PROMPT, SUMMARIZATION_PROMPT } from '../llm/llm.constants';
import type { ScrapingPlan, RedditReport } from '../llm/llm.types';
import type { RedditPost, RedditPostWithComments } from '../decodo/decodo.types';
import type { GeneratePlanDto } from './dto/generate-plan.dto';
import type { AnalyzePlanDto } from './dto/analyze-plan.dto';

const MAX_POSTS_TOTAL = 30;
const MAX_POSTS_DEEP_DIVE = 8;
const SCRAPE_CONCURRENCY = 4; // max simultaneous Decodo requests to avoid 429s

// LLM plan output sometimes wraps subreddit names with "r/" — normalize so
// downstream URLs and `subreddit:` search clauses don't end up malformed.
function normalizeSubreddit(name: string): string {
  return name.trim().replace(/^\/?r\//i, '');
}

// Small stop-word filter for tokenization. Keep it minimal — we want to drop
// noise like "the"/"are"/"what" while preserving short topical tokens like "ai".
const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'but',
  'of',
  'in',
  'on',
  'at',
  'to',
  'for',
  'with',
  'from',
  'by',
  'as',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'am',
  'do',
  'does',
  'did',
  'has',
  'have',
  'had',
  'will',
  'would',
  'should',
  'can',
  'could',
  'may',
  'might',
  'must',
  'what',
  'when',
  'where',
  'why',
  'who',
  'which',
  'how',
  'that',
  'this',
  'these',
  'those',
  'it',
  'its',
  'they',
  'them',
  'their',
  'i',
  'you',
  'he',
  'she',
  'we',
  'us',
  'our',
  'your',
  'about',
  'if',
  'than',
  'then',
  'so',
  'not',
  'no',
  'yes',
  'too',
  'very',
  'just',
]);

const TOPIC_STOP_WORDS = new Set([
  ...STOP_WORDS,
  'reddit',
  'sentiment',
  'positive',
  'negative',
  'neutral',
  'mixed',
  'give',
  'get',
  'analysis',
  'analyze',
  'research',
  'report',
  'opinion',
  'opinions',
  'think',
  'thinking',
  'feel',
  'feeling',
  'discuss',
  'discussion',
  'people',
  'users',
  'community',
]);

function tokenize(text: string, extraStopWords: Set<string> = STOP_WORDS): Set<string> {
  const matches = text.toLowerCase().match(/\b[a-z0-9]{2,}\b/g) ?? [];
  return new Set(matches.filter((w) => !extraStopWords.has(w)));
}

function extractTopicTokens(prompt: string, queries: string[]): Set<string> {
  const tokens = new Set<string>();

  for (const query of queries) {
    for (const match of query.matchAll(/"([^"]+)"/g)) {
      for (const tok of tokenize(match[1], TOPIC_STOP_WORDS)) {
        tokens.add(tok);
      }
    }
    for (const tok of tokenize(query, TOPIC_STOP_WORDS)) {
      tokens.add(tok);
    }
  }

  for (const match of prompt.matchAll(/"([^"]+)"/g)) {
    for (const tok of tokenize(match[1], TOPIC_STOP_WORDS)) {
      tokens.add(tok);
    }
  }

  for (const match of prompt.matchAll(/\b[A-Z][a-zA-Z0-9]*(?:[A-Z][a-z]*)*\b/g)) {
    const tok = match[0].toLowerCase();
    if (tok.length >= 3 && !TOPIC_STOP_WORDS.has(tok)) {
      tokens.add(tok);
    }
  }

  return tokens;
}

// Returns a 0..1 score for how many topic tokens appear in the post.
function relevanceToTopics(topicTokens: Set<string>, post: RedditPost): number {
  if (topicTokens.size === 0) return 1;
  const postTokens = tokenize(`${post.title} ${post.selftext}`);
  let hits = 0;
  for (const tok of topicTokens) {
    if (postTokens.has(tok)) hits++;
  }
  return hits / topicTokens.size;
}

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
      dto.timeRange ? `User-specified time range: ${dto.timeRange}` : '',
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

    const plan = this.llmService.parseJsonResponse<ScrapingPlan>(response.content);

    // Normalize LLM output — strip any stray "r/" prefixes the model may include.
    plan.subreddits = plan.subreddits.map(normalizeSubreddit).filter(Boolean);

    // Honour any user overrides
    if (dto.subreddits?.length) {
      const userSubs = dto.subreddits.map((s) => normalizeSubreddit(s).toLowerCase());
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

  async analyzePlan(
    dto: AnalyzePlanDto,
    onProgress?: OnProgress,
    signal?: AbortSignal,
  ): Promise<{
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
    this.logger.log(
      `[Analyze] Step 1/4 — Scraping ${dto.queries.length} search queries (max ${SCRAPE_CONCURRENCY} concurrent)...`,
    );
    const t1 = Date.now();
    const { posts, searchPostIds, failures } = await this.scrapeAll(dto, onProgress, signal);
    this.logger.log(
      `[Analyze] Step 1/4 ✓ — ${posts.length} posts collected in ${Date.now() - t1}ms`,
    );

    if (signal?.aborted) throw new Error('Request was cancelled');

    // If scraping produced nothing, bail before wasting LLM tokens and saving a
    // useless empty report to history. Distinguish rate-limit, total-failure,
    // and "Reddit returned nothing" so the user gets an actionable message.
    if (posts.length === 0) {
      if (failures.length > 0) {
        const had429 = failures.some((e) => e instanceof HttpException && e.getStatus() === 429);
        if (had429) {
          throw new HttpException(
            'Decodo rate limit reached. Please wait a moment and try again.',
            429,
          );
        }
        throw new HttpException(
          'Reddit scraping failed for all targets. The Decodo service may be unavailable.',
          502,
        );
      }
      throw new HttpException(
        'No Reddit posts matched your topic. Try broader search queries or a wider time range.',
        404,
      );
    }

    // Step 2: deep-dive comment threads — prefer search results (topically relevant)
    // over subreddit hot posts (high upvotes but often off-topic)
    const searchPosts = posts.filter((p) => searchPostIds.has(p.id));
    const deepDiveCandidates = searchPosts.length > 0 ? searchPosts : posts;
    const deepDivePosts = deepDiveCandidates.slice(0, MAX_POSTS_DEEP_DIVE);
    this.logger.log(
      `[Analyze] Step 2/4 — Deep-diving ${deepDivePosts.length} top posts for comments...`,
    );
    onProgress?.({ type: 'deep_diving', posts: deepDivePosts.length });
    const t2 = Date.now();
    const postsWithComments = await this.deepDive(deepDivePosts, signal);
    const totalComments = postsWithComments.reduce((n, p) => n + p.comments.length, 0);
    this.logger.log(
      `[Analyze] Step 2/4 ✓ — ${totalComments} comments fetched in ${Date.now() - t2}ms`,
    );

    if (signal?.aborted) throw new Error('Request was cancelled');

    // Step 3: LLM summarization
    this.logger.log(
      `[Analyze] Step 3/4 — Sending ${posts.length} posts to LLM for summarization...`,
    );
    onProgress?.({ type: 'summarizing' });
    const t3 = Date.now();
    const report = await this.summarize(dto.prompt, posts, postsWithComments, signal);
    this.logger.log(`[Analyze] Step 3/4 ✓ — Report generated in ${Date.now() - t3}ms`);
    this.logger.log(
      `[Analyze] Report sentiment: ${report.sentiment.overall} | themes: ${report.themes.map((t) => t.title).join(', ')}`,
    );

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

  private async scrapeAll(
    dto: AnalyzePlanDto,
    onProgress?: OnProgress,
    signal?: AbortSignal,
  ): Promise<{
    posts: RedditPost[];
    searchPostIds: Set<string>;
    failures: Error[];
  }> {
    const allQueries = [...new Set(dto.queries.map((q) => q.trim()).filter(Boolean))];

    const totalTasks = allQueries.length;
    let completedTasks = 0;
    const failures: Error[] = [];

    onProgress?.({
      type: 'started',
      totalTasks,
      queries: allQueries.length,
      subreddits: 0,
    });

    const searchTasks: (() => Promise<RedditPost[]>)[] = allQueries.map(
      (query, index) => async () => {
        // First query searches 'year' to catch older niche content (e.g. product launches)
        const timeRange = index === 0 ? 'year' : dto.timeRange;
        const result = await this.decodoService
          .searchReddit({ query, timeRange }, signal)
          .catch((err: unknown) => {
            if ((err as Error)?.name === 'AbortError') throw err;
            this.logger.warn(`Search query failed for "${query}": ${String(err)}`);
            failures.push(err as Error);
            return [] as RedditPost[];
          });
        onProgress?.({
          type: 'task_complete',
          completed: ++completedTasks,
          total: totalTasks,
          label: `search: "${query}"`,
        });
        return result;
      },
    );

    const results = await TrackerService.runWithConcurrency(searchTasks, SCRAPE_CONCURRENCY);

    const searchResults = results.flat();
    const searchPostIds = new Set(searchResults.map((p) => p.id).filter(Boolean));

    const ranked = this.deduplicateAndRank(searchResults, dto.prompt, dto.queries).slice(
      0,
      dto.maxPosts ?? MAX_POSTS_TOTAL,
    );

    this.logger.log(
      `[Scrape] Search: ${searchResults.length} raw → ${ranked.length} on-topic` +
        ` (top: "${ranked[0]?.title?.slice(0, 60) ?? 'none'}")`,
    );

    return { posts: ranked, searchPostIds, failures };
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

    const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
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
          this.logger.warn(`Comment scrape failed for post ${post.id}: ${String(err)}`);
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

    const response = await this.llmService.complete(
      {
        messages: [
          { role: 'user', content: SUMMARIZATION_PROMPT },
          { role: 'user', content: userMessage },
        ],
        responseFormat: 'json',
      },
      signal,
    );

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
            ...withComments.comments
              .slice(0, 5)
              .map((c) => `  - [${c.upvotes} upvotes] ${c.body.slice(0, 300)}`),
          );
        }

        return lines.filter(Boolean).join('\n');
      })
      .join('\n\n---\n\n');
  }

  private deduplicateAndRank(posts: RedditPost[], prompt: string, queries: string[]): RedditPost[] {
    const seen = new Set<string>();
    const unique: RedditPost[] = [];

    for (const post of posts) {
      if (post.id && !seen.has(post.id)) {
        seen.add(post.id);
        unique.push(post);
      }
    }

    const topicTokens = extractTopicTokens(prompt, queries);
    const relevanceMap = new Map(unique.map((p) => [p.id, relevanceToTopics(topicTokens, p)]));

    // Drop posts that don't mention any topic term — prevents subreddit hot-post noise
    // from polluting product-specific reports when search results are sparse.
    const onTopic = unique.filter((p) => (relevanceMap.get(p.id) ?? 0) > 0);
    const filtered = onTopic.length > 0 ? onTopic : [];

    if (unique.length > 0 && filtered.length === 0) {
      this.logger.log(
        `[Rank] Dropped ${unique.length} off-topic posts (topic tokens: [${[...topicTokens].join(', ')}])`,
      );
    }

    return filtered.sort((a, b) => {
      const relA = relevanceMap.get(a.id) ?? 0;
      const relB = relevanceMap.get(b.id) ?? 0;
      const scoreA = Math.log1p(a.upvotes) * relA;
      const scoreB = Math.log1p(b.upvotes) * relB;
      return scoreB - scoreA;
    });
  }
}
