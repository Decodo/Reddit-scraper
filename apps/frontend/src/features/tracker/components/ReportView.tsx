import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, ExternalLink, FileJson, FileText } from 'lucide-react';
import type { RedditReport } from '../tracker.types';

const sentimentColor: Record<string, string> = {
  positive: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  negative: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  mixed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

interface ReportViewProps {
  prompt: string;
  report: RedditReport;
  onExportMarkdown: () => void;
  onExportJson: () => void;
}

export const ReportView = ({
  prompt,
  report,
  onExportMarkdown,
  onExportJson,
}: ReportViewProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
            Results for
          </p>
          <p className="text-sm font-medium">{prompt}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={onExportMarkdown}>
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            <span className="hidden sm:inline">Markdown</span>
            <Download className="h-3 w-3 ml-1" />
          </Button>
          <Button variant="outline" size="sm" onClick={onExportJson}>
            <FileJson className="mr-1.5 h-3.5 w-3.5" />
            <span className="hidden sm:inline">JSON</span>
            <Download className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Executive Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {report.executiveSummary}
          </p>
        </CardContent>
      </Card>

      {/* Sentiment */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            Sentiment
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                sentimentColor[report.sentiment.overall] ?? sentimentColor.neutral
              }`}
            >
              {report.sentiment.overall}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {report.sentiment.rationale}
          </p>
        </CardContent>
      </Card>

      {/* Key Themes */}
      {report.themes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Key Themes</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {report.themes.map((theme, i) => (
              <Card key={i}>
                <CardHeader className="pb-1 pt-4">
                  <CardTitle className="text-sm">{theme.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {theme.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Notable Quotes */}
      {report.notableQuotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Notable Quotes</h3>
          <div className="space-y-2">
            {report.notableQuotes.map((quote, i) => (
              <blockquote
                key={i}
                className="border-l-2 border-border pl-4 py-1"
              >
                <p className="text-sm text-muted-foreground italic leading-relaxed">
                  "{quote.text}"
                </p>
                <a
                  href={quote.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  r/{quote.subreddit}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </blockquote>
            ))}
          </div>
        </div>
      )}

      {/* Top Posts */}
      {report.topPosts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Top Posts</h3>
          <div className="divide-y divide-border rounded-md border">
            {report.topPosts.map((post, i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <div className="flex-1 min-w-0">
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:underline line-clamp-2 flex items-start gap-1 group"
                  >
                    {post.title}
                    <ExternalLink className="h-3 w-3 mt-0.5 shrink-0 opacity-50 group-hover:opacity-100" />
                  </a>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      r/{post.subreddit}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {post.upvotes.toLocaleString()} upvotes
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {post.commentCount.toLocaleString()} comments
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
