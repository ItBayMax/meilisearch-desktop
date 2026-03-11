import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import {
  Cpu,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { EmbedderForm } from "@/components/embedder/EmbedderForm";
import { useAllSettings, useUpdateAllSettings } from "@/hooks/useSettings";
import type { EmbedderConfig, EmbedderSource } from "@/types";

const SOURCE_COLORS: Record<EmbedderSource, string> = {
  openAi: "bg-green-500/10 text-green-600 border-green-500/20",
  huggingFace: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  ollama: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  rest: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  userProvided: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

export default function Embedders() {
  const { t } = useTranslation();
  const { projectId, indexId } =
    useOutletContext<{ projectId: number; indexId: string; stats: unknown }>();

  const { data: allSettings, isLoading } = useAllSettings(projectId, indexId);
  const updateMutation = useUpdateAllSettings(projectId, indexId);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editName, setEditName] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string | null>(null);

  // Extract embedders from settings
  const embedders = useMemo(() => {
    if (!allSettings) return {};
    const raw = allSettings as unknown as Record<string, unknown>;
    return (raw?.embedders as Record<string, EmbedderConfig>) ?? {};
  }, [allSettings]);

  const embedderEntries = Object.entries(embedders);

  const handleAdd = (name: string, config: EmbedderConfig) => {
    const updated = { ...embedders, [name]: config };
    updateMutation.mutate(
      { embedders: updated } as Record<string, unknown>,
      {
        onSuccess: () => {
          toast.success(t("common.success"));
          setShowAddDialog(false);
        },
        onError: (err) => toast.error(String(err)),
      }
    );
  };

  const handleEdit = (name: string, config: EmbedderConfig) => {
    const updated = { ...embedders, [name]: config };
    updateMutation.mutate(
      { embedders: updated } as Record<string, unknown>,
      {
        onSuccess: () => {
          toast.success(t("common.success"));
          setEditName(null);
        },
        onError: (err) => toast.error(String(err)),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteName) return;
    // Set embedder to null to delete it via PATCH merge semantics
    const updated: Record<string, EmbedderConfig | null> = {
      ...embedders,
      [deleteName]: null,
    };
    updateMutation.mutate(
      { embedders: updated } as Record<string, unknown>,
      {
        onSuccess: () => {
          toast.success(t("common.success"));
          setDeleteName(null);
        },
        onError: (err) => toast.error(String(err)),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">{t("app.embedders")}</h3>
          <Badge variant="secondary" className="text-[10px]">
            Experimental
          </Badge>
        </div>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          {t("embedder.addEmbedder")}
        </Button>
      </div>

      {/* Empty state */}
      {embedderEntries.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Cpu className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium mb-1">
              {t("embedder.noEmbedders")}
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              {t("embedder.noEmbeddersDesc")}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {t("embedder.experimentalNote")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Embedder cards */}
      <div className="grid grid-cols-1 gap-3">
        {embedderEntries.map(([name, config]) => (
          <Card key={name}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{name}</span>
                    <Badge
                      className={`text-[10px] ${SOURCE_COLORS[config.source] ?? ""}`}
                    >
                      {t(`embedder.source.${config.source}`)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {config.model && (
                      <span>
                        Model: <span className="font-mono">{config.model}</span>
                      </span>
                    )}
                    {config.dimensions && (
                      <span>
                        Dimensions:{" "}
                        <span className="font-mono">{config.dimensions}</span>
                      </span>
                    )}
                    {config.url && (
                      <span>
                        URL:{" "}
                        <span className="font-mono truncate max-w-[200px] inline-block align-bottom">
                          {config.url}
                        </span>
                      </span>
                    )}
                    {config.revision && (
                      <span>
                        Revision:{" "}
                        <span className="font-mono">{config.revision}</span>
                      </span>
                    )}
                    {config.documentTemplate && (
                      <span className="truncate max-w-xs">
                        Template: {config.documentTemplate}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setEditName(name)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => setDeleteName(name)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("embedder.addEmbedder")}</DialogTitle>
          </DialogHeader>
          <EmbedderForm
            mode="create"
            onSubmit={handleAdd}
            isPending={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={!!editName}
        onOpenChange={(open) => !open && setEditName(null)}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("embedder.editEmbedder")}</DialogTitle>
          </DialogHeader>
          {editName && embedders[editName] && (
            <EmbedderForm
              mode="edit"
              initialName={editName}
              initialConfig={embedders[editName]}
              onSubmit={handleEdit}
              isPending={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteName}
        onOpenChange={(open) => !open && setDeleteName(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {t("embedder.deleteEmbedder")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("embedder.deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {updateMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              )}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
