import { useMutation } from '@tanstack/react-query';
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
}

const generatePlan = async (dto: GeneratePlanInput): Promise<ScrapingPlan> => {
  const { data } = await api.post<ScrapingPlan>('/tracker/plan', dto);
  return data;
};

const analyzePlan = async (dto: AnalyzePlanInput): Promise<AnalyzeResult> => {
  const { data } = await api.post<AnalyzeResult>('/tracker/analyze', dto);
  return data;
};

export const useGeneratePlanMutation = () =>
  useMutation({ mutationFn: generatePlan });

export const useAnalyzePlanMutation = () =>
  useMutation({ mutationFn: analyzePlan });
