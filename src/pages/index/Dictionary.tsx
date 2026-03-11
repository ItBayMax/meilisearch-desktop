import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { StringListEditor } from "@/components/settings/StringListEditor";
import { useDictionary, useUpdateDictionary } from "@/hooks/useSettings";

interface OutletCtx {
  projectId: number;
  indexId: string;
}

export default function Dictionary() {
  const { projectId, indexId } = useOutletContext<OutletCtx>();
  const { t } = useTranslation();
  const { data, isLoading } = useDictionary(projectId, indexId);
  const updateMutation = useUpdateDictionary(projectId, indexId);

  return (
    <StringListEditor
      title={t("dictionary.title")}
      description={t("dictionary.description")}
      items={data as string[] | undefined}
      isLoading={isLoading}
      onSave={async (items) => {
        try {
          await updateMutation.mutateAsync(items);
          toast.success(t("dictionary.updated"));
        } catch (err) {
          toast.error(String(err));
        }
      }}
      isSaving={updateMutation.isPending}
      placeholder="e.g. J.R.R., C++"
    />
  );
}
