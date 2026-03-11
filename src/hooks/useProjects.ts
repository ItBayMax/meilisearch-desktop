import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "@/services/api";
import type { CreateProjectData, UpdateProjectData, ExperimentalFeatures } from "@/types";

export const projectKeys = {
  all: ["projects"] as const,
  list: (includeInactive?: boolean) =>
    [...projectKeys.all, "list", { includeInactive }] as const,
  detail: (id: number) => [...projectKeys.all, "detail", id] as const,
  stats: (id: number) => [...projectKeys.all, "stats", id] as const,
  experimental: (id: number) =>
    [...projectKeys.all, "experimental", id] as const,
};

export function useProjects(includeInactive = false) {
  return useQuery({
    queryKey: projectKeys.list(includeInactive),
    queryFn: () => projectApi.getAll(includeInactive),
  });
}

export function useProject(id: number | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(id!),
    queryFn: () => projectApi.get(id!),
    enabled: id !== undefined,
  });
}

export function useProjectStats(id: number | undefined) {
  return useQuery({
    queryKey: projectKeys.stats(id!),
    queryFn: () => projectApi.getStats(id!),
    enabled: id !== undefined,
  });
}

export function useExperimentalFeatures(id: number | undefined) {
  return useQuery({
    queryKey: projectKeys.experimental(id!),
    queryFn: () => projectApi.getExperimentalFeatures(id!),
    enabled: id !== undefined,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectData) => projectApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateProjectData;
    }) => projectApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, hard = false }: { id: number; hard?: boolean }) =>
      projectApi.delete(id, hard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useTestConnection() {
  return useMutation({
    mutationFn: ({ url, apiKey }: { url: string; apiKey?: string }) =>
      projectApi.testConnection(url, apiKey),
  });
}

export function useUpdateExperimentalFeatures(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (features: Partial<ExperimentalFeatures>) =>
      projectApi.updateExperimentalFeatures(projectId, features as ExperimentalFeatures),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.experimental(projectId),
      });
    },
  });
}
