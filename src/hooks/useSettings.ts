import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/services/api";
import type { EmbedderConfig } from "@/types";

export const settingsKeys = {
  all: (projectId: number, uid: string) =>
    ["settings", projectId, uid] as const,
  full: (projectId: number, uid: string) =>
    [...settingsKeys.all(projectId, uid), "full"] as const,
  searchable: (projectId: number, uid: string) =>
    [...settingsKeys.all(projectId, uid), "searchable"] as const,
  displayed: (projectId: number, uid: string) =>
    [...settingsKeys.all(projectId, uid), "displayed"] as const,
  filterable: (projectId: number, uid: string) =>
    [...settingsKeys.all(projectId, uid), "filterable"] as const,
  sortable: (projectId: number, uid: string) =>
    [...settingsKeys.all(projectId, uid), "sortable"] as const,
  ranking: (projectId: number, uid: string) =>
    [...settingsKeys.all(projectId, uid), "ranking"] as const,
  synonyms: (projectId: number, uid: string) =>
    [...settingsKeys.all(projectId, uid), "synonyms"] as const,
  stopWords: (projectId: number, uid: string) =>
    [...settingsKeys.all(projectId, uid), "stopWords"] as const,
  typo: (projectId: number, uid: string) =>
    [...settingsKeys.all(projectId, uid), "typo"] as const,
  pagination: (projectId: number, uid: string) =>
    [...settingsKeys.all(projectId, uid), "pagination"] as const,
  faceting: (projectId: number, uid: string) =>
    [...settingsKeys.all(projectId, uid), "faceting"] as const,
  dictionary: (projectId: number, uid: string) =>
    [...settingsKeys.all(projectId, uid), "dictionary"] as const,
  separators: (projectId: number, uid: string) =>
    [...settingsKeys.all(projectId, uid), "separators"] as const,
  embedders: (projectId: number, uid: string) =>
    [...settingsKeys.all(projectId, uid), "embedders"] as const,
  searchCutoff: (projectId: number, uid: string) =>
    [...settingsKeys.all(projectId, uid), "searchCutoff"] as const,
  prefixSearch: (projectId: number, uid: string) =>
    [...settingsKeys.all(projectId, uid), "prefixSearch"] as const,
};

export function useAllSettings(
  projectId: number | undefined,
  uid: string | undefined
) {
  return useQuery({
    queryKey: settingsKeys.full(projectId!, uid!),
    queryFn: () => settingsApi.getAll(projectId!, uid!),
    enabled: projectId !== undefined && uid !== undefined,
  });
}

export function useUpdateAllSettings(projectId: number, uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: Record<string, unknown>) =>
      settingsApi.updateAll(projectId, uid, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.all(projectId, uid),
      });
    },
  });
}

export function useResetAllSettings(projectId: number, uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => settingsApi.resetAll(projectId, uid),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.all(projectId, uid),
      });
    },
  });
}

// Searchable attributes
export function useSearchableAttributes(
  projectId: number | undefined,
  uid: string | undefined
) {
  return useQuery({
    queryKey: settingsKeys.searchable(projectId!, uid!),
    queryFn: () => settingsApi.getSearchableAttributes(projectId!, uid!),
    enabled: projectId !== undefined && uid !== undefined,
  });
}

export function useUpdateSearchableAttributes(
  projectId: number,
  uid: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attributes: string[]) =>
      settingsApi.updateSearchableAttributes(projectId, uid, attributes),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.searchable(projectId, uid),
      });
    },
  });
}

// Displayed attributes
export function useDisplayedAttributes(
  projectId: number | undefined,
  uid: string | undefined
) {
  return useQuery({
    queryKey: settingsKeys.displayed(projectId!, uid!),
    queryFn: () => settingsApi.getDisplayedAttributes(projectId!, uid!),
    enabled: projectId !== undefined && uid !== undefined,
  });
}

export function useUpdateDisplayedAttributes(
  projectId: number,
  uid: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attributes: string[]) =>
      settingsApi.updateDisplayedAttributes(projectId, uid, attributes),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.displayed(projectId, uid),
      });
    },
  });
}

// Filterable attributes
export function useFilterableAttributes(
  projectId: number | undefined,
  uid: string | undefined
) {
  return useQuery({
    queryKey: settingsKeys.filterable(projectId!, uid!),
    queryFn: () => settingsApi.getFilterableAttributes(projectId!, uid!),
    enabled: projectId !== undefined && uid !== undefined,
  });
}

export function useUpdateFilterableAttributes(
  projectId: number,
  uid: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attributes: string[]) =>
      settingsApi.updateFilterableAttributes(projectId, uid, attributes),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.filterable(projectId, uid),
      });
    },
  });
}

// Sortable attributes
export function useSortableAttributes(
  projectId: number | undefined,
  uid: string | undefined
) {
  return useQuery({
    queryKey: settingsKeys.sortable(projectId!, uid!),
    queryFn: () => settingsApi.getSortableAttributes(projectId!, uid!),
    enabled: projectId !== undefined && uid !== undefined,
  });
}

export function useUpdateSortableAttributes(
  projectId: number,
  uid: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attributes: string[]) =>
      settingsApi.updateSortableAttributes(projectId, uid, attributes),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.sortable(projectId, uid),
      });
    },
  });
}

// Ranking rules
export function useRankingRules(
  projectId: number | undefined,
  uid: string | undefined
) {
  return useQuery({
    queryKey: settingsKeys.ranking(projectId!, uid!),
    queryFn: () => settingsApi.getRankingRules(projectId!, uid!),
    enabled: projectId !== undefined && uid !== undefined,
  });
}

export function useUpdateRankingRules(projectId: number, uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rules: string[]) =>
      settingsApi.updateRankingRules(projectId, uid, rules),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.ranking(projectId, uid),
      });
    },
  });
}

// Synonyms
export function useSynonyms(
  projectId: number | undefined,
  uid: string | undefined
) {
  return useQuery({
    queryKey: settingsKeys.synonyms(projectId!, uid!),
    queryFn: () => settingsApi.getSynonyms(projectId!, uid!),
    enabled: projectId !== undefined && uid !== undefined,
  });
}

export function useUpdateSynonyms(projectId: number, uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (synonyms: Record<string, string[]>) =>
      settingsApi.updateSynonyms(projectId, uid, synonyms),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.synonyms(projectId, uid),
      });
    },
  });
}

// Stop words
export function useStopWords(
  projectId: number | undefined,
  uid: string | undefined
) {
  return useQuery({
    queryKey: settingsKeys.stopWords(projectId!, uid!),
    queryFn: () => settingsApi.getStopWords(projectId!, uid!),
    enabled: projectId !== undefined && uid !== undefined,
  });
}

export function useUpdateStopWords(projectId: number, uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (words: string[]) =>
      settingsApi.updateStopWords(projectId, uid, words),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.stopWords(projectId, uid),
      });
    },
  });
}

// Typo tolerance
export function useTypoTolerance(
  projectId: number | undefined,
  uid: string | undefined
) {
  return useQuery({
    queryKey: settingsKeys.typo(projectId!, uid!),
    queryFn: () => settingsApi.getTypoTolerance(projectId!, uid!),
    enabled: projectId !== undefined && uid !== undefined,
  });
}

export function useUpdateTypoTolerance(projectId: number, uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: Record<string, unknown>) =>
      settingsApi.updateTypoTolerance(projectId, uid, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.typo(projectId, uid),
      });
    },
  });
}

// Pagination
export function usePaginationSettings(
  projectId: number | undefined,
  uid: string | undefined
) {
  return useQuery({
    queryKey: settingsKeys.pagination(projectId!, uid!),
    queryFn: () => settingsApi.getPaginationSettings(projectId!, uid!),
    enabled: projectId !== undefined && uid !== undefined,
  });
}

export function useUpdatePaginationSettings(
  projectId: number,
  uid: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: Record<string, unknown>) =>
      settingsApi.updatePaginationSettings(projectId, uid, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.pagination(projectId, uid),
      });
    },
  });
}

// Faceting
export function useFacetingSettings(
  projectId: number | undefined,
  uid: string | undefined
) {
  return useQuery({
    queryKey: settingsKeys.faceting(projectId!, uid!),
    queryFn: () => settingsApi.getFaceting(projectId!, uid!),
    enabled: projectId !== undefined && uid !== undefined,
  });
}

export function useUpdateFacetingSettings(
  projectId: number,
  uid: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: Record<string, unknown>) =>
      settingsApi.updateFaceting(projectId, uid, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.faceting(projectId, uid),
      });
    },
  });
}

// Dictionary
export function useDictionary(
  projectId: number | undefined,
  uid: string | undefined
) {
  return useQuery({
    queryKey: settingsKeys.dictionary(projectId!, uid!),
    queryFn: () => settingsApi.getDictionary(projectId!, uid!),
    enabled: projectId !== undefined && uid !== undefined,
  });
}

export function useUpdateDictionary(projectId: number, uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (words: string[]) =>
      settingsApi.updateDictionary(projectId, uid, words),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.dictionary(projectId, uid),
      });
    },
  });
}

// Separator tokens
export function useSeparatorTokens(
  projectId: number | undefined,
  uid: string | undefined
) {
  return useQuery({
    queryKey: settingsKeys.separators(projectId!, uid!),
    queryFn: () => settingsApi.getSeparatorTokens(projectId!, uid!),
    enabled: projectId !== undefined && uid !== undefined,
  });
}

export function useUpdateSeparatorTokens(projectId: number, uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tokens: string[]) =>
      settingsApi.updateSeparatorTokens(projectId, uid, tokens),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.separators(projectId, uid),
      });
    },
  });
}

// Embedders
export function useEmbedders(
  projectId: number | undefined,
  uid: string | undefined
) {
  return useQuery({
    queryKey: settingsKeys.embedders(projectId!, uid!),
    queryFn: async () => {
      const settings = await settingsApi.getAll(projectId!, uid!);
      const raw = settings as unknown as Record<string, unknown>;
      return (raw?.embedders as Record<string, EmbedderConfig> | null) ?? null;
    },
    enabled: projectId !== undefined && uid !== undefined,
  });
}

export function useUpdateEmbedders(projectId: number, uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (embedders: Record<string, EmbedderConfig | null>) =>
      settingsApi.updateAll(projectId, uid, { embedders } as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.all(projectId, uid),
      });
    },
  });
}

// Search cutoff
export function useSearchCutoffMs(
  projectId: number | undefined,
  uid: string | undefined
) {
  return useQuery({
    queryKey: settingsKeys.searchCutoff(projectId!, uid!),
    queryFn: () => settingsApi.getSearchCutoffMs(projectId!, uid!),
    enabled: projectId !== undefined && uid !== undefined,
  });
}

export function useUpdateSearchCutoffMs(projectId: number, uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (value: number | null) =>
      settingsApi.updateSearchCutoffMs(projectId, uid, value),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.searchCutoff(projectId, uid),
      });
    },
  });
}

// Prefix search
export function usePrefixSearch(
  projectId: number | undefined,
  uid: string | undefined
) {
  return useQuery({
    queryKey: settingsKeys.prefixSearch(projectId!, uid!),
    queryFn: () => settingsApi.getPrefixSearch(projectId!, uid!),
    enabled: projectId !== undefined && uid !== undefined,
  });
}

export function useUpdatePrefixSearch(projectId: number, uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (value: string) =>
      settingsApi.updatePrefixSearch(projectId, uid, value),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.prefixSearch(projectId, uid),
      });
    },
  });
}
