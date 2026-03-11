import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  Key,
  Copy,
  Eye,
  EyeOff,
  MoreHorizontal,
  X,
  Edit,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useKeys, useCreateKey, useUpdateKey, useDeleteKey } from "@/hooks/useKeys";
import type { ApiKey } from "@/types";

interface OutletCtx {
  projectId: number;
}

export default function Keys() {
  const { projectId } = useOutletContext<OutletCtx>();
  const { t } = useTranslation();

  const { data: keys = [], isLoading, isFetching, refetch, error } = useKeys(projectId);

  const [createOpen, setCreateOpen] = useState(false);
  const [editKey, setEditKey] = useState<ApiKey | null>(null);
  const [deleteKey, setDeleteKey] = useState<ApiKey | null>(null);
  const [viewKey, setViewKey] = useState<ApiKey | null>(null);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <Badge variant="secondary" className="text-xs">
          {keys.length} {t("app.keys")}
        </Badge>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            {t("common.refresh")}
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            {t("key.createKey")}
          </Button>
        </div>
      </div>

      {/* Key list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : keys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Key className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">{t("key.noKeys")}</p>
            <Button size="sm" className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {t("key.createKey")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {keys.map((k) => (
            <KeyCard
              key={k.uid}
              apiKey={k}
              onView={() => setViewKey(k)}
              onEdit={() => setEditKey(k)}
              onDelete={() => setDeleteKey(k)}
            />
          ))}
        </div>
      )}

      {/* Create dialog */}
      <CreateKeyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        projectId={projectId}
        onSuccess={() => { setCreateOpen(false); refetch(); }}
      />

      {/* Edit dialog */}
      <EditKeyDialog
        apiKey={editKey}
        onOpenChange={(open) => !open && setEditKey(null)}
        projectId={projectId}
        onSuccess={() => { setEditKey(null); refetch(); }}
      />

      {/* Delete dialog */}
      <DeleteKeyDialog
        apiKey={deleteKey}
        onOpenChange={(open) => !open && setDeleteKey(null)}
        projectId={projectId}
        onSuccess={() => { setDeleteKey(null); refetch(); }}
      />

      {/* View detail dialog */}
      <Dialog open={!!viewKey} onOpenChange={(open) => !open && setViewKey(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {viewKey?.name ?? "API Key"}
            </DialogTitle>
          </DialogHeader>
          {viewKey && (
            <div className="overflow-auto max-h-[55vh] rounded-lg border bg-muted/30">
              <pre className="p-4 text-xs font-mono text-foreground whitespace-pre-wrap break-all">
                {JSON.stringify(viewKey, null, 2)}
              </pre>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setViewKey(null)}>
              <X className="w-3.5 h-3.5 mr-1.5" />
              {t("common.close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== Sub-components =====

function KeyCard({
  apiKey,
  onView,
  onEdit,
  onDelete,
}: {
  apiKey: ApiKey;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const [showKey, setShowKey] = useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey.key);
    toast.success(t("common.copied"));
  };

  return (
    <Card className="group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {apiKey.name ?? apiKey.uid}
                </h4>
              </div>
              {apiKey.description && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {apiKey.description}
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="w-3.5 h-3.5 mr-2" />
                {t("common.view")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-3.5 h-3.5 mr-2" />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Key details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-3 pl-12">
          {/* Key */}
          <div>
            <p className="text-xs text-muted-foreground">{t("app.keys")}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs font-mono bg-muted/50 rounded px-2 py-0.5 max-w-[260px] truncate">
                {showKey ? apiKey.key : apiKey.key.slice(0, 8) + "..."}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={copyKey}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* UID */}
          <div>
            <p className="text-xs text-muted-foreground">{t("key.keyUid")}</p>
            <p className="text-xs font-mono mt-0.5 truncate">{apiKey.uid}</p>
          </div>

          {/* Actions */}
          <div>
            <p className="text-xs text-muted-foreground">{t("key.keyActions")}</p>
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              {apiKey.actions.slice(0, 3).map((a) => (
                <Badge key={a} variant="secondary" className="text-[10px]">
                  {a}
                </Badge>
              ))}
              {apiKey.actions.length > 3 && (
                <Badge variant="secondary" className="text-[10px]">
                  +{apiKey.actions.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Indexes */}
          <div>
            <p className="text-xs text-muted-foreground">{t("key.keyIndexes")}</p>
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              {apiKey.indexes.length === 1 && apiKey.indexes[0] === "*" ? (
                <Badge variant="secondary" className="text-[10px]">* (All)</Badge>
              ) : (
                <>
                  {apiKey.indexes.slice(0, 3).map((idx) => (
                    <Badge key={idx} variant="secondary" className="text-[10px]">
                      {idx}
                    </Badge>
                  ))}
                  {apiKey.indexes.length > 3 && (
                    <Badge variant="secondary" className="text-[10px]">
                      +{apiKey.indexes.length - 3}
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Created At */}
          <div>
            <p className="text-xs text-muted-foreground">{t("key.createdAt")}</p>
            <p className="text-xs mt-0.5">{new Date(apiKey.createdAt).toLocaleString()}</p>
          </div>

          {/* Expires At */}
          <div>
            <p className="text-xs text-muted-foreground">{t("key.expiresAt")}</p>
            <p className="text-xs mt-0.5">
              {apiKey.expiresAt
                ? new Date(apiKey.expiresAt).toLocaleString()
                : t("key.noExpiry")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateKeyDialog({
  open,
  onOpenChange,
  projectId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const createMutation = useCreateKey(projectId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [actions, setActions] = useState("*");
  const [indexes, setIndexes] = useState("*");
  const [expiresAt, setExpiresAt] = useState("");

  const handleSubmit = async () => {
    try {
      const actionsList = actions.split(",").map((s) => s.trim()).filter(Boolean);
      const indexesList = indexes.split(",").map((s) => s.trim()).filter(Boolean);
      await createMutation.mutateAsync({
        name: name || undefined,
        description: description || undefined,
        actions: actionsList,
        indexes: indexesList,
        expiresAt: expiresAt || null,
      });
      toast.success("API key created");
      setName(""); setDescription(""); setActions("*"); setIndexes("*"); setExpiresAt("");
      onSuccess();
    } catch (err) {
      toast.error(String(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("key.createKey")}</DialogTitle>
          <DialogDescription>Create a new API key with specific permissions.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("key.keyName")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My API Key" />
          </div>
          <div className="space-y-2">
            <Label>{t("common.description")}</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Key for frontend search" className="text-sm" />
          </div>
          <div className="space-y-2">
            <Label>{t("key.keyActions")}</Label>
            <Input value={actions} onChange={(e) => setActions(e.target.value)} placeholder="* or search, documents.add" className="font-mono text-sm" />
            <p className="text-xs text-muted-foreground">Comma-separated. Use * for all actions.</p>
          </div>
          <div className="space-y-2">
            <Label>{t("key.keyIndexes")}</Label>
            <Input value={indexes} onChange={(e) => setIndexes(e.target.value)} placeholder="* or movies, books" className="font-mono text-sm" />
            <p className="text-xs text-muted-foreground">Comma-separated. Use * for all indexes.</p>
          </div>
          <div className="space-y-2">
            <Label>{t("key.expiresAt")} ({t("common.optional")})</Label>
            <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {t("common.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditKeyDialog({
  apiKey,
  onOpenChange,
  projectId,
  onSuccess,
}: {
  apiKey: ApiKey | null;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const updateMutation = useUpdateKey(projectId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Sync when key changes
  useState(() => {
    if (apiKey) {
      setName(apiKey.name ?? "");
      setDescription(apiKey.description ?? "");
    }
  });

  const handleSubmit = async () => {
    if (!apiKey) return;
    try {
      await updateMutation.mutateAsync({
        key: apiKey.key,
        options: {
          name: name || undefined,
          description: description || undefined,
        },
      });
      toast.success("API key updated");
      onSuccess();
    } catch (err) {
      toast.error(String(err));
    }
  };

  return (
    <Dialog open={!!apiKey} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("key.editKey")}</DialogTitle>
          <DialogDescription>Only name and description can be updated.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("key.keyName")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("common.description")}</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="text-sm" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteKeyDialog({
  apiKey,
  onOpenChange,
  projectId,
  onSuccess,
}: {
  apiKey: ApiKey | null;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteKey(projectId);

  const handleDelete = async () => {
    if (!apiKey) return;
    try {
      await deleteMutation.mutateAsync(apiKey.key);
      toast.success("API key deleted");
      onSuccess();
    } catch (err) {
      toast.error(String(err));
    }
  };

  return (
    <AlertDialog open={!!apiKey} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("key.deleteKey")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("key.deleteConfirm")}{" "}
            <span className="font-mono font-medium text-foreground">
              {apiKey?.name ?? apiKey?.uid}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {t("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
