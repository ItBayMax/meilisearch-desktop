import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StringListEditor } from "@/components/settings/StringListEditor";
import { useTypoTolerance, useUpdateTypoTolerance } from "@/hooks/useSettings";

interface OutletCtx {
  projectId: number;
  indexId: string;
}

export default function TypoTolerance() {
  const { projectId, indexId } = useOutletContext<OutletCtx>();
  const { t } = useTranslation();

  const { data: rawData, isLoading } = useTypoTolerance(projectId, indexId);
  const updateMutation = useUpdateTypoTolerance(projectId, indexId);

  const data = rawData as Record<string, unknown> | undefined;

  const [enabled, setEnabled] = useState(true);
  const [oneTypo, setOneTypo] = useState(5);
  const [twoTypos, setTwoTypos] = useState(9);
  const [disableOnWords, setDisableOnWords] = useState<string[]>([]);
  const [disableOnAttributes, setDisableOnAttributes] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (data) {
      setEnabled((data.enabled as boolean) ?? true);
      const minWord = data.minWordSizeForTypos as Record<string, number> | undefined;
      setOneTypo((minWord?.oneTypo as number) ?? 5);
      setTwoTypos((minWord?.twoTypos as number) ?? 9);
      setDisableOnWords((data.disableOnWords as string[]) ?? []);
      setDisableOnAttributes((data.disableOnAttributes as string[]) ?? []);
      setHasChanges(false);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        enabled,
        minWordSizeForTypos: {
          oneTypo,
          twoTypos,
        },
        disableOnWords,
        disableOnAttributes,
      });
      toast.success(t("typoTolerance.updated"));
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
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("app.typoTolerance")}</CardTitle>
          <CardDescription>
            {t("typoTolerance.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>{t("typoTolerance.enabledLabel")}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("typoTolerance.enabledDesc")}
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={(v) => {
                setEnabled(v);
                setHasChanges(true);
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("typoTolerance.minWordOneTypo")}</Label>
              <Input
                type="number"
                value={oneTypo}
                onChange={(e) => {
                  setOneTypo(Number(e.target.value));
                  setHasChanges(true);
                }}
                min={0}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("typoTolerance.minWordTwoTypos")}</Label>
              <Input
                type="number"
                value={twoTypos}
                onChange={(e) => {
                  setTwoTypos(Number(e.target.value));
                  setHasChanges(true);
                }}
                min={0}
                className="text-sm"
              />
            </div>
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
                  setEnabled((data.enabled as boolean) ?? true);
                  const minWord = data.minWordSizeForTypos as Record<string, number> | undefined;
                  setOneTypo((minWord?.oneTypo as number) ?? 5);
                  setTwoTypos((minWord?.twoTypos as number) ?? 9);
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

      <StringListEditor
        title={t("typoTolerance.disableOnWords")}
        description={t("typoTolerance.disableOnWordsDesc")}
        items={disableOnWords}
        isLoading={false}
        onSave={async (items) => {
          setDisableOnWords(items);
          try {
            await updateMutation.mutateAsync({
              enabled,
              minWordSizeForTypos: { oneTypo, twoTypos },
              disableOnWords: items,
              disableOnAttributes,
            });
            toast.success(t("typoTolerance.updated"));
          } catch (err) {
            toast.error(String(err));
          }
        }}
        isSaving={updateMutation.isPending}
        placeholder="e.g. iPhone"
      />

      <StringListEditor
        title={t("typoTolerance.disableOnAttributes")}
        description={t("typoTolerance.disableOnAttributesDesc")}
        items={disableOnAttributes}
        isLoading={false}
        onSave={async (items) => {
          setDisableOnAttributes(items);
          try {
            await updateMutation.mutateAsync({
              enabled,
              minWordSizeForTypos: { oneTypo, twoTypos },
              disableOnWords,
              disableOnAttributes: items,
            });
            toast.success(t("typoTolerance.updated"));
          } catch (err) {
            toast.error(String(err));
          }
        }}
        isSaving={updateMutation.isPending}
        placeholder="e.g. id, sku"
      />
    </div>
  );
}
