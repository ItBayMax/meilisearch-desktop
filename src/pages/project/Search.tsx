import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Search as SearchIcon, Database } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useIndexes } from "@/hooks/useIndexes";
import { SearchPanel } from "@/components/search/SearchPanel";
import { SearchLayout } from "@/components/layout/SearchLayout";

export default function ProjectSearch() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const { t } = useTranslation();

  // Index selection
  const { data: rawIndexes } = useIndexes(projectId);
  const indexes = useMemo(() => {
    if (!rawIndexes) return [];
    return Array.isArray(rawIndexes)
      ? rawIndexes
      : ((rawIndexes as unknown as Record<string, unknown>)?.results as typeof rawIndexes) ?? [];
  }, [rawIndexes]);

  const [selectedIndex, setSelectedIndex] = useState<string>("");

  // Auto-select first index
  useEffect(() => {
    if (indexes.length > 0 && !selectedIndex) {
      const uid =
        (indexes[0] as unknown as Record<string, unknown>)?.uid as string ??
        "";
      setSelectedIndex(uid);
    }
  }, [indexes, selectedIndex]);

  // Index selector node to be rendered in sidebar
  const indexSelectorNode = (
    <div className="space-y-2">
      <Label className="text-xs font-medium flex items-center gap-1.5">
        <Database className="w-3 h-3" />
        {t("search.selectIndex")}
      </Label>
      <Select value={selectedIndex} onValueChange={setSelectedIndex}>
        <SelectTrigger className="h-7 text-xs">
          <SelectValue placeholder={t("search.selectIndex")} />
        </SelectTrigger>
        <SelectContent>
          {indexes.map((idx) => {
            const uid =
              (idx as unknown as Record<string, unknown>)?.uid as string ?? "";
            return (
              <SelectItem key={uid} value={uid} className="text-xs">
                {uid}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );

  if (!selectedIndex) {
    return (
      <div className="h-[calc(100vh-180px)]">
        <SearchLayout sidebarContent={indexSelectorNode}>
          <div className="flex flex-col items-center justify-center h-full text-center">
            <SearchIcon className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">
              {t("search.selectIndex")}
            </p>
          </div>
        </SearchLayout>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-180px)]">
      <SearchPanel
        key={selectedIndex}
        projectId={projectId}
        indexId={selectedIndex}
        indexSelectorNode={indexSelectorNode}
      />
    </div>
  );
}
