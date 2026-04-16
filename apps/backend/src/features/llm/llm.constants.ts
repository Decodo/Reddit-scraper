export const LLM_DEFAULTS = {
  claude: {
    model: 'claude-sonnet-4-20250514',
  },
  openai: {
    model: 'gpt-4o',
  },
  gemini: {
    model: 'gemini-2.5-flash',
  },
} as const;

export const SCRAPING_PLAN_PROMPT = `You are a Reddit research assistant. Given a user's research prompt, generate a structured scraping plan.

Analyze the prompt and return a JSON object with exactly this shape:
{
  "subreddits": ["subreddit1", "subreddit2"],
  "queries": ["search query 1", "search query 2"],
  "timeRange": "week",
  "rationale": "Brief explanation of your choices"
}

Rules:
- subreddits: 3–8 relevant subreddits (names only, no "r/" prefix)
- queries: 2–5 specific search queries (more targeted than the raw prompt)
- timeRange: one of "day", "week", "month", "year" — pick based on the topic's recency needs
- rationale: 1–2 sentences explaining your choices
- Return ONLY valid JSON, no markdown, no extra text`;

export const SUMMARIZATION_PROMPT = `You are a Reddit intelligence analyst. You will receive scraped Reddit content and must produce a structured report.

Return a JSON object with exactly this shape:
{
  "executiveSummary": "2–3 sentence overview of the main findings",
  "themes": [
    { "title": "Theme name", "description": "What people are saying about this theme" }
  ],
  "sentiment": {
    "overall": "positive|negative|neutral|mixed",
    "rationale": "1–2 sentences explaining the sentiment"
  },
  "notableQuotes": [
    { "text": "Direct quote from a post or comment", "subreddit": "subredditName", "url": "https://reddit.com/..." }
  ],
  "topPosts": [
    { "title": "Post title", "subreddit": "subredditName", "upvotes": 123, "commentCount": 45, "url": "https://reddit.com/..." }
  ]
}

Rules:
- themes: 3–5 distinct themes found in the content
- notableQuotes: 3–6 direct quotes that best represent the discussions
- topPosts: up to 10 most relevant posts with accurate metadata
- Return ONLY valid JSON, no markdown, no extra text`;
