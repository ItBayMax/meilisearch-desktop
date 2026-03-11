import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  PlayCircle,
  Ban,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { useTasks, useCancelTasks, useDeleteTasks } from "@/hooks/useTasks";
import { useIndexes } from "@/hooks/useIndexes";
import type { MeilisearchTask, TaskFilters } from "@/types";

interface OutletCtx {
  projectId: number;
}

const STATUS_OPTIONS = ["enqueued", "processing", "succeeded", "failed", "canceled"];
const TYPE_OPTIONS = [
  "indexCreation",
  "indexUpdate",
  "indexDeletion",
  "indexSwap",
  "documentAdditionOrUpdate",
  "documentDeletion",
  "settingsUpdate",
  "dumpCreation",
  "snapshotCreation",
  "taskCancelation",
  "taskDeletion",
];

export default function Tasks() {
  const { projectId } = useOutletContext<OutletCtx>();
  const { t } = useTranslation();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [indexFilter, setIndexFilter] = useState<string>("all");
  const [limit] = useState(20);
  const [from, setFrom] = useState<number | undefined>(undefined);

  // Detail / action state
  const [viewTask, setViewTask] = useState<MeilisearchTask | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [cancelTaskUid, setCancelTaskUid] = useState<number | null>(null);
  const [deleteTaskUid, setDeleteTaskUid] = useState<number | null>(null);

  // Fetch indexes for filter dropdown
  const { data: rawIndexes } = useIndexes(projectId);
  const indexUids = useMemo(() => {
    if (!rawIndexes) return [];
    const list = Array.isArray(rawIndexes)
      ? rawIndexes
      : ((rawIndexes as unknown as Record<string, unknown>)?.results as typeof rawIndexes) ?? [];
    return list.map((idx) => (idx as unknown as Record<string, unknown>)?.uid as string ?? "").filter(Boolean);
  }, [rawIndexes]);

  const filters = useMemo<TaskFilters>(() => {
    const f: TaskFilters = { limit };
    if (statusFilter !== "all") f.statuses = [statusFilter];
    if (typeFilter !== "all") f.types = [typeFilter];
    if (indexFilter !== "all") f.indexUids = [indexFilter];
    if (from !== undefined) f.from = from;
    return f;
  }, [statusFilter, typeFilter, indexFilter, limit, from]);

  const { data: rawData, isLoading, isFetching, refetch } = useTasks(projectId, filters);
  const cancelMutation = useCancelTasks(projectId);
  const deleteMutation = useDeleteTasks(projectId);

  const tasksData = rawData as unknown as Record<string, unknown> | undefined;
  const results = ((tasksData?.results as MeilisearchTask[]) ?? []);
  const total = (tasksData?.total as number) ?? 0;
  const nextFrom = (tasksData?.next as number) ?? null;

  const handleCancelPending = async () => {
    try {
      await cancelMutation.mutateAsync({ statuses: ["enqueued", "processing"] });
      toast.success(t("task.cancelRequestEnqueued"));
      setCancelConfirm(false);
      refetch();
    } catch (err) {
      toast.error(String(err));
    }
  };

  const handleCancelSingleTask = async () => {
    if (cancelTaskUid === null) return;
    try {
      await cancelMutation.mutateAsync({ uids: [cancelTaskUid] });
      toast.success(t("task.cancelRequestEnqueued"));
      setCancelTaskUid(null);
      refetch();
    } catch (err) {
      toast.error(String(err));
    }
  };

  const handleDeleteSingleTask = async () => {
    if (deleteTaskUid === null) return;
    try {
      await deleteMutation.mutateAsync({ uids: [deleteTaskUid] });
      toast.success(t("task.deleteRequestEnqueued"));
      setDeleteTaskUid(null);
      refetch();
    } catch (err) {
      toast.error(String(err));
    }
  };

  const handleDeleteCompleted = async () => {
    try {
      await deleteMutation.mutateAsync({ statuses: ["succeeded", "failed", "canceled"] });
      toast.success(t("task.deleteRequestEnqueued"));
      setDeleteConfirm(false);
      refetch();
    } catch (err) {
      toast.error(String(err));
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {total.toLocaleString()} {t("app.tasks")}
          </Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setFrom(undefined); }}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("task.allStatuses")}</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`task.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Type filter */}
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setFrom(undefined); }}>
            <SelectTrigger className="h-8 w-[180px] text-xs">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("task.allTypes")}</SelectItem>
              {TYPE_OPTIONS.map((tp) => (
                <SelectItem key={tp} value={tp}>
                  {tp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Index filter */}
          <Select value={indexFilter} onValueChange={(v) => { setIndexFilter(v); setFrom(undefined); }}>
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("task.allIndexes")}</SelectItem>
              {indexUids.map((uid) => (
                <SelectItem key={uid} value={uid}>
                  {uid}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            {t("common.refresh")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCancelConfirm(true)}
            className="text-amber-600 hover:text-amber-600"
          >
            <Ban className="w-3.5 h-3.5 mr-1.5" />
            {t("task.cancelAllPending")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteConfirm(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            {t("task.deleteTask")}
          </Button>
        </div>
      </div>

      {/* Task table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Clock className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">{t("task.noTasks")}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-medium w-[60px]">{t("task.uid")}</TableHead>
                    <TableHead className="text-xs font-medium">{t("common.type")}</TableHead>
                    <TableHead className="text-xs font-medium">{t("common.status")}</TableHead>
                    <TableHead className="text-xs font-medium">{t("task.index")}</TableHead>
                    <TableHead className="text-xs font-medium">{t("task.duration")}</TableHead>
                    <TableHead className="text-xs font-medium">{t("task.enqueuedAt")}</TableHead>
                    <TableHead className="w-[90px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((task) => (
                    <TaskRow
                      key={task.uid}
                      task={task}
                      onView={() => setViewTask(task)}
                      onCancel={
                        task.status === "enqueued" || task.status === "processing"
                          ? () => setCancelTaskUid(task.uid)
                          : undefined
                      }
                      onDelete={() => setDeleteTaskUid(task.uid)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-muted-foreground">
              Showing {results.length} of {total.toLocaleString()}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={from === undefined}
                onClick={() => setFrom(undefined)}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={nextFrom === null}
                onClick={() => nextFrom !== null && setFrom(nextFrom)}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Task detail dialog */}
      <Dialog open={!!viewTask} onOpenChange={(open) => !open && setViewTask(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {t("task.taskDetail")}
            </DialogTitle>
          </DialogHeader>
          {viewTask && (
            <div className="space-y-4 overflow-auto max-h-[60vh]">
              {/* Key info grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("task.uid")}</p>
                  <p className="text-sm font-semibold">{viewTask.uid}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("common.status")}</p>
                  <StatusBadge status={viewTask.status} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("common.type")}</p>
                  <p className="text-sm font-semibold font-mono">{viewTask.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("task.index")}</p>
                  <p className="text-sm font-semibold font-mono">{viewTask.indexUid ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("task.duration")}</p>
                  <p className="text-sm font-semibold font-mono">{viewTask.duration ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("task.enqueuedAt")}</p>
                  <p className="text-sm font-semibold">{new Date(viewTask.enqueuedAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Full details JSON */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">{t("task.fullDetails")}</p>
                <div className="rounded-lg border bg-muted/30 overflow-auto max-h-[300px]">
                  <pre className="p-4 text-xs font-mono text-foreground whitespace-pre-wrap break-all">
                    {JSON.stringify(viewTask, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel all confirmation */}
      <AlertDialog open={cancelConfirm} onOpenChange={setCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("task.cancelAllPending")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("task.cancelAllPendingDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelPending}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              {cancelMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {t("common.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("task.deleteTask")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("task.deleteCompletedDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompleted}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single task cancel confirmation */}
      <AlertDialog open={cancelTaskUid !== null} onOpenChange={(open) => !open && setCancelTaskUid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("task.cancelTask")} #{cancelTaskUid}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("task.cancelSingleTaskDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSingleTask}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              {cancelMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {t("common.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single task delete confirmation */}
      <AlertDialog open={deleteTaskUid !== null} onOpenChange={(open) => !open && setDeleteTaskUid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("task.deleteTask")} #{deleteTaskUid}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("task.deleteSingleTaskDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSingleTask}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TaskRow({
  task,
  onView,
  onCancel,
  onDelete,
}: {
  task: MeilisearchTask;
  onView: () => void;
  onCancel?: () => void;
  onDelete: () => void;
}) {
  return (
    <TableRow className="cursor-pointer hover:bg-muted/30" onClick={onView}>
      <TableCell className="text-xs font-mono">{task.uid}</TableCell>
      <TableCell className="text-xs">
        <Badge variant="outline" className="text-[10px] font-mono">
          {task.type}
        </Badge>
      </TableCell>
      <TableCell>
        <StatusBadge status={task.status} />
      </TableCell>
      <TableCell className="text-xs font-mono text-muted-foreground">
        {task.indexUid ?? "-"}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {task.duration ?? "-"}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {new Date(task.enqueuedAt).toLocaleString()}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-0.5">
          {onCancel && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-amber-600 hover:text-amber-700"
              onClick={(e) => { e.stopPropagation(); onCancel(); }}
            >
              <Ban className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => { e.stopPropagation(); onView(); }}
          >
            <Eye className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const config: Record<string, { icon: typeof CheckCircle2; className: string }> = {
    succeeded: { icon: CheckCircle2, className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    failed: { icon: XCircle, className: "bg-red-500/10 text-red-600 border-red-500/20" },
    processing: { icon: PlayCircle, className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    enqueued: { icon: Clock, className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    canceled: { icon: Ban, className: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
  };
  const c = config[status] ?? config.enqueued;
  const Icon = c.icon;
  return (
    <Badge className={`text-[10px] gap-1 ${c.className}`}>
      <Icon className="w-3 h-3" />
      {t(`task.${status}`, status)}
    </Badge>
  );
}
