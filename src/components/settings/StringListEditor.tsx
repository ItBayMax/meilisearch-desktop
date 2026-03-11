import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Loader2, Plus, X, ChevronUp, ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Reusable string-list editor (for attributes, stop words, dictionary, separator tokens, ranking rules)
export function StringListEditor({
  title,
  description,
  items,
  isLoading,
  onSave,
  isSaving,
  placeholder,
  orderable,
}: {
  title: string;
  description?: string;
  items: string[] | undefined;
  isLoading: boolean;
  onSave: (items: string[]) => void;
  isSaving: boolean;
  placeholder?: string;
  orderable?: boolean;
}) {
  const { t } = useTranslation();
  const [localItems, setLocalItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (items) {
      setLocalItems([...items]);
      setHasChanges(false);
    }
  }, [items]);

  const addItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed || localItems.includes(trimmed)) return;
    setLocalItems([...localItems, trimmed]);
    setNewItem("");
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
    <div className="space-y-4 max-w-2xl">
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
          {/* Add new item */}
          <div className="flex gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              placeholder={placeholder ?? "Add item..."}
              className="text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={addItem}
              disabled={!newItem.trim()}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              {t("common.add")}
            </Button>
          </div>

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
                    <span className="text-xs text-muted-foreground w-5">
                      {i + 1}.
                    </span>
                  )}
                  <span className="flex-1 text-sm font-mono">{item}</span>
                  {orderable && (
                    <div className="flex items-center gap-0.5">
                      <button
                        className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:pointer-events-none"
                        onClick={() => moveItem(i, i - 1)}
                        disabled={i === 0}
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:pointer-events-none"
                        onClick={() => moveItem(i, i + 1)}
                        disabled={i === localItems.length - 1}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
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
    </div>
  );
}
