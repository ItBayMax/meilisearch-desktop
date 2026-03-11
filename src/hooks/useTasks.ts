import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "@/services/api";
import type { TaskFilters } from "@/types";

export const taskKeys = {
  all: (projectId: number) => ["tasks", projectId] as const,
  list: (projectId: number, filters?: TaskFilters) =>
    [...taskKeys.all(projectId), "list", filters] as const,
  detail: (projectId: number, taskUid: number) =>
    [...taskKeys.all(projectId), "detail", taskUid] as const,
};

export function useTasks(
  projectId: number | undefined,
  filters?: TaskFilters
) {
  return useQuery({
    queryKey: taskKeys.list(projectId!, filters),
    queryFn: () => taskApi.getAll(projectId!, filters),
    enabled: projectId !== undefined,
    refetchInterval: 5000,
  });
}

export function useTask(
  projectId: number | undefined,
  taskUid: number | undefined
) {
  return useQuery({
    queryKey: taskKeys.detail(projectId!, taskUid!),
    queryFn: () => taskApi.get(projectId!, taskUid!),
    enabled: projectId !== undefined && taskUid !== undefined,
  });
}

export function useCancelTasks(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (filters: TaskFilters) => taskApi.cancel(projectId, filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all(projectId) });
    },
  });
}

export function useDeleteTasks(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (filters: TaskFilters) => taskApi.delete(projectId, filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all(projectId) });
    },
  });
}

export function useWaitForTask(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskUid,
      timeout,
    }: {
      taskUid: number;
      timeout?: number;
    }) => taskApi.waitFor(projectId, taskUid, timeout),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all(projectId) });
    },
  });
}
