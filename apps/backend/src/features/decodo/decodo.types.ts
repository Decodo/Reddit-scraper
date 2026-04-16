export type DecodoTarget = 'universal' | 'reddit_subreddit' | 'reddit_post';

export interface DecodoScrapeRequest {
  target: DecodoTarget;
  url: string;
  locale?: string;
}

export interface DecodoScrapeResponse {
  status: number;
  url: string;
  content: string;
  target: DecodoTarget;
}

export type RedditTimeRange = 'day' | 'week' | 'month' | 'year';

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

export interface RedditComment {
  id: string;
  author: string;
  body: string;
  upvotes: number;
  permalink: string;
}

export interface RedditPostWithComments extends RedditPost {
  comments: RedditComment[];
}

export interface ScrapeSearchParams {
  query: string;
  timeRange: RedditTimeRange;
  limit?: number;
}

export interface ScrapeSubredditParams {
  subreddit: string;
  limit?: number;
}

export interface ScrapePostParams {
  subreddit: string;
  postId: string;
}
