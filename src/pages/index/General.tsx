import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  FileText,
  BarChart3,
  Activity,
  Loader2,
  Plus,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useIndexStats, useDeleteIndex } from "@/hooks/useIndexes";
import { useDeleteDocuments } from "@/hooks/useDocuments";
import { AddDocumentsDialog } from "@/components/documents/AddDocumentsDialog";

interface OutletCtx {
  projectId: number;
  indexId: string;
  stats: Record<string, unknown> | undefined;
}

export default function IndexGeneral() {
  const { projectId, indexId, stats: parentStats } = useOutletContext<OutletCtx>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: rawStats, isLoading: statsLoading, refetch: refetchStats } = useIndexStats(projectId, indexId);

  const deleteIndexMutation = useDeleteIndex(projectId);
  const deleteDocsMutation = useDeleteDocuments(projectId, indexId);

  const [addDocsOpen, setAddDocsOpen] = useState(false);
  const [deleteDocsOpen, setDeleteDocsOpen] = useState(false);
  const [deleteIndexOpen, setDeleteIndexOpen] = useState(false);

  const stats = (rawStats ?? parentStats) as Record<string, unknown> | undefined;

  const docCount =
    (stats?.numberOfDocuments as number) ?? 0;
  const isIndexing = (stats?.isIndexing as boolean) ?? false;
  const fieldDistribution =
    (stats?.fieldDistribution as Record<string, number>) ?? {};

  const fieldEntries = Object.entries(fieldDistribution).sort(
    ([, a], [, b]) => b - a
  );

  const handleDeleteAllDocs = async () => {
    try {
      await deleteDocsMutation.mutateAsync(undefined);
      toast.success(t("document.deleteAllSuccess"));
      setDeleteDocsOpen(false);
      refetchStats();
    } catch (err) {
      toast.error(String(err));
    }
  };

  const handleDeleteIndex = async () => {
    try {
      await deleteIndexMutation.mutateAsync(indexId);
      toast.success(t("index.indexDeleted"));
      setDeleteIndexOpen(false);
      navigate(`/projects/${projectId}`);
    } catch (err) {
      toast.error(String(err));
    }
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {docCount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("index.documents")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {fieldEntries.length}
                </p>
                <p className="text-xs text-muted-foreground">{t("common.fields")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mt-1">
                  {isIndexing ? (
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                      {t("index.indexing")}
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                      {t("index.ready")}
                    </Badge>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("common.status")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Field Distribution */}
      {fieldEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("index.fieldDistribution")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {fieldEntries.map(([field, count]) => {
                const pct = docCount > 0 ? (count / docCount) * 100 : 0;
                return (
                  <div key={field} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-mono text-foreground">{field}</span>
                      <span className="text-muted-foreground text-xs">
                        {count.toLocaleString()} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/60 transition-all"
                        style={{ width: `${Math.max(pct, 0.5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("common.actions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" onClick={() => setAddDocsOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {t("document.addDocuments")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDocsOpen(true)}
              disabled={docCount === 0}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              {t("document.deleteAllDocuments")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteIndexOpen(true)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              {t("index.deleteIndex")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Documents Dialog */}
      <AddDocumentsDialog
        open={addDocsOpen}
        onOpenChange={setAddDocsOpen}
        projectId={projectId}
        indexId={indexId}
        onSuccess={() => {
          refetchStats();
          setAddDocsOpen(false);
        }}
      />

      {/* Delete All Documents Dialog */}
      <AlertDialog open={deleteDocsOpen} onOpenChange={setDeleteDocsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {t("document.deleteAllDocuments")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("document.deleteAllDocumentsDesc", { count: docCount })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllDocs}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDocsMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              )}
              {t("document.deleteAll")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Index Dialog */}
      <AlertDialog open={deleteIndexOpen} onOpenChange={setDeleteIndexOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {t("index.deleteIndex")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("index.deleteIndexDesc", { indexId })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteIndex}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteIndexMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              )}
              {t("index.deleteIndex")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
