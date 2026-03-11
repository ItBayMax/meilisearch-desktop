import { useMemo, useState } from "react";
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
  ListTodo,
  Settings,
  KeyRound,
  Search,
  ArrowLeft,
  Loader2,
  Copy,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useProject } from "@/hooks/useProjects";
import { EditProjectDialog } from "@/components/project/EditProjectDialog";

const tabItems = [
  { path: "", icon: Database, labelKey: "app.indexes", end: true },
  { path: "tasks", icon: ListTodo, labelKey: "app.tasks" },
  { path: "search", icon: Search, labelKey: "app.search" },
  { path: "keys", icon: KeyRound, labelKey: "app.keys" },
  { path: "settings", icon: Settings, labelKey: "app.settings" },
];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: project, isLoading } = useProject(projectId);
  const [showEdit, setShowEdit] = useState(false);

  const activeTab = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    // /projects/:id -> indexes, /projects/:id/tasks -> tasks, etc.
    return segments.length > 2 ? segments[2] : "";
  }, [location.pathname]);

  const copyUrl = () => {
    if (project?.url) {
      navigator.clipboard.writeText(project.url);
      toast.success(t("common.copied"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">{t("common.projectNotFound")}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/projects")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("common.back")}
        </Button>
      </div>
    );
  }

  const urlHost = (() => {
    try {
      return new URL(project.url).host;
    } catch {
      return project.url;
    }
  })();

  return (
    <div className="space-y-0 -m-6">
      {/* Project Header */}
      <div className="px-6 pt-6 pb-4 bg-background border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {t("app.projects")}
          </span>
        </div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">
                  {project.name}
                </h2>
                <Badge
                  variant={project.is_active ? "default" : "secondary"}
                  className="text-[10px] px-1.5"
                >
                  {project.is_active ? t("common.active") : t("common.inactive")}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">{urlHost}</span>
                <button
                  onClick={copyUrl}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEdit(true)}
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            {t("common.edit")}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-5 -mb-4">
          {tabItems.map((tab) => {
            const isActive = activeTab === tab.path;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                end={tab.end}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors",
                  isActive
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {t(tab.labelKey)}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Outlet context={{ project, projectId }} />
      </div>

      {/* Edit Dialog */}
      {showEdit && (
        <EditProjectDialog
          open={showEdit}
          onOpenChange={setShowEdit}
          project={project}
        />
      )}
    </div>
  );
}
