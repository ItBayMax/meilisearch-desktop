import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Database,
  Loader2,
  Trash2,
  Search,
  MoreHorizontal,
  Settings,
  FileText,
  FilePlus,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIndexes, useCreateIndex, useDeleteIndex } from "@/hooks/useIndexes";
import { AddDocumentsDialog } from "@/components/documents/AddDocumentsDialog";
import { projectApi } from "@/services/api";
import type { Project, ProjectStats } from "@/types";

interface OutletCtx {
  project: Project;
  projectId: number;
}

export default function Indexes() {
  const { projectId } = useOutletContext<OutletCtx>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ uid: "", primaryKey: "" });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [addDocsTarget, setAddDocsTarget] = useState<string | null>(null);

  const {
    data: indexesData,
    isLoading,
    refetch,
  } = useIndexes(projectId);

  const createIndex = useCreateIndex(projectId);
  const deleteIndex = useDeleteIndex(projectId);

  // Fetch project stats for document counts
  const { data: projectStats } = useQuery({
    queryKey: ["project-stats", projectId],
    queryFn: () => projectApi.getStats(projectId),
  });

  // Normalize: indexesData may be { results: [...] } or an array
  const indexes = (() => {
    const raw = Array.isArray(indexesData)
      ? indexesData
      : ((indexesData as Record<string, unknown> | undefined)?.results ?? []);
    // Sort by createdAt descending (newest first)
    return (raw as Record<string, unknown>[]).slice().sort((a, b) => {
      const ta = a.createdAt as string | undefined;
      const tb = b.createdAt as string | undefined;
      if (!ta || !tb) return 0;
      return new Date(tb).getTime() - new Date(ta).getTime();
    });
  })();

  const getDocCount = (uid: string): number | null => {
    if (!projectStats) return null;
    const stats = projectStats as ProjectStats;
    const idxStats = stats.indexes?.[uid];
    return idxStats?.numberOfDocuments ?? null;
  };

  const handleCreate = async () => {
    if (!createForm.uid.trim()) return;
    try {
      await createIndex.mutateAsync({
        uid: createForm.uid.trim(),
        primaryKey: createForm.primaryKey.trim() || undefined,
      });
      toast.success(t("common.success"));
      setShowCreate(false);
      setCreateForm({ uid: "", primaryKey: "" });
      // Meilisearch index creation is async; refetch after a short delay
      setTimeout(() => refetch(), 500);
    } catch (err) {
      toast.error(t("common.error"), { description: String(err) });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteIndex.mutateAsync(deleteTarget);
      toast.success(t("common.success"));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(t("common.error"), { description: String(err) });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground">
            {t("app.indexes")}
          </h3>
          {!isLoading && (indexes as unknown[]).length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {(indexes as unknown[]).length}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            {t("index.createIndex")}
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && (indexes as unknown[]).length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
            <Database className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {t("index.noIndexes")}
          </p>
          <Button
            size="sm"
            className="mt-4"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {t("index.createIndex")}
          </Button>
        </div>
      )}

      {/* Index grid */}
      {!isLoading && (indexes as unknown[]).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(indexes as Record<string, unknown>[]).map((idx) => {
            const uid = idx.uid as string;
            const pk = idx.primaryKey as string | null;
            const createdAt = idx.createdAt as string | undefined;
            const updatedAt = idx.updatedAt as string | undefined;
            const docCount = getDocCount(uid);
            return (
              <Card
                key={uid}
                className="group border border-border hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
                onClick={() =>
                  navigate(`/projects/${projectId}/indexes/${uid}`)
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Database className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-foreground truncate">
                          {uid}
                        </h4>
                        {pk && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[11px] text-muted-foreground">
                              {t("index.primaryKeyAbbr")}:
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {pk}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/projects/${projectId}/indexes/${uid}`)
                          }
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          {t("app.settings")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setAddDocsTarget(uid)}
                        >
                          <FilePlus className="w-4 h-4 mr-2" />
                          {t("document.addDocuments")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/projects/${projectId}/search`)
                          }
                        >
                          <Search className="w-4 h-4 mr-2" />
                          {t("app.search")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(uid)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t("common.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>
                        {(docCount ?? 0).toLocaleString()} {t("index.documents")}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-[11px] text-muted-foreground">
                      {t("index.createdAt")}: {createdAt && new Date(createdAt).toLocaleDateString()}
                    </span>
                    {updatedAt && (
                      <span className="text-[11px] text-muted-foreground">
                        {t("index.lastUpdate")}:{" "}
                        {new Date(updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog
        open={showCreate}
        onOpenChange={(v) => {
          setShowCreate(v);
          if (!v) setCreateForm({ uid: "", primaryKey: "" });
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{t("index.createIndex")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("index.indexUid")} *</Label>
              <Input
                placeholder="movies"
                value={createForm.uid}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, uid: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && createForm.uid.trim()) handleCreate();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("index.primaryKey")}</Label>
              <Input
                placeholder="id"
                value={createForm.primaryKey}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, primaryKey: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && createForm.uid.trim()) handleCreate();
                }}
              />
              <p className="text-xs text-muted-foreground">
                {t("index.primaryKeyHint")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createIndex.isPending || !createForm.uid.trim()}
            >
              {createIndex.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("index.deleteIndex")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("index.deleteConfirm")}
              {deleteTarget && (
                <span className="block mt-2 font-medium text-foreground">
                  {deleteTarget}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteIndex.isPending}
            >
              {deleteIndex.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Documents Dialog */}
      {addDocsTarget && (
        <AddDocumentsDialog
          open={!!addDocsTarget}
          onOpenChange={(v) => !v && setAddDocsTarget(null)}
          projectId={projectId}
          indexId={addDocsTarget}
          onSuccess={() => setAddDocsTarget(null)}
        />
      )}
    </div>
  );
}
