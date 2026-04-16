import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface SettingsStatus {
  provider: string;
  model: string;
  decodoKeySet: boolean;
  anthropicKeySet: boolean;
  openaiKeySet: boolean;
  geminiKeySet: boolean;
}

export interface UpdateSettingsInput {
  provider?: string;
  model?: string;
  decodoApiKey?: string;
  anthropicApiKey?: string;
  openaiApiKey?: string;
  geminiApiKey?: string;
}

const SETTINGS_KEY = ['settings'] as const;

const fetchSettings = async (): Promise<SettingsStatus> => {
  const { data } = await api.get<SettingsStatus>('/settings');
  return data;
};

const updateSettings = async (input: UpdateSettingsInput): Promise<SettingsStatus> => {
  const { data } = await api.patch<SettingsStatus>('/settings', input);
  return data;
};

export const useSettingsQuery = () =>
  useQuery({ queryKey: SETTINGS_KEY, queryFn: fetchSettings });

export const useUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(SETTINGS_KEY, data);
    },
  });
};
