"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, LockKeyhole, Search } from "lucide-react";
import { PageHeader } from "@/components/ui-v3/page-header";
import { EmptyState } from "@/components/ui-v3/states";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { AdminAuditViewModel } from "../model";
import { DependencyNotice, formatAdminDate, StatusBadge } from "./operations-shared";

type OutcomeFilter = "ALL" | AdminAuditViewModel["events"][number]["outcome"];

export function AdminAuditContent({ initialData }: { initialData?: AdminAuditViewModel }) {
  const t = useTranslations("adminOperations");
  const [query, setQuery] = useState("");
  const [outcome, setOutcome] = useState<OutcomeFilter>("ALL");
  const events = useMemo(() => initialData?.events.filter((event) => {
    const normalized = query.trim().toLocaleLowerCase("id");
    return (!normalized || [event.actorLabel, event.action, event.resource, event.requestId].some((value) => value.toLocaleLowerCase("id").includes(normalized))) && (outcome === "ALL" || event.outcome === outcome);
  }) ?? [], [initialData, outcome, query]);

  return <div className="space-y-6"><PageHeader eyebrow={t("eyebrow")} title={t("audit.title")} description={t("audit.description")} />{initialData === undefined ? <DependencyContent t={t} /> : <><DependencyNotice id="audit-immutable" title={t("audit.immutableTitle")} description={t("audit.immutableBody")} /><section className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_14rem]" aria-label={t("audit.filters")}><div className="grid gap-2"><label htmlFor="audit-search" className="text-sm font-medium">{t("audit.search")}</label><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input id="audit-search" type="search" className="h-11 pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("audit.searchPlaceholder")} /></div></div><div className="grid gap-2"><label htmlFor="audit-outcome" className="text-sm font-medium">{t("audit.outcome")}</label><select id="audit-outcome" className="h-11 rounded-lg border border-input bg-background px-3 text-sm" value={outcome} onChange={(event) => setOutcome(event.target.value as OutcomeFilter)}><option value="ALL">{t("all")}</option><option value="SUCCESS">{t("states.SUCCESS")}</option><option value="DENIED">{t("states.DENIED")}</option><option value="FAILED">{t("states.FAILED")}</option></select></div><p aria-live="polite" className="text-xs text-muted-foreground sm:col-span-2">{t("audit.results", { visible: events.length, total: initialData.events.length })}</p></section>{events.length === 0 ? <EmptyState title={t("audit.noResults")} description={t("audit.noResultsBody")} /> : <AuditTable events={events} t={t} />}<div className="flex flex-col gap-3 rounded-xl border border-dashed p-4 text-sm sm:flex-row sm:items-center sm:justify-between"><p className="text-muted-foreground">{initialData.nextCursor ? t("audit.moreAvailable") : t("audit.end")}</p><Button variant="outline" className="h-11" disabled>{t("audit.loadMore")}</Button></div><p className="text-xs text-muted-foreground">{t("updatedAt", { date: formatAdminDate(initialData.updatedAt) })}</p></>}</div>;
}

function AuditTable({ events, t }: { events: AdminAuditViewModel["events"]; t: ReturnType<typeof useTranslations<"adminOperations">> }) {
  return <div className="overflow-hidden rounded-xl border bg-card"><table className="block w-full lg:table"><caption className="sr-only">{t("audit.title")}</caption><thead className="hidden border-b bg-muted/40 lg:table-header-group"><tr><Header>{t("audit.time")}</Header><Header>{t("audit.actorAction")}</Header><Header>{t("audit.resource")}</Header><Header>{t("audit.outcome")}</Header><Header alignRight>{t("audit.detail")}</Header></tr></thead><tbody className="block divide-y lg:table-row-group">{events.map((event) => <tr key={event.id} className="grid gap-3 p-4 lg:table-row lg:p-0"><td className="text-xs tabular-nums text-muted-foreground lg:table-cell lg:px-4 lg:py-4">{formatAdminDate(event.occurredAt)}</td><td className="lg:table-cell lg:px-4 lg:py-4"><p className="font-heading text-sm font-semibold">{event.action}</p><p className="mt-1 text-xs text-muted-foreground">{event.actorLabel}</p></td><td className="break-all text-sm text-muted-foreground lg:table-cell lg:px-4 lg:py-4">{event.resource}</td><td className="lg:table-cell lg:px-4 lg:py-4"><StatusBadge state={event.outcome} label={t(`states.${event.outcome}`)} /></td><td className="lg:table-cell lg:px-4 lg:py-4 lg:text-right"><AuditDetail event={event} t={t} /></td></tr>)}</tbody></table></div>;
}

function AuditDetail({ event, t }: { event: AdminAuditViewModel["events"][number]; t: ReturnType<typeof useTranslations<"adminOperations">> }) { return <Dialog><DialogTrigger render={<Button variant="ghost" className="h-11" />}><Eye className="size-4" aria-hidden="true" />{t("audit.view")}</DialogTrigger><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>{event.action}</DialogTitle><DialogDescription>{event.summary}</DialogDescription></DialogHeader><dl className="grid gap-3 rounded-xl border bg-muted/20 p-4 text-sm sm:grid-cols-2"><KeyValue label={t("audit.requestId")} value={event.requestId} /><KeyValue label={t("audit.correlationId")} value={event.correlationId ?? t("notAvailable")} /><KeyValue label={t("audit.resource")} value={event.resource} /><KeyValue label={t("audit.redacted")} value={t("audit.redactedCount", { count: event.redactedFields })} /></dl><div className="flex gap-3 rounded-xl border p-4"><LockKeyhole className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" /><p className="text-sm text-muted-foreground">{t("audit.readOnlyDetail")}</p></div></DialogContent></Dialog>; }

function KeyValue({ label, value }: { label: string; value: string }) { return <div className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-all font-medium">{value}</dd></div>; }
function Header({ children, alignRight = false }: { children: React.ReactNode; alignRight?: boolean }) { return <th scope="col" className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${alignRight ? "text-right" : "text-left"}`}>{children}</th>; }
function DependencyContent({ t }: { t: ReturnType<typeof useTranslations<"adminOperations">> }) { return <section className="space-y-4"><DependencyNotice id="audit-dependency" title={t("dependencyTitle")} description={t("dependencyBody")} /><div className="rounded-xl border border-dashed bg-muted/20 p-5" aria-hidden="true"><div className="h-12 rounded-lg bg-muted" /><div className="mt-4 h-52 rounded-lg bg-muted/60" /></div></section>; }
