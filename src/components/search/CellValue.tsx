import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CellValueProps {
  value: unknown;
  maxLength?: number;
}

const IMAGE_URL_PATTERN = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;

function isImageUrl(val: unknown): boolean {
  if (typeof val !== "string") return false;
  return IMAGE_URL_PATTERN.test(val);
}

export function CellValue({ value, maxLength = 40 }: CellValueProps) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const rawStr =
    value === null || value === undefined
      ? ""
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);

  const displayStr =
    value === null || value === undefined
      ? "\u2014"
      : rawStr.length > maxLength
        ? rawStr.slice(0, maxLength) + "..."
        : rawStr;

  const isComplex = typeof value === "object" && value !== null;
  const isEmpty = value === null || value === undefined;
  const isImage = isImageUrl(value) && !imgError;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      isComplex ? JSON.stringify(value, null, 2) : rawStr
    );
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group/cell flex items-center gap-1 max-w-full">
      {isImage ? (
        <img
          src={rawStr}
          alt=""
          className="w-10 h-10 object-cover rounded flex-shrink-0"
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className={cn(
            "truncate block flex-1 min-w-0",
            isComplex && "text-primary/70",
            isEmpty && "text-muted-foreground"
          )}
        >
          {displayStr}
        </span>
      )}
      {!isEmpty && (
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover/cell:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-500" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      )}
    </div>
  );
}
