import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { indexApi } from "@/services/api";

export const indexKeys = {
  all: (projectId: number) => ["indexes", projectId] as const,
  list: (projectId: number) =>
    [...indexKeys.all(projectId), "list"] as const,
  detail: (projectId: number, uid: string) =>
    [...indexKeys.all(projectId), "detail", uid] as const,
  stats: (projectId: number, uid: string) =>
    [...indexKeys.all(projectId), "stats", uid] as const,
};

export function useIndexes(projectId: number | undefined) {
  return useQuery({
    queryKey: indexKeys.list(projectId!),
    queryFn: () => indexApi.getAll(projectId!),
    enabled: projectId !== undefined,
  });
}

export function useIndex(projectId: number | undefined, uid: string | undefined) {
  return useQuery({
    queryKey: indexKeys.detail(projectId!, uid!),
    queryFn: () => indexApi.get(projectId!, uid!),
    enabled: projectId !== undefined && uid !== undefined,
  });
}

export function useIndexStats(projectId: number | undefined, uid: string | undefined) {
  return useQuery({
    queryKey: indexKeys.stats(projectId!, uid!),
    queryFn: () => indexApi.getStats(projectId!, uid!),
    enabled: projectId !== undefined && uid !== undefined,
  });
}

export function useCreateIndex(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, primaryKey }: { uid: string; primaryKey?: string }) =>
      indexApi.create(projectId, uid, primaryKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: indexKeys.all(projectId) });
    },
  });
}

export function useDeleteIndex(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => indexApi.delete(projectId, uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: indexKeys.all(projectId) });
    },
  });
}
