import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, Monitor, Globe, Info, Github, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { openUrl } from "@tauri-apps/plugin-opener";
import { getVersion } from "@tauri-apps/api/app";

const GITHUB_URL = "https://github.com/ItBayMax/meilisearch-desktop";

export default function AppSettings() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [version, setVersion] = useState("0.1.0");

  useEffect(() => {
    getVersion().then(setVersion).catch(() => {});
  }, []);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">{t("app.settings")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("settings.appPreferences")}
        </p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.theme")}</CardTitle>
          <CardDescription>{t("settings.chooseAppearance")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <ThemeCard
              icon={Sun}
              label={t("settings.light")}
              active={theme === "light"}
              onClick={() => setTheme("light")}
            />
            <ThemeCard
              icon={Moon}
              label={t("settings.dark")}
              active={theme === "dark"}
              onClick={() => setTheme("dark")}
            />
            <ThemeCard
              icon={Monitor}
              label={t("settings.system")}
              active={theme === "system"}
              onClick={() => setTheme("system")}
            />
          </div>
          {theme === "system" && (
            <p className="text-xs text-muted-foreground">
              {t("settings.currentTheme", { theme: resolvedTheme === "dark" ? t("settings.dark") : t("settings.light") })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.language")}</CardTitle>
          <CardDescription>{t("settings.selectLanguage")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <Select value={i18n.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4" />
            {t("settings.about")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Meilisearch Desktop</Label>
            <Badge variant="secondary">v{version}</Badge>
          </div>
          <Separator />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>{t("settings.appDescription")}</p>
            <p>{t("settings.builtWith")}</p>
          </div>
          <Separator />
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => openUrl(GITHUB_URL)}
          >
            <Github className="w-4 h-4 mr-2" />
            GitHub
            <ExternalLink className="w-3 h-3 ml-auto" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ThemeCard({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Sun;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      className="h-auto flex flex-col items-center gap-2 py-4"
      onClick={onClick}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs">{label}</span>
    </Button>
  );
}
