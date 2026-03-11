import { useState, useRef, useCallback, useEffect, type ReactNode } from "react";
import { PanelLeftOpen, PanelLeftClose, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface SearchLayoutProps {
  sidebarContent: ReactNode;
  children: ReactNode;
}

const MIN_WIDTH = 300;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 400;
const COLLAPSED_WIDTH = 48; // 3rem

export function SearchLayout({ sidebarContent, children }: SearchLayoutProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isResizing.current = true;
      startX.current = e.clientX;
      startWidth.current = width;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [width]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = e.clientX - startX.current;
      const newWidth = Math.min(
        MAX_WIDTH,
        Math.max(MIN_WIDTH, startWidth.current + delta)
      );
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          "flex-shrink-0 border-r border-border bg-muted/30 relative transition-all duration-200",
          collapsed ? "overflow-hidden" : ""
        )}
        style={{ width: collapsed ? COLLAPSED_WIDTH : width }}
      >
        {collapsed ? (
          <div className="flex flex-col items-center py-3 gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCollapsed(false)}
            >
              <PanelLeftOpen className="w-4 h-4" />
            </Button>
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Search className="w-4 h-4" />
                {t("search.searchOptions")}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCollapsed(true)}
              >
                <PanelLeftClose className="w-4 h-4" />
              </Button>
            </div>

            {/* Sidebar content */}
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-4">{sidebarContent}</div>
            </ScrollArea>

            {/* Resize handle */}
            <div
              className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors z-10"
              onMouseDown={handleMouseDown}
            />
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
