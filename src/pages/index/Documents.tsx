import { useState, useMemo, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileJson,
  Eye,
  X,
  Loader2,
  Copy,
  Pencil,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { CellValue } from "@/components/search/CellValue";
import { AddDocumentsDialog } from "@/components/documents/AddDocumentsDialog";
import {
  useDocuments,
  useAddDocuments,
  useDeleteDocument,
  useDeleteDocuments,
} from "@/hooks/useDocuments";

interface OutletCtx {
  projectId: number;
  indexId: string;
  stats: Record<string, unknown> | undefined;
}

const PAGE_SIZES = [10, 20, 50, 100];

export default function Documents() {
  const { projectId, indexId } = useOutletContext<OutletCtx>();
  const { t } = useTranslation();

  // Pagination state
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);

  // Dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState<Record<string, unknown> | null>(null);
  const [editDoc, setEditDoc] = useState<Record<string, unknown> | null>(null);
  const [editText, setEditText] = useState("");
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  // Data
  const {
    data: rawData,
    isLoading,
    refetch,
    isFetching,
  } = useDocuments(projectId, indexId, offset, limit);
  const addDocsMutation = useAddDocuments(projectId, indexId);

  const docsData = rawData as unknown as Record<string, unknown> | undefined;
  const results = (docsData?.results as Record<string, unknown>[]) ?? [];
  const total = (docsData?.total as number) ?? 0;

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  // Find primary key field from first document
  const allFields = useMemo(() => {
    if (results.length === 0) return [] as string[];
    const fieldSet = new Set<string>();
    results.forEach((doc) => Object.keys(doc).forEach((k) => fieldSet.add(k)));
    return Array.from(fieldSet);
  }, [results]);

  const getPkValue = useCallback(
    (doc: Record<string, unknown>) => {
      // Try common PK field names
      for (const f of ["id", "_id", "uid", allFields[0]]) {
        if (f && doc[f] !== undefined) return String(doc[f]);
      }
      return "";
    },
    [allFields]
  );

  // Visible columns (show max 6 fields in table)
  const visibleFields = useMemo(() => {
    return allFields.slice(0, 6);
  }, [allFields]);

  const handlePageChange = (page: number) => {
    setOffset((page - 1) * limit);
  };

  const handleLimitChange = (newLimit: string) => {
    const l = Number(newLimit);
    setLimit(l);
    setOffset(0);
  };

  const copyJson = (doc: Record<string, unknown>, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(doc, null, 2));
    toast.success(t("common.copied"));
  };

  const openEditDoc = (doc: Record<string, unknown>, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditDoc(doc);
    setEditText(JSON.stringify(doc, null, 2));
  };

  const handleSaveEdit = async () => {
    try {
      const parsed = JSON.parse(editText);
      const docs = Array.isArray(parsed) ? parsed : [parsed];
      await addDocsMutation.mutateAsync({ documentsJson: JSON.stringify(docs) });
      toast.success(t("common.success"));
      setEditDoc(null);
      refetch();
    } catch (err) {
      toast.error(err instanceof SyntaxError ? "Invalid JSON" : String(err));
    }
  };

  return (
    <div className="space-y-4 max-w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {total.toLocaleString()} {t("index.documents")}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`}
            />
            {t("common.refresh")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteAllOpen(true)}
            disabled={total === 0}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            {t("common.deleteAll")}
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            {t("document.addDocuments")}
          </Button>
        </div>
      </div>

      {/* Document Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileJson className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-sm font-medium text-foreground mb-1">
              {t("document.noDocuments")}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {t("document.noDocumentsDesc")}
            </p>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {t("document.addDocuments")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    {/* Action column */}
                    <TableHead className="text-xs font-medium w-[90px]">
                      {t("common.actions")}
                    </TableHead>
                    {visibleFields.map((field) => (
                      <TableHead
                        key={field}
                        className="text-xs font-medium whitespace-nowrap"
                      >
                        {field}
                      </TableHead>
                    ))}
                    {allFields.length > 6 && (
                      <TableHead className="text-xs font-medium text-muted-foreground">
                        +{allFields.length - 6}
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((doc, i) => {
                    const pkVal = getPkValue(doc);
                    return (
                      <TableRow
                        key={pkVal || i}
                        className="group cursor-pointer hover:bg-muted/30"
                        onClick={() => setViewDoc(doc)}
                      >
                        {/* Action buttons */}
                        <TableCell className="py-1">
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={(e) => copyJson(doc, e)}
                              className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
                              title={t("common.copy") + " JSON"}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => openEditDoc(doc, e)}
                              className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
                              title={t("common.edit")}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteDocId(pkVal);
                              }}
                              className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded"
                              title={t("common.delete")}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </TableCell>
                        {visibleFields.map((field) => (
                          <TableCell
                            key={field}
                            className="text-xs max-w-[200px] font-mono"
                          >
                            <CellValue value={doc[field]} maxLength={40} />
                          </TableCell>
                        ))}
                        {allFields.length > 6 && (
                          <TableCell className="text-xs text-muted-foreground">
                            ...
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {offset + 1}–{Math.min(offset + limit, total)} / {total.toLocaleString()}
              </span>
              <Select value={String(limit)} onValueChange={handleLimitChange}>
                <SelectTrigger className="h-7 w-[70px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>/ page</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              {generatePageNumbers(currentPage, totalPages).map((p, i) =>
                p === -1 ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-1 text-xs text-muted-foreground"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={p === currentPage ? "default" : "outline"}
                    size="icon"
                    className="h-7 w-7 text-xs"
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Add Documents Dialog */}
      <AddDocumentsDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        projectId={projectId}
        indexId={indexId}
        onSuccess={() => {
          refetch();
          setAddOpen(false);
        }}
      />

      {/* View Document Dialog */}
      <ViewDocumentDialog
        doc={viewDoc}
        onClose={() => setViewDoc(null)}
        onCopy={() => viewDoc && copyJson(viewDoc)}
        onDelete={() => {
          if (viewDoc) {
            setDeleteDocId(getPkValue(viewDoc));
            setViewDoc(null);
          }
        }}
      />

      {/* Edit Document Dialog */}
      <Dialog
        open={!!editDoc}
        onOpenChange={(open) => !open && setEditDoc(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {t("document.editDocument")}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="font-mono text-xs min-h-[300px]"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDoc(null)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={addDocsMutation.isPending}
            >
              {addDocsMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              )}
              {t("common.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Single Document */}
      <DeleteDocumentDialog
        docId={deleteDocId}
        onOpenChange={(open) => !open && setDeleteDocId(null)}
        projectId={projectId}
        indexId={indexId}
        onSuccess={() => {
          setDeleteDocId(null);
          refetch();
        }}
      />

      {/* Delete All Documents */}
      <DeleteAllDocumentsDialog
        open={deleteAllOpen}
        onOpenChange={setDeleteAllOpen}
        projectId={projectId}
        indexId={indexId}
        total={total}
        onSuccess={() => {
          setDeleteAllOpen(false);
          setOffset(0);
          refetch();
        }}
      />
    </div>
  );
}

// ===== Sub-components =====

function ViewDocumentDialog({
  doc,
  onClose,
  onCopy,
  onDelete,
}: {
  doc: Record<string, unknown> | null;
  onClose: () => void;
  onCopy: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  if (!doc) return null;

  return (
    <Dialog open={!!doc} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            {t("document.viewDocument")}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-auto max-h-[55vh] rounded-lg border bg-muted/30">
          <pre className="p-4 text-xs font-mono text-foreground whitespace-pre-wrap break-all">
            {JSON.stringify(doc, null, 2)}
          </pre>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            {t("common.delete")}
          </Button>
          <Button variant="outline" size="sm" onClick={onCopy}>
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            {t("common.copy")} JSON
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-3.5 h-3.5 mr-1.5" />
            {t("common.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDocumentDialog({
  docId,
  onOpenChange,
  projectId,
  indexId,
  onSuccess,
}: {
  docId: string | null;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  indexId: string;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteDocument(projectId, indexId);

  const handleDelete = async () => {
    if (!docId) return;
    try {
      await deleteMutation.mutateAsync(docId);
      toast.success(t("document.deleteSuccess"));
      onSuccess();
    } catch (err) {
      toast.error(String(err));
    }
  };

  return (
    <AlertDialog open={!!docId} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("document.deleteDocument")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("document.deleteDocumentDesc")}{" "}
            <span className="font-mono font-medium text-foreground">
              {docId}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            )}
            {t("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteAllDocumentsDialog({
  open,
  onOpenChange,
  projectId,
  indexId,
  total,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  indexId: string;
  total: number;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteDocuments(projectId, indexId);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(undefined);
      toast.success(t("document.deleteAllSuccess"));
      onSuccess();
    } catch (err) {
      toast.error(String(err));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            {t("document.deleteAllDocuments")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("document.deleteAllDocumentsDesc", {
              count: total,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            )}
            {t("document.deleteAll")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ===== Helpers =====

function generatePageNumbers(
  current: number,
  total: number
): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: number[] = [];
  pages.push(1);

  if (current > 3) pages.push(-1); // ellipsis

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push(-1); // ellipsis

  pages.push(total);
  return pages;
}
