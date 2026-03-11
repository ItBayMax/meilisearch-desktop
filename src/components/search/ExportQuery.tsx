import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Download, Copy, FileJson } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SearchParams } from "@/types";

interface ExportQueryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectUrl: string;
  apiKey: string | null;
  indexId: string;
  searchParams: SearchParams;
}

export function ExportQueryDialog({
  open,
  onOpenChange,
  projectUrl,
  apiKey,
  indexId,
  searchParams,
}: ExportQueryDialogProps) {
  const { t } = useTranslation();

  const apiUrl = `${projectUrl.replace(/\/$/, "")}/indexes/${indexId}/search`;
  const body = JSON.stringify(searchParams, null, 2);

  const copyAsCurl = () => {
    const headers = ['-H "Content-Type: application/json"'];
    if (apiKey) headers.push(`-H "Authorization: Bearer ${apiKey}"`);
    const curl = `curl -X POST '${apiUrl}' \\\n  ${headers.join(" \\\n  ")} \\\n  -d '${JSON.stringify(searchParams)}'`;
    navigator.clipboard.writeText(curl);
    toast.success(t("common.copied"));
  };

  const exportPostman = async () => {
    const collection = {
      info: {
        name: `Meilisearch Search - ${indexId}`,
        schema:
          "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      },
      item: [
        {
          name: `Search ${indexId}`,
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              ...(apiKey
                ? [{ key: "Authorization", value: `Bearer ${apiKey}` }]
                : []),
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify(searchParams, null, 2),
            },
            url: { raw: apiUrl },
          },
        },
      ],
    };
    await saveJsonFile(
      JSON.stringify(collection, null, 2),
      `meilisearch-${indexId}-search.postman_collection.json`
    );
  };

  const downloadBody = async () => {
    await saveJsonFile(body, `meilisearch-${indexId}-search.json`);
  };

  const copyQueryPreview = () => {
    navigator.clipboard.writeText(body);
    toast.success(t("common.copied"));
  };

  const saveJsonFile = async (content: string, defaultName: string) => {
    try {
      const path = await save({
        defaultPath: defaultName,
        filters: [{ name: "JSON", extensions: ["json"] }],
      });
      if (path) {
        await invoke("write_text_file", { path, content });
        toast.success(t("common.success"));
      }
    } catch (err) {
      toast.error(String(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm">
            {t("search.export.exportQuery")}
          </DialogTitle>
          <DialogDescription>
            {t("search.export.description")}
          </DialogDescription>
        </DialogHeader>

        {/* Query preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {t("search.export.queryPreview")}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={copyQueryPreview}
            >
              <Copy className="w-3 h-3 mr-1" />
              {t("common.copy")}
            </Button>
          </div>
          <div className="rounded-lg border bg-muted/30 overflow-auto max-h-[200px]">
            <pre className="p-3 text-xs font-mono text-foreground whitespace-pre-wrap break-all">
              {body}
            </pre>
          </div>
        </div>

        {/* Export buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="default"
            size="sm"
            className="h-9 text-xs"
            onClick={copyAsCurl}
          >
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            {t("search.export.curl")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={exportPostman}
          >
            <FileJson className="w-3.5 h-3.5 mr-1.5" />
            {t("search.export.postman")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={downloadBody}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {t("search.export.downloadJson")}
          </Button>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            {t("common.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
