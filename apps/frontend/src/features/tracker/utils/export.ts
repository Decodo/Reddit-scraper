import type { RedditReport } from '../tracker.types';

export const exportAsMarkdown = (prompt: string, report: RedditReport): void => {
  const lines: string[] = [
    `# Reddit Intelligence Report`,
    ``,
    `**Query:** ${prompt}`,
    ``,
    `## Executive Summary`,
    ``,
    report.executiveSummary,
    ``,
    `## Key Themes`,
    ``,
    ...report.themes.flatMap((t) => [`### ${t.title}`, ``, t.description, ``]),
    `## Sentiment`,
    ``,
    `**Overall:** ${report.sentiment.overall}`,
    ``,
    report.sentiment.rationale,
    ``,
  ];

  if (report.notableQuotes.length) {
    lines.push(`## Notable Quotes`, ``);
    for (const q of report.notableQuotes) {
      lines.push(`> "${q.text}" — [r/${q.subreddit}](${q.url})`, ``);
    }
  }

  if (report.topPosts.length) {
    lines.push(`## Top Posts`, ``);
    for (const p of report.topPosts) {
      lines.push(
        `- [${p.title}](${p.url}) — r/${p.subreddit} · ${p.upvotes} upvotes · ${p.commentCount} comments`,
      );
    }
  }

  downloadBlob(new Blob([lines.join('\n')], { type: 'text/markdown' }), 'reddit-report.md');
};

export const exportAsJson = (data: unknown): void => {
  downloadBlob(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    'reddit-report.json',
  );
};

const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
