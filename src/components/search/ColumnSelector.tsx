import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ColumnSelectorProps {
  allColumns: string[];
  selectedColumns: string[];
  onSelectedChange: (columns: string[]) => void;
}

export function ColumnSelector({
  allColumns,
  selectedColumns,
  onSelectedChange,
}: ColumnSelectorProps) {
  const { t } = useTranslation();

  const allSelected =
    allColumns.length > 0 && selectedColumns.length === allColumns.length;

  const toggleAll = () => {
    onSelectedChange(allSelected ? [] : [...allColumns]);
  };

  const toggleColumn = (col: string) => {
    if (selectedColumns.includes(col)) {
      onSelectedChange(selectedColumns.filter((c) => c !== col));
    } else {
      onSelectedChange([...selectedColumns, col]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">
          {t("search.columnSelector.selectColumns")}
        </Label>
        {allColumns.length > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {selectedColumns.length}/{allColumns.length}
          </span>
        )}
      </div>

      {allColumns.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 pb-1 border-b border-border">
            <Checkbox
              id="select-all-cols"
              checked={allSelected}
              onCheckedChange={toggleAll}
              className="h-3.5 w-3.5"
            />
            <label
              htmlFor="select-all-cols"
              className="text-xs text-muted-foreground cursor-pointer"
            >
              {t("search.columnSelector.selectAll")}
            </label>
          </div>

          <ScrollArea className="max-h-[150px]">
            <div className="space-y-0.5">
              {allColumns.map((col) => (
                <div key={col} className="flex items-center gap-2 py-0.5">
                  <Checkbox
                    id={`col-${col}`}
                    checked={selectedColumns.includes(col)}
                    onCheckedChange={() => toggleColumn(col)}
                    className="h-3.5 w-3.5"
                  />
                  <label
                    htmlFor={`col-${col}`}
                    className="text-xs font-mono truncate cursor-pointer"
                  >
                    {col}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
