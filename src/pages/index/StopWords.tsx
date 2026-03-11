import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { StringListEditor } from "@/components/settings/StringListEditor";
import { useStopWords, useUpdateStopWords } from "@/hooks/useSettings";

interface OutletCtx {
  projectId: number;
  indexId: string;
}

export default function StopWords() {
  const { projectId, indexId } = useOutletContext<OutletCtx>();
  const { t } = useTranslation();
  const { data, isLoading } = useStopWords(projectId, indexId);
  const updateMutation = useUpdateStopWords(projectId, indexId);

  return (
    <StringListEditor
      title={t("stopWords.title")}
      description={t("stopWords.description")}
      items={data as string[] | undefined}
      isLoading={isLoading}
      onSave={async (items) => {
        try {
          await updateMutation.mutateAsync(items);
          toast.success(t("stopWords.updated"));
        } catch (err) {
          toast.error(String(err));
        }
      }}
      isSaving={updateMutation.isPending}
      placeholder="e.g. the, a, an, is"
    />
  );
}
