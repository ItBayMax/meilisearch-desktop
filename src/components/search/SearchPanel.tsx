import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Search as SearchIcon,
  Loader2,
  FileJson,
  Table as TableIcon,
  Copy,
  Timer,
  Target,
  BarChart3,
  X,
  ArrowUpDown,
  Brain,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { SearchLayout } from "@/components/layout/SearchLayout";
import { FilterBuilder, buildFilterString } from "./FilterBuilder";
import { ColumnSelector } from "./ColumnSelector";
import { VectorSearchConfig } from "./VectorSearchConfig";
import { ExportQueryDialog } from "./ExportQuery";
import { CellValue } from "./CellValue";
import { useSearch, useInitialSearch } from "@/hooks/useSearch";
import {
  useFilterableAttributes,
  useSortableAttributes,
  useAllSettings,
} from "@/hooks/useSettings";
import { useProject } from "@/hooks/useProjects";
import { useAddDocuments } from "@/hooks/useDocuments";
import type { SearchParams, SearchResult, FilterCondition, EmbedderConfig } from "@/types";

interface SearchPanelProps {
  projectId: number;
  indexId: string;
  indexSelectorNode?: React.ReactNode;
  onNavigateToEmbedders?: () => void;
}

export function SearchPanel({ projectId, indexId, indexSelectorNode, onNavigateToEmbedders }: SearchPanelProps) {
  const { t } = useTranslation();
  const searchMutation = useSearch(projectId, indexId);
  const { data: initialData } = useInitialSearch(projectId, indexId);
  const addDocsMutation = useAddDocuments(projectId, indexId);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch metadata for sidebar controls
  const { data: filterableAttrs } = useFilterableAttributes(projectId, indexId);
  const { data: sortableAttrs } = useSortableAttributes(projectId, indexId);
  const { data: allSettings } = useAllSettings(projectId, indexId);
  const { data: project } = useProject(projectId);

  // Extract embedder names
  const embedderNames = useMemo(() => {
    if (!allSettings) return [];
    const raw = allSettings as unknown as Record<string, unknown>;
    const embedders = raw?.embedders as Record<string, EmbedderConfig> | null;
    return embedders ? Object.keys(embedders) : [];
  }, [allSettings]);

  // Search state
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "json">("table");
  const [viewDoc, setViewDoc] = useState<Record<string, unknown> | null>(null);
  const [editDoc, setEditDoc] = useState<Record<string, unknown> | null>(null);
  const [editText, setEditText] = useState("");
  const [showExport, setShowExport] = useState(false);

  // Sidebar state
  const [limit, setLimit] = useState(20);
  const [showRankingScore, setShowRankingScore] = useState(false);
  const [sortAttribute, setSortAttribute] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);

  // Column selection
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // Vector search
  const [vectorEnabled, setVectorEnabled] = useState(false);
  const [semanticRatio, setSemanticRatio] = useState(0.5);
  const [selectedEmbedder, setSelectedEmbedder] = useState("");

  const result = (searchMutation.data ?? initialData) as SearchResult | undefined;

  // All columns from results
  const allColumns = useMemo(() => {
    if (!result?.hits?.length) return [];
    const fieldSet = new Set<string>();
    result.hits.forEach((hit) =>
      Object.keys(hit).forEach((k) => {
        if (!k.startsWith("_")) fieldSet.add(k);
      })
    );
    return Array.from(fieldSet);
  }, [result]);

  // Auto-init selected columns when results come in
  const visibleColumns = useMemo(() => {
    if (selectedColumns.length > 0) {
      return selectedColumns.filter((c) => allColumns.includes(c));
    }
    return allColumns.slice(0, 6);
  }, [selectedColumns, allColumns]);

  // Build search params
  const buildSearchParams = useCallback((): SearchParams => {
    const params: SearchParams = {
      q: query,
      limit,
      showRankingScore,
      attributesToHighlight: ["*"],
    };

    // Filter
    const filterStr = buildFilterString(filterConditions);
    if (filterStr) params.filter = filterStr;

    // Sort
    if (sortAttribute && sortAttribute.trim()) {
      params.sort = [`${sortAttribute}:${sortDirection}`];
    }

    // Columns
    if (selectedColumns.length > 0) {
      params.attributesToRetrieve = selectedColumns;
    }

    // Vector/hybrid search
    if (vectorEnabled && selectedEmbedder) {
      params.hybrid = {
        semanticRatio,
        embedder: selectedEmbedder,
      };
    }

    return params;
  }, [
    query,
    limit,
    showRankingScore,
    filterConditions,
    sortAttribute,
    sortDirection,
    selectedColumns,
    vectorEnabled,
    semanticRatio,
    selectedEmbedder,
  ]);

  const handleSearch = useCallback(() => {
    searchMutation.mutate(buildSearchParams());
  }, [searchMutation, buildSearchParams]);

  // Auto-trigger search when showRankingScore changes
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (result) {
      searchMutation.mutate(buildSearchParams());
    }
  }, [showRankingScore]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const copyDocJson = (hit: Record<string, unknown>, e: React.MouseEvent) => {
    e.stopPropagation();
    // Remove internal fields
    const clean = Object.fromEntries(
      Object.entries(hit).filter(([k]) => !k.startsWith("_"))
    );
    navigator.clipboard.writeText(JSON.stringify(clean, null, 2));
    toast.success(t("common.copied"));
  };

  const openEditDoc = (hit: Record<string, unknown>, e: React.MouseEvent) => {
    e.stopPropagation();
    const clean = Object.fromEntries(
      Object.entries(hit).filter(([k]) => !k.startsWith("_"))
    );
    setEditDoc(clean);
    setEditText(JSON.stringify(clean, null, 2));
  };

  const handleSaveEdit = async () => {
    try {
      const parsed = JSON.parse(editText);
      const docs = Array.isArray(parsed) ? parsed : [parsed];
      await addDocsMutation.mutateAsync({ documentsJson: JSON.stringify(docs) });
      toast.success(t("common.success"));
      setEditDoc(null);
      // Re-search to refresh
      handleSearch();
    } catch (err) {
      toast.error(err instanceof SyntaxError ? "Invalid JSON" : String(err));
    }
  };

  // Sidebar content
  const sidebarContent = (
    <>
      {/* Index selector (when provided, e.g. project-level search) */}
      {indexSelectorNode && (
        <>
          {indexSelectorNode}
          <div className="border-t border-border" />
        </>
      )}

      {/* Sort options */}
      <div className="space-y-2">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <ArrowUpDown className="w-3 h-3" />
          {t("search.sortBy")}
        </Label>
        {sortableAttrs && sortableAttrs.length > 0 ? (
          <div className="flex gap-1.5">
            <Select value={sortAttribute} onValueChange={setSortAttribute}>
              <SelectTrigger className="h-7 text-xs flex-1">
                <SelectValue placeholder={t("search.sort.sortAttribute")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" " className="text-xs text-muted-foreground">
                  —
                </SelectItem>
                {sortableAttrs.map((attr) => (
                  <SelectItem
                    key={typeof attr === "string" ? attr : String(attr)}
                    value={typeof attr === "string" ? attr : String(attr)}
                    className="text-xs"
                  >
                    {typeof attr === "string" ? attr : String(attr)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() =>
                setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
              }
            >
              {sortDirection === "asc"
                ? t("search.sort.ascending")
                : t("search.sort.descending")}
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {t("search.sort.noSortableAttributes")}
          </p>
        )}
      </div>

      <div className="border-t border-border" />

      {/* Column selector */}
      <ColumnSelector
        allColumns={allColumns}
        selectedColumns={
          selectedColumns.length > 0 ? selectedColumns : allColumns.slice(0, 6)
        }
        onSelectedChange={setSelectedColumns}
      />

      <div className="border-t border-border" />

      {/* View mode */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">{t("search.viewMode")}</Label>
        <div className="flex gap-1">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs flex-1"
            onClick={() => setViewMode("table")}
          >
            <TableIcon className="w-3 h-3 mr-1" />
            {t("search.tableView")}
          </Button>
          <Button
            variant={viewMode === "json" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs flex-1"
            onClick={() => setViewMode("json")}
          >
            <FileJson className="w-3 h-3 mr-1" />
            {t("search.jsonView")}
          </Button>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Ranking score */}
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{t("search.rankingScore")}</Label>
        <Switch
          checked={showRankingScore}
          onCheckedChange={setShowRankingScore}
          className="scale-90"
        />
      </div>

      <div className="border-t border-border" />

      {/* Limit */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">{t("search.limit")}</Label>
        <Select
          value={String(limit)}
          onValueChange={(v) => setLimit(Number(v))}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 50, 100].map((n) => (
              <SelectItem key={n} value={String(n)} className="text-xs">
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border-t border-border" />

      {/* Filter builder */}
      <FilterBuilder
        filterableAttributes={
          filterableAttrs
            ? (filterableAttrs as unknown as string[]).map((a) =>
                typeof a === "string" ? a : String(a)
              )
            : []
        }
        conditions={filterConditions}
        onConditionsChange={setFilterConditions}
        onApply={handleSearch}
      />

      <div className="border-t border-border" />

      {/* Vector search */}
      <VectorSearchConfig
        enabled={vectorEnabled}
        onEnabledChange={setVectorEnabled}
        semanticRatio={semanticRatio}
        onSemanticRatioChange={setSemanticRatio}
        embedder={selectedEmbedder}
        onEmbedderChange={setSelectedEmbedder}
        availableEmbedders={embedderNames}
        projectId={projectId}
        indexId={indexId}
        onGoToEmbedders={onNavigateToEmbedders}
      />

      <div className="border-t border-border" />

      {/* Export */}
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs w-full"
        onClick={() => setShowExport(true)}
      >
        {t("search.export.exportQuery")}
      </Button>
    </>
  );

  return (
    <SearchLayout sidebarContent={sidebarContent}>
      <div className="p-4 space-y-4">
        {/* Search input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("search.searchPlaceholder")}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} disabled={searchMutation.isPending}>
            {searchMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <SearchIcon className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Results summary */}
        {result && (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm">
              <Target className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {t("search.totalHits")}:
              </span>
              <span className="font-medium">
                {(result.estimatedTotalHits ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Timer className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {t("search.processingTime")}:
              </span>
              <span className="font-medium">
                {result.processingTimeMs ?? 0}ms
              </span>
            </div>
            {result.semanticHitCount !== undefined && (
              <div className="flex items-center gap-1.5 text-sm">
                <Brain className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t("search.vector.semanticHits")}:
                </span>
                <span className="font-medium">{result.semanticHitCount}</span>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {searchMutation.isError && (
          <Card>
            <CardContent className="p-4 text-sm text-destructive">
              {String(searchMutation.error)}
            </CardContent>
          </Card>
        )}

        {/* No results */}
        {result && result.hits.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <SearchIcon className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">
                {t("search.noResults")}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Table view */}
        {result && result.hits.length > 0 && viewMode === "table" && (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    {/* Action column */}
                    <TableHead className="text-xs font-medium w-[90px]">
                      {t("common.actions")}
                    </TableHead>
                    {showRankingScore && (
                      <TableHead className="text-xs font-medium w-[80px]">
                        Score
                      </TableHead>
                    )}
                    {visibleColumns.map((col) => (
                      <TableHead
                        key={col}
                        className="text-xs font-medium whitespace-nowrap"
                      >
                        {col}
                      </TableHead>
                    ))}
                    {allColumns.length > visibleColumns.length && (
                      <TableHead className="text-xs text-muted-foreground">
                        +{allColumns.length - visibleColumns.length}
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.hits.map((hit, i) => (
                    <TableRow
                      key={i}
                      className="group cursor-pointer hover:bg-muted/30"
                      onClick={() => setViewDoc(hit)}
                    >
                      {/* Action buttons */}
                      <TableCell className="py-1">
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={(e) => copyDocJson(hit, e)}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
                            title={t("common.copy") + " JSON"}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => openEditDoc(hit, e)}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
                            title={t("common.edit")}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // For search results, delete is less common; open view dialog
                              setViewDoc(hit);
                            }}
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded"
                            title={t("common.delete")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>
                      {showRankingScore && (
                        <TableCell className="text-xs font-mono">
                          {typeof hit._rankingScore === "number"
                            ? hit._rankingScore.toFixed(4)
                            : "\u2014"}
                        </TableCell>
                      )}
                      {visibleColumns.map((col) => (
                        <TableCell
                          key={col}
                          className="text-xs max-w-[150px] font-mono"
                        >
                          <CellValue value={hit[col]} maxLength={30} />
                        </TableCell>
                      ))}
                      {allColumns.length > visibleColumns.length && (
                        <TableCell className="text-xs text-muted-foreground">
                          ...
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* JSON view */}
        {result && result.hits.length > 0 && viewMode === "json" && (
          <div className="border rounded-lg overflow-hidden bg-muted/30">
            <pre className="p-4 text-xs font-mono overflow-auto max-h-[600px] text-foreground whitespace-pre-wrap break-all">
              {JSON.stringify(result.hits, null, 2)}
            </pre>
          </div>
        )}

        {/* Facet distribution */}
        {result?.facetDistribution &&
          Object.keys(result.facetDistribution).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Facet Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(result.facetDistribution).map(
                    ([facet, values]) => (
                      <div key={facet} className="space-y-2">
                        <p className="text-xs font-medium text-foreground">
                          {facet}
                        </p>
                        <div className="space-y-1">
                          {Object.entries(values)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 10)
                            .map(([val, count]) => (
                              <div
                                key={val}
                                className="flex items-center justify-between text-xs"
                              >
                                <span className="text-muted-foreground truncate mr-2">
                                  {val}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5"
                                >
                                  {count}
                                </Badge>
                              </div>
                            ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        {/* View document dialog */}
        <Dialog
          open={!!viewDoc}
          onOpenChange={(open) => !open && setViewDoc(null)}
        >
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-sm">
                {t("document.viewDocument")}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-auto max-h-[55vh] rounded-lg border bg-muted/30">
              <pre className="p-4 text-xs font-mono text-foreground whitespace-pre-wrap break-all">
                {JSON.stringify(viewDoc, null, 2)}
              </pre>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (viewDoc) {
                    navigator.clipboard.writeText(
                      JSON.stringify(viewDoc, null, 2)
                    );
                    toast.success(t("common.copied"));
                  }
                }}
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                {t("common.copy")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewDoc(null)}
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                {t("common.close")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit document dialog */}
        <Dialog
          open={!!editDoc}
          onOpenChange={(open) => !open && setEditDoc(null)}
        >
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-sm">
                {t("document.editDocument")}
              </DialogTitle>
            </DialogHeader>
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="font-mono text-xs min-h-[300px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditDoc(null)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={addDocsMutation.isPending}
              >
                {addDocsMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                )}
                {t("common.save")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export query dialog */}
        <ExportQueryDialog
          open={showExport}
          onOpenChange={setShowExport}
          projectUrl={project?.url ?? ""}
          apiKey={project?.api_key ?? null}
          indexId={indexId}
          searchParams={buildSearchParams()}
        />
      </div>
    </SearchLayout>
  );
}
