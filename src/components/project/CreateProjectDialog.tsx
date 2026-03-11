import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, Zap, CheckCircle2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProject, useTestConnection } from "@/hooks/useProjects";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const createProject = useCreateProject();
  const testConnection = useTestConnection();

  const [form, setForm] = useState({
    name: "",
    url: "http://localhost:7700",
    api_key: "",
    description: "",
  });
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [testVersion, setTestVersion] = useState("");

  const resetForm = () => {
    setForm({ name: "", url: "http://localhost:7700", api_key: "", description: "" });
    setTestStatus("idle");
    setTestVersion("");
  };

  const handleClose = (val: boolean) => {
    if (!val) resetForm();
    onOpenChange(val);
  };

  const handleTest = async () => {
    if (!form.url.trim()) return;
    setTestStatus("testing");
    try {
      const result = await testConnection.mutateAsync({
        url: form.url.trim(),
        apiKey: form.api_key || undefined,
      });
      if (result.success) {
        setTestStatus("success");
        setTestVersion(result.version || "");
      } else {
        setTestStatus("error");
      }
    } catch {
      setTestStatus("error");
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.url.trim()) {
      toast.error(t("common.error"), {
        description: "Name and URL are required.",
      });
      return;
    }
    try {
      await createProject.mutateAsync({
        name: form.name.trim(),
        url: form.url.trim(),
        api_key: form.api_key || undefined,
        description: form.description || undefined,
      });
      toast.success(t("common.success"), {
        description: t("project.addProject"),
      });
      handleClose(false);
    } catch (err) {
      toast.error(t("common.error"), {
        description: String(err),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{t("project.addProject")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">{t("project.projectName")} *</Label>
            <Input
              id="name"
              placeholder="My Meilisearch"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">{t("project.projectUrl")} *</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                placeholder="http://localhost:7700"
                value={form.url}
                className="flex-1"
                onChange={(e) =>
                  setForm((f) => ({ ...f, url: e.target.value }))
                }
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={handleTest}
                disabled={testStatus === "testing" || !form.url.trim()}
              >
                {testStatus === "testing" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                <span className="ml-1">{t("project.testConnection")}</span>
              </Button>
            </div>
            {testStatus === "success" && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t("project.connectionSuccess")}
                {testVersion && <span className="ml-1">v{testVersion}</span>}
              </div>
            )}
            {testStatus === "error" && (
              <div className="flex items-center gap-1.5 text-xs text-destructive">
                <XCircle className="w-3.5 h-3.5" />
                {t("project.connectionFailed")}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="api_key">{t("project.apiKey")}</Label>
            <Input
              id="api_key"
              type="password"
              placeholder="masterKey"
              value={form.api_key}
              onChange={(e) =>
                setForm((f) => ({ ...f, api_key: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("common.description")}</Label>
            <Textarea
              id="description"
              placeholder={t("common.description")}
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createProject.isPending || !form.name.trim() || !form.url.trim()}
          >
            {createProject.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {t("common.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
