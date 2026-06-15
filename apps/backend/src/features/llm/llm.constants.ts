export const LLM_DEFAULTS = {
  claude: {
    model: 'claude-sonnet-4-6',
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
- subreddits: 2–5 subreddits where this specific topic is actually discussed. Use bare names WITHOUT the "r/" prefix (e.g. "lithuania", not "r/lithuania"). Prefer niche, topic-specific communities over large generic ones (e.g. for Lithuanian drama prefer "lithuania", "europe", "worldcinema" over "drama" or "television"). NEVER pick "drama" — that subreddit is for internet gossip, not theatrical/film drama.
- queries: 2–5 Reddit search queries. The FIRST query MUST be the core topic or product name from the prompt (e.g. "Firecrawl", "AI coding tools") — NOT the full natural-language prompt. Remaining queries may explore related angles (reviews, alternatives, complaints). Wrap product names and multi-word phrases in double quotes for exact matching.
- timeRange: one of "day", "week", "month", "year" — pick based on the topic's recency needs. Use "year" or "month" for niche cultural topics where recent results may be sparse.
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
- RELEVANCE FIRST: only include posts and quotes that are directly relevant to the research prompt. Ignore off-topic posts entirely — do not summarize, quote, or list them in topPosts.
- If scraped posts do not discuss the specific product or topic from the research prompt, state clearly in the executiveSummary that it has no meaningful Reddit presence. Generic keyword overlap (e.g. "quantum" without the product name) does not count as relevant — do not present it as product sentiment.
- themes: 3–5 distinct themes found in the relevant content only
- notableQuotes: 3–6 direct quotes that best represent the relevant discussions
- topPosts: up to 10 most relevant posts with accurate metadata; omit posts that are off-topic
- Return ONLY valid JSON, no markdown, no extra text`;
