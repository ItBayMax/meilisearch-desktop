import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { keyApi } from "@/services/api";
import type { CreateKeyData, UpdateKeyData, ApiKey } from "@/types";

export const keyKeys = {
  all: (projectId: number) => ["keys", projectId] as const,
  list: (projectId: number) => [...keyKeys.all(projectId), "list"] as const,
  detail: (projectId: number, key: string) =>
    [...keyKeys.all(projectId), "detail", key] as const,
};

export function useKeys(projectId: number | undefined) {
  return useQuery<ApiKey[], Error>({
    queryKey: keyKeys.list(projectId!),
    queryFn: async () => {
      const response = await keyApi.getAll(projectId!);
      // Handle error response - if response is not an object with results, throw error
      if (typeof response === 'string') {
        throw new Error(response);
      }
      if (response && typeof response === 'object' && 'results' in response) {
        return (response as { results: ApiKey[] }).results;
      }
      // If response is already an array, return it
      if (Array.isArray(response)) {
        return response as ApiKey[];
      }
      // Default to empty array for unexpected formats
      return [];
    },
    enabled: projectId !== undefined,
  });
}

export function useKey(
  projectId: number | undefined,
  key: string | undefined
) {
  return useQuery({
    queryKey: keyKeys.detail(projectId!, key!),
    queryFn: () => keyApi.get(projectId!, key!),
    enabled: projectId !== undefined && key !== undefined,
  });
}

export function useCreateKey(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (options: CreateKeyData) => keyApi.create(projectId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keyKeys.all(projectId) });
    },
  });
}

export function useUpdateKey(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, options }: { key: string; options: UpdateKeyData }) =>
      keyApi.update(projectId, key, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keyKeys.all(projectId) });
    },
  });
}

export function useDeleteKey(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => keyApi.delete(projectId, key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keyKeys.all(projectId) });
    },
  });
}
