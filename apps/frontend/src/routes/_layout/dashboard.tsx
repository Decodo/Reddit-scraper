import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Clock, Search, Zap } from 'lucide-react';
import { useQueriesQuery } from '@/features/queries/api/useQueriesApi';

export const Route = createFileRoute('/_layout/dashboard')({
  component: DashboardPage,
});

const sentimentColor: Record<string, string> = {
  positive: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  negative: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  mixed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

function DashboardPage() {
  const { data: queries, isLoading } = useQueriesQuery();

  const recentQueries = queries?.slice(0, 3) ?? [];
  const totalAnalyses = queries?.length ?? 0;

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Reddit intelligence, powered by Decodo
        </p>
      </div>

      {/* CTA */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center justify-between gap-4 py-5">
          <div className="space-y-1">
            <p className="font-medium">Start a new analysis</p>
            <p className="text-sm text-muted-foreground">
              Enter any topic and get AI-summarized Reddit intelligence in seconds.
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link to="/tracker">
              <Zap className="mr-2 h-4 w-4" />
              New analysis
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total analyses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-3xl font-bold">{totalAnalyses}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most recent
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-5 w-32" />
            ) : queries?.[0] ? (
              <p className="text-sm font-medium truncate">{queries[0].prompt}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No analyses yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent analyses */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent analyses</h2>
          {totalAnalyses > 3 && (
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link to="/history">
                View all
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : recentQueries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Search className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No analyses yet.</p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link to="/tracker">Run your first analysis</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentQueries.map((query) => (
              <Card key={query._id} className="hover:bg-muted/30 transition-colors">
                <CardContent className="flex items-center gap-3 py-3">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Link
                    to="/history/$id"
                    params={{ id: query._id }}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-medium truncate">{query.prompt}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {new Date(query.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {query.report?.sentiment?.overall && (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                            sentimentColor[query.report.sentiment.overall] ??
                            sentimentColor.neutral
                          }`}
                        >
                          {query.report.sentiment.overall}
                        </span>
                      )}
                      <div className="flex gap-1">
                        {query.plan.subreddits.slice(0, 2).map((sub) => (
                          <Badge key={sub} variant="outline" className="text-xs px-1.5 py-0">
                            r/{sub}
                          </Badge>
                        ))}
                        {query.plan.subreddits.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{query.plan.subreddits.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
