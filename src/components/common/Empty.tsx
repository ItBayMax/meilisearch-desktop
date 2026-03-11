import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyProps {
  className?: string;
  text?: string;
  icon?: React.ReactNode;
}

export function Empty({ className, text, icon }: EmptyProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      {icon || <Inbox className="w-12 h-12 text-muted-foreground/50" />}
      <p className="mt-3 text-sm text-muted-foreground">
        {text || "No data"}
      </p>
    </div>
  );
}
