"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { BookOpen, ChevronDown, ClipboardCheck, Home, Menu, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { demoClasses } from "@/features/workspace/types";

const nav = [
  { href: "/app", labelKey: "overview" as const, icon: Home },
  { href: "/app/classes/class-demo/learning", labelKey: "learning" as const, icon: BookOpen },
  { href: "/app/classes/class-demo/people", labelKey: "people" as const, icon: Users },
  { href: "/app/classes/class-demo/submissions", labelKey: "submissions" as const, icon: ClipboardCheck },
];

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  return <nav aria-label="Navigasi workspace" className="grid gap-1">{nav.map(({ href, labelKey, icon: Icon }) => { const active = pathname === href || pathname.startsWith(`${href}/`); return <Link key={href} href={href} onClick={onNavigate} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><Icon className="size-4" aria-hidden="true" />{t(labelKey)}</Link>; })}</nav>;
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("workspace");
  return <div className="min-h-screen bg-muted/20"><aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-background p-5 lg:block"><Brand /><ClassSwitcher /><Navigation /></aside><div className="lg:pl-64"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur sm:px-6"><div className="flex items-center gap-3"><Sheet open={open} onOpenChange={setOpen}><SheetTrigger><Button variant="outline" size="icon" className="lg:hidden" aria-label="Buka navigasi"><Menu className="size-4" /></Button></SheetTrigger><SheetContent side="left" className="w-72"><div className="mb-6"><Brand /></div><ClassSwitcher /><Navigation onNavigate={() => setOpen(false)} /></SheetContent></Sheet><div className="hidden text-sm text-muted-foreground sm:block">{t("contextual")}</div></div><div className="flex items-center gap-3"><span className="hidden text-sm text-muted-foreground sm:block">Pengguna LMS</span><span className="grid size-9 place-items-center rounded-full bg-primary font-heading text-sm font-semibold text-primary-foreground">PL</span></div></header><main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main></div></div>;
}

function Brand() { return <Link href="/app" className="flex items-center gap-2" aria-label="Infinite Learning LMS"><span className="grid size-9 place-items-center rounded-xl bg-primary font-heading font-bold text-primary-foreground">IL</span><span className="font-heading text-sm font-semibold">Infinite Learning<span className="block text-xs font-normal text-muted-foreground">LMS v3</span></span></Link>; }
function ClassSwitcher() { const current = demoClasses[0]; const t = useTranslations("workspace"); return <div className="my-8 rounded-xl border bg-muted/30 p-3"><p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("chooseClass")}</p><button className="mt-2 flex w-full items-center justify-between gap-2 text-left" type="button"><span className="min-w-0"><span className="block truncate text-sm font-semibold">{current.name}</span><span className="block truncate text-xs text-muted-foreground">{current.program_label}</span></span><ChevronDown className="size-4 shrink-0 text-muted-foreground" /></button></div>; }
