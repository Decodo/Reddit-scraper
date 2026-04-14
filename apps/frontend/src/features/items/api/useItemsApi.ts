import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Item, CreateItemDto, UpdateItemDto } from "@platform/shared";
import { api } from "@/lib/api";

const ITEMS_KEY = ["items"] as const;

const fetchItems = async (): Promise<Item[]> => {
  const { data } = await api.get<Item[]>("/items");
  return data;
};

const fetchItem = async (id: string): Promise<Item> => {
  const { data } = await api.get<Item>(`/items/${id}`);
  return data;
};

const createItem = async (dto: CreateItemDto): Promise<Item> => {
  const { data } = await api.post<Item>("/items", dto);
  return data;
};

const updateItem = async ({ id, dto }: { id: string; dto: UpdateItemDto }): Promise<Item> => {
  const { data } = await api.patch<Item>(`/items/${id}`, dto);
  return data;
};

const deleteItem = async (id: string): Promise<void> => {
  await api.delete(`/items/${id}`);
};

export const useItemsQuery = () =>
  useQuery({ queryKey: ITEMS_KEY, queryFn: fetchItems });

export const useItemQuery = (id: string) =>
  useQuery({ queryKey: [...ITEMS_KEY, id], queryFn: () => fetchItem(id), enabled: !!id });

export const useCreateItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ITEMS_KEY }),
  });
};

export const useUpdateItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ITEMS_KEY }),
  });
};

export const useDeleteItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ITEMS_KEY }),
  });
};
