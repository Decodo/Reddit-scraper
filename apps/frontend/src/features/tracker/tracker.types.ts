export type TimeRange = 'day' | 'week' | 'month' | 'year';

export interface ScrapingPlan {
  subreddits: string[];
  queries: string[];
  timeRange: TimeRange;
  rationale: string;
}

export interface RedditPost {
  id: string;
  title: string;
  subreddit: string;
  author: string;
  upvotes: number;
  commentCount: number;
  url: string;
  permalink: string;
  selftext: string;
  createdAt: number;
}

export interface RedditReport {
  executiveSummary: string;
  themes: Array<{ title: string; description: string }>;
  sentiment: {
    overall: 'positive' | 'negative' | 'neutral' | 'mixed';
    rationale: string;
  };
  notableQuotes: Array<{ text: string; subreddit: string; url: string }>;
  topPosts: Array<{
    title: string;
    subreddit: string;
    upvotes: number;
    commentCount: number;
    url: string;
  }>;
}

export interface AnalyzeResult {
  id: string;
  plan: {
    prompt: string;
    subreddits: string[];
    queries: string[];
    timeRange: TimeRange;
  };
  posts: RedditPost[];
  report: RedditReport;
}

export interface StoredQuery {
  _id: string;
  prompt: string;
  plan: ScrapingPlan;
  posts?: RedditPost[];
  report: RedditReport;
  createdAt: string;
}
