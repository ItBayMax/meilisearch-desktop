import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Database, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/hooks/useProjects";
import { ProjectCard } from "@/components/project/ProjectCard";
import { CreateProjectDialog } from "@/components/project/CreateProjectDialog";
import { DeleteProjectDialog } from "@/components/project/DeleteProjectDialog";
import type { Project } from "@/types";

export default function Projects() {
  const { t } = useTranslation();
  const { data: projects, isLoading } = useProjects();
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [search, setSearch] = useState("");

  const filtered = (projects || []).filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {t("app.projects")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("project.noProjects").split(".")[0]}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t("project.addProject")}
        </Button>
      </div>

      {/* Search */}
      {(projects?.length || 0) > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("common.search") + "..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Database className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {search ? t("common.noData") : t("project.noProjects").split(".")[0]}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm text-center">
            {search
              ? ""
              : t("project.noProjects")}
          </p>
          {!search && (
            <Button className="mt-6" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t("project.addProject")}
            </Button>
          )}
        </div>
      )}

      {/* Grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateProjectDialog open={showCreate} onOpenChange={setShowCreate} />
      <DeleteProjectDialog
        open={!!deleteTarget}
        onOpenChange={(val) => !val && setDeleteTarget(null)}
        project={deleteTarget}
      />
    </div>
  );
}
