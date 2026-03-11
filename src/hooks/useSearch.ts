import { useMutation, useQuery } from "@tanstack/react-query";
import { searchApi } from "@/services/api";
import type { SearchParams } from "@/types";

export function useSearch(projectId: number, uid: string) {
  return useMutation({
    mutationFn: (params: SearchParams) =>
      searchApi.search(projectId, uid, params),
  });
}

export function useInitialSearch(projectId: number, uid: string) {
  return useQuery({
    queryKey: ["search", "initial", projectId, uid],
    queryFn: () =>
      searchApi.search(projectId, uid, {
        q: "",
        limit: 20,
        attributesToHighlight: ["*"],
      }),
  });
}
