import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Timer, Loader2, RotateCcw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSearchCutoffMs, useUpdateSearchCutoffMs } from "@/hooks/useSettings";

interface OutletCtx {
  projectId: number;
  indexId: string;
}

export default function SearchCutoff() {
  const { projectId, indexId } = useOutletContext<OutletCtx>();
  const { t } = useTranslation();

  const { data, isLoading } = useSearchCutoffMs(projectId, indexId);
  const updateMutation = useUpdateSearchCutoffMs(projectId, indexId);

  const [localValue, setLocalValue] = useState<string>("");
  const [disableCutoff, setDisableCutoff] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (data !== undefined) {
      if (data === null) {
        setLocalValue("");
        setDisableCutoff(true);
      } else {
        setLocalValue(String(data));
        setDisableCutoff(false);
      }
      setHasChanges(false);
    }
  }, [data]);

  const handleValueChange = (val: string) => {
    setLocalValue(val);
    setHasChanges(true);
  };

  const handleDisableToggle = () => {
    const next = !disableCutoff;
    setDisableCutoff(next);
    if (next) {
      setLocalValue("");
    }
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const value = disableCutoff ? null : Number(localValue) || null;
      await updateMutation.mutateAsync(value);
      toast.success(t("searchCutoff.updated"));
      setHasChanges(false);
    } catch (err) {
      toast.error(String(err));
    }
  };

  const handleReset = () => {
    if (data !== undefined) {
      if (data === null) {
        setLocalValue("");
        setDisableCutoff(true);
      } else {
        setLocalValue(String(data));
        setDisableCutoff(false);
      }
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Timer className="w-4 h-4" />
            {t("app.searchCutoff")}
          </CardTitle>
          <CardDescription>
            {t("searchCutoff.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Value input */}
          <div className="space-y-2">
            <Label className="text-sm">{t("searchCutoff.cutoffDuration")}</Label>
            <Input
              type="number"
              value={localValue}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="1500"
              disabled={disableCutoff}
              className="text-sm max-w-[200px]"
              min={0}
            />
          </div>

          {/* Disable toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="disable-cutoff"
              checked={disableCutoff}
              onChange={handleDisableToggle}
              className="rounded border-border"
            />
            <Label htmlFor="disable-cutoff" className="text-sm text-muted-foreground cursor-pointer">
              {t("searchCutoff.disableCutoff")}
            </Label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending}
            >
              {updateMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              )}
              {t("common.save")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={!hasChanges}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              {t("common.reset")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommended values */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="w-4 h-4" />
            {t("searchCutoff.recommendedValues")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>
              <code className="text-primary text-xs font-mono bg-muted px-1.5 py-0.5 rounded">1500</code>
              <span className="ml-2">{t("searchCutoff.rec1500")}</span>
            </li>
            <li>
              <code className="text-primary text-xs font-mono bg-muted px-1.5 py-0.5 rounded">500–1000</code>
              <span className="ml-2">{t("searchCutoff.rec500")}</span>
            </li>
            <li>
              <code className="text-primary text-xs font-mono bg-muted px-1.5 py-0.5 rounded">3000–5000</code>
              <span className="ml-2">{t("searchCutoff.rec3000")}</span>
            </li>
            <li>
              <code className="text-primary text-xs font-mono bg-muted px-1.5 py-0.5 rounded">null</code>
              <span className="ml-2">{t("searchCutoff.recNull")}</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
