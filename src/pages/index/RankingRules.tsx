import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { StringListEditor } from "@/components/settings/StringListEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { useRankingRules, useUpdateRankingRules } from "@/hooks/useSettings";

interface OutletCtx {
  projectId: number;
  indexId: string;
}

export default function RankingRules() {
  const { projectId, indexId } = useOutletContext<OutletCtx>();
  const { t } = useTranslation();

  const defaultRulesInfo = useMemo(() => [
    { name: "words", desc: t("rankingRules.words") },
    { name: "typo", desc: t("rankingRules.typo") },
    { name: "proximity", desc: t("rankingRules.proximity") },
    { name: "attribute", desc: t("rankingRules.attribute") },
    { name: "sort", desc: t("rankingRules.sort") },
    { name: "exactness", desc: t("rankingRules.exactness") },
  ], [t]);

  const { data, isLoading } = useRankingRules(projectId, indexId);
  const updateMutation = useUpdateRankingRules(projectId, indexId);

  return (
    <div className="space-y-4 max-w-2xl">
      <StringListEditor
        title={t("rankingRules.title")}
        description={t("rankingRules.description")}
        items={data as string[] | undefined}
        isLoading={isLoading}
        onSave={async (items) => {
          try {
            await updateMutation.mutateAsync(items);
            toast.success(t("rankingRules.updated"));
          } catch (err) {
            toast.error(String(err));
          }
        }}
        isSaving={updateMutation.isPending}
        placeholder='e.g. words, typo, proximity, attribute, sort, exactness, year:desc'
        orderable
      />

      {/* Default Rules description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="w-4 h-4" />
            {t("rankingRules.defaultRules")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2">
            {defaultRulesInfo.map((rule) => (
              <li key={rule.name}>
                <code className="text-primary text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                  {rule.name}
                </code>
                <span className="ml-2">{rule.desc}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
