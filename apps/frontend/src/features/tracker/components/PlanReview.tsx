import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Plus, X, Zap } from 'lucide-react';
import type { ScrapingPlan, TimeRange } from '../tracker.types';

interface PlanReviewProps {
  plan: ScrapingPlan;
  prompt: string;
  maxPosts?: number;
  onAnalyze: (plan: {
    prompt: string;
    subreddits: string[];
    queries: string[];
    timeRange: TimeRange;
    maxPosts?: number;
  }) => void;
  onBack: () => void;
  isLoading: boolean;
}

export const PlanReview = ({
  plan,
  prompt,
  maxPosts,
  onAnalyze,
  onBack,
  isLoading,
}: PlanReviewProps) => {
  const [subreddits, setSubreddits] = useState<string[]>(plan.subreddits);
  const [queries, setQueries] = useState<string[]>(plan.queries);
  const [timeRange, setTimeRange] = useState<TimeRange>(plan.timeRange);
  const [newSubreddit, setNewSubreddit] = useState('');

  const removeSubreddit = (sub: string) => setSubreddits((prev) => prev.filter((s) => s !== sub));

  const addSubreddit = () => {
    const clean = newSubreddit.trim().replace(/^r\//, '').toLowerCase();
    if (clean && !subreddits.includes(clean)) {
      setSubreddits((prev) => [...prev, clean]);
    }
    setNewSubreddit('');
  };

  const updateQuery = (index: number, value: string) =>
    setQueries((prev) => prev.map((q, i) => (i === index ? value : q)));

  const removeQuery = (index: number) => setQueries((prev) => prev.filter((_, i) => i !== index));

  const addQuery = () => setQueries((prev) => [...prev, '']);

  const handleSubmit = () => {
    const validQueries = queries.map((q) => q.trim()).filter(Boolean);
    if (!subreddits.length || !validQueries.length) return;
    onAnalyze({ prompt, subreddits, queries: validQueries, timeRange, maxPosts });
  };

  const canSubmit = !isLoading && subreddits.length > 0 && queries.some((q) => q.trim());

  return (
    <div className="space-y-6">
      {plan.rationale && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">{plan.rationale}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <Label className="text-sm font-medium">Subreddits ({subreddits.length})</Label>
        <div className="flex flex-wrap gap-2">
          {subreddits.map((sub) => (
            <Badge key={sub} variant="secondary" className="flex items-center gap-1 pr-1 text-sm">
              r/{sub}
              <button
                type="button"
                onClick={() => removeSubreddit(sub)}
                disabled={isLoading}
                className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5 disabled:cursor-not-allowed"
                aria-label={`Remove r/${sub}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newSubreddit}
            onChange={(e) => setNewSubreddit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSubreddit();
              }
            }}
            placeholder="Add subreddit"
            disabled={isLoading}
            className="h-8 text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSubreddit}
            disabled={!newSubreddit.trim() || isLoading}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Search queries</Label>
        <div className="space-y-2">
          {queries.map((q, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={q}
                onChange={(e) => updateQuery(i, e.target.value)}
                placeholder="Search query"
                disabled={isLoading}
                className="h-8 text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeQuery(i)}
                disabled={queries.length <= 1 || isLoading}
                aria-label="Remove query"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addQuery}
          disabled={isLoading}
          className="mt-1"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add query
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Time range</Label>
        <Select
          value={timeRange}
          onValueChange={(v) => setTimeRange(v as TimeRange)}
          disabled={isLoading}
        >
          <SelectTrigger className="h-8 w-full sm:w-48 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Past 24 hours</SelectItem>
            <SelectItem value="week">Past week</SelectItem>
            <SelectItem value="month">Past month</SelectItem>
            <SelectItem value="year">Past year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={!canSubmit} className="flex-1">
          <Zap className="mr-2 h-4 w-4" />
          {isLoading ? 'Scraping & analyzing…' : 'Run analysis'}
        </Button>
      </div>
    </div>
  );
};
