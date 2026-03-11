import { useState } from "react";
import { useTranslation } from "react-i18next";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { toast } from "sonner";
import {
  FileJson,
  Upload,
  Globe,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAddDocuments,
  useUploadDocuments,
  useFetchDocumentsFromUrl,
} from "@/hooks/useDocuments";

interface AddDocumentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  indexId: string;
  onSuccess: () => void;
}

export function AddDocumentsDialog({
  open,
  onOpenChange,
  projectId,
  indexId,
  onSuccess,
}: AddDocumentsDialogProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"json" | "file" | "url">("json");
  const [jsonText, setJsonText] = useState("");
  const [primaryKey, setPrimaryKey] = useState("");
  const [filePath, setFilePath] = useState("");

  // URL mode fields
  const [url, setUrl] = useState("");
  const [fieldPath, setFieldPath] = useState("");
  const [urlPrimaryKey, setUrlPrimaryKey] = useState("");
  const [customHeaders, setCustomHeaders] = useState("");

  const addMutation = useAddDocuments(projectId, indexId);
  const uploadMutation = useUploadDocuments(projectId, indexId);
  const fetchUrlMutation = useFetchDocumentsFromUrl(projectId, indexId);

  const isSubmitting =
    addMutation.isPending || uploadMutation.isPending || fetchUrlMutation.isPending;

  const handleSubmit = async () => {
    try {
      if (mode === "json") {
        JSON.parse(jsonText);
        await addMutation.mutateAsync({
          documentsJson: jsonText,
          primaryKey: primaryKey || undefined,
        });
      } else if (mode === "file") {
        if (!filePath) {
          toast.error(t("document.selectFile"));
          return;
        }
        await uploadMutation.mutateAsync({
          filePath,
          primaryKey: primaryKey || undefined,
        });
      } else {
        if (!url.trim()) {
          toast.error("Please enter a URL");
          return;
        }
        let headers: Record<string, string> | undefined;
        if (customHeaders.trim()) {
          try {
            headers = JSON.parse(customHeaders.trim());
          } catch {
            toast.error(t("document.invalidHeadersFormat"));
            return;
          }
        }
        await fetchUrlMutation.mutateAsync({
          url: url.trim(),
          fieldPath: fieldPath.trim() || undefined,
          primaryKey: urlPrimaryKey.trim() || undefined,
          headers,
        });
      }
      toast.success(t("document.addSuccess"));
      resetForm();
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof SyntaxError
          ? t("document.invalidJson")
          : String(err)
      );
    }
  };

  const resetForm = () => {
    setJsonText("");
    setFilePath("");
    setPrimaryKey("");
    setUrl("");
    setFieldPath("");
    setUrlPrimaryKey("");
    setCustomHeaders("");
  };

  const handlePickFile = async () => {
    const selected = await openDialog({
      multiple: false,
      filters: [
        {
          name: "Data files",
          extensions: ["json", "ndjson", "jsonl", "csv"],
        },
      ],
    });
    if (selected) {
      setFilePath(selected as string);
    }
  };

  const isSubmitDisabled =
    isSubmitting ||
    (mode === "json" ? !jsonText.trim() : mode === "file" ? !filePath : !url.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("document.addDocuments")}</DialogTitle>
          <DialogDescription>
            {t("document.addDocumentsDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode tabs */}
          <div className="flex gap-2">
            <Button
              variant={mode === "json" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("json")}
            >
              <FileJson className="w-3.5 h-3.5 mr-1.5" />
              JSON
            </Button>
            <Button
              variant={mode === "file" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("file")}
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              {t("document.uploadFile")}
            </Button>
            <Button
              variant={mode === "url" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("url")}
            >
              <Globe className="w-3.5 h-3.5 mr-1.5" />
              URL
            </Button>
          </div>

          {mode === "json" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>{t("index.primaryKey")} <span className="text-muted-foreground text-xs font-normal">({t("common.optional")})</span></Label>
                <Input
                  value={primaryKey}
                  onChange={(e) => setPrimaryKey(e.target.value)}
                  placeholder="id"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("document.jsonData")}</Label>
                <Textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder={'[\n  { "id": 1, "title": "..." },\n  { "id": 2, "title": "..." }\n]'}
                  className="font-mono text-xs min-h-[200px]"
                />
              </div>
            </div>
          )}

          {mode === "file" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>{t("index.primaryKey")} <span className="text-muted-foreground text-xs font-normal">({t("common.optional")})</span></Label>
                <Input
                  value={primaryKey}
                  onChange={(e) => setPrimaryKey(e.target.value)}
                  placeholder="id"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("document.file")}</Label>
                <div className="flex gap-2">
                  <Input
                    value={filePath}
                    readOnly
                    placeholder={t("document.selectFile")}
                    className="flex-1 text-xs"
                  />
                  <Button variant="outline" size="sm" onClick={handlePickFile}>
                    {t("common.browse")}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("document.supportedFormats")}
                </p>
              </div>
            </div>
          )}

          {mode === "url" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>
                  {t("index.primaryKey")} <span className="text-muted-foreground text-xs font-normal">({t("common.optional")})</span>
                </Label>
                <Input
                  value={urlPrimaryKey}
                  onChange={(e) => setUrlPrimaryKey(e.target.value)}
                  placeholder="id"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("document.remoteUrl")}</Label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/data.json"
                  type="url"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {t("document.fieldPath")} <span className="text-muted-foreground text-xs font-normal">({t("common.optional")})</span>
                </Label>
                <Input
                  value={fieldPath}
                  onChange={(e) => setFieldPath(e.target.value)}
                  placeholder="e.g. data.items"
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  JSON path to the array of documents in the response. Leave empty if the response is an array.
                </p>
              </div>
              <div className="space-y-2">
                <Label>
                  {t("document.customHeaders")} <span className="text-muted-foreground text-xs font-normal">({t("common.optional")})</span>
                </Label>
                <Textarea
                  value={customHeaders}
                  onChange={(e) => setCustomHeaders(e.target.value)}
                  placeholder={'{"Authorization": "Bearer token", "X-Custom": "value"}'}
                  className="font-mono text-xs min-h-[60px]"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  {t("document.customHeadersHint")}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {t("document.addDocuments")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
