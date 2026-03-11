import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VectorSearchConfigProps {
  enabled: boolean;
  onEnabledChange: (val: boolean) => void;
  semanticRatio: number;
  onSemanticRatioChange: (val: number) => void;
  embedder: string;
  onEmbedderChange: (val: string) => void;
  availableEmbedders: string[];
  projectId?: number;
  indexId?: string;
  onGoToEmbedders?: () => void;
}

export function VectorSearchConfig({
  enabled,
  onEnabledChange,
  semanticRatio,
  onSemanticRatioChange,
  embedder,
  onEmbedderChange,
  availableEmbedders,
  projectId,
  indexId,
  onGoToEmbedders,
}: VectorSearchConfigProps) {
  const { t } = useTranslation();

  if (availableEmbedders.length === 0) {
    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium">
          {t("search.vector.enableHybrid")}
        </Label>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <p className="text-xs font-medium text-yellow-500">
                {t("search.vector.noVectorEngine")}
              </p>
              <p className="text-xs text-yellow-400/80">
                {t("search.vector.configureFirst")}
              </p>
              {projectId !== undefined && indexId && (
                <Link
                  to={`/projects/${projectId}/indexes/${indexId}/embedders`}
                  className="text-xs text-yellow-400 hover:text-yellow-300 underline mt-1 inline-block"
                  onClick={() => onGoToEmbedders?.()}
                >
                  {t("search.vector.goToEmbedders")} →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">
          {t("search.vector.enableHybrid")}
        </Label>
        <Switch
          checked={enabled}
          onCheckedChange={onEnabledChange}
          className="scale-90"
        />
      </div>

      {enabled && (
        <>
          {/* Semantic ratio slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                {t("search.vector.semanticRatio")}
              </Label>
              <span className="text-xs font-mono text-muted-foreground">
                {semanticRatio.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[semanticRatio]}
              onValueChange={([v]) => onSemanticRatioChange(v)}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Keyword</span>
              <span>Semantic</span>
            </div>
          </div>

          {/* Embedder selector */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              {t("search.vector.embedder")}
            </Label>
            <Select value={embedder} onValueChange={onEmbedderChange}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableEmbedders.map((name) => (
                  <SelectItem key={name} value={name} className="text-xs">
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hybrid search info */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-md space-y-0.5">
            <p>• {t("search.vector.hybridInfo1")}</p>
            <p>• {t("search.vector.hybridInfo2")}</p>
            <p>• {t("search.vector.hybridInfo3")}</p>
          </div>
        </>
      )}
    </div>
  );
}
