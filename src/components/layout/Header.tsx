import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, Monitor, Globe } from "lucide-react";

export function Header() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "zh" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  const cycleTheme = () => {
    const themes: Array<"dark" | "light" | "system"> = ["dark", "light", "system"];
    const currentIdx = themes.indexOf(theme);
    setTheme(themes[(currentIdx + 1) % themes.length]);
  };

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <header 
      className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm"
      data-tauri-drag-region
    >
      {/* Left padding for macOS traffic lights */}
      <div className="flex items-center gap-2" data-tauri-drag-region>
        <h1 className="text-lg font-semibold text-foreground" data-tauri-drag-region>
          {t("app.title")}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleLanguage}
          className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title={t("settings.language")}
        >
          <Globe className="w-4 h-4" />
          <span className="ml-1 text-xs">{i18n.language === "en" ? "EN" : "\u4e2d"}</span>
        </button>
        <button
          onClick={cycleTheme}
          className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title={t("settings.theme")}
        >
          <ThemeIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
