import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { StoredQuery } from '@/features/tracker/tracker.types';

const QUERIES_KEY = ['queries'] as const;

const fetchQueries = async (): Promise<StoredQuery[]> => {
  const { data } = await api.get<StoredQuery[]>('/queries');
  return data;
};

const fetchQuery = async (id: string): Promise<StoredQuery> => {
  const { data } = await api.get<StoredQuery>(`/queries/${id}`);
  return data;
};

const deleteQuery = async (id: string): Promise<void> => {
  await api.delete(`/queries/${id}`);
};

export const useQueriesQuery = () =>
  useQuery({ queryKey: QUERIES_KEY, queryFn: fetchQueries });

export const useQueryDetailQuery = (id: string) =>
  useQuery({
    queryKey: [...QUERIES_KEY, id],
    queryFn: () => fetchQuery(id),
    enabled: !!id,
  });

export const useDeleteQueryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteQuery,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERIES_KEY }),
  });
};
