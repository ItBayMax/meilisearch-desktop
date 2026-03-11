export interface Project {
  id: number;
  name: string;
  url: string;
  api_key: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectData {
  name: string;
  url: string;
  api_key?: string;
  description?: string;
}

export interface UpdateProjectData {
  name?: string;
  url?: string;
  api_key?: string;
  description?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  version?: string;
  message?: string;
}

export interface ProjectStats {
  databaseSize: number;
  indexes: Record<string, IndexStats>;
}

export interface IndexStats {
  numberOfDocuments: number;
  isIndexing: boolean;
  fieldDistribution: Record<string, number>;
}

export interface MeilisearchIndex {
  uid: string;
  primary_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentsResult {
  results: Record<string, unknown>[];
  offset: number;
  limit: number;
  total: number;
}

export interface SearchParams {
  q?: string;
  offset?: number;
  limit?: number;
  filter?: string;
  sort?: string[];
  facets?: string[];
  attributesToRetrieve?: string[];
  attributesToHighlight?: string[];
  showRankingScore?: boolean;
  showRankingScoreDetails?: boolean;
  vector?: number[];
  hybrid?: Record<string, unknown>;
}

export interface SearchResult {
  hits: Record<string, unknown>[];
  offset: number;
  limit: number;
  estimatedTotalHits: number;
  processingTimeMs: number;
  query: string;
  facetDistribution?: Record<string, Record<string, number>>;
  semanticHitCount?: number;
}

export interface MeilisearchTask {
  uid: number;
  indexUid: string | null;
  status: "enqueued" | "processing" | "succeeded" | "failed" | "canceled";
  type: string;
  duration: string | null;
  enqueuedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  error: Record<string, unknown> | null;
  details: Record<string, unknown> | null;
  batchUid: number | null;
}

export interface TasksResult {
  results: MeilisearchTask[];
  total: number;
  limit: number;
  from: number;
  next: number | null;
}

export interface TaskFilters {
  statuses?: string[];
  types?: string[];
  indexUids?: string[];
  uids?: number[];
  beforeEnqueuedAt?: string;
  afterEnqueuedAt?: string;
  beforeStartedAt?: string;
  afterStartedAt?: string;
  beforeFinishedAt?: string;
  afterFinishedAt?: string;
  limit?: number;
  from?: number;
}

export interface ApiKey {
  uid: string;
  key: string;
  name: string | null;
  description: string | null;
  actions: string[];
  indexes: string[];
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKeyData {
  name?: string;
  description?: string;
  actions: string[];
  indexes: string[];
  expiresAt?: string | null;
  uid?: string;
}

export interface UpdateKeyData {
  name?: string;
  description?: string;
}

export interface IndexSettings {
  displayedAttributes?: string[];
  searchableAttributes?: string[];
  filterableAttributes?: string[];
  sortableAttributes?: string[];
  rankingRules?: string[];
  stopWords?: string[];
  synonyms?: Record<string, string[]>;
  typoTolerance?: TypoToleranceSettings;
  pagination?: PaginationSettings;
  faceting?: FacetingSettings;
  dictionary?: string[];
  separatorTokens?: string[];
  nonSeparatorTokens?: string[];
  embedders?: Record<string, EmbedderConfig>;
}

export interface TypoToleranceSettings {
  enabled: boolean;
  minWordSizeForTypos?: {
    oneTypo: number;
    twoTypos: number;
  };
  disableOnWords?: string[];
  disableOnAttributes?: string[];
}

export interface PaginationSettings {
  maxTotalHits: number;
}

export interface FacetingSettings {
  maxValuesPerFacet: number;
  sortFacetValuesBy?: Record<string, string>;
}

export interface ExperimentalFeatures {
  vectorStoreSetting?: boolean;
  metrics?: boolean;
  logsRoute?: boolean;
  editDocumentsByFunction?: boolean;
  containsFilter?: boolean;
  network?: boolean;
  chatCompletions?: boolean;
  multimodal?: boolean;
}

// ===== Embedders =====
export type EmbedderSource = "openAi" | "huggingFace" | "ollama" | "rest" | "userProvided";

export interface EmbedderConfig {
  source: EmbedderSource;
  apiKey?: string;
  model?: string;
  url?: string;
  dimensions?: number;
  documentTemplate?: string;
  documentTemplateMaxBytes?: number;
  revision?: string;
  pooling?: string;
  request?: Record<string, unknown>;
  response?: Record<string, unknown>;
  binaryQuantized?: boolean;
}

// ===== Filter Builder =====
export interface FilterCondition {
  attribute: string;
  operator: string;
  value: string;
}
