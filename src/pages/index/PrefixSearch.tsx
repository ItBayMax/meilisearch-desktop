import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Search, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePrefixSearch, useUpdatePrefixSearch } from "@/hooks/useSettings";

interface OutletCtx {
  projectId: number;
  indexId: string;
}

export default function PrefixSearch() {
  const { projectId, indexId } = useOutletContext<OutletCtx>();
  const { t } = useTranslation();

  const { data, isLoading } = usePrefixSearch(projectId, indexId);
  const updateMutation = useUpdatePrefixSearch(projectId, indexId);

  const [localValue, setLocalValue] = useState<string>("indexingTime");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (data !== undefined && data !== null) {
      setLocalValue(String(data));
      setHasChanges(false);
    }
  }, [data]);

  const handleChange = (value: string) => {
    setLocalValue(value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(localValue);
      toast.success(t("prefixSearch.updated"));
      setHasChanges(false);
    } catch (err) {
      toast.error(String(err));
    }
  };

  const handleReset = () => {
    if (data !== undefined && data !== null) {
      setLocalValue(String(data));
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
            <Search className="w-4 h-4" />
            {t("app.prefixSearch")}
          </CardTitle>
          <CardDescription>
            {t("prefixSearch.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Radio options */}
          <div className="space-y-3">
            <label
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                localValue === "indexingTime"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-accent/50"
              }`}
              onClick={() => handleChange("indexingTime")}
            >
              <input
                type="radio"
                name="prefixSearch"
                value="indexingTime"
                checked={localValue === "indexingTime"}
                onChange={() => handleChange("indexingTime")}
                className="mt-1"
              />
              <div>
                <span className="text-sm font-medium text-foreground">{t("prefixSearch.indexingTime")}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("prefixSearch.indexingTimeDesc")}
                </p>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                localValue === "disabled"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-accent/50"
              }`}
              onClick={() => handleChange("disabled")}
            >
              <input
                type="radio"
                name="prefixSearch"
                value="disabled"
                checked={localValue === "disabled"}
                onChange={() => handleChange("disabled")}
                className="mt-1"
              />
              <div>
                <span className="text-sm font-medium text-foreground">{t("prefixSearch.disabled")}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("prefixSearch.disabledDesc")}
                </p>
              </div>
            </label>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground">
            {t("prefixSearch.note")}
          </p>

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
    </div>
  );
}
