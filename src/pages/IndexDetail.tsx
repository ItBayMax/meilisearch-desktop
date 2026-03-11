import { useState, useMemo } from "react";
import {
  Outlet,
  useParams,
  useNavigate,
  useLocation,
  NavLink,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Database,
  ArrowLeft,
  Loader2,
  FileText,
  BarChart3,
  List,
  Trophy,
  BookOpen,
  Type,
  Hash,
  SplitSquareHorizontal,
  BookMarked,
  Rows3,
  Layers,
  Timer,
  Cpu,
  Settings,
  Search,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIndex, useIndexStats } from "@/hooks/useIndexes";
import { useProject } from "@/hooks/useProjects";
import { SearchPanel } from "@/components/search/SearchPanel";

const settingsTabs = [
  { path: "", icon: BarChart3, labelKey: "app.general", end: true },
  { path: "documents", icon: FileText, labelKey: "index.documents" },
  { path: "attributes", icon: List, labelKey: "app.attributes" },
  { path: "ranking-rules", icon: Trophy, labelKey: "app.rankingRules" },
  { path: "synonyms", icon: BookOpen, labelKey: "app.synonyms" },
  { path: "typo-tolerance", icon: Type, labelKey: "app.typoTolerance" },
  { path: "prefix-search", icon: Search, labelKey: "app.prefixSearch" },
  { path: "stop-words", icon: Hash, labelKey: "app.stopWords" },
  { path: "separators", icon: SplitSquareHorizontal, labelKey: "app.separators" },
  { path: "dictionary", icon: BookMarked, labelKey: "app.dictionary" },
  { path: "pagination", icon: Rows3, labelKey: "app.pagination" },
  { path: "faceting", icon: Layers, labelKey: "app.faceting" },
  { path: "search-cutoff", icon: Timer, labelKey: "app.searchCutoff" },
  { path: "embedders", icon: Cpu, labelKey: "app.embedders" },
];

export default function IndexDetail() {
  const { projectId: pId, indexId } = useParams<{
    projectId: string;
    indexId: string;
  }>();
  const projectId = Number(pId);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: project } = useProject(projectId);
  const { data: indexInfo, isLoading: indexLoading } = useIndex(
    projectId,
    indexId
  );
  const { data: stats } = useIndexStats(projectId, indexId);

  const [activeTopTab, setActiveTopTab] = useState<"settings" | "search">(
    "settings"
  );

  const activeSettingsTab = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    return segments.length > 4 ? segments[4] : "";
  }, [location.pathname]);

  if (indexLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const uid = indexInfo?.uid ?? indexId ?? "";
  const pk = indexInfo?.primary_key ?? null;

  const rawStats = stats as unknown as Record<string, unknown> | undefined;
  const isIndexing =
    (rawStats?.isIndexing as boolean) ?? false;

  const info = indexInfo as Record<string, unknown> | undefined;
  const createdAt = (info?.createdAt as string) ?? (info?.created_at as string) ?? null;
  const updatedAt = (info?.updatedAt as string) ?? (info?.updated_at as string) ?? null;

  return (
    <div className="space-y-0 -m-6">
      {/* Header */}
      <div className="px-6 pt-6 pb-0 bg-background border-b border-border">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-4 text-sm">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <button
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            {project?.name ?? t("app.projects")}
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">{uid}</span>
        </div>

        {/* Index info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{uid}</h2>
                {isIndexing ? (
                  <Badge className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                    {t("index.indexing")}
                  </Badge>
                ) : (
                  <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    {t("index.ready")}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                {pk && (
                  <div className="flex items-center gap-1">
                    <span>{t("index.primaryKeyAbbr")}:</span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {pk}
                    </Badge>
                  </div>
                )}
                {createdAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(createdAt).toLocaleString()}</span>
                  </div>
                )}
                {updatedAt && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(updatedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top-level 2 tabs: Settings | Search Preview */}
        <div className="flex items-center gap-1 mt-5 -mb-px">
          <button
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTopTab === "settings"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
            onClick={() => setActiveTopTab("settings")}
          >
            <Settings className="w-4 h-4" />
            {t("index.settingsTab")}
          </button>
          <button
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTopTab === "search"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
            onClick={() => setActiveTopTab("search")}
          >
            <Search className="w-4 h-4" />
            {t("index.searchPreview")}
          </button>
        </div>
      </div>

      {/* Content area */}
      {activeTopTab === "settings" ? (
        <div className="flex">
          {/* Left sidebar navigation */}
          <div className="w-[200px] flex-shrink-0 border-r border-border bg-muted/20">
            <ScrollArea className="h-[calc(100vh-220px)]">
              <nav className="p-2 space-y-0.5">
                {settingsTabs.map((tab) => {
                  const isActive = activeSettingsTab === tab.path;
                  return (
                    <NavLink
                      key={tab.path}
                      to={tab.path}
                      end={tab.end}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <tab.icon className="w-3.5 h-3.5 flex-shrink-0" />
                      {t(tab.labelKey)}
                    </NavLink>
                  );
                })}
              </nav>
            </ScrollArea>
          </div>

          {/* Settings content */}
          <div className="flex-1 p-6 overflow-auto">
            <Outlet context={{ projectId, indexId: uid, stats }} />
          </div>
        </div>
      ) : (
        <div className="h-[calc(100vh-220px)]">
          <SearchPanel projectId={projectId} indexId={uid} onNavigateToEmbedders={() => setActiveTopTab("settings")} />
        </div>
      )}
    </div>
  );
}
