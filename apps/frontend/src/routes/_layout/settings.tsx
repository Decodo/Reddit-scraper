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
import { CheckCircle, Circle, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  useSettingsQuery,
  useUpdateSettingsMutation,
} from '@/features/settings/api/useSettingsApi';

export const Route = createFileRoute('/_layout/settings')({
  component: SettingsPage,
});

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

  const [provider, setProvider] = useState('');
  const [model, setModel] = useState('');
  const [decodoApiKey, setDecodoApiKey] = useState('');
  const [anthropicApiKey, setAnthropicApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');

  const handleSave = () => {
    const input = {
      ...(provider && { provider }),
      ...(model.trim() && { model: model.trim() }),
      ...(decodoApiKey.trim() && { decodoApiKey: decodoApiKey.trim() }),
      ...(anthropicApiKey.trim() && { anthropicApiKey: anthropicApiKey.trim() }),
      ...(openaiApiKey.trim() && { openaiApiKey: openaiApiKey.trim() }),
      ...(geminiApiKey.trim() && { geminiApiKey: geminiApiKey.trim() }),
    };

    updateMutation.mutate(input, {
      onSuccess: () => {
        toast.success('Settings saved');
        setDecodoApiKey('');
        setAnthropicApiKey('');
        setOpenaiApiKey('');
        setGeminiApiKey('');
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">LLM Provider</CardTitle>
          <CardDescription>
            Choose which AI model generates scraping plans and reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="provider">Provider</Label>
            <div className="flex items-center gap-3">
              <Select
                value={provider || status?.provider || 'claude'}
                onValueChange={setProvider}
                disabled={isLoading}
              >
                <SelectTrigger id="provider" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                  <SelectItem value="openai">GPT (OpenAI)</SelectItem>
                  <SelectItem value="gemini">Gemini (Google)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="model">Model override</Label>
            <Input
              id="model"
              value={model || status?.model || ''}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Leave blank to use default"
              disabled={isLoading}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              Defaults: claude-sonnet-4-20250514 · gpt-4o · gemini-2.5-flash
            </p>
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
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="decodoKey">Decodo API key</Label>
              {!isLoading && status && (
                <KeyStatusBadge isSet={status.decodoKeySet} />
              )}
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="anthropicKey">Anthropic API key</Label>
              {!isLoading && status && (
                <KeyStatusBadge isSet={status.anthropicKeySet} />
              )}
            </div>
            <Input
              id="anthropicKey"
              type="password"
              value={anthropicApiKey}
              onChange={(e) => setAnthropicApiKey(e.target.value)}
              placeholder="Set new key…"
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="openaiKey">OpenAI API key</Label>
              {!isLoading && status && (
                <KeyStatusBadge isSet={status.openaiKeySet} />
              )}
            </div>
            <Input
              id="openaiKey"
              type="password"
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              placeholder="Set new key…"
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="geminiKey">Google Gemini API key</Label>
              {!isLoading && status && (
                <KeyStatusBadge isSet={status.geminiKeySet} />
              )}
            </div>
            <Input
              id="geminiKey"
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="Set new key…"
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
