import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { ReportView } from '@/features/tracker/components/ReportView';
import { useQueryDetailQuery } from '@/features/queries/api/useQueriesApi';
import { exportAsMarkdown, exportAsJson } from '@/features/tracker/utils/export';

export const Route = createFileRoute('/_layout/history/$id')({
  component: HistoryDetailPage,
});

function HistoryDetailPage() {
  const { id } = Route.useParams();
  const { data: query, isLoading, isError } = useQueryDetailQuery(id);

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/history">
            <ArrowLeft className="mr-2 h-4 w-4" />
            History
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-muted-foreground">
          Failed to load this query. It may have been deleted.
        </p>
      )}

      {query && (
        <ReportView
          prompt={query.prompt}
          report={query.report}
          onExportMarkdown={() => exportAsMarkdown(query.prompt, query.report)}
          onExportJson={() => exportAsJson(query)}
        />
      )}
    </div>
  );
}
