import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle, Circle, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  useSettingsQuery,
  useUpdateSettingsMutation,
} from '@/features/settings/api/useSettingsApi';

export const Route = createFileRoute('/_layout/settings')({
  component: SettingsPage,
});

type Provider = 'claude' | 'openai' | 'gemini';

const PROVIDER_LABELS: Record<Provider, string> = {
  claude: 'Claude (Anthropic)',
  openai: 'GPT (OpenAI)',
  gemini: 'Gemini (Google)',
};

const PROVIDER_DEFAULT_MODELS: Record<Provider, string> = {
  claude: 'claude-sonnet-4-20250514',
  openai: 'gpt-4o',
  gemini: 'gemini-2.5-flash',
};

const KeyRow = ({
  label,
  isSet,
  isLoading,
}: {
  label: string;
  isSet?: boolean;
  isLoading: boolean;
}) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm">{label}</span>
    {isLoading ? (
      <Skeleton className="h-4 w-20" />
    ) : isSet ? (
      <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
        <CheckCircle className="h-3.5 w-3.5" />
        Configured
      </span>
    ) : (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Circle className="h-3.5 w-3.5" />
        Not set
      </span>
    )}
  </div>
);

function SettingsPage() {
  const { data: status, isLoading } = useSettingsQuery();
  const updateMutation = useUpdateSettingsMutation();

  const [provider, setProvider] = useState<Provider>('claude');
  const [model, setModel] = useState('');

  // Sync local state once status loads
  useEffect(() => {
    if (status) {
      setProvider((status.provider as Provider) || 'claude');
      setModel(status.model || '');
    }
  }, [status]);

  const llmKeySet =
    provider === 'openai'
      ? status?.openaiKeySet
      : provider === 'gemini'
        ? status?.geminiKeySet
        : status?.anthropicKeySet;

  const missingDecodo = !isLoading && status && !status.decodoKeySet;
  const missingLlmKey = !isLoading && status && !llmKeySet;

  const isDirty =
    status !== undefined &&
    (provider !== status.provider || model !== (status.model ?? ''));

  const handleSave = () => {
    updateMutation.mutate(
      { provider, model },
      {
        onSuccess: () => toast.success('Settings saved'),
        onError: () => toast.error('Failed to save settings'),
      },
    );
  };

  return (
    <div className="py-6 space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose your LLM provider. API keys are configured via <code className="font-mono">.env</code> on the server.
        </p>
      </div>

      {/* Warnings */}
      {(missingDecodo || missingLlmKey) && (
        <div className="space-y-2">
          {missingDecodo && (
            <div className="flex items-start gap-2 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2.5 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <code className="font-mono">DECODO_BASIC_AUTH_TOKEN</code> is not set in your{' '}
                <code className="font-mono">.env</code> — scraping won't work.
              </span>
            </div>
          )}
          {missingLlmKey && (
            <div className="flex items-start gap-2 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2.5 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                No API key found for <code className="font-mono">{provider}</code> — add{' '}
                <code className="font-mono">
                  {provider === 'openai'
                    ? 'OPENAI_API_KEY'
                    : provider === 'gemini'
                      ? 'GEMINI_API_KEY'
                      : 'ANTHROPIC_API_KEY'}
                </code>{' '}
                to your <code className="font-mono">.env</code>.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Provider selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">LLM Provider</CardTitle>
          <CardDescription>
            Select which provider to use. Only the key for the selected provider needs to be set.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="provider">Provider</Label>
            <Select
              value={provider}
              onValueChange={(v) => { setProvider(v as Provider); setModel(''); }}
              disabled={isLoading}
            >
              <SelectTrigger id="provider" className="w-full sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(PROVIDER_LABELS) as [Provider, string][]).map(([key, label]) => {
                  const keySet =
                    key === 'openai'
                      ? status?.openaiKeySet
                      : key === 'gemini'
                        ? status?.geminiKeySet
                        : status?.anthropicKeySet;
                  return (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        {label}
                        {keySet && <CheckCircle className="h-3 w-3 text-green-500" />}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="model">Model override</Label>
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={`Default: ${PROVIDER_DEFAULT_MODELS[provider]}`}
              disabled={isLoading}
              className="w-full sm:max-w-xs"
            />
            <p className="text-xs text-muted-foreground">Leave blank to use the provider's default model.</p>
          </div>

          <Button
            onClick={handleSave}
            disabled={!isDirty || updateMutation.isPending || isLoading}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Save className="mr-2 h-3.5 w-3.5" />
            {updateMutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </CardContent>
      </Card>

      {/* Key status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Keys</CardTitle>
          <CardDescription>
            Set via environment variables in your <code className="font-mono text-xs">.env</code>.
            Keys are never stored in the database.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          <KeyRow label="Anthropic API key (ANTHROPIC_API_KEY)" isSet={status?.anthropicKeySet} isLoading={isLoading} />
          <KeyRow label="OpenAI API key (OPENAI_API_KEY)" isSet={status?.openaiKeySet} isLoading={isLoading} />
          <KeyRow label="Gemini API key (GEMINI_API_KEY)" isSet={status?.geminiKeySet} isLoading={isLoading} />
          <KeyRow label="Decodo token (DECODO_BASIC_AUTH_TOKEN)" isSet={status?.decodoKeySet} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
