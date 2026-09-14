"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Bot,
  CheckCircle2,
  CircleAlert,
  FileSpreadsheet,
  GraduationCap,
  History,
  LockKeyhole,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui-v3/page-header";
import { EmptyState } from "@/components/ui-v3/states";
import { useClassContext } from "@/features/workspace/context";
import {
  applyAiSuggestion,
  clampCriterionScore,
  formatGradebookDate,
  gradebookBelongsToClass,
  gradebookUiPolicy,
  type ClassGradebookViewModel,
  type GradebookAssignmentViewModel,
  type GradeEntryViewModel,
  type GradeState,
} from "../model";

const gradeStateStyles: Record<GradeState, string> = {
  UNGRADED: "border-border bg-muted text-muted-foreground",
  DRAFT: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  FINAL: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  RELEASED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

export function GradebookContent({ initialGradebook }: { initialGradebook?: ClassGradebookViewModel }) {
  const t = useTranslations("gradebook");
  const { activeClass } = useClassContext();
  if (!activeClass) return null;
  const policy = gradebookUiPolicy(activeClass.capabilities);

  if (!policy.canRead) return <EmptyState title={t("forbiddenTitle")} description={t("forbiddenBody")} />;
  if (initialGradebook && !gradebookBelongsToClass(initialGradebook, activeClass.id)) {
    return <EmptyState title={t("contextMismatchTitle")} description={t("contextMismatchBody")} />;
  }
  if (!initialGradebook) return <GradebookDependencyState />;
  if (initialGradebook.assignments.length === 0) {
    return <div className="space-y-6"><PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} /><EmptyState title={t("emptyTitle")} description={t("emptyBody")} /></div>;
  }
  return <GradebookWorkspace model={initialGradebook} canManage={policy.canGrade} />;
}

function GradebookWorkspace({ model, canManage }: { model: ClassGradebookViewModel; canManage: boolean }) {
  const t = useTranslations("gradebook");
  const [assignmentId, setAssignmentId] = useState<string | undefined>(model.assignments[0]?.assignmentId);
  const assignment = model.assignments.find((item) => item.assignmentId === assignmentId) ?? model.assignments[0];
  const [query, setQuery] = useState("");
  const [state, setState] = useState<GradeState | "ALL">("ALL");
  const filteredEntries = useMemo(() => assignment.entries.filter((entry) => {
    const matchesText = !query.trim() || entry.studentName.toLocaleLowerCase("id-ID").includes(query.trim().toLocaleLowerCase("id-ID"));
    return matchesText && (state === "ALL" || entry.state === state);
  }), [assignment.entries, query, state]);
  const [selectedId, setSelectedId] = useState<string | undefined>(assignment.entries[0]?.submissionId);
  const selected = filteredEntries.find((entry) => entry.submissionId === selectedId) ?? filteredEntries[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        actions={<Button type="button" variant="outline" className="min-h-11" disabled aria-describedby="gradebook-command-pending"><Upload className="size-4" aria-hidden="true" />{t("importAction")}</Button>}
      />
      <GradebookScopeNotice canManage={canManage} />
      <section aria-label={t("summaryLabel")} className="grid overflow-hidden rounded-xl border bg-card sm:grid-cols-4">
        <SummaryItem label={t("summaryStudents")} value={assignment.entries.length} />
        <SummaryItem label={t("summaryUngraded")} value={assignment.entries.filter((entry) => entry.state === "UNGRADED").length} />
        <SummaryItem label={t("summaryDraft")} value={assignment.entries.filter((entry) => entry.state === "DRAFT").length} />
        <SummaryItem label={t("summaryReleased")} value={assignment.entries.filter((entry) => entry.state === "RELEASED").length} last />
      </section>

      <section className="grid gap-4 rounded-xl border bg-card p-4 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,0.65fr)_12rem]" aria-label={t("filtersTitle")}>
        <div className="grid gap-2"><label htmlFor="grade-assignment" className="text-sm font-medium">{t("assignmentLabel")}</label><select id="grade-assignment" className="h-11 min-w-0 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" value={assignment.assignmentId} onChange={(event) => { const next = model.assignments.find((item) => item.assignmentId === event.target.value); setAssignmentId(event.target.value); setQuery(""); setState("ALL"); setSelectedId(next?.entries[0]?.submissionId); }}>{model.assignments.map((item) => <option key={item.assignmentId} value={item.assignmentId}>{item.title}</option>)}</select></div>
        <div className="grid gap-2"><label htmlFor="grade-search" className="text-sm font-medium">{t("searchLabel")}</label><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input id="grade-search" type="search" className="h-11 pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchPlaceholder")} /></div></div>
        <div className="grid gap-2"><label htmlFor="grade-state" className="text-sm font-medium">{t("stateLabel")}</label><select id="grade-state" className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" value={state} onChange={(event) => setState(event.target.value as GradeState | "ALL")}><option value="ALL">{t("allStates")}</option>{(["UNGRADED", "DRAFT", "FINAL", "RELEASED"] as const).map((value) => <option key={value} value={value}>{t(`states.${value}`)}</option>)}</select></div>
        <p aria-live="polite" className="text-xs text-muted-foreground lg:col-span-3">{t("results", { visible: filteredEntries.length, total: assignment.entries.length })}</p>
      </section>

      {filteredEntries.length === 0 ? <EmptyState title={t("noResultsTitle")} description={t("noResultsBody")} /> : (
        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(17rem,0.8fr)_minmax(0,1.7fr)]">
          <aside className="min-w-0 self-start overflow-hidden rounded-xl border bg-card" aria-labelledby="grade-student-list">
            <div className="border-b p-4"><h2 id="grade-student-list" className="font-heading font-semibold">{t("studentListTitle")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("studentListBody")}</p></div>
            <div className="grid gap-2 p-3">{filteredEntries.map((entry) => <button key={entry.submissionId} type="button" onClick={() => setSelectedId(entry.submissionId)} aria-current={entry.submissionId === selected?.submissionId ? "true" : undefined} className="w-full rounded-lg border border-transparent bg-muted/30 p-3 text-left transition-colors hover:border-border hover:bg-muted aria-current:border-primary/40 aria-current:bg-primary/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"><span className="flex items-start justify-between gap-3"><span className="min-w-0"><span className="block truncate font-heading text-sm font-semibold">{entry.studentName}</span><span className="mt-1 block text-xs text-muted-foreground">{t("submissionRevision", { revision: entry.submissionRevision })}</span></span><GradeStateBadge state={entry.state} /></span></button>)}</div>
          </aside>
          {selected ? <GradingPanel key={selected.submissionId} assignment={assignment} entry={selected} timeZone={model.timeZone} canManage={canManage} /> : null}
        </div>
      )}

      {model.importPreview ? <ImportPreview model={model} /> : null}
      <div id="gradebook-command-pending" role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"><div className="flex items-start gap-3"><CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" /><div><p className="font-heading text-sm font-semibold">{t("commandPendingTitle")}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("commandPendingBody")}</p></div></div></div>
    </div>
  );
}

function GradingPanel({ assignment, entry, timeZone, canManage }: { assignment: GradebookAssignmentViewModel; entry: GradeEntryViewModel; timeZone: string; canManage: boolean }) {
  const t = useTranslations("gradebook");
  const [scores, setScores] = useState<Record<string, number>>({ ...entry.criterionScores });
  const [feedback, setFeedback] = useState(entry.feedback ?? "");
  const [regradeReason, setRegradeReason] = useState(entry.regradeReason ?? "");
  const dirty = feedback !== (entry.feedback ?? "") || regradeReason !== (entry.regradeReason ?? "") || assignment.criteria.some((criterion) => (scores[criterion.id] ?? 0) !== (entry.criterionScores[criterion.id] ?? 0));
  useUnsavedGradeWarning(dirty);
  const total = assignment.criteria.reduce((sum, criterion) => sum + (scores[criterion.id] ?? 0), 0);

  return (
    <article className="min-w-0 overflow-hidden rounded-xl border bg-card" aria-labelledby={`grade-${entry.submissionId}`}>
      <header className="border-b p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2"><GradeStateBadge state={entry.state} /><Badge variant="outline">{t("rubricVersion", { version: assignment.rubricVersion })}</Badge><Badge variant="outline">{t("gradeVersion", { version: entry.gradeVersion })}</Badge></div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><h2 id={`grade-${entry.submissionId}`} className="break-words font-heading text-xl font-semibold">{entry.studentName}</h2><p className="mt-1 text-sm text-muted-foreground">{t("submissionRevision", { revision: entry.submissionRevision })}</p></div><div className="rounded-lg bg-primary/10 px-4 py-2 text-right"><p className="text-xs text-muted-foreground">{t("totalScore")}</p><p aria-live="polite" className="font-heading text-xl font-semibold text-primary">{total}/{assignment.maxPoints}</p></div></div>
        {entry.releasedAt ? <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />{t("releasedAt", { date: formatGradebookDate(entry.releasedAt, timeZone) })}</p> : null}
      </header>
      <form onSubmit={(event) => event.preventDefault()} className="grid gap-6 p-5 sm:p-6">
        <fieldset className="grid gap-3" disabled={!canManage || entry.state === "RELEASED"}>
          <legend className="font-heading text-sm font-semibold">{t("rubricTitle")}</legend>
          <p className="text-sm leading-6 text-muted-foreground">{t("rubricBody")}</p>
          {assignment.criteria.map((criterion) => <div key={criterion.id} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[minmax(0,1fr)_7rem] sm:items-start"><div><label htmlFor={`score-${entry.submissionId}-${criterion.id}`} className="text-sm font-semibold">{criterion.title}</label>{criterion.description ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{criterion.description}</p> : null}</div><div><Input id={`score-${entry.submissionId}-${criterion.id}`} type="number" min={0} max={criterion.maxPoints} step={1} value={scores[criterion.id] ?? 0} onChange={(event) => setScores((current) => ({ ...current, [criterion.id]: clampCriterionScore(Number(event.target.value), criterion.maxPoints) }))} className="h-11 text-right" aria-label={t("criterionScore", { criterion: criterion.title, max: criterion.maxPoints })} /><p className="mt-1 text-right text-xs text-muted-foreground">{t("maxPoints", { points: criterion.maxPoints })}</p></div></div>)}
        </fieldset>

        {entry.aiSuggestion ? <AiSuggestionPanel entry={entry} assignment={assignment} canManage={canManage} onApply={() => setScores(applyAiSuggestion(entry, assignment))} /> : null}

        <div className="grid gap-2"><label htmlFor={`grade-feedback-${entry.submissionId}`} className="text-sm font-medium">{t("feedbackLabel")}</label><Textarea id={`grade-feedback-${entry.submissionId}`} rows={5} value={feedback} onChange={(event) => setFeedback(event.target.value)} disabled={!canManage || entry.state === "RELEASED"} placeholder={t("feedbackPlaceholder")} aria-describedby="gradebook-command-pending" /></div>
        {entry.gradeVersion > 0 && entry.state !== "RELEASED" ? <div className="grid gap-2"><label htmlFor={`regrade-${entry.submissionId}`} className="text-sm font-medium">{t("regradeReasonLabel")}</label><Textarea id={`regrade-${entry.submissionId}`} rows={3} value={regradeReason} onChange={(event) => setRegradeReason(event.target.value)} disabled={!canManage} placeholder={t("regradeReasonPlaceholder")} aria-describedby="gradebook-command-pending" /><p className="text-xs text-muted-foreground">{t("regradeReasonHelp")}</p></div> : null}
        {dirty ? <p role="status" className="text-sm font-semibold text-primary">{t("localChanges")}</p> : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" className="min-h-11" disabled aria-describedby="gradebook-command-pending"><Save className="size-4" aria-hidden="true" />{t("saveDraft")}</Button><Button type="button" className="min-h-11" disabled aria-describedby="gradebook-command-pending"><Send className="size-4" aria-hidden="true" />{t("finalizeGrade")}</Button><Button type="button" variant="outline" className="min-h-11" disabled aria-describedby="gradebook-command-pending"><LockKeyhole className="size-4" aria-hidden="true" />{t("releaseGrade")}</Button></div>
      </form>
    </article>
  );
}

function AiSuggestionPanel({ entry, assignment, canManage, onApply }: { entry: GradeEntryViewModel; assignment: GradebookAssignmentViewModel; canManage: boolean; onApply: () => void }) {
  const t = useTranslations("gradebook");
  const suggestion = entry.aiSuggestion;
  if (!suggestion) return null;
  if (suggestion.state === "FAILED") return <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-4" aria-labelledby="ai-suggestion-title"><h3 id="ai-suggestion-title" className="flex items-center gap-2 font-heading text-sm font-semibold"><Bot className="size-4 text-destructive" aria-hidden="true" />{t("aiFailedTitle")}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{suggestion.failureReason ?? t("aiFailedBody")}</p><p className="mt-3 text-xs font-semibold text-foreground">{t("aiNoFallback")}</p></section>;
  if (suggestion.state === "PENDING") return <section className="rounded-xl border bg-muted/20 p-4" aria-labelledby="ai-suggestion-title"><h3 id="ai-suggestion-title" className="flex items-center gap-2 font-heading text-sm font-semibold"><Bot className="size-4 text-primary" aria-hidden="true" />{t("aiPendingTitle")}</h3><p className="mt-2 text-sm text-muted-foreground">{t("aiPendingBody")}</p></section>;
  const suggestedTotal = assignment.criteria.reduce((sum, criterion) => sum + (suggestion.criterionScores?.[criterion.id] ?? 0), 0);
  return <section className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4" aria-labelledby="ai-suggestion-title"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h3 id="ai-suggestion-title" className="flex items-center gap-2 font-heading text-sm font-semibold"><Sparkles className="size-4 text-violet-600" aria-hidden="true" />{t("aiReadyTitle")}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{suggestion.summary}</p></div><Badge variant="outline" className="shrink-0 border-violet-500/30 text-violet-700 dark:text-violet-300">{t("aiScore", { score: suggestedTotal, max: assignment.maxPoints })}</Badge></div><dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2"><div><dt className="text-muted-foreground">{t("aiModel")}</dt><dd className="font-semibold">{suggestion.modelLabel ?? t("notAvailable")}</dd></div><div><dt className="text-muted-foreground">{t("aiProvenance")}</dt><dd className="font-semibold">{suggestion.provenanceLabel ?? t("notAvailable")}</dd></div></dl><div className="mt-4 flex flex-col gap-3 rounded-lg border bg-background/70 p-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-muted-foreground">{t("aiHumanReview")}</p><Button type="button" variant="outline" className="min-h-11 shrink-0" disabled={!canManage} onClick={onApply}><Sparkles className="size-4" aria-hidden="true" />{t("applyAiDraft")}</Button></div></section>;
}

function ImportPreview({ model }: { model: ClassGradebookViewModel }) {
  const t = useTranslations("gradebook");
  const preview = model.importPreview;
  if (!preview) return null;
  return <section className="overflow-hidden rounded-xl border bg-card" aria-labelledby="import-preview-title"><header className="border-b p-5"><div className="flex items-start gap-3"><FileSpreadsheet className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" /><div><h2 id="import-preview-title" className="font-heading font-semibold">{t("importPreviewTitle")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("importPreviewBody", { file: preview.fileName, version: preview.policyVersion })}</p></div></div></header><div className="grid gap-5 p-5"><div className="grid overflow-hidden rounded-xl border sm:grid-cols-3"><SummaryItem label={t("importValid")} value={preview.validRows} /><SummaryItem label={t("importInvalid")} value={preview.invalidRows} /><SummaryItem label={t("importUnchanged")} value={preview.unchangedRows} last /></div><p className="text-xs text-muted-foreground">{t("importExpires", { date: formatGradebookDate(preview.expiresAt, model.timeZone) })}</p>{preview.issues.length > 0 ? <ul className="grid gap-2">{preview.issues.map((issue) => <li key={issue} className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-muted-foreground"><CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden="true" />{issue}</li>)}</ul> : null}<div className="flex justify-end"><Button type="button" disabled aria-describedby="gradebook-command-pending"><Upload className="size-4" aria-hidden="true" />{t("commitImport")}</Button></div></div></section>;
}

function GradebookScopeNotice({ canManage }: { canManage: boolean }) {
  const t = useTranslations("gradebook");
  return <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" /><p><span className="font-semibold text-foreground">{t("scopeTitle")}.</span> {canManage ? t("scopeManageBody") : t("scopeReadBody")}</p></div>;
}

function GradebookDependencyState() {
  const t = useTranslations("gradebook");
  return <div className="space-y-6"><PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} /><section role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5"><div className="flex items-start gap-3"><CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" /><div><h2 className="font-heading font-semibold">{t("dependencyTitle")}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("dependencyBody")}</p></div></div></section><div className="grid gap-3 md:grid-cols-3"><DependencyCard icon={GraduationCap} title={t("dependencyRubricTitle")} body={t("dependencyRubricBody")} /><DependencyCard icon={History} title={t("dependencyHistoryTitle")} body={t("dependencyHistoryBody")} /><DependencyCard icon={Bot} title={t("dependencyAiTitle")} body={t("dependencyAiBody")} /></div></div>;
}

function GradeStateBadge({ state }: { state: GradeState }) {
  const t = useTranslations("gradebook");
  return <Badge variant="outline" className={gradeStateStyles[state]}>{t(`states.${state}`)}</Badge>;
}

function SummaryItem({ label, value, last = false }: { label: string; value: number; last?: boolean }) {
  return <div className={`p-4 sm:px-5 ${last ? "" : "border-b sm:border-b-0 sm:border-r"}`}><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 font-heading text-2xl font-semibold">{value}</p></div>;
}

function DependencyCard({ icon: Icon, title, body }: { icon: typeof GraduationCap; title: string; body: string }) {
  return <article className="rounded-xl border bg-card p-5"><Icon className="size-5 text-primary" aria-hidden="true" /><h3 className="mt-3 font-heading text-sm font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p></article>;
}

function useUnsavedGradeWarning(active: boolean) {
  const t = useTranslations("gradebook");
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
