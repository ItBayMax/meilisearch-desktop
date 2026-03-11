import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePaginationSettings, useUpdatePaginationSettings } from "@/hooks/useSettings";

interface OutletCtx {
  projectId: number;
  indexId: string;
}

export default function Pagination() {
  const { projectId, indexId } = useOutletContext<OutletCtx>();
  const { t } = useTranslation();

  const { data: rawData, isLoading } = usePaginationSettings(projectId, indexId);
  const updateMutation = useUpdatePaginationSettings(projectId, indexId);

  const data = rawData as Record<string, unknown> | undefined;
  const [maxTotalHits, setMaxTotalHits] = useState(1000);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (data) {
      setMaxTotalHits((data.maxTotalHits as number) ?? 1000);
      setHasChanges(false);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ maxTotalHits });
      toast.success(t("pagination.updated"));
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
          <CardTitle className="text-base">{t("app.pagination")}</CardTitle>
          <CardDescription>
            {t("pagination.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("pagination.maxTotalHits")}</Label>
            <Input
              type="number"
              value={maxTotalHits}
              onChange={(e) => {
                setMaxTotalHits(Number(e.target.value));
                setHasChanges(true);
              }}
              min={1}
              className="text-sm w-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              {t("pagination.hint")}
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
                  setMaxTotalHits((data.maxTotalHits as number) ?? 1000);
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
