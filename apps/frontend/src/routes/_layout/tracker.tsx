import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { PromptForm } from '@/features/tracker/components/PromptForm';
import { PlanReview } from '@/features/tracker/components/PlanReview';
import { ReportView } from '@/features/tracker/components/ReportView';
import { MiniGame } from '@/features/tracker/components/MiniGame';
import {
  useGeneratePlanMutation,
  useAnalyzePlanStream,
} from '@/features/tracker/api/useTrackerApi';
import type { ProgressState } from '@/features/tracker/api/useTrackerApi';
import { exportAsMarkdown, exportAsJson } from '@/features/tracker/utils/export';
import type { ScrapingPlan, AnalyzeResult, TimeRange } from '@/features/tracker/tracker.types';

export const Route = createFileRoute('/_layout/tracker')({
  component: TrackerPage,
});

type Step =
  | { stage: 'input' }
  | { stage: 'reviewing'; plan: ScrapingPlan; prompt: string; maxPosts?: number }
  | { stage: 'done'; result: AnalyzeResult; prompt: string };

const AnalyzingState = ({
  progress,
  onCancel,
}: {
  progress: ProgressState | null;
  onCancel: () => void;
}) => {
  const showBar = progress !== null && progress.total > 0 && progress.completed < progress.total;

  return (
    <div className="space-y-5 py-2">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
            <p className="text-sm text-muted-foreground truncate">
              {progress?.label ?? 'Scraping Reddit and generating your report…'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onCancel} className="shrink-0">
            Cancel
          </Button>
        </div>
        <p
          className={`truncate pl-7 text-xs text-muted-foreground ${progress?.sublabel ? '' : 'invisible'}`}
        >
          {progress?.sublabel ?? '—'}
        </p>
      </div>
      <div className="space-y-1" style={{ visibility: showBar ? 'visible' : 'hidden' }}>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{
              width: `${progress && progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%`,
            }}
          />
        </div>
        <p className="text-right text-xs text-muted-foreground">
          {progress && progress.total > 0
            ? Math.round((progress.completed / progress.total) * 100)
            : 0}
          %
        </p>
      </div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-12 rounded-md bg-muted animate-pulse"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        This typically takes 10–30 seconds depending on the number of subreddits.
      </p>
    </div>
  );
};

const getApiError = (error: unknown): string | undefined =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
  (error as Error)?.message;

const ErrorMessage = ({ message, error }: { message: string; error?: unknown }) => (
  <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive space-y-1">
    <p>{message}</p>
    {getApiError(error) && <p className="text-xs opacity-80 font-mono">{getApiError(error)}</p>}
    <p>
      <Link to="/settings" className="underline underline-offset-2 font-medium">
        Check your API key settings.
      </Link>
    </p>
  </div>
);

function TrackerPage() {
  const [step, setStep] = useState<Step>({ stage: 'input' });
  const generatePlan = useGeneratePlanMutation();
  const analyzePlan = useAnalyzePlanStream();

  const handlePromptSubmit = (
    prompt: string,
    options: { subreddits?: string[]; timeRange?: TimeRange; maxPosts?: number },
  ) => {
    const { maxPosts, ...planOptions } = options;
    generatePlan.mutate(
      { prompt, ...planOptions },
      {
        onSuccess: (plan) => {
          setStep({ stage: 'reviewing', plan, prompt, maxPosts });
        },
      },
    );
  };

  const handleAnalyze = (planInput: {
    prompt: string;
    subreddits: string[];
    queries: string[];
    timeRange: TimeRange;
    maxPosts?: number;
  }) => {
    analyzePlan.mutate(planInput, {
      onSuccess: (result) => {
        setStep({ stage: 'done', result, prompt: planInput.prompt });
      },
    });
  };

  const reset = () => {
    setStep({ stage: 'input' });
    generatePlan.reset();
    analyzePlan.reset();
  };

  const stepLabel = {
    input: '1 of 3 — Enter your topic',
    reviewing: '2 of 3 — Review the scraping plan',
    done: '3 of 3 — Your intelligence report',
  }[step.stage];

  const cardTitle = {
    input: 'What would you like to research?',
    reviewing: analyzePlan.isPending ? 'Analyzing…' : 'Adjust the scraping plan',
    done: 'Report',
  }[step.stage];

  return (
    <div className="py-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Reddit Intelligence</h1>
            <p className="text-sm text-muted-foreground mt-1">{stepLabel}</p>
          </div>
          {step.stage !== 'input' && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Start over
            </Button>
          )}
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">{cardTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            {step.stage === 'input' && (
              <>
                <PromptForm
                  onSubmit={handlePromptSubmit}
                  onCancel={generatePlan.reset}
                  isLoading={generatePlan.isPending}
                />
                {generatePlan.isError && (
                  <ErrorMessage
                    message="Failed to generate a scraping plan."
                    error={generatePlan.error}
                  />
                )}
              </>
            )}

            {step.stage === 'reviewing' &&
              (analyzePlan.isPending ? (
                <AnalyzingState progress={analyzePlan.progress} onCancel={analyzePlan.reset} />
              ) : (
                <>
                  <PlanReview
                    plan={step.plan}
                    prompt={step.prompt}
                    maxPosts={step.maxPosts}
                    onAnalyze={handleAnalyze}
                    onBack={reset}
                    isLoading={false}
                  />
                  {analyzePlan.isError && (
                    <ErrorMessage message="Analysis failed." error={analyzePlan.error} />
                  )}
                </>
              ))}

            {step.stage === 'done' && (
              <ReportView
                prompt={step.prompt}
                report={step.result.report}
                onExportMarkdown={() => exportAsMarkdown(step.prompt, step.result.report)}
                onExportJson={() => exportAsJson(step.result)}
              />
            )}
          </CardContent>
        </Card>

        {step.stage === 'reviewing' && analyzePlan.isPending && <MiniGame />}

        {step.stage === 'input' && !generatePlan.isPending && (
          <p className="text-center text-xs text-muted-foreground">
            Need to configure API keys?{' '}
            <Link to="/settings" className="underline underline-offset-2">
              Go to Settings
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
