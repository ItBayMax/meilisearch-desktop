import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { EmbedderConfig, EmbedderSource } from "@/types";

const SOURCES: { value: EmbedderSource; labelKey: string }[] = [
  { value: "openAi", labelKey: "embedder.source.openAi" },
  { value: "huggingFace", labelKey: "embedder.source.huggingFace" },
  { value: "ollama", labelKey: "embedder.source.ollama" },
  { value: "rest", labelKey: "embedder.source.rest" },
  { value: "userProvided", labelKey: "embedder.source.userProvided" },
];

const OPENAI_MODELS = [
  "text-embedding-3-small",
  "text-embedding-3-large",
  "text-embedding-ada-002",
];

const POOLING_OPTIONS = ["useModel", "forceMean", "forceCls"];

interface EmbedderFormProps {
  mode: "create" | "edit";
  initialName?: string;
  initialConfig?: EmbedderConfig;
  onSubmit: (name: string, config: EmbedderConfig) => void;
  isPending: boolean;
}

export function EmbedderForm({
  mode,
  initialName = "",
  initialConfig,
  onSubmit,
  isPending,
}: EmbedderFormProps) {
  const { t } = useTranslation();

  const [name, setName] = useState(initialName);
  const [source, setSource] = useState<EmbedderSource>(
    initialConfig?.source ?? "openAi"
  );
  const [apiKey, setApiKey] = useState(initialConfig?.apiKey ?? "");
  const [model, setModel] = useState(initialConfig?.model ?? "");
  const [url, setUrl] = useState(initialConfig?.url ?? "");
  const [dimensions, setDimensions] = useState(
    initialConfig?.dimensions?.toString() ?? ""
  );
  const [documentTemplate, setDocumentTemplate] = useState(
    initialConfig?.documentTemplate ?? ""
  );
  const [documentTemplateMaxBytes, setDocumentTemplateMaxBytes] = useState(
    initialConfig?.documentTemplateMaxBytes?.toString() ?? ""
  );
  const [revision, setRevision] = useState(initialConfig?.revision ?? "");
  const [pooling, setPooling] = useState(initialConfig?.pooling ?? "");
  const [requestTemplate, setRequestTemplate] = useState(
    initialConfig?.request ? JSON.stringify(initialConfig.request, null, 2) : ""
  );
  const [responsePath, setResponsePath] = useState(
    initialConfig?.response
      ? JSON.stringify(initialConfig.response, null, 2)
      : ""
  );
  const [binaryQuantized, setBinaryQuantized] = useState(
    initialConfig?.binaryQuantized ?? false
  );

  const isValid = (): boolean => {
    if (!name.trim()) return false;
    if (!source) return false;
    if (source === "ollama" && (!url.trim() || !model.trim())) return false;
    if (source === "rest" && !url.trim()) return false;
    return true;
  };

  const handleSubmit = () => {
    const config: EmbedderConfig = { source };

    if (apiKey.trim()) config.apiKey = apiKey.trim();
    if (model.trim()) config.model = model.trim();
    if (url.trim()) config.url = url.trim();
    if (dimensions.trim()) config.dimensions = Number(dimensions);
    if (documentTemplate.trim())
      config.documentTemplate = documentTemplate.trim();
    if (documentTemplateMaxBytes.trim())
      config.documentTemplateMaxBytes = Number(documentTemplateMaxBytes);
    if (revision.trim()) config.revision = revision.trim();
    if (pooling.trim()) config.pooling = pooling.trim();
    if (binaryQuantized) config.binaryQuantized = true;

    if (requestTemplate.trim()) {
      try {
        config.request = JSON.parse(requestTemplate);
      } catch {
        // Keep as-is if invalid JSON
      }
    }
    if (responsePath.trim()) {
      try {
        config.response = JSON.parse(responsePath);
      } catch {
        // Keep as-is if invalid JSON
      }
    }

    onSubmit(name.trim(), config);
  };

  return (
    <div className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <Label className="text-sm">{t("embedder.embedderName")}</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={mode === "edit"}
          placeholder="default"
          className="text-sm"
        />
      </div>

      {/* Source type */}
      <div className="space-y-1.5">
        <Label className="text-sm">{t("embedder.sourceType")}</Label>
        <div className="grid grid-cols-5 gap-1.5">
          {SOURCES.map((s) => (
            <Button
              key={s.value}
              variant={source === s.value ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 text-xs",
                source === s.value && "shadow-sm"
              )}
              onClick={() => setSource(s.value)}
            >
              {t(s.labelKey)}
            </Button>
          ))}
        </div>
      </div>

      {/* Source-specific fields */}
      {source === "openAi" && (
        <div className="space-y-3 border-l-2 border-primary/20 pl-4">
          <div className="space-y-1.5">
            <Label className="text-sm">{t("embedder.fields.urlOptional")}</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.openai.com/v1/embeddings"
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">{t("embedder.fields.apiKey")}</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {t("embedder.fields.apiKeyHint")}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">{t("embedder.fields.model")}</Label>
            <DropdownMenu>
              <div className="relative">
                <Input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="text-embedding-3-small"
                  className="text-sm pr-8"
                />
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                  >
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
              </div>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                {OPENAI_MODELS.map((m) => (
                  <DropdownMenuItem
                    key={m}
                    onClick={() => setModel(m)}
                    className={cn("text-sm", model === m && "bg-accent")}
                  >
                    {m}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <p className="text-xs text-muted-foreground">
              {t("embedder.fields.modelHint")}
            </p>
          </div>
        </div>
      )}

      {source === "huggingFace" && (
        <div className="space-y-3 border-l-2 border-primary/20 pl-4">
          <div className="space-y-1.5">
            <Label className="text-sm">{t("embedder.fields.model")}</Label>
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="BAAI/bge-base-en-v1.5"
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">{t("embedder.fields.revision")}</Label>
            <Input
              value={revision}
              onChange={(e) => setRevision(e.target.value)}
              placeholder={t("embedder.fields.revisionHint")}
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">{t("embedder.fields.pooling")}</Label>
            <Select value={pooling} onValueChange={setPooling}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select pooling" />
              </SelectTrigger>
              <SelectContent>
                {POOLING_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p} className="text-sm">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {source === "ollama" && (
        <div className="space-y-3 border-l-2 border-primary/20 pl-4">
          <div className="space-y-1.5">
            <Label className="text-sm">
              {t("embedder.fields.url")} *
            </Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:11434/api/embeddings"
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">
              {t("embedder.fields.model")} *
            </Label>
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="nomic-embed-text"
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">{t("embedder.fields.apiKey")}</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`${t("common.optional")}`}
              className="text-sm"
            />
          </div>
        </div>
      )}

      {source === "rest" && (
        <div className="space-y-3 border-l-2 border-primary/20 pl-4">
          <div className="space-y-1.5">
            <Label className="text-sm">
              {t("embedder.fields.url")} *
            </Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/embeddings"
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">{t("embedder.fields.apiKey")}</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`${t("common.optional")}`}
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">
              {t("embedder.fields.requestTemplate")}
            </Label>
            <Textarea
              value={requestTemplate}
              onChange={(e) => setRequestTemplate(e.target.value)}
              placeholder={'{\n  "input": "{{text}}"\n}'}
              className="font-mono text-xs min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              {t("embedder.fields.requestTemplateHint")}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">
              {t("embedder.fields.responsePath")}
            </Label>
            <Textarea
              value={responsePath}
              onChange={(e) => setResponsePath(e.target.value)}
              placeholder={'{\n  "embedding": "data.0.embedding"\n}'}
              className="font-mono text-xs min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              {t("embedder.fields.responsePathHint")}
            </p>
          </div>
        </div>
      )}

      {source === "userProvided" && (
        <div className="border-l-2 border-primary/20 pl-4">
          <p className="text-sm text-muted-foreground">
            {t("embedder.fields.userProvidedInfo")}
          </p>
        </div>
      )}

      {/* Common settings */}
      <div className="border-t border-border pt-4 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-sm">{t("embedder.fields.dimensions")}</Label>
          <Input
            type="number"
            value={dimensions}
            onChange={(e) => setDimensions(e.target.value)}
            placeholder={t("embedder.fields.dimensionsHint")}
            className="text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">
            {t("embedder.fields.documentTemplate")}
          </Label>
          <Textarea
            value={documentTemplate}
            onChange={(e) => setDocumentTemplate(e.target.value)}
            placeholder={"A document titled '{{doc.title}}' whose description starts with {{doc.overview}}"}
            className="text-xs min-h-[60px]"
          />
          <p className="text-xs text-muted-foreground">
            {t("embedder.fields.documentTemplateHint")}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">
            {t("embedder.fields.documentTemplateMaxBytes")}
          </Label>
          <Input
            type="number"
            value={documentTemplateMaxBytes}
            onChange={(e) => setDocumentTemplateMaxBytes(e.target.value)}
            className="text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <Checkbox
            id="binary-quantized"
            checked={binaryQuantized}
            onCheckedChange={(v) => setBinaryQuantized(v === true)}
          />
          <div>
            <label
              htmlFor="binary-quantized"
              className="text-sm font-medium cursor-pointer"
            >
              {t("embedder.fields.binaryQuantized")}
            </label>
            <p className="text-xs text-destructive">
              {t("embedder.fields.binaryQuantizedWarning")}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button onClick={handleSubmit} disabled={!isValid() || isPending}>
          {isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
          {mode === "create" ? t("common.create") : t("common.save")}
        </Button>
      </div>
    </div>
  );
}
