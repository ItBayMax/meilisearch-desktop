import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Database, Plus, Activity, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProjects } from "@/hooks/useProjects";
import { CreateProjectDialog } from "@/components/project/CreateProjectDialog";

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: projects, isLoading } = useProjects();
  const [showCreate, setShowCreate] = useState(false);

  const recentProjects = (projects || []).slice(0, 6);
  const totalProjects = projects?.length || 0;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {t("app.dashboard")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("app.manageInstances")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    totalProjects
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("app.projects")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    (projects || []).filter((p) => p.is_active).length
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{t("app.activeInstances")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors group"
          onClick={() => setShowCreate(true)}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t("project.addProject")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("app.connectInstance")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {t("app.recentProjects")}
            </h3>
            {totalProjects > 6 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/projects")}
              >
                {t("app.viewAll")}
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentProjects.map((project) => (
              <Card
                key={project.id}
                className="border border-border hover:border-primary/40 hover:shadow-sm cursor-pointer transition-all"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Database className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {project.name}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {project.url}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <CreateProjectDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
