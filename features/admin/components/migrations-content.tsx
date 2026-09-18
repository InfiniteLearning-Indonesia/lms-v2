"use client";

import { ArrowRight, Boxes, Code2, Database, ExternalLink, Fence, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui-v3/page-header";
import type { AdminMigrationEvidenceKey, AdminMigrationsViewModel } from "../model";
import { DependencyNotice, formatAdminDate, JobStatusList, StatusBadge } from "./operations-shared";

const evidenceGroups: Array<{ id: "data" | "rehearsal" | "cutover"; keys: AdminMigrationEvidenceKey[] }> = [
  { id: "data", keys: ["preflight", "backup", "mapping", "reconciliation", "quarantine"] },
  { id: "rehearsal", keys: ["rehearsal", "recovery"] },
  { id: "cutover", keys: ["fence", "pilot", "wave", "approval"] },
];

export function AdminMigrationsContent({ initialData }: { initialData?: AdminMigrationsViewModel }) {
  const t = useTranslations("adminOperations");
  const stateLabels = {
    queued: t("states.queued"), running: t("states.running"), succeeded: t("states.succeeded"),
    partial: t("states.partial"), failed: t("states.failed"),
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t("eyebrow")} title={t("migrations.title")} description={t("migrations.description")} />
      {initialData === undefined ? <DependencyContent t={t} /> : (
        <>
          <DependencyNotice id="migration-control-plane" title={t("migrations.controlPlaneTitle")} description={t("migrations.controlPlaneBody")} tone="warning" />

          <div className="grid gap-4 lg:grid-cols-2">
            <section className={`rounded-xl border p-4 ${initialData.maintenance.state === "NORMAL" ? "bg-card" : "border-amber-500/30 bg-amber-500/5"}`} aria-labelledby="maintenance-title">
              <div className="flex gap-3">
                <Fence className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 id="maintenance-title" className="font-heading text-sm font-semibold">{t("migrations.maintenance")}</h2>
                    <StatusBadge state={initialData.maintenance.state} label={t(`states.${initialData.maintenance.state}`)} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{initialData.maintenance.detail}</p>
                </div>
              </div>
            </section>

            <section className="rounded-xl border bg-card p-4" aria-labelledby="ownership-title">
              <div className="flex gap-3">
                <ShieldAlert className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <h2 id="ownership-title" className="font-heading text-sm font-semibold">{t("migrations.ownership")}</h2>
                  <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                    <OwnershipDatum label={t("migrations.writer")} value={t(`writers.${initialData.ownership.writer}`)} />
                    <OwnershipDatum label={t("migrations.fence")} value={t(`fences.${initialData.ownership.fence}`)} />
                    <OwnershipDatum label={t("migrations.ownerEpoch")} value={initialData.ownership.ownerEpochLabel} mono />
                  </dl>
                </div>
              </div>
            </section>
          </div>

          {initialData.movedClass ? (
            <section className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4" aria-labelledby="class-moved-title">
              <div className="flex gap-3">
                <ExternalLink className="mt-0.5 size-5 shrink-0 text-blue-700 dark:text-blue-300" aria-hidden="true" />
                <div>
                  <h2 id="class-moved-title" className="font-heading text-sm font-semibold">{t("migrations.classMoved", { name: initialData.movedClass.className })}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{initialData.movedClass.detail}</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-800 dark:text-blue-200">{initialData.movedClass.targetLabel}<ArrowRight className="size-4" aria-hidden="true" /></p>
                </div>
              </div>
            </section>
          ) : null}

          <section aria-labelledby="readiness-title">
            <div className="mb-3"><h2 id="readiness-title" className="font-heading text-lg font-semibold">{t("migrations.readiness")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("migrations.readinessBody")}</p></div>
            <div className="grid gap-4 md:grid-cols-3">{initialData.readiness.map((item) => <ReadinessCard key={item.dimension} item={item} t={t} />)}</div>
          </section>

          <section className="rounded-xl border bg-card" aria-labelledby="migration-evidence-title">
            <div className="border-b p-4 sm:p-5"><h2 id="migration-evidence-title" className="font-heading text-lg font-semibold">{t("migrations.evidence")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("migrations.evidenceBody")}</p></div>
            <div className="grid gap-6 p-4 sm:p-5 xl:grid-cols-3">
              {evidenceGroups.map((group) => (
                <div key={group.id} className="min-w-0 space-y-3">
                  <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t(`evidenceGroups.${group.id}`)}</h3>
                  {group.keys.map((key) => {
                    const item = initialData.evidence[key];
                    return (
                      <article key={key} className="rounded-lg border bg-background p-3">
                        <div className="flex flex-wrap items-start justify-between gap-2"><h4 className="font-heading text-sm font-semibold">{t(`evidenceCategories.${key}`)}</h4><StatusBadge state={item.state} label={t(`states.${item.state}`)} /></div>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.summary}</p>
                        {item.evidenceLabel ? <p className="mt-2 break-all font-mono text-xs text-muted-foreground">{item.evidenceLabel}</p> : null}
                      </article>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border bg-card" aria-labelledby="migration-units-title">
            <div className="border-b p-4 sm:p-5"><h2 id="migration-units-title" className="font-heading text-lg font-semibold">{t("migrations.units")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("migrations.unitsBody")}</p></div>
            <div className="divide-y">
              {initialData.units.map((unit) => (
                <article key={unit.id} className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-5">
                  <div className="flex items-start gap-3"><Boxes className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" /><div><h3 className="font-heading text-sm font-semibold">{unit.label}</h3><p className="mt-1 text-sm text-muted-foreground">{unit.evidence}</p></div></div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end"><StatusBadge state={unit.stage === "QUARANTINED" ? "BLOCKED" : "EVIDENCE_PENDING"} label={t(`stages.${unit.stage}`)} /><span className="text-xs font-semibold text-muted-foreground">{t("migrations.unresolved", { count: unit.unresolvedCount })}</span></div>
                </article>
              ))}
            </div>
          </section>

          <JobStatusList jobs={initialData.jobs} title={t("jobs.migrationTitle")} description={t("jobs.migrationDescription")} stateLabels={stateLabels} />
          <p className="text-xs text-muted-foreground">{t("updatedAt", { date: formatAdminDate(initialData.updatedAt) })}</p>
        </>
      )}
    </div>
  );
}

function OwnershipDatum({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className={`mt-1 break-all font-semibold ${mono ? "font-mono text-xs" : ""}`}>{value}</dd></div>;
}

function ReadinessCard({ item, t }: { item: AdminMigrationsViewModel["readiness"][number]; t: ReturnType<typeof useTranslations<"adminOperations">> }) {
  const Icon = item.dimension === "CODE" ? Code2 : item.dimension === "DATA" ? Database : ShieldAlert;
  return <article className="rounded-xl border bg-card p-4"><div className="flex items-start justify-between gap-3"><span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" aria-hidden="true" /></span><StatusBadge state={item.state} label={t(`states.${item.state}`)} /></div><h3 className="mt-4 font-heading text-base font-semibold">{t(`dimensions.${item.dimension}`)}</h3><p className="mt-2 text-sm text-muted-foreground">{item.summary}</p><p className="mt-3 break-all rounded-lg bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">{item.evidenceLabel}</p></article>;
}

function DependencyContent({ t }: { t: ReturnType<typeof useTranslations<"adminOperations">> }) {
  return <section className="space-y-4"><DependencyNotice id="migrations-dependency" title={t("dependencyTitle")} description={t("dependencyBody")} /><div className="grid gap-4 md:grid-cols-3" aria-hidden="true">{[1, 2, 3].map((item) => <div key={item} className="h-40 rounded-xl border border-dashed bg-muted/30" />)}</div></section>;
}
