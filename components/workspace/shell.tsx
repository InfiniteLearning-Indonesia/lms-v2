"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Beaker, BookOpen, CalendarCheck, ClipboardCheck, FileBadge, GraduationCap, Home, Menu, NotebookPen, Search, Settings, Users, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useClassContext } from "@/features/workspace/context";
import { allowedClassNavigation, type ClassNavKey } from "@/features/workspace/navigation";
import { useActorSession } from "@/lib/auth/provider";

const icons: Record<ClassNavKey, typeof Home> = {
  overview: Home,
  learning: BookOpen,
  people: Users,
  submissions: ClipboardCheck,
  gradebook: GraduationCap,
  attendance: CalendarCheck,
  logbook: NotebookPen,
  credentials: FileBadge,
  settings: Settings,
};

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const { activeClass, classId } = useClassContext();
  const classItems = activeClass
    ? allowedClassNavigation(activeClass.capabilities).map((item) => ({ href: `/app/classes/${activeClass.id}${item.suffix}`, label: t(item.key), icon: icons[item.key], exact: item.suffix === "" }))
    : [];
  const items = classId ? classItems : [{ href: "/app", label: t("workspace"), icon: Home, exact: true }];

  return (
    <nav aria-label="Navigasi workspace" className="grid gap-1">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <Icon className="size-4" aria-hidden="true" />{label}
          </Link>
        );
      })}
    </nav>
  );
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("workspace");
  const { actor, previewMode } = useActorSession();
  const displayName = actor.display_name ?? t("actorFallback");
  const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-muted/20">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-background p-5 lg:block"><Brand /><WorkspaceContextControl id="class-search-desktop" /><Navigation /></aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger render={<Button variant="outline" size="icon" className="size-11 lg:hidden" aria-label={t("openNavigation")} />}><Menu className="size-4" /></SheetTrigger>
              <SheetContent side="left" className="w-72 p-5"><div className="mb-6"><Brand /></div><WorkspaceContextControl id="class-search-mobile" onNavigate={() => setOpen(false)} /><Navigation onNavigate={() => setOpen(false)} /></SheetContent>
            </Sheet>
            <div className="hidden text-sm text-muted-foreground sm:block">{t("contextual")}</div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link href="/app/profile" className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted" aria-label={t("openProfile", { name: displayName })}>
              <span className="hidden max-w-44 truncate text-sm text-muted-foreground sm:block">{displayName}</span>
              <span className="grid size-9 place-items-center rounded-full bg-primary font-heading text-sm font-semibold text-primary-foreground">{initials || "IL"}</span>
            </Link>
          </div>
        </header>
        {previewMode ? (
          <aside aria-label={t("previewTitle")} className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-amber-950 dark:text-amber-100 sm:px-6">
            <div className="mx-auto flex max-w-7xl items-start gap-2 text-xs leading-relaxed">
              <Beaker className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p><span className="font-semibold">{t("previewTitle")}</span> — {t("previewBody")}</p>
            </div>
          </aside>
        ) : null}
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function Brand() {
  return <Link href="/app" className="flex items-center gap-2" aria-label="Infinite Learning LMS"><span className="grid size-9 place-items-center rounded-xl bg-primary font-heading font-bold text-primary-foreground">IL</span><span className="font-heading text-sm font-semibold">Infinite Learning<span className="block text-xs font-normal text-muted-foreground">LMS v3</span></span></Link>;
}

function WorkspaceContextControl({ id, onNavigate }: { id: string; onNavigate?: () => void }) {
  const t = useTranslations("workspace");
  const { availableClasses, classId, classSearch, directoryAvailable, filteredClasses, setClassSearch } = useClassContext();

  if (classId) {
    return (
      <Link href="/app" onClick={onNavigate} className="my-8 flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("backToWorkspace")}
      </Link>
    );
  }

  return (
    <section className="my-8 rounded-xl border bg-muted/30 p-3" aria-labelledby={`${id}-label`}>
      <label id={`${id}-label`} htmlFor={id} className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("searchMyClasses")}</label>
      {directoryAvailable && availableClasses.length > 0 ? (
        <>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id={id}
              type="search"
              value={classSearch}
              onChange={(event) => setClassSearch(event.target.value)}
              placeholder={t("searchClassPlaceholder")}
              autoComplete="off"
              className="h-11 bg-background pl-9 pr-10"
              aria-describedby={`${id}-results`}
            />
            {classSearch ? (
              <button type="button" onClick={() => setClassSearch("")} aria-label={t("clearClassSearch")} className="absolute right-0 top-0 grid size-11 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
          <p id={`${id}-results`} aria-live="polite" className="mt-2 px-1 text-xs text-muted-foreground">
            {t("classSearchResults", { visible: filteredClasses.length, total: availableClasses.length })}
          </p>
        </>
      ) : (
        <p id={`${id}-results`} className="mt-2 px-1 text-xs leading-relaxed text-muted-foreground">
          {directoryAvailable ? t("noClass") : t("classDirectoryPending")}
        </p>
      )}
    </section>
  );
}
