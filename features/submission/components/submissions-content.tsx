"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  CalendarClock,
  CircleAlert,
  Clock3,
  FileCheck2,
  FileText,
  Inbox,
  LockKeyhole,
  Paperclip,
  ReceiptText,
  Search,
  Send,
  ShieldCheck,
  UserRoundCheck,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui-v3/page-header";
import { EmptyState } from "@/components/ui-v3/states";
import { useClassContext } from "@/features/workspace/context";
import {
  formatSubmissionDate,
  formatSubmissionFileSize,
  matchesTeacherSubmission,
  submissionBelongsToClass,
  submissionUiPolicy,
  type ClassSubmissionViewModel,
  type LearnerAssignmentViewModel,
  type SubmissionAttachmentViewModel,
  type SubmissionState,
  type TeacherSubmissionViewModel,
} from "../model";

const stateStyles: Record<SubmissionState, string> = {
  NOT_STARTED: "border-border bg-muted text-muted-foreground",
  DRAFT: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  SUBMITTED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  RETURNED: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  GRADED: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  LOCKED: "border-border bg-muted text-muted-foreground",
};

export function SubmissionsContent({ initialSubmissions }: { initialSubmissions?: ClassSubmissionViewModel }) {
  const t = useTranslations("submissions");
  const { activeClass } = useClassContext();
  if (!activeClass) return null;

  const policy = submissionUiPolicy(activeClass.capabilities);
  if (!policy.canRead) return <EmptyState title={t("forbiddenTitle")} description={t("forbiddenBody")} />;
  if (initialSubmissions && !submissionBelongsToClass(initialSubmissions, activeClass.id)) {
    return <EmptyState title={t("contextMismatchTitle")} description={t("contextMismatchBody")} />;
  }
  if (!initialSubmissions) return <SubmissionDependencyState />;
  if (policy.canReview && initialSubmissions.teacherInbox) {
    return <TeacherSubmissionInbox model={initialSubmissions} items={initialSubmissions.teacherInbox} />;
  }
  if (initialSubmissions.learnerAssignments) {
    return <LearnerSubmissionWorkspace model={initialSubmissions} assignments={initialSubmissions.learnerAssignments} />;
  }
  return <EmptyState title={t("projectionUnavailableTitle")} description={t("projectionUnavailableBody")} />;
}

function LearnerSubmissionWorkspace({ model, assignments }: { model: ClassSubmissionViewModel; assignments: LearnerAssignmentViewModel[] }) {
  const t = useTranslations("submissions");
  const [selectedId, setSelectedId] = useState(assignments[0]?.assignmentId);
  const selected = assignments.find((assignment) => assignment.assignmentId === selectedId) ?? assignments[0];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t("studentEyebrow")} title={t("studentTitle")} description={t("studentDescription")} />
      <SubmissionScopeNotice />
      {assignments.length === 0 ? <EmptyState title={t("studentEmptyTitle")} description={t("studentEmptyBody")} /> : (
        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(16rem,0.75fr)_minmax(0,1.6fr)]">
          <aside className="min-w-0 self-start overflow-hidden rounded-xl border bg-card" aria-labelledby="learner-assignment-list">
            <div className="border-b p-4">
              <h2 id="learner-assignment-list" className="font-heading font-semibold">{t("assignmentListTitle")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("assignmentListBody", { count: assignments.length })}</p>
            </div>
            <div className="grid gap-2 p-3">
              {assignments.map((assignment) => (
                <button
                  key={assignment.assignmentId}
                  type="button"
                  onClick={() => setSelectedId(assignment.assignmentId)}
                  aria-current={assignment.assignmentId === selected?.assignmentId ? "true" : undefined}
                  className="min-h-20 w-full rounded-lg border border-transparent bg-muted/30 p-3 text-left transition-colors hover:border-border hover:bg-muted aria-current:border-primary/40 aria-current:bg-primary/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="block break-words font-heading text-sm font-semibold">{assignment.title}</span>
                  <span className="mt-2 flex flex-wrap items-center gap-2">
                    <SubmissionStateBadge state={assignment.state} />
                    <span className="text-xs text-muted-foreground">{t("revision", { revision: assignment.currentRevision })}</span>
                  </span>
                </button>
              ))}
            </div>
          </aside>
          {selected ? <LearnerAssignmentDetail key={selected.assignmentId} assignment={selected} timeZone={model.timeZone} /> : null}
        </div>
      )}
    </div>
  );
}

function LearnerAssignmentDetail({ assignment, timeZone }: { assignment: LearnerAssignmentViewModel; timeZone: string }) {
  const t = useTranslations("submissions");
  const [draft, setDraft] = useState(assignment.draftText ?? "");
  const [selectedFile, setSelectedFile] = useState<string>();
  const dirty = draft !== (assignment.draftText ?? "") || selectedFile !== undefined;
  useUnsavedSubmissionWarning(dirty);
  const locked = assignment.state === "SUBMITTED" || assignment.state === "GRADED" || assignment.state === "LOCKED" || assignment.deadlineState === "CLOSED";

  return (
    <article className="min-w-0 overflow-hidden rounded-xl border bg-card" aria-labelledby={`assignment-${assignment.assignmentId}`}>
      <header className="border-b p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <SubmissionStateBadge state={assignment.state} />
          <Badge variant="outline">{t(`deadlineStates.${assignment.deadlineState}`)}</Badge>
        </div>
        <h2 id={`assignment-${assignment.assignmentId}`} className="mt-4 break-words font-heading text-xl font-semibold sm:text-2xl">{assignment.title}</h2>
        {assignment.summary ? <p className="mt-2 max-w-[72ch] text-sm leading-6 text-muted-foreground">{assignment.summary}</p> : null}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><CalendarClock className="size-4" aria-hidden="true" />{t("due", { date: formatSubmissionDate(assignment.dueAt, timeZone) })}</span>
          {assignment.cutoffAt ? <span className="inline-flex items-center gap-1.5"><LockKeyhole className="size-4" aria-hidden="true" />{t("cutoff", { date: formatSubmissionDate(assignment.cutoffAt, timeZone) })}</span> : null}
        </div>
      </header>

      <div className="grid gap-6 p-5 sm:p-6">
        {assignment.teacherFeedback ? (
          <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4" aria-labelledby="teacher-feedback-title">
            <h3 id="teacher-feedback-title" className="flex items-center gap-2 font-heading text-sm font-semibold"><UserRoundCheck className="size-4 text-amber-600" aria-hidden="true" />{t("teacherFeedbackTitle")}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{assignment.teacherFeedback}</p>
          </section>
        ) : null}

        {assignment.receipt ? <ReceiptPanel receipt={assignment.receipt} timeZone={timeZone} /> : null}

        <form onSubmit={(event) => event.preventDefault()} className="grid gap-5">
          <div className="grid gap-2">
            <label htmlFor={`submission-answer-${assignment.assignmentId}`} className="text-sm font-medium">{t("answerLabel")}</label>
            <Textarea
              id={`submission-answer-${assignment.assignmentId}`}
              rows={8}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={locked}
              aria-describedby="submission-command-pending"
              placeholder={t("answerPlaceholder")}
            />
            <p className="text-xs text-muted-foreground">{locked ? t("answerLocked") : t("answerHelp")}</p>
          </div>
          <div className="grid gap-2">
            <label htmlFor={`submission-file-${assignment.assignmentId}`} className="text-sm font-medium">{t("attachmentLabel")}</label>
            <Input
              id={`submission-file-${assignment.assignmentId}`}
              type="file"
              className="h-11 file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium"
              disabled={locked}
              onChange={(event) => setSelectedFile(event.target.files?.[0]?.name)}
              aria-describedby="submission-command-pending"
            />
            {selectedFile ? <p role="status" className="text-xs font-medium text-primary">{t("selectedFile", { file: selectedFile })}</p> : null}
          </div>

          <div id="submission-command-pending" role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3"><CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" /><div><p className="font-heading text-sm font-semibold">{t("commandPendingTitle")}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("commandPendingBody")}</p></div></div>
          </div>
          {dirty ? <p role="status" className="text-sm font-semibold text-primary">{t("localChanges")}</p> : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="min-h-11" disabled aria-describedby="submission-command-pending"><FileCheck2 className="size-4" aria-hidden="true" />{t("saveDraft")}</Button>
            <Button type="submit" className="min-h-11" disabled aria-describedby="submission-command-pending"><Send className="size-4" aria-hidden="true" />{assignment.state === "RETURNED" ? t("resubmit") : t("submit")}</Button>
          </div>
        </form>

        <SubmissionAttachments attachments={assignment.attachments} />
        <SubmissionTimeline events={assignment.timeline} timeZone={timeZone} />
      </div>
    </article>
  );
}

function TeacherSubmissionInbox({ model, items }: { model: ClassSubmissionViewModel; items: TeacherSubmissionViewModel[] }) {
  const t = useTranslations("submissions");
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SubmissionState | "ALL">("ALL");
  const [assignmentId, setAssignmentId] = useState<string | "ALL">("ALL");
  const [selectedId, setSelectedId] = useState(items[0]?.submissionId);
  const assignments = useMemo(() => Array.from(new Map(items.map((item) => [item.assignmentId, item.assignmentTitle])).entries()), [items]);
  const filtered = useMemo(() => items.filter((item) => matchesTeacherSubmission(item, query, state, assignmentId)), [assignmentId, items, query, state]);
  const selected = filtered.find((item) => item.submissionId === selectedId) ?? filtered[0];
  const filtersActive = Boolean(query || state !== "ALL" || assignmentId !== "ALL");

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t("teacherEyebrow")} title={t("teacherTitle")} description={t("teacherDescription")} />
      <SubmissionScopeNotice />
      <section aria-label={t("summaryLabel")} className="grid overflow-hidden rounded-xl border bg-card sm:grid-cols-3">
        <SummaryItem label={t("summarySubmitted")} value={items.filter((item) => item.state === "SUBMITTED").length} />
        <SummaryItem label={t("summaryReturned")} value={items.filter((item) => item.state === "RETURNED").length} />
        <SummaryItem label={t("summaryGraded")} value={items.filter((item) => item.state === "GRADED").length} last />
      </section>
      <section className="grid gap-4 rounded-xl border bg-card p-4 lg:grid-cols-[minmax(0,1fr)_13rem_15rem]" aria-label={t("filtersTitle")}>
        <div className="grid gap-2"><label htmlFor="submission-search" className="text-sm font-medium">{t("searchLabel")}</label><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input id="submission-search" type="search" className="h-11 pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchPlaceholder")} /></div></div>
        <div className="grid gap-2"><label htmlFor="submission-state" className="text-sm font-medium">{t("stateFilterLabel")}</label><select id="submission-state" className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" value={state} onChange={(event) => setState(event.target.value as SubmissionState | "ALL")}><option value="ALL">{t("allStates")}</option>{(["DRAFT", "SUBMITTED", "RETURNED", "GRADED", "LOCKED"] as const).map((value) => <option key={value} value={value}>{t(`states.${value}`)}</option>)}</select></div>
        <div className="grid gap-2"><label htmlFor="submission-assignment" className="text-sm font-medium">{t("assignmentFilterLabel")}</label><select id="submission-assignment" className="h-11 min-w-0 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" value={assignmentId} onChange={(event) => setAssignmentId(event.target.value)}><option value="ALL">{t("allAssignments")}</option>{assignments.map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select></div>
        <div className="flex flex-wrap items-center justify-between gap-3 lg:col-span-3"><p aria-live="polite" className="text-xs text-muted-foreground">{t("results", { visible: filtered.length, total: items.length })}</p>{filtersActive ? <Button type="button" variant="ghost" className="min-h-11" onClick={() => { setQuery(""); setState("ALL"); setAssignmentId("ALL"); }}><X className="size-4" aria-hidden="true" />{t("clearFilters")}</Button> : null}</div>
      </section>

      {items.length === 0 ? <EmptyState title={t("teacherEmptyTitle")} description={t("teacherEmptyBody")} /> : filtered.length === 0 ? <EmptyState title={t("noResultsTitle")} description={t("noResultsBody")} /> : (
        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(18rem,0.9fr)_minmax(0,1.4fr)]">
          <div className="min-w-0 overflow-hidden rounded-xl border bg-card">
            <div className="border-b p-4"><h2 className="font-heading font-semibold">{t("inboxTitle")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("inboxBody")}</p></div>
            <div className="grid gap-2 p-3">
              {filtered.map((item) => <button key={item.submissionId} type="button" onClick={() => setSelectedId(item.submissionId)} aria-current={item.submissionId === selected?.submissionId ? "true" : undefined} className="w-full rounded-lg border border-transparent bg-muted/30 p-3 text-left transition-colors hover:border-border hover:bg-muted aria-current:border-primary/40 aria-current:bg-primary/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"><span className="flex items-start justify-between gap-3"><span className="min-w-0"><span className="block truncate font-heading text-sm font-semibold">{item.studentName}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{item.assignmentTitle}</span></span><SubmissionStateBadge state={item.state} /></span><span className="mt-2 block text-xs text-muted-foreground">{t("revision", { revision: item.currentRevision })}</span></button>)}
            </div>
          </div>
          {selected ? <TeacherSubmissionDetail submission={selected} timeZone={model.timeZone} /> : null}
        </div>
      )}
    </div>
  );
}

function TeacherSubmissionDetail({ submission, timeZone }: { submission: TeacherSubmissionViewModel; timeZone: string }) {
  const t = useTranslations("submissions");
  return (
    <article className="min-w-0 overflow-hidden rounded-xl border bg-card" aria-labelledby={`review-${submission.submissionId}`}>
      <header className="border-b p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2"><SubmissionStateBadge state={submission.state} /><Badge variant="outline">{t(`deadlineStates.${submission.deadlineState}`)}</Badge><Badge variant="outline">{t("revision", { revision: submission.currentRevision })}</Badge></div>
        <h2 id={`review-${submission.submissionId}`} className="mt-4 break-words font-heading text-xl font-semibold">{submission.studentName}</h2>
        <p className="mt-1 break-words text-sm text-muted-foreground">{submission.assignmentTitle}{submission.studentEmail ? ` · ${submission.studentEmail}` : ""}</p>
        {submission.submittedAt ? <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="size-4" aria-hidden="true" />{t("submittedAt", { date: formatSubmissionDate(submission.submittedAt, timeZone) })}</p> : null}
      </header>
      <div className="grid gap-6 p-5 sm:p-6">
        <section aria-labelledby="submission-answer-preview"><h3 id="submission-answer-preview" className="font-heading text-sm font-semibold">{t("answerPreviewTitle")}</h3><div className="mt-3 rounded-xl border bg-muted/20 p-4 text-sm leading-7 text-muted-foreground">{submission.excerpt ?? t("answerPreviewEmpty")}</div></section>
        {submission.receipt ? <ReceiptPanel receipt={submission.receipt} timeZone={timeZone} /> : null}
        <SubmissionAttachments attachments={submission.attachments} />
        <SubmissionTimeline events={submission.timeline} timeZone={timeZone} />
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4"><p className="font-heading text-sm font-semibold">{t("gradeHandoffTitle")}</p><p id="gradebook-command-pending" className="mt-1 text-sm leading-6 text-muted-foreground">{t("gradeHandoffBody")}</p><Button className="mt-4 min-h-11" disabled aria-describedby="gradebook-command-pending"><UserRoundCheck className="size-4" aria-hidden="true" />{t("openGrading")}</Button></div>
      </div>
    </article>
  );
}

function SubmissionDependencyState() {
  const t = useTranslations("submissions");
  return <div className="space-y-6"><PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} /><section role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5"><div className="flex items-start gap-3"><CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" /><div><h2 className="font-heading font-semibold">{t("dependencyTitle")}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("dependencyBody")}</p></div></div></section><div className="grid gap-3 md:grid-cols-3"><DependencyCard icon={FileText} title={t("dependencyDraftTitle")} body={t("dependencyDraftBody")} /><DependencyCard icon={ReceiptText} title={t("dependencyReceiptTitle")} body={t("dependencyReceiptBody")} /><DependencyCard icon={ShieldCheck} title={t("dependencyDeadlineTitle")} body={t("dependencyDeadlineBody")} /></div></div>;
}

function SubmissionScopeNotice() {
  const t = useTranslations("submissions");
  return <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" /><p><span className="font-semibold text-foreground">{t("scopeTitle")}.</span> {t("scopeBody")}</p></div>;
}

function ReceiptPanel({ receipt, timeZone }: { receipt: LearnerAssignmentViewModel["receipt"] | TeacherSubmissionViewModel["receipt"]; timeZone: string }) {
  const t = useTranslations("submissions");
  if (!receipt) return null;
  return <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4" aria-labelledby={`receipt-${receipt.code}`}><h3 id={`receipt-${receipt.code}`} className="flex items-center gap-2 font-heading text-sm font-semibold"><ReceiptText className="size-4 text-emerald-600" aria-hidden="true" />{t("receiptTitle")}</h3><dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><div><dt className="text-xs text-muted-foreground">{t("receiptCode")}</dt><dd className="mt-0.5 break-all font-mono text-xs font-semibold">{receipt.code}</dd></div><div><dt className="text-xs text-muted-foreground">{t("serverRecorded")}</dt><dd className="mt-0.5 text-xs font-semibold">{formatSubmissionDate(receipt.serverRecordedAt, timeZone)}</dd></div></dl></section>;
}

function SubmissionAttachments({ attachments }: { attachments: SubmissionAttachmentViewModel[] }) {
  const t = useTranslations("submissions");
  if (attachments.length === 0) return null;
  return <section aria-labelledby="submission-attachments"><h3 id="submission-attachments" className="flex items-center gap-2 font-heading text-sm font-semibold"><Paperclip className="size-4 text-primary" aria-hidden="true" />{t("attachmentsTitle")}</h3><ul className="mt-3 grid gap-2">{attachments.map((attachment) => <li key={attachment.id} className="flex min-w-0 items-center justify-between gap-3 rounded-lg border p-3"><span className="min-w-0"><span className="block truncate text-sm font-medium">{attachment.name}</span><span className="mt-0.5 block text-xs text-muted-foreground">{formatSubmissionFileSize(attachment.sizeBytes)}</span></span><Badge variant="outline">{t(`attachmentStates.${attachment.state}`)}</Badge></li>)}</ul></section>;
}

function SubmissionTimeline({ events, timeZone }: { events: LearnerAssignmentViewModel["timeline"]; timeZone: string }) {
  const t = useTranslations("submissions");
  return <section aria-labelledby="submission-timeline"><h3 id="submission-timeline" className="font-heading text-sm font-semibold">{t("timelineTitle")}</h3>{events.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">{t("timelineEmpty")}</p> : <ol className="mt-4 space-y-4 border-l pl-4">{events.map((event) => <li key={event.id} className="relative"><span className="absolute -left-[1.28rem] top-1.5 size-2 rounded-full bg-primary ring-4 ring-background" aria-hidden="true" /><p className="text-sm font-medium">{t(`timeline.${event.type}`)}</p><p className="mt-0.5 text-xs text-muted-foreground">{formatSubmissionDate(event.occurredAt, timeZone)}{event.label ? ` · ${event.label}` : ""}</p></li>)}</ol>}</section>;
}

function SubmissionStateBadge({ state }: { state: SubmissionState }) {
  const t = useTranslations("submissions");
  return <Badge variant="outline" className={stateStyles[state]}>{t(`states.${state}`)}</Badge>;
}

function SummaryItem({ label, value, last = false }: { label: string; value: number; last?: boolean }) {
  return <div className={`p-4 sm:px-5 ${last ? "" : "border-b sm:border-b-0 sm:border-r"}`}><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 font-heading text-2xl font-semibold">{value}</p></div>;
}

function DependencyCard({ icon: Icon, title, body }: { icon: typeof Inbox; title: string; body: string }) {
  return <article className="rounded-xl border bg-card p-5"><Icon className="size-5 text-primary" aria-hidden="true" /><h3 className="mt-3 font-heading text-sm font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p></article>;
}

function useUnsavedSubmissionWarning(active: boolean) {
  const t = useTranslations("submissions");
  const message = t("unsavedNavigationWarning");
  useEffect(() => {
    if (!active) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = true; };
    const beforeLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download") || window.confirm(message)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", beforeLink, true);
    return () => { window.removeEventListener("beforeunload", beforeUnload); document.removeEventListener("click", beforeLink, true); };
  }, [active, message]);
}
