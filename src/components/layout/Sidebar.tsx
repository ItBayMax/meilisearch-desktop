import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Database,
  ChevronRight,
  Loader2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/useProjects";
import { getVersion } from "@tauri-apps/api/app";

interface SidebarProps {
  collapsed?: boolean;
}

const mainNavItems = [
  { path: "/", icon: LayoutDashboard, labelKey: "app.dashboard" },
  { path: "/projects", icon: Database, labelKey: "app.projects" },
  { path: "/settings", icon: Settings, labelKey: "app.settings" },
];

export function Sidebar({ collapsed }: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: projects, isLoading } = useProjects();
  const [version, setVersion] = useState("0.1.0");

  useEffect(() => {
    getVersion().then(setVersion).catch(() => {});
  }, []);

  const recentProjects = (projects || []).slice(0, 5);

  return (
    <aside
      className={cn(
        "h-full border-r border-border bg-background/50 flex flex-col transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo - draggable for macOS */}
      <div className="h-14 flex items-center px-4 border-b border-border" data-tauri-drag-region>
        <div className="flex items-center gap-2 pl-12" data-tauri-drag-region>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            MS
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-foreground">
              Meilisearch
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{t(item.labelKey)}</span>}
            </NavLink>
          );
        })}

        {/* Recent Projects */}
        {!collapsed && recentProjects.length > 0 && (
          <div className="pt-4 mt-3 border-t border-border">
            <p className="px-3 pb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {t("app.recentProjects")}
            </p>
            {recentProjects.map((project) => {
              const isActive = location.pathname.startsWith(
                `/projects/${project.id}`
              );
              return (
                <button
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors text-left",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      project.is_active
                        ? "bg-emerald-500"
                        : "bg-muted-foreground/30"
                    )}
                  />
                  <span className="truncate">{project.name}</span>
                  <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100" />
                </button>
              );
            })}
          </div>
        )}

        {!collapsed && isLoading && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {!collapsed && (
          <div className="text-xs text-muted-foreground text-center">
            v{version}
          </div>
        )}
      </div>
    </aside>
  );
}
