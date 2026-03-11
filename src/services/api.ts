import { invoke } from "@tauri-apps/api/core";
import type {
  Project,
  CreateProjectData,
  UpdateProjectData,
  ConnectionTestResult,
  ProjectStats,
  MeilisearchIndex,
  IndexStats,
  DocumentsResult,
  SearchParams,
  SearchResult,
  TasksResult,
  TaskFilters,
  MeilisearchTask,
  ApiKey,
  CreateKeyData,
  UpdateKeyData,
  IndexSettings,
  ExperimentalFeatures,
} from "@/types";

// ===== Project API =====
export const projectApi = {
  getAll: (includeInactive = false) =>
    invoke<Project[]>("get_projects", { includeInactive }),
  get: (projectId: number) =>
    invoke<Project>("get_project", { projectId }),
  create: (data: CreateProjectData) => {
    const { api_key, ...rest } = data;
    return invoke<Project>("create_project", { ...rest, apiKey: api_key });
  },
  update: (projectId: number, data: UpdateProjectData) => {
    const { api_key, ...rest } = data;
    return invoke<Project>("update_project", { projectId, ...rest, apiKey: api_key });
  },
  delete: (projectId: number, hard = false) =>
    invoke<void>("delete_project", { projectId, hard }),
  testConnection: (url: string, apiKey?: string) =>
    invoke<ConnectionTestResult>("test_connection", { url, apiKey }),
  getStats: (projectId: number) =>
    invoke<ProjectStats>("get_project_stats", { projectId }),
  getExperimentalFeatures: (projectId: number) =>
    invoke<ExperimentalFeatures>("get_experimental_features", { projectId }),
  updateExperimentalFeatures: (projectId: number, features: ExperimentalFeatures) =>
    invoke<ExperimentalFeatures>("update_experimental_features", { projectId, features }),
};

// ===== Index API =====
export const indexApi = {
  getAll: (projectId: number) =>
    invoke<MeilisearchIndex[]>("get_indexes", { projectId }),
  get: (projectId: number, uid: string) =>
    invoke<MeilisearchIndex>("get_index", { projectId, uid }),
  create: (projectId: number, uid: string, primaryKey?: string) =>
    invoke<MeilisearchIndex>("create_index", { projectId, uid, primaryKey }),
  delete: (projectId: number, uid: string) =>
    invoke<void>("delete_index", { projectId, uid }),
  getStats: (projectId: number, uid: string) =>
    invoke<IndexStats>("get_index_stats", { projectId, uid }),
};

// ===== Document API =====
export const documentApi = {
  getAll: (projectId: number, uid: string, offset = 0, limit = 20, fields?: string[]) =>
    invoke<DocumentsResult>("get_documents", { projectId, uid, offset, limit, fields }),
  get: (projectId: number, uid: string, docId: string) =>
    invoke<Record<string, unknown>>("get_document", { projectId, uid, docId }),
  add: (projectId: number, uid: string, documentsJson: string, primaryKey?: string) =>
    invoke<Record<string, unknown>>("add_documents", { projectId, uid, documentsJson, primaryKey }),
  uploadFile: (projectId: number, uid: string, filePath: string, primaryKey?: string) =>
    invoke<Record<string, unknown>>("upload_documents_file", { projectId, uid, filePath, primaryKey }),
  fetchFromUrl: (projectId: number, uid: string, url: string, fieldPath?: string, primaryKey?: string, headers?: Record<string, string>) =>
    invoke<Record<string, unknown>>("fetch_documents_from_url", { projectId, uid, url, fieldPath, primaryKey, headers }),
  delete: (projectId: number, uid: string, docId: string) =>
    invoke<Record<string, unknown>>("delete_document", { projectId, uid, docId }),
  deleteMultiple: (projectId: number, uid: string, ids?: string[]) =>
    invoke<Record<string, unknown>>("delete_documents", { projectId, uid, ids }),
};

// ===== Search API =====
export const searchApi = {
  search: (projectId: number, uid: string, params: SearchParams) =>
    invoke<SearchResult>("search_documents", { projectId, uid, params }),
};

// ===== Settings API =====
export const settingsApi = {
  getAll: (projectId: number, uid: string) =>
    invoke<IndexSettings>("get_settings", { projectId, uid }),
  updateAll: (projectId: number, uid: string, settings: Partial<IndexSettings>) =>
    invoke<Record<string, unknown>>("update_settings", { projectId, uid, settings }),
  resetAll: (projectId: number, uid: string) =>
    invoke<Record<string, unknown>>("reset_settings", { projectId, uid }),
  getSearchableAttributes: (projectId: number, uid: string) =>
    invoke<string[]>("get_searchable_attributes", { projectId, uid }),
  updateSearchableAttributes: (projectId: number, uid: string, attributes: string[]) =>
    invoke<Record<string, unknown>>("update_searchable_attributes", { projectId, uid, attributes }),
  getDisplayedAttributes: (projectId: number, uid: string) =>
    invoke<string[]>("get_displayed_attributes", { projectId, uid }),
  updateDisplayedAttributes: (projectId: number, uid: string, attributes: string[]) =>
    invoke<Record<string, unknown>>("update_displayed_attributes", { projectId, uid, attributes }),
  getFilterableAttributes: (projectId: number, uid: string) =>
    invoke<string[]>("get_filterable_attributes", { projectId, uid }),
  updateFilterableAttributes: (projectId: number, uid: string, attributes: string[]) =>
    invoke<Record<string, unknown>>("update_filterable_attributes", { projectId, uid, attributes }),
  getSortableAttributes: (projectId: number, uid: string) =>
    invoke<string[]>("get_sortable_attributes", { projectId, uid }),
  updateSortableAttributes: (projectId: number, uid: string, attributes: string[]) =>
    invoke<Record<string, unknown>>("update_sortable_attributes", { projectId, uid, attributes }),
  getRankingRules: (projectId: number, uid: string) =>
    invoke<string[]>("get_ranking_rules", { projectId, uid }),
  updateRankingRules: (projectId: number, uid: string, rules: string[]) =>
    invoke<Record<string, unknown>>("update_ranking_rules", { projectId, uid, rules }),
  getSynonyms: (projectId: number, uid: string) =>
    invoke<Record<string, string[]>>("get_synonyms", { projectId, uid }),
  updateSynonyms: (projectId: number, uid: string, synonyms: Record<string, string[]>) =>
    invoke<Record<string, unknown>>("update_synonyms", { projectId, uid, synonyms }),
  getStopWords: (projectId: number, uid: string) =>
    invoke<string[]>("get_stop_words", { projectId, uid }),
  updateStopWords: (projectId: number, uid: string, words: string[]) =>
    invoke<Record<string, unknown>>("update_stop_words", { projectId, uid, words }),
  getTypoTolerance: (projectId: number, uid: string) =>
    invoke<Record<string, unknown>>("get_typo_tolerance", { projectId, uid }),
  updateTypoTolerance: (projectId: number, uid: string, settings: Record<string, unknown>) =>
    invoke<Record<string, unknown>>("update_typo_tolerance", { projectId, uid, settings }),
  getPaginationSettings: (projectId: number, uid: string) =>
    invoke<Record<string, unknown>>("get_pagination_settings", { projectId, uid }),
  updatePaginationSettings: (projectId: number, uid: string, settings: Record<string, unknown>) =>
    invoke<Record<string, unknown>>("update_pagination_settings", { projectId, uid, settings }),
  getFaceting: (projectId: number, uid: string) =>
    invoke<Record<string, unknown>>("get_faceting", { projectId, uid }),
  updateFaceting: (projectId: number, uid: string, settings: Record<string, unknown>) =>
    invoke<Record<string, unknown>>("update_faceting", { projectId, uid, settings }),
  getDictionary: (projectId: number, uid: string) =>
    invoke<string[]>("get_dictionary", { projectId, uid }),
  updateDictionary: (projectId: number, uid: string, words: string[]) =>
    invoke<Record<string, unknown>>("update_dictionary", { projectId, uid, words }),
  getSeparatorTokens: (projectId: number, uid: string) =>
    invoke<string[]>("get_separator_tokens", { projectId, uid }),
  updateSeparatorTokens: (projectId: number, uid: string, tokens: string[]) =>
    invoke<Record<string, unknown>>("update_separator_tokens", { projectId, uid, tokens }),
  getSearchCutoffMs: (projectId: number, uid: string) =>
    invoke<number | null>("get_search_cutoff_ms", { projectId, uid }),
  updateSearchCutoffMs: (projectId: number, uid: string, value: number | null) =>
    invoke<Record<string, unknown>>("update_search_cutoff_ms", { projectId, uid, value }),
  getPrefixSearch: (projectId: number, uid: string) =>
    invoke<string>("get_prefix_search", { projectId, uid }),
  updatePrefixSearch: (projectId: number, uid: string, value: string) =>
    invoke<Record<string, unknown>>("update_prefix_search", { projectId, uid, value }),
};

// ===== Task API =====
export const taskApi = {
  getAll: (projectId: number, params?: TaskFilters) =>
    invoke<TasksResult>("get_tasks", { projectId, params }),
  get: (projectId: number, taskUid: number) =>
    invoke<MeilisearchTask>("get_task", { projectId, taskUid }),
  cancel: (projectId: number, filters: TaskFilters) =>
    invoke<Record<string, unknown>>("cancel_tasks", { projectId, filters }),
  delete: (projectId: number, filters: TaskFilters) =>
    invoke<Record<string, unknown>>("delete_tasks", { projectId, filters }),
  waitFor: (projectId: number, taskUid: number, timeout?: number) =>
    invoke<MeilisearchTask>("wait_for_task", { projectId, taskUid, timeout }),
};

// ===== Key API =====
export const keyApi = {
  getAll: (projectId: number) =>
    invoke<ApiKey[]>("get_keys", { projectId }),
  get: (projectId: number, key: string) =>
    invoke<ApiKey>("get_key", { projectId, key }),
  create: (projectId: number, options: CreateKeyData) =>
    invoke<ApiKey>("create_key", { projectId, options }),
  update: (projectId: number, key: string, options: UpdateKeyData) =>
    invoke<ApiKey>("update_key", { projectId, key, options }),
  delete: (projectId: number, key: string) =>
    invoke<void>("delete_key", { projectId, key }),
};
