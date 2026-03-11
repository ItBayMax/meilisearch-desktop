import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, Plus, X, GripVertical, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useSearchableAttributes,
  useUpdateSearchableAttributes,
  useDisplayedAttributes,
  useUpdateDisplayedAttributes,
  useFilterableAttributes,
  useUpdateFilterableAttributes,
  useSortableAttributes,
  useUpdateSortableAttributes,
} from "@/hooks/useSettings";
import { useIndexStats } from "@/hooks/useIndexes";

interface OutletCtx {
  projectId: number;
  indexId: string;
}

type FilterMode = "equality" | "comparison";

interface FilterableItem {
  name: string;
  mode: FilterMode;
}

// ===== Attribute List Editor (dropdown-based) =====
function AttributeListEditor({
  title,
  description,
  items,
  isLoading,
  onSave,
  isSaving,
  availableFields,
  orderable,
  emptyHint,
}: {
  title: string;
  description?: string;
  items: string[] | undefined;
  isLoading: boolean;
  onSave: (items: string[]) => void;
  isSaving: boolean;
  availableFields: string[];
  orderable?: boolean;
  emptyHint?: string;
}) {
  const { t } = useTranslation();
  const [localItems, setLocalItems] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (items) {
      setLocalItems([...items]);
      setHasChanges(false);
    }
  }, [items]);

  const remaining = useMemo(
    () => availableFields.filter((f) => !localItems.includes(f)),
    [availableFields, localItems]
  );

  const addItem = () => {
    if (!selected || localItems.includes(selected)) return;
    setLocalItems([...localItems, selected]);
    setSelected("");
    setHasChanges(true);
  };

  const removeItem = (index: number) => {
    setLocalItems(localItems.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= localItems.length) return;
    const arr = [...localItems];
    const [removed] = arr.splice(from, 1);
    arr.splice(to, 0, removed);
    setLocalItems(arr);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(localItems);
    setHasChanges(false);
  };

  const handleReset = () => {
    if (items) {
      setLocalItems([...items]);
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          <Badge variant="secondary" className="text-xs">
            {localItems.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add via dropdown */}
        <div className="flex gap-2">
          <Select value={selected} onValueChange={setSelected} disabled={remaining.length === 0}>
            <SelectTrigger className="flex-1 text-sm">
              <SelectValue placeholder={remaining.length > 0 ? (emptyHint ?? t("attribute.selectAttribute")) : t("attribute.noAvailableFields")} />
            </SelectTrigger>
            <SelectContent>
              {remaining.map((field) => (
                <SelectItem key={field} value={field}>
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={addItem}
            disabled={!selected}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            {t("common.add")}
          </Button>
        </div>
        {remaining.length === 0 && localItems.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-500">
            <AlertCircle className="w-3.5 h-3.5" />
            {t("attribute.allFieldsAdded")}
          </div>
        )}

        {/* Items list */}
        {localItems.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {t("common.noData")}
          </p>
        ) : (
          <div className="space-y-1">
            {localItems.map((item, i) => (
              <div
                key={`${item}-${i}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 group"
              >
                {orderable && (
                  <div className="flex flex-col -my-1">
                    <button
                      className="text-muted-foreground hover:text-foreground p-0.5"
                      onClick={() => moveItem(i, i - 1)}
                      disabled={i === 0}
                    >
                      <GripVertical className="w-3 h-3 rotate-90" />
                    </button>
                  </div>
                )}
                {orderable && (
                  <span className="text-xs text-muted-foreground w-5">
                    {i + 1}.
                  </span>
                )}
                <span className="flex-1 text-sm font-mono">{item}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={() => removeItem(i)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving && (
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
  );
}

// ===== Filterable Attribute Editor (with equality/comparison mode) =====
function FilterableAttributeEditor({
  items,
  isLoading,
  onSave,
  isSaving,
  availableFields,
}: {
  items: string[] | undefined;
  isLoading: boolean;
  onSave: (items: string[]) => void;
  isSaving: boolean;
  availableFields: string[];
}) {
  const { t } = useTranslation();
  const [localItems, setLocalItems] = useState<FilterableItem[]>([]);
  const [selected, setSelected] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("equality");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (items) {
      setLocalItems(
        items.map((name) => ({ name, mode: "equality" as FilterMode }))
      );
      setHasChanges(false);
    }
  }, [items]);

  const remaining = useMemo(
    () => availableFields.filter((f) => !localItems.some((it) => it.name === f)),
    [availableFields, localItems]
  );

  const addItem = () => {
    if (!selected || localItems.some((it) => it.name === selected)) return;
    setLocalItems([...localItems, { name: selected, mode: filterMode }]);
    setSelected("");
    setFilterMode("equality");
    setHasChanges(true);
  };

  const removeItem = (index: number) => {
    setLocalItems(localItems.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(localItems.map((it) => it.name));
    setHasChanges(false);
  };

  const handleReset = () => {
    if (items) {
      setLocalItems(
        items.map((name) => ({ name, mode: "equality" as FilterMode }))
      );
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{t("attribute.filterableAttributes")}</CardTitle>
            <CardDescription className="mt-1">
              {t("attribute.filterableDesc")}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            {localItems.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add via dropdown + mode */}
        <div className="flex gap-2">
          <Select value={selected} onValueChange={setSelected} disabled={remaining.length === 0}>
            <SelectTrigger className="flex-1 text-sm">
              <SelectValue placeholder={remaining.length > 0 ? t("attribute.selectAttribute") : t("attribute.noAvailableFields")} />
            </SelectTrigger>
            <SelectContent>
              {remaining.map((field) => (
                <SelectItem key={field} value={field}>
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterMode} onValueChange={(v) => setFilterMode(v as FilterMode)}>
            <SelectTrigger className="w-[130px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equality">{t("attribute.equality")}</SelectItem>
              <SelectItem value="comparison">{t("attribute.comparison")}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={addItem}
            disabled={!selected}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            {t("common.add")}
          </Button>
        </div>
        {remaining.length === 0 && localItems.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-500">
            <AlertCircle className="w-3.5 h-3.5" />
            {t("attribute.allFieldsAdded")}
          </div>
        )}

        {/* Items list */}
        {localItems.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {t("common.noData")}
          </p>
        ) : (
          <div className="space-y-2">
            {localItems.map((item, i) => (
              <div
                key={item.name}
                className="px-3 py-2 rounded-md bg-muted/50 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{item.name}</span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {item.mode === "equality"
                        ? t("attribute.equality")
                        : t("attribute.comparison")}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={() => removeItem(i)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {item.mode === "equality"
                    ? "=, !=, IN, AND, OR, NOT, EXISTS, IS EMPTY, IS NULL"
                    : ">, <, >=, <=, AND, OR, NOT, EXISTS, IS EMPTY, IS NULL"}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving && (
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
  );
}

// ===== Main Attributes Page =====
export default function Attributes() {
  const { projectId, indexId } = useOutletContext<OutletCtx>();
  const { t } = useTranslation();
  const { data: stats } = useIndexStats(projectId, indexId);

  const availableFields = useMemo(() => {
    const rawStats = stats as Record<string, unknown> | undefined;
    const fd = (rawStats?.fieldDistribution as Record<string, number>) ?? {};
    return Object.keys(fd).sort();
  }, [stats]);

  const searchable = useSearchableAttributes(projectId, indexId);
  const updateSearchable = useUpdateSearchableAttributes(projectId, indexId);

  const displayed = useDisplayedAttributes(projectId, indexId);
  const updateDisplayed = useUpdateDisplayedAttributes(projectId, indexId);

  const filterable = useFilterableAttributes(projectId, indexId);
  const updateFilterable = useUpdateFilterableAttributes(projectId, indexId);

  const sortable = useSortableAttributes(projectId, indexId);
  const updateSortable = useUpdateSortableAttributes(projectId, indexId);

  const handleSave = async (
    mutate: (data: string[]) => Promise<unknown>,
    data: string[],
    label: string
  ) => {
    try {
      await mutate(data);
      toast.success(t("attribute.attributeUpdated", { label }));
    } catch (err) {
      toast.error(String(err));
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <AttributeListEditor
        title={t("attribute.searchableAttributes")}
        description={t("attribute.searchableDesc")}
        items={searchable.data as string[] | undefined}
        isLoading={searchable.isLoading}
        onSave={(items) =>
          handleSave(updateSearchable.mutateAsync, items, "Searchable attributes")
        }
        isSaving={updateSearchable.isPending}
        availableFields={availableFields}
        orderable
      />

      <AttributeListEditor
        title={t("attribute.displayedAttributes")}
        description={t("attribute.displayedDesc")}
        items={displayed.data as string[] | undefined}
        isLoading={displayed.isLoading}
        onSave={(items) =>
          handleSave(updateDisplayed.mutateAsync, items, "Displayed attributes")
        }
        isSaving={updateDisplayed.isPending}
        availableFields={availableFields}
      />

      <FilterableAttributeEditor
        items={filterable.data as string[] | undefined}
        isLoading={filterable.isLoading}
        onSave={(items) =>
          handleSave(updateFilterable.mutateAsync, items, "Filterable attributes")
        }
        isSaving={updateFilterable.isPending}
        availableFields={availableFields}
      />

      <AttributeListEditor
        title={t("attribute.sortableAttributes")}
        description={t("attribute.sortableDesc")}
        items={sortable.data as string[] | undefined}
        isLoading={sortable.isLoading}
        onSave={(items) =>
          handleSave(updateSortable.mutateAsync, items, "Sortable attributes")
        }
        isSaving={updateSortable.isPending}
        availableFields={availableFields}
      />
    </div>
  );
}
