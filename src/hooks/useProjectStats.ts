import { useQuery } from "@tanstack/react-query";
import { projectApi } from "@/services/api";

export function useProjectStats(projectId: number | undefined) {
  return useQuery({
    queryKey: ["project", "stats", projectId],
    queryFn: () => projectApi.getStats(projectId!),
    enabled: projectId !== undefined,
  });
}
