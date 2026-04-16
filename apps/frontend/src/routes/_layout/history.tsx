import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Search, Trash2 } from 'lucide-react';
import { useQueriesQuery, useDeleteQueryMutation } from '@/features/queries/api/useQueriesApi';

export const Route = createFileRoute('/_layout/history')({
  component: HistoryPage,
});

const sentimentColor: Record<string, string> = {
  positive: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  negative: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  mixed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

function HistoryPage() {
  const { pathname } = useLocation();
  const { data: queries, isLoading } = useQueriesQuery();
  const deleteMutation = useDeleteQueryMutation();

  // When navigated to a child route (e.g. /history/:id), yield to the child component.
  // TanStack Router flat-file routing makes history.$id a child of this route,
  // so this component must render <Outlet /> for the child to appear.
  if (pathname !== '/history') {
    return <Outlet />;
  }

  if (isLoading) {
    return (
      <div className="py-6 space-y-4">
        <h1 className="text-2xl font-semibold">History</h1>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="py-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your past Reddit intelligence queries
        </p>
      </div>

      {!queries?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No queries yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Run your first analysis from the Tracker page.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/tracker">Go to Tracker</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {queries.map((query) => (
            <Card key={query._id} className="group hover:bg-muted/30 transition-colors">
              <CardContent className="flex items-center gap-4 py-4">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <Link
                  to="/history/$id"
                  params={{ id: query._id }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium truncate">{query.prompt}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(query.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
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
                      {query.plan.subreddits.slice(0, 3).map((sub) => (
                        <Badge
                          key={sub}
                          variant="outline"
                          className="text-xs px-1.5 py-0"
                        >
                          r/{sub}
                        </Badge>
                      ))}
                      {query.plan.subreddits.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{query.plan.subreddits.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  disabled={deleteMutation.isPending}
                  onClick={(e) => {
                    e.preventDefault();
                    deleteMutation.mutate(query._id);
                  }}
                  aria-label="Delete query"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
