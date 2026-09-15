"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Award,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  ClipboardCheck,
  FileCheck2,
  History,
  RotateCcw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui-v3/page-header";
import { EmptyState } from "@/components/ui-v3/states";
import { useClassContext } from "@/features/workspace/context";
import { cn } from "@/lib/utils";
import {
  activityCount,
  completedActivityCount,
  completionBelongsToClass,
  completionUiPolicy,
  formatCompletionDate,
  matchesLearnerCompletion,
  type ActivityCompletionState,
  type ClassCompletionViewModel,
  type CompletionEvidenceViewModel,
  type CompletionOutcome,
  type LearnerCompletionViewModel,
} from "../model";

const outcomeStyles: Record<CompletionOutcome, string> = {
  IN_PROGRESS: "border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-200",
  COMPLETED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  PASSED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  NOT_PASSED: "border-destructive/30 bg-destructive/10 text-destructive",
  WAIVED: "border-violet-500/30 bg-violet-500/10 text-violet-800 dark:text-violet-200",
  REOPENED: "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200",
};

const activityStyles: Record<ActivityCompletionState, string> = {
  NOT_STARTED: "border-border bg-muted text-muted-foreground",
  IN_PROGRESS: "border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-200",
  COMPLETED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  WAIVED: "border-violet-500/30 bg-violet-500/10 text-violet-800 dark:text-violet-200",
  REOPENED: "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200",
};

export function ProgressContent({ initialCompletion }: { initialCompletion?: ClassCompletionViewModel }) {
  const t = useTranslations("completion");
  const { activeClass } = useClassContext();
  if (!activeClass) return null;
  const policy = completionUiPolicy(activeClass.capabilities);

  if (!policy.canRead) return <EmptyState title={t("forbiddenTitle")} description={t("forbiddenBody")} />;
  if (initialCompletion && !completionBelongsToClass(initialCompletion, activeClass.id)) {
    return <EmptyState title={t("contextMismatchTitle")} description={t("contextMismatchBody")} />;
  }
  if (!initialCompletion) return <ProgressDependencyState />;
  if (initialCompletion.learnerProgress) {
    return <LearnerProgress model={initialCompletion} learner={initialCompletion.learnerProgress} />;
  }
  if (initialCompletion.teacherRoster) {
    return <TeacherProgress model={initialCompletion} learners={initialCompletion.teacherRoster} canManage={policy.canManageOutcome} />;
  }
  return <EmptyState title={t("projectionTitle")} description={t("projectionBody")} />;
}

function LearnerProgress({ model, learner }: { model: ClassCompletionViewModel; learner: LearnerCompletionViewModel }) {
  const t = useTranslations("completion");
  const { activeClass } = useClassContext();
  const credentialHref = activeClass?.capabilities?.includes("credentials.read") ? `/app/classes/${model.classId}/credentials` : undefined;
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        actions={credentialHref ? <Link href={credentialHref} className={cn(buttonVariants({ variant: "outline" }), "min-h-11")}><Award className="size-4" aria-hidden="true" />{t("openCredential")}</Link> : undefined}
      />
      <AuthorityNotice manage={false} />
      <ProgressSummary learner={learner} />
      {learner.correctedAt || learner.outcome === "REOPENED" ? <CorrectionNotice learner={learner} timeZone={model.timeZone} /> : null}
      <LearnerEvidenceSections learner={learner} timeZone={model.timeZone} />
    </div>
  );
}

function TeacherProgress({ model, learners, canManage }: { model: ClassCompletionViewModel; learners: LearnerCompletionViewModel[]; canManage: boolean }) {
  const t = useTranslations("completion");
  const [query, setQuery] = useState("");
  const [outcome, setOutcome] = useState<CompletionOutcome | "ALL">("ALL");
  const filtered = useMemo(() => learners.filter((learner) => matchesLearnerCompletion(learner, query, outcome)), [learners, outcome, query]);
  const [selectedId, setSelectedId] = useState<string | undefined>(learners[0]?.studentId);
  const selected = filtered.find((learner) => learner.studentId === selectedId) ?? filtered[0];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t("teacherEyebrow")} title={t("teacherTitle")} description={t("teacherDescription")} />
      <AuthorityNotice manage={canManage} />
      <section aria-label={t("teacherSummaryLabel")} className="grid divide-y overflow-hidden rounded-xl border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <SummaryItem label={t("studentsLabel")} value={learners.length} />
        <SummaryItem label={t("passedLabel")} value={learners.filter((item) => item.outcome === "PASSED").length} />
        <SummaryItem label={t("needsReviewLabel")} value={learners.filter((item) => item.outcome === "REOPENED" || item.outcome === "NOT_PASSED").length} last />
      </section>
      <section aria-label={t("filtersTitle")} className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="grid gap-2"><label htmlFor="completion-search" className="text-sm font-medium">{t("searchLabel")}</label><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input id="completion-search" type="search" className="h-11 pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchPlaceholder")} /></div></div>
        <div className="grid gap-2"><label htmlFor="completion-outcome" className="text-sm font-medium">{t("outcomeFilter")}</label><select id="completion-outcome" className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" value={outcome} onChange={(event) => setOutcome(event.target.value as CompletionOutcome | "ALL")}><option value="ALL">{t("allOutcomes")}</option>{(["IN_PROGRESS", "COMPLETED", "PASSED", "NOT_PASSED", "WAIVED", "REOPENED"] as const).map((value) => <option key={value} value={value}>{t(`outcomes.${value}`)}</option>)}</select></div>
        <p aria-live="polite" className="text-xs text-muted-foreground md:col-span-2">{t("results", { visible: filtered.length, total: learners.length })}</p>
      </section>
      {filtered.length === 0 ? <EmptyState title={t("noResultsTitle")} description={t("noResultsBody")} /> : (
        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(17rem,0.75fr)_minmax(0,1.6fr)]">
          <aside className="min-w-0 self-start overflow-hidden rounded-xl border bg-card" aria-labelledby="completion-student-list"><div className="border-b p-4"><h2 id="completion-student-list" className="font-heading font-semibold">{t("studentListTitle")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("studentListBody")}</p></div><div className="grid gap-2 p-3">{filtered.map((learner) => <button key={learner.studentId} type="button" onClick={() => setSelectedId(learner.studentId)} aria-current={selected?.studentId === learner.studentId ? "true" : undefined} className="min-h-16 w-full rounded-lg border border-transparent bg-muted/30 p-3 text-left transition-colors hover:border-border hover:bg-muted aria-current:border-primary/40 aria-current:bg-primary/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"><span className="flex items-start justify-between gap-3"><span className="min-w-0"><span className="block truncate font-heading text-sm font-semibold">{learner.studentName}</span><span className="mt-1 block text-xs text-muted-foreground">{t("studentProgress", { percent: learner.progressPercent })}</span></span><OutcomeBadge outcome={learner.outcome} /></span></button>)}</div></aside>
          {selected ? <TeacherLearnerDetail key={selected.studentId} learner={selected} timeZone={model.timeZone} canManage={canManage} /> : null}
        </div>
      )}
    </div>
  );
}

function TeacherLearnerDetail({ learner, timeZone, canManage }: { learner: LearnerCompletionViewModel; timeZone: string; canManage: boolean }) {
  const t = useTranslations("completion");
  return <article className="min-w-0 overflow-hidden rounded-xl border bg-card" aria-labelledby={`completion-${learner.studentId}`}><header className="border-b p-5 sm:p-6"><div className="flex flex-wrap items-center gap-2"><OutcomeBadge outcome={learner.outcome} /><Badge variant="outline">{t("policyVersion", { version: learner.policyVersion })}</Badge><Badge variant="outline">{t("outcomeVersion", { version: learner.outcomeVersion })}</Badge></div><h2 id={`completion-${learner.studentId}`} className="mt-4 font-heading text-xl font-semibold">{learner.studentName}</h2><p className="mt-1 text-sm text-muted-foreground">{learner.outcomeReason ?? t("noOutcomeReason")}</p></header><div className="space-y-6 p-5 sm:p-6"><ProgressSummary learner={learner} compact />{learner.correctedAt || learner.outcome === "REOPENED" ? <CorrectionNotice learner={learner} timeZone={timeZone} /> : null}<LearnerEvidenceSections learner={learner} timeZone={timeZone} compact /><section aria-labelledby="completion-controls" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"><h3 id="completion-controls" className="font-heading font-semibold">{t("controlsTitle")}</h3><p id="completion-command-pending" className="mt-1 text-sm leading-6 text-muted-foreground">{canManage ? t("controlsPendingBody") : t("controlsReadOnlyBody")}</p><div className="mt-4 flex flex-col gap-2 sm:flex-row"><Button type="button" variant="outline" className="min-h-11" disabled aria-describedby="completion-command-pending"><ClipboardCheck className="size-4" aria-hidden="true" />{t("overrideAction")}</Button><Button type="button" variant="outline" className="min-h-11" disabled aria-describedby="completion-command-pending"><RotateCcw className="size-4" aria-hidden="true" />{t("reopenAction")}</Button></div></section></div></article>;
}

function ProgressSummary({ learner, compact = false }: { learner: LearnerCompletionViewModel; compact?: boolean }) {
  const t = useTranslations("completion");
  const completed = completedActivityCount(learner);
  const total = activityCount(learner);
  return <section aria-label={t("summaryLabel")} className={compact ? "space-y-4" : "grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(14rem,0.6fr)]"}><div className="rounded-xl border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-medium text-muted-foreground">{t("classProgress")}</p><p className="mt-1 font-heading text-2xl font-semibold">{t("percentComplete", { percent: learner.progressPercent })}</p></div><OutcomeBadge outcome={learner.outcome} /></div><div role="progressbar" aria-label={t("classProgress")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={learner.progressPercent} className="mt-5 h-2.5 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{ width: `${learner.progressPercent}%` }} /></div><p className="mt-3 text-xs text-muted-foreground">{t("progressAuthoritative")}</p></div><div className="grid divide-y overflow-hidden rounded-xl border bg-card sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-1 lg:divide-x-0 lg:divide-y"><SummaryItem label={t("activitiesComplete")} value={`${completed}/${total}`} /><SummaryItem label={t("evidenceSatisfied")} value={`${learner.satisfiedEvidence}/${learner.requiredEvidence}`} last /></div></section>;
}

function LearnerEvidenceSections({ learner, timeZone, compact = false }: { learner: LearnerCompletionViewModel; timeZone: string; compact?: boolean }) {
  const t = useTranslations("completion");
  return <section aria-labelledby={compact ? `evidence-${learner.studentId}` : "evidence-title"} className="space-y-4"><div><h2 id={compact ? `evidence-${learner.studentId}` : "evidence-title"} className="font-heading text-lg font-semibold">{t("evidenceTitle")}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("evidenceBody")}</p></div>{learner.sections.map((section) => <article key={section.sectionId} className="overflow-hidden rounded-xl border bg-card"><header className="border-b bg-muted/20 px-4 py-3 sm:px-5"><h3 className="font-heading font-semibold">{section.title}</h3><p className="mt-1 text-xs text-muted-foreground">{t("activityCount", { count: section.activities.length })}</p></header><ul className="divide-y">{section.activities.map((activity) => <li key={activity.activityId} className="p-4 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="font-heading font-semibold">{activity.title}</p>{activity.reason ? <p className="mt-1 text-sm leading-5 text-muted-foreground">{activity.reason}</p> : null}{activity.completedAt ? <p className="mt-2 text-xs text-muted-foreground">{t("recordedAt", { date: formatCompletionDate(activity.completedAt, timeZone) })}</p> : null}</div><Badge variant="outline" className={cn("shrink-0", activityStyles[activity.state])}>{t(`activityStates.${activity.state}`)}</Badge></div><ul className="mt-4 grid gap-2" aria-label={t("activityEvidence", { title: activity.title })}>{activity.evidences.map((evidence) => <EvidenceItem key={evidence.id} evidence={evidence} timeZone={timeZone} />)}</ul></li>)}</ul></article>)}</section>;
}

function EvidenceItem({ evidence, timeZone }: { evidence: CompletionEvidenceViewModel; timeZone: string }) {
  const t = useTranslations("completion");
  const Icon = evidence.state === "SATISFIED" ? CheckCircle2 : evidence.state === "MISSING" ? CircleAlert : evidence.state === "WAIVED" ? FileCheck2 : CircleDashed;
  return <li className="flex items-start gap-3 rounded-lg border bg-background p-3"><Icon className={cn("mt-0.5 size-4 shrink-0", evidence.state === "SATISFIED" ? "text-emerald-600" : evidence.state === "MISSING" ? "text-amber-600" : "text-primary")} aria-hidden="true" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><span className="text-sm font-semibold">{evidence.label}</span><Badge variant="outline">{t(`evidenceStates.${evidence.state}`)}</Badge></div>{evidence.description ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{evidence.description}</p> : null}{evidence.provenanceLabel || evidence.recordedAt ? <p className="mt-2 text-xs text-muted-foreground">{[evidence.provenanceLabel, evidence.recordedAt ? formatCompletionDate(evidence.recordedAt, timeZone) : undefined].filter(Boolean).join(" · ")}</p> : null}</div></li>;
}

function CorrectionNotice({ learner, timeZone }: { learner: LearnerCompletionViewModel; timeZone: string }) {
  const t = useTranslations("completion");
  return <aside className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"><History className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" /><div><h2 className="font-heading text-sm font-semibold">{t("correctionTitle")}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{learner.outcomeReason ?? t("correctionBody")}</p>{learner.correctedAt ? <p className="mt-2 text-xs text-muted-foreground">{t("correctedAt", { date: formatCompletionDate(learner.correctedAt, timeZone) })}</p> : null}</div></aside>;
}

function AuthorityNotice({ manage }: { manage: boolean }) {
  const t = useTranslations("completion");
  return <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" /><p><span className="font-semibold text-foreground">{t("authorityTitle")}.</span> {manage ? t("authorityManageBody") : t("authorityLearnerBody")}</p></div>;
}

function OutcomeBadge({ outcome }: { outcome: CompletionOutcome }) {
  const t = useTranslations("completion");
  return <Badge variant="outline" className={outcomeStyles[outcome]}>{t(`outcomes.${outcome}`)}</Badge>;
}

function SummaryItem({ label, value }: { label: string; value: string | number; last?: boolean }) {
  return <div className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-heading text-xl font-semibold">{value}</p></div>;
}

function ProgressDependencyState() {
  const t = useTranslations("completion");
  return <div className="space-y-6"><PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} /><section role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5"><div className="flex items-start gap-3"><CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" /><div><h2 className="font-heading font-semibold">{t("dependencyTitle")}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("dependencyBody")}</p></div></div></section><div className="grid gap-3 md:grid-cols-3"><DependencyCard icon={FileCheck2} title={t("dependencyEvidenceTitle")} body={t("dependencyEvidenceBody")} /><DependencyCard icon={ClipboardCheck} title={t("dependencyPolicyTitle")} body={t("dependencyPolicyBody")} /><DependencyCard icon={History} title={t("dependencyCorrectionTitle")} body={t("dependencyCorrectionBody")} /></div></div>;
}

function DependencyCard({ icon: Icon, title, body }: { icon: typeof FileCheck2; title: string; body: string }) {
  return <article className="rounded-xl border bg-card p-4"><Icon className="size-5 text-primary" aria-hidden="true" /><h2 className="mt-3 font-heading text-sm font-semibold">{title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p></article>;
}
