import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentApi, taskApi } from "@/services/api";
import { indexKeys } from "./useIndexes";

export const documentKeys = {
  all: (projectId: number, uid: string) =>
    ["documents", projectId, uid] as const,
  list: (projectId: number, uid: string, offset: number, limit: number) =>
    [...documentKeys.all(projectId, uid), "list", { offset, limit }] as const,
  detail: (projectId: number, uid: string, docId: string) =>
    [...documentKeys.all(projectId, uid), "detail", docId] as const,
};

/** Wait for a Meilisearch task to complete, then invalidate document & stats queries */
async function waitAndInvalidate(
  projectId: number,
  uid: string,
  taskResult: Record<string, unknown>,
  queryClient: ReturnType<typeof useQueryClient>,
) {
  const taskUid = taskResult.taskUid as number | undefined;
  if (taskUid !== undefined) {
    await taskApi.waitFor(projectId, taskUid, 30000);
  }
  queryClient.invalidateQueries({
    queryKey: documentKeys.all(projectId, uid),
  });
  queryClient.invalidateQueries({
    queryKey: indexKeys.stats(projectId, uid),
  });
}

export function useDocuments(
  projectId: number | undefined,
  uid: string | undefined,
  offset = 0,
  limit = 20,
  fields?: string[]
) {
  return useQuery({
    queryKey: documentKeys.list(projectId!, uid!, offset, limit),
    queryFn: () => documentApi.getAll(projectId!, uid!, offset, limit, fields),
    enabled: projectId !== undefined && uid !== undefined,
  });
}

export function useDocument(
  projectId: number | undefined,
  uid: string | undefined,
  docId: string | undefined
) {
  return useQuery({
    queryKey: documentKeys.detail(projectId!, uid!, docId!),
    queryFn: () => documentApi.get(projectId!, uid!, docId!),
    enabled:
      projectId !== undefined && uid !== undefined && docId !== undefined,
  });
}

export function useAddDocuments(projectId: number, uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      documentsJson,
      primaryKey,
    }: {
      documentsJson: string;
      primaryKey?: string;
    }) => documentApi.add(projectId, uid, documentsJson, primaryKey),
    onSuccess: (data) =>
      waitAndInvalidate(projectId, uid, data, queryClient),
  });
}

export function useUploadDocuments(projectId: number, uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      filePath,
      primaryKey,
    }: {
      filePath: string;
      primaryKey?: string;
    }) => documentApi.uploadFile(projectId, uid, filePath, primaryKey),
    onSuccess: (data) =>
      waitAndInvalidate(projectId, uid, data, queryClient),
  });
}

export function useFetchDocumentsFromUrl(projectId: number, uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      url,
      fieldPath,
      primaryKey,
      headers,
    }: {
      url: string;
      fieldPath?: string;
      primaryKey?: string;
      headers?: Record<string, string>;
    }) => documentApi.fetchFromUrl(projectId, uid, url, fieldPath, primaryKey, headers),
    onSuccess: (data) =>
      waitAndInvalidate(projectId, uid, data, queryClient),
  });
}

export function useDeleteDocument(projectId: number, uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) => documentApi.delete(projectId, uid, docId),
    onSuccess: (data) =>
      waitAndInvalidate(projectId, uid, data, queryClient),
  });
}

export function useDeleteDocuments(projectId: number, uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids?: string[]) =>
      documentApi.deleteMultiple(projectId, uid, ids),
    onSuccess: (data) =>
      waitAndInvalidate(projectId, uid, data, queryClient),
  });
}
