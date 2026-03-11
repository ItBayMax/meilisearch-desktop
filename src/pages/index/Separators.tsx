import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { StringListEditor } from "@/components/settings/StringListEditor";
import { useSeparatorTokens, useUpdateSeparatorTokens } from "@/hooks/useSettings";

interface OutletCtx {
  projectId: number;
  indexId: string;
}

export default function Separators() {
  const { projectId, indexId } = useOutletContext<OutletCtx>();
  const { t } = useTranslation();
  const { data, isLoading } = useSeparatorTokens(projectId, indexId);
  const updateMutation = useUpdateSeparatorTokens(projectId, indexId);

  return (
    <StringListEditor
      title={t("separators.title")}
      description={t("separators.description")}
      items={data as string[] | undefined}
      isLoading={isLoading}
      onSave={async (items) => {
        try {
          await updateMutation.mutateAsync(items);
          toast.success(t("separators.updated"));
        } catch (err) {
          toast.error(String(err));
        }
      }}
      isSaving={updateMutation.isPending}
      placeholder='e.g. @, #, &'
    />
  );
}
