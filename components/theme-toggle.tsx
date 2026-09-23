"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const t = useTranslations("common");
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative size-11 shrink-0 overflow-hidden rounded-lg hover:bg-muted"
      aria-label={t("toggleTheme")}
    >
      <Sun className="hidden size-[18px] text-brand-yellow dark:block" strokeWidth={2} aria-hidden="true" />
      <Moon className="size-[18px] text-brand-gray dark:hidden" strokeWidth={2} aria-hidden="true" />
    </Button>
  );
}
