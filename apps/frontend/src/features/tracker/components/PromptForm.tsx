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
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import type { TimeRange } from '../tracker.types';

const EXAMPLE_PROMPTS = [
  'What do developers think about AI coding tools?',
  'How do people feel about remote work in tech?',
  'What are the most common complaints about React?',
];

interface PromptFormProps {
  onSubmit: (
    prompt: string,
    options: { subreddits?: string[]; timeRange?: TimeRange; maxPosts?: number },
  ) => void;
  onCancel?: () => void;
  isLoading: boolean;
}

export const PromptForm = ({ onSubmit, onCancel, isLoading }: PromptFormProps) => {
  const [prompt, setPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [subredditsInput, setSubredditsInput] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange | ''>('');
  const [maxPostsInput, setMaxPostsInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const subreddits = subredditsInput
      .split(',')
      .map((s) => s.trim().replace(/^r\//, '').toLowerCase())
      .filter(Boolean);

    const maxPostsNum = parseInt(maxPostsInput, 10);
    const maxPosts =
      !isNaN(maxPostsNum) && maxPostsNum >= 5 && maxPostsNum <= 100
        ? maxPostsNum
        : undefined;

    onSubmit(prompt.trim(), {
      subreddits: subreddits.length ? subreddits : undefined,
      timeRange: timeRange || undefined,
      maxPosts,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={EXAMPLE_PROMPTS[0]}
          rows={3}
          disabled={isLoading}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
        {!prompt && !isLoading && (
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_PROMPTS.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setPrompt(example)}
                className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:bg-muted hover:text-foreground transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showAdvanced ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
          Advanced options
        </button>

        {showAdvanced && (
          <div className="mt-3 space-y-3 rounded-md border border-border p-4">
            <div className="space-y-1.5">
              <Label htmlFor="subreddits" className="text-xs">
                Specific subreddits (comma-separated)
              </Label>
              <Input
                id="subreddits"
                value={subredditsInput}
                onChange={(e) => setSubredditsInput(e.target.value)}
                placeholder="programming, MachineLearning, webdev"
                disabled={isLoading}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="timeRange" className="text-xs">
                Time range
              </Label>
              <Select
                value={timeRange}
                onValueChange={(v) => setTimeRange(v as TimeRange)}
                disabled={isLoading}
              >
                <SelectTrigger id="timeRange" className="h-8 text-sm">
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Past 24 hours</SelectItem>
                  <SelectItem value="week">Past week</SelectItem>
                  <SelectItem value="month">Past month</SelectItem>
                  <SelectItem value="year">Past year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="maxPosts" className="text-xs">
                Max posts (5–100, default 30)
              </Label>
              <Input
                id="maxPosts"
                type="number"
                min={5}
                max={100}
                value={maxPostsInput}
                onChange={(e) => setMaxPostsInput(e.target.value)}
                placeholder="30"
                disabled={isLoading}
                className="h-8 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={!prompt.trim() || isLoading} className="flex-1">
          <Search className="mr-2 h-4 w-4" />
          {isLoading ? 'Generating plan…' : 'Analyze Reddit'}
        </Button>
        {isLoading && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
