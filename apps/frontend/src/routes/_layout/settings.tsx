import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, Circle, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  useSettingsQuery,
  useUpdateSettingsMutation,
} from '@/features/settings/api/useSettingsApi';
import type { SettingsStatus } from '@/features/settings/api/useSettingsApi';

export const Route = createFileRoute('/_layout/settings')({
  component: SettingsPage,
});

type Provider = 'claude' | 'openai' | 'gemini';

const PROVIDER_META: Record<Provider, {
  label: string;
  keyLabel: string;
  placeholder: string;
  keyField: keyof SettingsStatus;
  dtoField: string;
  defaultModel: string;
}> = {
  claude: {
    label: 'Claude (Anthropic)',
    keyLabel: 'Anthropic API key',
    placeholder: 'sk-ant-api03-…',
    keyField: 'anthropicKeySet',
    dtoField: 'anthropicApiKey',
    defaultModel: 'claude-sonnet-4-20250514',
  },
  openai: {
    label: 'GPT (OpenAI)',
    keyLabel: 'OpenAI API key',
    placeholder: 'sk-proj-…',
    keyField: 'openaiKeySet',
    dtoField: 'openaiApiKey',
    defaultModel: 'gpt-4o',
  },
  gemini: {
    label: 'Gemini (Google)',
    keyLabel: 'Google Gemini API key',
    placeholder: 'AIzaSy…',
    keyField: 'geminiKeySet',
    dtoField: 'geminiApiKey',
    defaultModel: 'gemini-2.5-flash',
  },
};

const KeyStatusBadge = ({ isSet }: { isSet: boolean }) =>
  isSet ? (
    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
      <CheckCircle className="h-3.5 w-3.5" />
      Configured
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Circle className="h-3.5 w-3.5" />
      Not set
    </span>
  );

function SettingsPage() {
  const { data: status, isLoading } = useSettingsQuery();
  const updateMutation = useUpdateSettingsMutation();

  const [provider, setProvider] = useState<Provider | ''>('');
  const [model, setModel] = useState('');
  const [decodoApiKey, setDecodoApiKey] = useState('');
  const [llmApiKey, setLlmApiKey] = useState('');

  // Active provider: local override > saved status > default
  const activeProvider = (provider || status?.provider || 'claude') as Provider;
  const meta = PROVIDER_META[activeProvider];

  // Whether the active provider's key is already set (from saved status)
  const llmKeySet = status ? (status[meta.keyField] as boolean) : false;
  // Show warning only once status has loaded and key is missing
  const showMissingKeyWarning = !isLoading && status && !llmKeySet;
  const showMissingDecodoWarning = !isLoading && status && !status.decodoKeySet;

  const handleProviderChange = (val: string) => {
    setProvider(val as Provider);
    setLlmApiKey(''); // clear key input when switching providers
  };

  const handleSave = () => {
    const input = {
      ...(provider && { provider }),
      ...(model.trim() && { model: model.trim() }),
      ...(decodoApiKey.trim() && { decodoApiKey: decodoApiKey.trim() }),
      ...(llmApiKey.trim() && { [meta.dtoField]: llmApiKey.trim() }),
    };

    updateMutation.mutate(input, {
      onSuccess: () => {
        toast.success('Settings saved');
        setDecodoApiKey('');
        setLlmApiKey('');
      },
      onError: () => {
        toast.error('Failed to save settings');
      },
    });
  };

  return (
    <div className="py-6 space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure API keys and LLM preferences. Keys are stored securely on the server.
        </p>
      </div>

      {/* Missing key warnings */}
      {(showMissingKeyWarning || showMissingDecodoWarning) && (
        <div className="space-y-2">
          {showMissingDecodoWarning && (
            <div className="flex items-start gap-2 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2.5 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Decodo API key is not set — scraping won't work until you add it below.</span>
            </div>
          )}
          {showMissingKeyWarning && (
            <div className="flex items-start gap-2 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2.5 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{meta.keyLabel} is not set — the selected LLM won't work until you add it below.</span>
            </div>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">LLM Provider</CardTitle>
          <CardDescription>
            You only need a key for the provider you choose to use.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="provider">Provider</Label>
            <Select
              value={activeProvider}
              onValueChange={handleProviderChange}
              disabled={isLoading}
            >
              <SelectTrigger id="provider" className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(PROVIDER_META) as [Provider, typeof meta][]).map(([key, m]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      {m.label}
                      {status && (status[m.keyField] as boolean) && (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="model">Model override</Label>
            <Input
              id="model"
              value={model || status?.model || ''}
              onChange={(e) => setModel(e.target.value)}
              placeholder={`Default: ${meta.defaultModel}`}
              disabled={isLoading}
              className="max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Keys</CardTitle>
          <CardDescription>
            Keys are write-only — existing values are never shown. Leave blank to keep the current key.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Decodo — always required */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="decodoKey">
                Decodo API key
                <span className="ml-1.5 text-xs text-muted-foreground">(required for scraping)</span>
              </Label>
              {!isLoading && status && <KeyStatusBadge isSet={status.decodoKeySet} />}
            </div>
            <Input
              id="decodoKey"
              type="password"
              value={decodoApiKey}
              onChange={(e) => setDecodoApiKey(e.target.value)}
              placeholder="Set new key…"
              autoComplete="off"
            />
          </div>

          <Separator />

          {/* LLM key — only for the active provider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="llmKey">
                {meta.keyLabel}
                <span className="ml-1.5 text-xs text-muted-foreground">(required for {activeProvider})</span>
              </Label>
              {!isLoading && status && <KeyStatusBadge isSet={llmKeySet} />}
            </div>
            <Input
              id="llmKey"
              type="password"
              value={llmApiKey}
              onChange={(e) => setLlmApiKey(e.target.value)}
              placeholder={meta.placeholder}
              autoComplete="off"
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={updateMutation.isPending || isLoading}
        className="w-full sm:w-auto"
      >
        <Save className="mr-2 h-4 w-4" />
        {updateMutation.isPending ? 'Saving…' : 'Save settings'}
      </Button>
    </div>
  );
}
