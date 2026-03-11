import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  Zap,
  CheckCircle2,
  XCircle,
  Trash2,
  Save,
  Server,
  HardDrive,
  Activity,
  FlaskConical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  useUpdateProject,
  useTestConnection,
  useExperimentalFeatures,
  useUpdateExperimentalFeatures,
  projectKeys,
} from "@/hooks/useProjects";
import { DeleteProjectDialog } from "@/components/project/DeleteProjectDialog";
import { projectApi } from "@/services/api";
import type { Project } from "@/types";

interface OutletCtx {
  project: Project;
  projectId: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

const FEATURE_ORDER = [
  "vectorStoreSetting",
  "metrics",
  "logsRoute",
  "containsFilter",
  "editDocumentsByFunction",
  "network",
  "chatCompletions",
  "multimodal",
];

export default function ProjectSettings() {
  const { project, projectId } = useOutletContext<OutletCtx>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const updateProject = useUpdateProject();
  const testConnection = useTestConnection();

  const [form, setForm] = useState({
    name: project.name,
    url: project.url,
    api_key: project.api_key || "",
    description: project.description || "",
  });
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [testVersion, setTestVersion] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  // Instance stats
  const { data: stats } = useQuery({
    queryKey: projectKeys.stats(projectId),
    queryFn: () => projectApi.getStats(projectId),
  });

  // Experimental features
  const { data: features } = useExperimentalFeatures(projectId);
  const updateFeaturesMutation = useUpdateExperimentalFeatures(projectId);

  // Health check on load
  const { data: health } = useQuery({
    queryKey: ["health", projectId],
    queryFn: () =>
      projectApi.testConnection(project.url, project.api_key || undefined),
  });

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

  const handleSave = async () => {
    try {
      await updateProject.mutateAsync({
        id: projectId,
        data: {
          name: form.name.trim(),
          url: form.url.trim(),
          api_key: form.api_key || undefined,
          description: form.description || undefined,
        },
      });
      toast.success(t("common.success"));
    } catch (err) {
      toast.error(t("common.error"), { description: String(err) });
    }
  };

  const indexCount = stats?.indexes
    ? Object.keys(stats.indexes).length
    : 0;

  const featuresRecord = features as Record<string, boolean> | undefined;
  const availableFeatures = featuresRecord
    ? FEATURE_ORDER.filter((key) => key in featuresRecord)
    : [];

  const handleToggleFeature = async (featureKey: string) => {
    if (!featuresRecord) return;
    const newValue = !featuresRecord[featureKey];
    try {
      await updateFeaturesMutation.mutateAsync({ [featureKey]: newValue });
    } catch (err) {
      toast.error(t("common.error"), { description: String(err) });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("project.editProject")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("project.projectName")} *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("project.projectUrl")} *</Label>
            <div className="flex gap-2">
              <Input
                value={form.url}
                className="flex-1"
                onChange={(e) =>
                  setForm((f) => ({ ...f, url: e.target.value }))
                }
              />
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={handleTest}
                disabled={testStatus === "testing"}
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
            <Label>{t("project.apiKey")}</Label>
            <Input
              type="password"
              value={form.api_key}
              onChange={(e) =>
                setForm((f) => ({ ...f, api_key: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("common.description")}</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={updateProject.isPending}>
              {updateProject.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              <Save className="w-4 h-4 mr-2" />
              {t("common.save")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instance Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("project.instanceInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("project.healthStatus")}</p>
                <div className="mt-0.5">
                  {health?.success ? (
                    <Badge
                      variant="default"
                      className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"
                    >
                      {t("project.healthy")}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px]">
                      {t("project.unreachable")}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Server className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("project.version")}
                </p>
                <p className="text-sm font-medium">
                  {health?.version ? `v${health.version}` : "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("project.dbSize")}</p>
                <p className="text-sm font-medium">
                  {stats?.databaseSize
                    ? formatBytes(stats.databaseSize)
                    : "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("project.indexCount")}
                </p>
                <p className="text-sm font-medium">{indexCount}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experimental Features */}
      {availableFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FlaskConical className="w-4 h-4" />
              {t("project.experimentalFeatures")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableFeatures.map((key) => {
                const enabled = !!featuresRecord?.[key];
                return (
                  <div
                    key={key}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {t(`experimentalFeature.${key}.name`, key)}
                      </span>
                      <Switch
                        checked={enabled}
                        onCheckedChange={() => handleToggleFeature(key)}
                        disabled={updateFeaturesMutation.isPending}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {t(`experimentalFeature.${key}.desc`, "")}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            {t("project.dangerZone")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {t("project.deleteProject")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("project.deleteConfirm")}
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              {t("common.delete")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteProjectDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        project={project}
        onDeleted={() => navigate("/projects")}
      />
    </div>
  );
}
