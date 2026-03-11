import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, Plus, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSynonyms, useUpdateSynonyms } from "@/hooks/useSettings";

interface OutletCtx {
  projectId: number;
  indexId: string;
}

export default function Synonyms() {
  const { projectId, indexId } = useOutletContext<OutletCtx>();
  const { t } = useTranslation();

  const { data, isLoading } = useSynonyms(projectId, indexId);
  const updateMutation = useUpdateSynonyms(projectId, indexId);

  const [localSynonyms, setLocalSynonyms] = useState<Record<string, string[]>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newSynonyms, setNewSynonyms] = useState("");

  useEffect(() => {
    if (data) {
      setLocalSynonyms({ ...(data as Record<string, string[]>) });
      setHasChanges(false);
    }
  }, [data]);

  const addEntry = () => {
    const word = newWord.trim();
    const syns = newSynonyms
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!word || syns.length === 0) return;
    setLocalSynonyms({ ...localSynonyms, [word]: syns });
    setNewWord("");
    setNewSynonyms("");
    setHasChanges(true);
  };

  const removeEntry = (word: string) => {
    const copy = { ...localSynonyms };
    delete copy[word];
    setLocalSynonyms(copy);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(localSynonyms);
      toast.success(t("synonyms.updated"));
      setHasChanges(false);
    } catch (err) {
      toast.error(String(err));
    }
  };

  const handleReset = () => {
    if (data) {
      setLocalSynonyms({ ...(data as Record<string, string[]>) });
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

  const entries = Object.entries(localSynonyms);

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{t("app.synonyms")}</CardTitle>
              <CardDescription className="mt-1">
                {t("synonyms.description")}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              {entries.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Example */}
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <h4 className="text-xs font-medium text-foreground mb-1">{t("synonyms.example")}</h4>
            <p className="text-xs text-muted-foreground">
              {t("synonyms.exampleDesc")}
            </p>
          </div>

          {/* Add new synonym group */}
          <div className="space-y-2 p-3 rounded-lg border border-dashed">
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder={t("synonyms.wordPlaceholder")}
                className="text-sm"
              />
              <Input
                value={newSynonyms}
                onChange={(e) => setNewSynonyms(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addEntry()}
                placeholder={t("synonyms.synonymsPlaceholder")}
                className="text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addEntry}
              disabled={!newWord.trim() || !newSynonyms.trim()}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              {t("common.add")}
            </Button>
          </div>

          {/* Synonym list */}
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {t("common.noData")}
            </p>
          ) : (
            <div className="space-y-2">
              {entries.map(([word, syns]) => (
                <div
                  key={word}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 group"
                >
                  <Badge variant="default" className="text-xs shrink-0">
                    {word}
                  </Badge>
                  <span className="text-muted-foreground text-xs">&rarr;</span>
                  <div className="flex flex-wrap gap-1 flex-1">
                    {syns.map((syn) => (
                      <Badge key={syn} variant="secondary" className="text-xs">
                        {syn}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                    onClick={() => removeEntry(word)}
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
              disabled={!hasChanges || updateMutation.isPending}
            >
              {updateMutation.isPending && (
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
