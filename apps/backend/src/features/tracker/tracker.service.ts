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
    this.logger.log(`Generating scraping plan for: "${dto.prompt}"`);

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

    return plan;
  }

  // ---------------------------------------------------------------------------
  // Endpoint 2: execute the plan and return a summarized report
  // ---------------------------------------------------------------------------

  async analyzePlan(dto: AnalyzePlanDto): Promise<{
    plan: AnalyzePlanDto;
    posts: RedditPost[];
    report: RedditReport;
  }> {
    this.logger.log(
      `Analyzing plan — ${dto.subreddits.length} subreddits, ${dto.queries.length} queries`,
    );

    // Step 1: parallel scraping
    const posts = await this.scrapeAll(dto);

    // Step 2: deep-dive comment threads for top posts
    const postsWithComments = await this.deepDive(
      posts.slice(0, MAX_POSTS_DEEP_DIVE),
    );

    // Step 3: LLM summarization
    const report = await this.summarize(dto.prompt, posts, postsWithComments);

    // Step 4: persist to query history
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

    return { id: String(saved._id), plan: dto, posts, report };
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  private async scrapeAll(dto: AnalyzePlanDto): Promise<RedditPost[]> {
    const tasks: Promise<RedditPost[]>[] = [];

    // Global search queries via universal target
    for (const query of dto.queries) {
      tasks.push(
        this.decodoService
          .searchReddit({ query, timeRange: dto.timeRange })
          .catch((err) => {
            this.logger.warn(`Search query failed for "${query}": ${String(err)}`);
            return [];
          }),
      );
    }

    // Subreddit feeds via reddit_subreddit target
    for (const subreddit of dto.subreddits) {
      tasks.push(
        this.decodoService
          .scrapeSubreddit({ subreddit })
          .catch((err) => {
            this.logger.warn(`Subreddit scrape failed for r/${subreddit}: ${String(err)}`);
            return [];
          }),
      );
    }

    const results = await Promise.all(tasks);
    const all = results.flat();

    return this.deduplicateAndRank(all).slice(0, MAX_POSTS_TOTAL);
  }

  private async deepDive(
    posts: RedditPost[],
  ): Promise<RedditPostWithComments[]> {
    const tasks = posts.map((post) =>
      this.decodoService
        .scrapePost({ subreddit: post.subreddit, postId: post.id })
        .catch((err) => {
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
    });

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
