import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Database, Copy, Search, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectStats } from "@/hooks/useProjectStats";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

interface Props {
  project: Project;
}

export function ProjectCard({ project }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: stats } = useProjectStats(project.id);

  const copyUrl = () => {
    navigator.clipboard.writeText(project.url);
    toast.success(t("common.copied"));
  };

  const urlHost = (() => {
    try {
      const u = new URL(project.url);
      return u.host;
    } catch {
      return project.url;
    }
  })();

  const indexCount = stats?.indexes ? Object.keys(stats.indexes).length : 0;
  const totalDocuments = stats?.indexes
    ? Object.values(stats.indexes).reduce((sum, idx) => sum + (idx.numberOfDocuments ?? 0), 0)
    : 0;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:border-primary/40",
        "border border-border bg-card"
      )}
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate text-base">
                {project.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-muted-foreground truncate">
                  {urlHost}
                </span>
                {project.api_key && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1.5 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(project.api_key!);
                      toast.success(t("common.copied"));
                    }}
                  >
                    <KeyRound className="w-3 h-3" />
                    {t("common.copyKey")}
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              project.is_active
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                : "bg-muted-foreground/10 text-muted-foreground border border-muted-foreground/20"
            )}
          >
            {project.is_active ? t("common.active") : t("common.inactive")}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {indexCount}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("index.indexes")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {totalDocuments.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("index.documents")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">–</div>
            <div className="text-xs text-muted-foreground">
              {t("search.searches")}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              copyUrl();
            }}
          >
            <Copy className="w-3 h-3 mr-1" />
            {t("common.copyAddress")}
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/projects/${project.id}/search`);
            }}
          >
            <Search className="w-3 h-3 mr-1" />
            {t("search.preview")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
