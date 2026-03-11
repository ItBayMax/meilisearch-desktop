import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFacetingSettings, useUpdateFacetingSettings } from "@/hooks/useSettings";

interface OutletCtx {
  projectId: number;
  indexId: string;
}

export default function Faceting() {
  const { projectId, indexId } = useOutletContext<OutletCtx>();
  const { t } = useTranslation();

  const { data: rawData, isLoading } = useFacetingSettings(projectId, indexId);
  const updateMutation = useUpdateFacetingSettings(projectId, indexId);

  const data = rawData as Record<string, unknown> | undefined;
  const [maxValuesPerFacet, setMaxValuesPerFacet] = useState(100);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (data) {
      setMaxValuesPerFacet((data.maxValuesPerFacet as number) ?? 100);
      setHasChanges(false);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ maxValuesPerFacet });
      toast.success(t("faceting.updated"));
      setHasChanges(false);
    } catch (err) {
      toast.error(String(err));
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
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("app.faceting")}</CardTitle>
          <CardDescription>
            {t("faceting.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("faceting.maxValuesPerFacet")}</Label>
            <Input
              type="number"
              value={maxValuesPerFacet}
              onChange={(e) => {
                setMaxValuesPerFacet(Number(e.target.value));
                setHasChanges(true);
              }}
              min={1}
              className="text-sm w-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              {t("faceting.hint")}
            </p>
          </div>

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
              onClick={() => {
                if (data) {
                  setMaxValuesPerFacet((data.maxValuesPerFacet as number) ?? 100);
                  setHasChanges(false);
                }
              }}
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
