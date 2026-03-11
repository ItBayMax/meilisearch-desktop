import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useDeleteProject } from "@/hooks/useProjects";
import type { Project } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onDeleted?: () => void;
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  project,
  onDeleted,
}: Props) {
  const { t } = useTranslation();
  const deleteProject = useDeleteProject();

  const handleDelete = async () => {
    if (!project) return;
    try {
      await deleteProject.mutateAsync({ id: project.id, hard: true });
      toast.success(t("common.success"), {
        description: t("project.deleteProject"),
      });
      onOpenChange(false);
      onDeleted?.();
    } catch (err) {
      toast.error(t("common.error"), { description: String(err) });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("project.deleteProject")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("project.deleteConfirm")}
            {project && (
              <span className="block mt-2 font-medium text-foreground">
                {project.name}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteProject.isPending}
          >
            {deleteProject.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {t("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
