import { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ScrapingPlan, AnalyzeResult, TimeRange } from '../tracker.types';

interface GeneratePlanInput {
  prompt: string;
  subreddits?: string[];
  timeRange?: TimeRange;
}

interface AnalyzePlanInput {
  prompt: string;
  subreddits: string[];
  queries: string[];
  timeRange: TimeRange;
  maxPosts?: number;
}

// ---------------------------------------------------------------------------
// Progress types (mirror of the backend ProgressEvent union)
// ---------------------------------------------------------------------------

type ProgressEvent =
  | { type: 'started'; totalTasks: number; queries: number; subreddits: number }
  | { type: 'task_complete'; completed: number; total: number; label: string }
  | { type: 'deep_diving'; posts: number }
  | { type: 'summarizing' }
  | { type: 'saving' };

export type ProgressState = {
  completed: number;
  total: number;
  label: string;
  sublabel?: string;
};

type SseEvent =
  | ProgressEvent
  | {
      type: 'complete';
      id: string;
      plan: AnalyzeResult['plan'];
      posts: AnalyzeResult['posts'];
      report: AnalyzeResult['report'];
    }
  | { type: 'error'; message: string };

// ---------------------------------------------------------------------------
// Plan generation (unchanged)
// ---------------------------------------------------------------------------

const generatePlan = async (dto: GeneratePlanInput): Promise<ScrapingPlan> => {
  const { data } = await api.post<ScrapingPlan>('/tracker/plan', dto);
  return data;
};

export const useGeneratePlanMutation = () => useMutation({ mutationFn: generatePlan });

// ---------------------------------------------------------------------------
// SSE streaming analyze
// ---------------------------------------------------------------------------

const BASE_URL = ((import.meta.env.PUBLIC_API_BASE_URL as string | undefined) ?? '/api').replace(
  /\/$/,
  '',
);

async function analyzePlanStream(
  dto: AnalyzePlanInput,
  onProgress: (event: ProgressEvent) => void,
  signal?: AbortSignal,
): Promise<AnalyzeResult> {
  const response = await fetch(`${BASE_URL}/tracker/analyze/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`Request failed: HTTP ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      const dataLine = part.split('\n').find((l) => l.startsWith('data: '));
      if (!dataLine) continue;

      const event = JSON.parse(dataLine.slice(6)) as SseEvent;

      if (event.type === 'error') throw new Error(event.message);

      if (event.type === 'complete') {
        return { id: event.id, plan: event.plan, posts: event.posts, report: event.report };
      }

      onProgress(event);
    }
  }

  throw new Error('Stream ended without a completion event');
}

export function useAnalyzePlanStream() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const mutate = useCallback(
    (dto: AnalyzePlanInput, callbacks: { onSuccess?: (result: AnalyzeResult) => void } = {}) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setIsPending(true);
      setIsError(false);
      setProgress({ completed: 0, total: 0, label: 'Connecting…' });

      analyzePlanStream(
        dto,
        (event) => {
          if (event.type === 'started') {
            setProgress({ completed: 0, total: event.totalTasks, label: 'Scraping Reddit…' });
          } else if (event.type === 'task_complete') {
            setProgress({
              completed: event.completed,
              total: event.total,
              label: `Scraped ${event.completed} of ${event.total} sources`,
              sublabel: event.label,
            });
          } else if (event.type === 'deep_diving') {
            setProgress((p) => ({
              ...p!,
              label: `Fetching ${event.posts} comment threads…`,
              sublabel: undefined,
            }));
          } else if (event.type === 'summarizing') {
            setProgress((p) => ({
              ...p!,
              label: 'Generating report with AI…',
              sublabel: undefined,
            }));
          } else if (event.type === 'saving') {
            setProgress((p) => ({ ...p!, label: 'Saving to history…', sublabel: undefined }));
          }
        },
        ac.signal,
      )
        .then((result) => {
          setIsPending(false);
          void queryClient.invalidateQueries({ queryKey: ['queries'] });
          callbacks.onSuccess?.(result);
        })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name === 'AbortError') return;
          setIsError(true);
          setIsPending(false);
        });
    },
    [queryClient],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsPending(false);
    setIsError(false);
    setProgress(null);
  }, []);

  return { mutate, isPending, isError, progress, reset };
}
