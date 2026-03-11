import { useTranslation } from "react-i18next";
import { Plus, X, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FilterCondition } from "@/types";

const OPERATORS = [
  { value: "=", label: "=" },
  { value: "!=", label: "!=" },
  { value: ">", label: ">" },
  { value: "<", label: "<" },
  { value: ">=", label: ">=" },
  { value: "<=", label: "<=" },
  { value: "IN", label: "IN" },
  { value: "NOT IN", label: "NOT IN" },
  { value: "EXISTS", label: "EXISTS" },
  { value: "IS EMPTY", label: "IS EMPTY" },
  { value: "IS NULL", label: "IS NULL" },
];

const NO_VALUE_OPERATORS = ["EXISTS", "IS EMPTY", "IS NULL"];

interface FilterBuilderProps {
  filterableAttributes: string[];
  conditions: FilterCondition[];
  onConditionsChange: (conditions: FilterCondition[]) => void;
  onApply?: () => void;
}

export function FilterBuilder({
  filterableAttributes,
  conditions,
  onConditionsChange,
  onApply,
}: FilterBuilderProps) {
  const { t } = useTranslation();

  const addCondition = () => {
    onConditionsChange([
      ...conditions,
      { attribute: "", operator: "=", value: "" },
    ]);
  };

  const removeCondition = (index: number) => {
    onConditionsChange(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (
    index: number,
    field: keyof FilterCondition,
    value: string
  ) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    onConditionsChange(updated);
  };

  const clearAll = () => {
    onConditionsChange([]);
  };

  return (
    <div className="space-y-2">
      {/* Header: title + add/clear buttons */}
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">
          {t("search.filter.filterExpression")}
        </Label>
        {filterableAttributes.length > 0 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={addCondition}
            >
              <Plus className="w-3 h-3 mr-1" />
              {t("search.filter.addCondition")}
            </Button>
            {conditions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground"
                onClick={clearAll}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                {t("search.filter.clearAll")}
              </Button>
            )}
          </div>
        )}
      </div>

      {filterableAttributes.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {t("search.filter.noFilterableAttributes")}
        </p>
      ) : (
        <>
          {/* Condition rows */}
          <div className="space-y-2">
            {conditions.map((condition, index) => (
              <div key={index} className="flex items-center gap-1.5">
                {/* Attribute */}
                <Select
                  value={condition.attribute}
                  onValueChange={(v) => updateCondition(index, "attribute", v)}
                >
                  <SelectTrigger className="h-7 text-xs flex-1 min-w-0">
                    <SelectValue
                      placeholder={t("search.filter.attribute")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filterableAttributes.map((attr) => (
                      <SelectItem key={attr} value={attr} className="text-xs">
                        {attr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Operator */}
                <Select
                  value={condition.operator}
                  onValueChange={(v) => updateCondition(index, "operator", v)}
                >
                  <SelectTrigger className="h-7 text-xs w-[90px] flex-shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((op) => (
                      <SelectItem
                        key={op.value}
                        value={op.value}
                        className="text-xs font-mono"
                      >
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Value */}
                {!NO_VALUE_OPERATORS.includes(condition.operator) && (
                  <Input
                    value={condition.value}
                    onChange={(e) =>
                      updateCondition(index, "value", e.target.value)
                    }
                    placeholder={t("search.filter.value")}
                    className="h-7 text-xs flex-1 min-w-0"
                  />
                )}

                {/* Remove */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={() => removeCondition(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Apply filter button */}
          {conditions.length > 0 && onApply && (
            <Button
              variant="default"
              size="sm"
              className="h-7 text-xs w-full"
              onClick={onApply}
            >
              <Play className="w-3 h-3 mr-1" />
              {t("search.filter.applyFilter")}
            </Button>
          )}
        </>
      )}
    </div>
  );
}

/** Build Meilisearch filter string from conditions */
export function buildFilterString(conditions: FilterCondition[]): string {
  const parts = conditions
    .filter((c) => c.attribute && c.operator)
    .map((c) => {
      const { attribute, operator, value } = c;

      if (NO_VALUE_OPERATORS.includes(operator)) {
        return `${attribute} ${operator}`;
      }

      if (operator === "IN" || operator === "NOT IN") {
        const values = value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
          .map((v) => (isNumeric(v) ? v : `"${v}"`));
        return `${attribute} ${operator} [${values.join(", ")}]`;
      }

      // Standard operators
      const formattedValue = isNumeric(value) ? value : `"${value}"`;
      return `${attribute} ${operator} ${formattedValue}`;
    });

  return parts.join(" AND ");
}

function isNumeric(s: string): boolean {
  return s !== "" && !isNaN(Number(s));
}
