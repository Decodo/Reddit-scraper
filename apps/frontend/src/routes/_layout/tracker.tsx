import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { PromptForm } from '@/features/tracker/components/PromptForm';
import { PlanReview } from '@/features/tracker/components/PlanReview';
import { ReportView } from '@/features/tracker/components/ReportView';
import {
  useGeneratePlanMutation,
  useAnalyzePlanMutation,
} from '@/features/tracker/api/useTrackerApi';
import { exportAsMarkdown, exportAsJson } from '@/features/tracker/utils/export';
import type { ScrapingPlan, AnalyzeResult, TimeRange } from '@/features/tracker/tracker.types';

export const Route = createFileRoute('/_layout/tracker')({
  component: TrackerPage,
});

type Step =
  | { stage: 'input' }
  | { stage: 'reviewing'; plan: ScrapingPlan; prompt: string }
  | { stage: 'done'; result: AnalyzeResult; prompt: string };

const AnalyzingState = () => (
  <div className="space-y-5 py-2">
    <div className="flex items-center gap-3">
      <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <p className="text-sm text-muted-foreground">
        Scraping Reddit and generating your report…
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

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
    {message}{' '}
    <Link to="/settings" className="underline underline-offset-2 font-medium">
      Check your API key settings.
    </Link>
  </div>
);

function TrackerPage() {
  const [step, setStep] = useState<Step>({ stage: 'input' });
  const generatePlan = useGeneratePlanMutation();
  const analyzePlan = useAnalyzePlanMutation();

  const handlePromptSubmit = (
    prompt: string,
    options: { subreddits?: string[]; timeRange?: TimeRange },
  ) => {
    generatePlan.mutate(
      { prompt, ...options },
      {
        onSuccess: (plan) => setStep({ stage: 'reviewing', plan, prompt }),
      },
    );
  };

  const handleAnalyze = (planInput: {
    prompt: string;
    subreddits: string[];
    queries: string[];
    timeRange: TimeRange;
  }) => {
    analyzePlan.mutate(planInput, {
      onSuccess: (result) =>
        setStep({ stage: 'done', result, prompt: planInput.prompt }),
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
                  isLoading={generatePlan.isPending}
                />
                {generatePlan.isError && (
                  <ErrorMessage message="Failed to generate a scraping plan." />
                )}
              </>
            )}

            {step.stage === 'reviewing' && (
              analyzePlan.isPending ? (
                <AnalyzingState />
              ) : (
                <>
                  <PlanReview
                    plan={step.plan}
                    prompt={step.prompt}
                    onAnalyze={handleAnalyze}
                    onBack={reset}
                    isLoading={false}
                  />
                  {analyzePlan.isError && (
                    <ErrorMessage message="Analysis failed. Check your Decodo and LLM API keys." />
                  )}
                </>
              )
            )}

            {step.stage === 'done' && (
              <ReportView
                prompt={step.prompt}
                report={step.result.report}
                onExportMarkdown={() =>
                  exportAsMarkdown(step.prompt, step.result.report)
                }
                onExportJson={() => exportAsJson(step.result)}
              />
            )}
          </CardContent>
        </Card>

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
