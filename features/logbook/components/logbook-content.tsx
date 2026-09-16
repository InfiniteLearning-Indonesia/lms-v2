"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { BookOpenText, CircleAlert, History, Search, UserRoundCheck, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui-v3/page-header";
import { EmptyState } from "@/components/ui-v3/states";
import { useClassContext } from "@/features/workspace/context";
import {
  formatLogbookDate,
  logbookBelongsToClass,
  logbookUiPolicy,
  matchesLogbookReview,
  type ClassLogbookViewModel,
  type LogbookEntryState,
  type LogbookEntryViewModel,
  type LogbookPeriodViewModel,
  type MentorAssignmentViewModel,
} from "../model";

const stateStyles: Record<LogbookEntryState, string> = {
  DRAFT: "border-border bg-muted text-muted-foreground",
  SUBMITTED: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  REVISION_REQUIRED: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  ACCEPTED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

export function LogbookContent({ initialLogbook }: { initialLogbook?: ClassLogbookViewModel }) {
  const t = useTranslations("logbook");
  const { activeClass } = useClassContext();
  const policy = logbookUiPolicy(activeClass?.capabilities);
  const matchesClass = !initialLogbook || logbookBelongsToClass(initialLogbook, activeClass?.id);

  if (!activeClass) return null;
  if (!policy.canRead) return <EmptyState title={t("forbiddenTitle")} description={t("forbiddenBody")} />;
  if (!matchesClass) return <EmptyState title={t("contextMismatchTitle")} description={t("contextMismatchBody")} />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description", { className: activeClass.name })} />
      {!initialLogbook ? <LogbookDependency /> : initialLogbook.reviewer ? (
        <ReviewerLogbook model={initialLogbook} />
      ) : initialLogbook.learner ? (
        <LearnerLogbook model={initialLogbook} />
      ) : (
        <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />
      )}
    </div>
  );
}

function LogbookDependency() {
  const t = useTranslations("logbook");
  return (
    <section className="grid gap-4" aria-labelledby="logbook-dependency-title">
      <div role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
        <div className="flex items-start gap-3"><CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-300" aria-hidden="true" /><div><h2 id="logbook-dependency-title" className="font-heading font-semibold">{t("dependencyTitle")}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("dependencyBody")}</p></div></div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {[[BookOpenText, t("dependencyPeriodTitle"), t("dependencyPeriodBody")], [History, t("dependencyRevisionTitle"), t("dependencyRevisionBody")], [UsersRound, t("dependencyMentorTitle"), t("dependencyMentorBody")]].map(([Icon, title, body]) => (
          <article key={title as string} className="rounded-xl border bg-card p-5"><Icon className="size-5 text-primary" aria-hidden="true" /><h3 className="mt-3 font-heading text-sm font-semibold">{title as string}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{body as string}</p></article>
        ))}
      </div>
    </section>
  );
}

function LearnerLogbook({ model }: { model: ClassLogbookViewModel }) {
  const t = useTranslations("logbook");
  const { activeClass } = useClassContext();
  const policy = logbookUiPolicy(activeClass?.capabilities);
  const learner = model.learner!;
  const initialPeriodId = model.periods.find((period) => period.state === "OPEN")?.id ?? model.periods[0]?.id ?? "";
  const [periodId, setPeriodId] = useState(initialPeriodId);
  const period = model.periods.find((item) => item.id === periodId);
  const entry = learner.entries.find((item) => item.periodId === periodId);

  return (
    <div className="space-y-6">
      <AuthorityNotice body={t("learnerAuthorityBody")} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
        <section className="rounded-xl border bg-card" aria-labelledby="entry-title">
          <div className="grid gap-4 border-b p-5 md:grid-cols-[minmax(0,1fr)_minmax(14rem,0.42fr)] md:items-end"><div><h2 id="entry-title" className="font-heading font-semibold">{t("myEntryTitle")}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("myEntryBody")}</p></div><div className="grid gap-2"><label htmlFor="logbook-period" className="text-sm font-medium">{t("periodLabel")}</label><select id="logbook-period" value={periodId} onChange={(event) => setPeriodId(event.target.value)} className="h-11 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{model.periods.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div></div>
          {period ? <LearnerEditor key={period.id} period={period} entry={entry} timeZone={model.timeZone} canWrite={policy.canWrite} /> : <div className="p-5"><EmptyState title={t("periodEmptyTitle")} description={t("periodEmptyBody")} /></div>}
        </section>
        {policy.canReadMentoring ? <MentorContext history={learner.mentorHistory} groupLabel={learner.group ? `${learner.group.name} · ${t("members", { count: learner.group.memberCount })}` : undefined} timeZone={model.timeZone} /> : null}
      </div>
    </div>
  );
}

function LearnerEditor({ period, entry, timeZone, canWrite }: { period: LogbookPeriodViewModel; entry?: LogbookEntryViewModel; timeZone: string; canWrite: boolean }) {
  const t = useTranslations("logbook");
  const [summary, setSummary] = useState(entry?.activitySummary ?? "");
  const [reflection, setReflection] = useState(entry?.reflection ?? "");
  const dirty = summary !== (entry?.activitySummary ?? "") || reflection !== (entry?.reflection ?? "");
  const pendingId = "logbook-command-pending";
  return (
    <form className="grid gap-5 p-5" onSubmit={(event) => event.preventDefault()} noValidate>
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-heading text-lg font-semibold">{period.label}</h3><p className="mt-1 text-xs text-muted-foreground">{t("dueAt", { date: formatLogbookDate(period.dueAt, timeZone) })}</p></div><div className="flex gap-2"><Badge variant="outline">{t(`periodStates.${period.state}`)}</Badge>{entry ? <Badge variant="outline" className={stateStyles[entry.state]}>{t(`entryStates.${entry.state}`)}</Badge> : null}</div></div>
      {entry?.feedback ? <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4"><p className="text-sm font-semibold">{t("feedbackTitle")}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{entry.feedback}</p></div> : null}
      {canWrite && period.state === "OPEN" ? <p id={pendingId} role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-5 text-muted-foreground">{t("entryCommandPending")}</p> : null}
      <div className="grid gap-2"><label htmlFor={`summary-${period.id}`} className="text-sm font-medium">{t("summaryLabel")}</label><Textarea id={`summary-${period.id}`} rows={6} value={summary} onChange={(event) => setSummary(event.target.value)} readOnly={!canWrite || period.state !== "OPEN"} aria-describedby={canWrite && period.state === "OPEN" ? pendingId : undefined} /></div>
      <div className="grid gap-2"><label htmlFor={`reflection-${period.id}`} className="text-sm font-medium">{t("reflectionLabel")}</label><Textarea id={`reflection-${period.id}`} rows={6} value={reflection} onChange={(event) => setReflection(event.target.value)} readOnly={!canWrite || period.state !== "OPEN"} aria-describedby={canWrite && period.state === "OPEN" ? pendingId : undefined} /></div>
      {dirty ? <p role="status" className="text-sm font-semibold text-primary">{t("localChanges")}</p> : null}
      {canWrite && period.state === "OPEN" ? <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" className="min-h-11" disabled aria-describedby={pendingId}>{t("saveDraft")}</Button><Button type="submit" className="min-h-11" disabled aria-describedby={pendingId}>{t(entry?.state === "REVISION_REQUIRED" ? "resubmitEntry" : "submitEntry")}</Button></div> : null}
    </form>
  );
}

function ReviewerLogbook({ model }: { model: ClassLogbookViewModel }) {
  const t = useTranslations("logbook");
  const { activeClass } = useClassContext();
  const policy = logbookUiPolicy(activeClass?.capabilities);
  const reviewer = model.reviewer!;
  const [query, setQuery] = useState("");
  const [state, setState] = useState<LogbookEntryState | "ALL">("ALL");
  const visible = useMemo(() => reviewer.reviewInbox.filter((review) => matchesLogbookReview(review, query, state)), [reviewer.reviewInbox, query, state]);
  const [selectedId, setSelectedId] = useState(reviewer.reviewInbox[0]?.id ?? "");
  const selected = visible.find((item) => item.id === selectedId) ?? visible[0];

  return (
    <div className="space-y-6">
      <AuthorityNotice body={t("reviewerAuthorityBody")} />
      <section className="rounded-xl border bg-card" aria-labelledby="review-inbox-title">
        <div className="border-b p-5"><h2 id="review-inbox-title" className="font-heading font-semibold">{t("reviewInboxTitle")}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("reviewInboxBody")}</p><div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]"><div className="relative"><Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" aria-hidden="true" /><Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 pl-9" aria-label={t("searchLabel")} placeholder={t("searchPlaceholder")} /></div><select value={state} onChange={(event) => setState(event.target.value as LogbookEntryState | "ALL")} className="h-11 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50" aria-label={t("stateFilter")}><option value="ALL">{t("allStates")}</option>{(["DRAFT", "SUBMITTED", "REVISION_REQUIRED", "ACCEPTED"] as const).map((item) => <option key={item} value={item}>{t(`entryStates.${item}`)}</option>)}</select></div></div>
        {visible.length === 0 ? <div className="p-5"><EmptyState title={t("reviewEmptyTitle")} description={t("reviewEmptyBody")} /></div> : <div className="grid lg:grid-cols-[minmax(16rem,0.42fr)_minmax(0,1fr)]"><ol className="border-b lg:border-b-0 lg:border-r">{visible.map((item) => <li key={item.id}><button type="button" onClick={() => setSelectedId(item.id)} aria-pressed={selected?.id === item.id} className={`min-h-16 w-full border-b p-4 text-left transition-colors last:border-b-0 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50 ${selected?.id === item.id ? "bg-primary/10" : "hover:bg-muted/60"}`}><span className="block font-heading text-sm font-semibold">{item.studentName}</span><span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span>{t("revision", { revision: item.revision })}</span><Badge variant="outline" className={stateStyles[item.state]}>{t(`entryStates.${item.state}`)}</Badge></span></button></li>)}</ol>{selected ? <ReviewDetail review={selected} canReview={policy.canReview} timeZone={model.timeZone} /> : null}</div>}
      </section>
      {policy.canReadMentoring ? <MentorContext history={reviewer.mentorHistory} groupLabel={reviewer.groups.map((group) => `${group.name} · ${t("members", { count: group.memberCount })}`).join(" · ")} timeZone={model.timeZone} /> : null}
    </div>
  );
}

function ReviewDetail({ review, canReview, timeZone }: { review: NonNullable<ClassLogbookViewModel["reviewer"]>["reviewInbox"][number]; canReview: boolean; timeZone: string }) {
  const t = useTranslations("logbook");
  const pendingId = "logbook-review-pending";
  return <article className="grid min-w-0 gap-5 p-5"><div><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-heading text-lg font-semibold">{review.studentName}</h3><Badge variant="outline" className={stateStyles[review.state]}>{t(`entryStates.${review.state}`)}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{review.mentorName}{review.submittedAt ? ` · ${t("submittedAt", { date: formatLogbookDate(review.submittedAt, timeZone) })}` : ""}</p></div><ReadBlock title={t("summaryLabel")} body={review.activitySummary} /><ReadBlock title={t("reflectionLabel")} body={review.reflection} />{review.feedback ? <ReadBlock title={t("feedbackTitle")} body={review.feedback} /> : null}{canReview ? <div className="grid gap-3"><p id={pendingId} className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-5 text-muted-foreground">{t("reviewCommandPending")}</p><label htmlFor={`feedback-${review.id}`} className="text-sm font-medium">{t("reviewFeedbackLabel")}</label><Textarea id={`feedback-${review.id}`} rows={4} placeholder={t("reviewFeedbackPlaceholder")} aria-describedby={pendingId} /><div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" className="min-h-11" disabled>{t("requestRevision")}</Button><Button type="button" className="min-h-11" disabled>{t("acceptEntry")}</Button></div></div> : null}</article>;
}

function ReadBlock({ title, body }: { title: string; body?: string }) {
  const t = useTranslations("logbook");
  return <div><h4 className="text-sm font-semibold">{title}</h4><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{body || t("notProvided")}</p></div>;
}

function MentorContext({ history, groupLabel, timeZone }: { history: MentorAssignmentViewModel[]; groupLabel?: string; timeZone: string }) {
  const t = useTranslations("logbook");
  return <section className="rounded-xl border bg-card" aria-labelledby="mentor-context-title"><div className="border-b p-5"><h2 id="mentor-context-title" className="font-heading font-semibold">{t("mentorContextTitle")}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("mentorContextBody")}</p>{groupLabel ? <p className="mt-3 flex items-center gap-2 text-sm font-semibold"><UsersRound className="size-4 text-primary" aria-hidden="true" />{groupLabel}</p> : null}</div>{history.length === 0 ? <div className="p-5"><EmptyState title={t("mentorEmptyTitle")} description={t("mentorEmptyBody")} /></div> : <ol className="divide-y">{history.map((item) => <li key={item.id} className="p-5"><p className="font-heading text-sm font-semibold">{item.mentorName}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{formatLogbookDate(item.startsAt, timeZone)} — {item.endsAt ? formatLogbookDate(item.endsAt, timeZone) : t("currentMentor")}</p>{item.reason ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.reason}</p> : null}</li>)}</ol>}</section>;
}

function AuthorityNotice({ body }: { body: string }) {
  const t = useTranslations("logbook");
  return <div role="status" className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4"><UserRoundCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" /><div><p className="font-heading text-sm font-semibold">{t("authorityTitle")}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p></div></div>;
}
