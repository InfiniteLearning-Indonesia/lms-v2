"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  CalendarDays,
  ChartPie,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  FileLock2,
  Gavel,
  Search,
  UsersRound,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui-v3/page-header";
import { EmptyState } from "@/components/ui-v3/states";
import { useClassContext } from "@/features/workspace/context";
import {
  attendanceBelongsToClass,
  attendanceUiPolicy,
  findMeetingRoster,
  formatAttendanceDate,
  matchesPermit,
  type AttendanceMeetingViewModel,
  type AttendanceMonthlySummaryViewModel,
  type AttendanceRecordViewModel,
  type AttendanceState,
  type ClassAttendanceViewModel,
  type DisciplineCaseViewModel,
  type PermitState,
  type PermitViewModel,
} from "../model";

const states: AttendanceState[] = ["PRESENT", "LATE", "EXCUSED", "ABSENT", "UNKNOWN"];
const attendanceStyles: Record<AttendanceState, string> = {
  PRESENT: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  LATE: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  EXCUSED: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  ABSENT: "border-destructive/30 bg-destructive/10 text-destructive",
  UNKNOWN: "border-border bg-muted text-muted-foreground",
};
const stateSurface: Record<AttendanceState, string> = {
  PRESENT: "border-emerald-500/25 bg-emerald-500/10",
  LATE: "border-amber-500/25 bg-amber-500/10",
  EXCUSED: "border-blue-500/25 bg-blue-500/10",
  ABSENT: "border-destructive/25 bg-destructive/10",
  UNKNOWN: "border-border bg-muted/60",
};
const permitStyles: Record<PermitState, string> = {
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  APPROVED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  REJECTED: "border-destructive/30 bg-destructive/10 text-destructive",
  REVISION_REQUIRED: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
};
const chartColors: Record<AttendanceState, string> = {
  PRESENT: "var(--color-emerald-500)",
  LATE: "var(--color-amber-500)",
  EXCUSED: "var(--color-blue-500)",
  ABSENT: "var(--color-destructive)",
  UNKNOWN: "var(--color-zinc-400)",
};

type TeacherView = "calendar" | "recap";
type CalendarMonth = { year: number; month: number };

export function AttendanceContent({ initialAttendance }: { initialAttendance?: ClassAttendanceViewModel }) {
  const t = useTranslations("attendance");
  const { activeClass } = useClassContext();
  const policy = attendanceUiPolicy(activeClass?.capabilities);
  const matchesClass = !initialAttendance || attendanceBelongsToClass(initialAttendance, activeClass?.id);

  if (!activeClass) return null;
  if (!policy.canRead) return <EmptyState title={t("forbiddenTitle")} description={t("forbiddenBody")} />;
  if (!matchesClass) return <EmptyState title={t("contextMismatchTitle")} description={t("contextMismatchBody")} />;

  const teacher = Boolean(initialAttendance?.manager || policy.canManageRecords || policy.canReviewPermit || policy.canManageDiscipline);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t(teacher ? "teacherEyebrow" : "menteeEyebrow")}
        title={t(teacher ? "teacherTitle" : "menteeTitle")}
        description={t(teacher ? "teacherDescription" : "menteeDescription", { className: activeClass.name })}
      />
      {!initialAttendance ? <AttendanceDependency /> : initialAttendance.manager ? (
        <TeacherAttendance model={initialAttendance} />
      ) : initialAttendance.learner ? (
        <MenteeCalendar model={initialAttendance} />
      ) : (
        <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />
      )}
    </div>
  );
}

function AttendanceDependency() {
  const t = useTranslations("attendance");
  return (
    <section className="grid gap-4" aria-labelledby="attendance-dependency-title">
      <div role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
        <div className="flex items-start gap-3"><CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-300" aria-hidden="true" /><div><h2 id="attendance-dependency-title" className="font-heading font-semibold">{t("dependencyTitle")}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("dependencyBody")}</p></div></div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {[[CalendarDays, t("dependencyMeetingTitle"), t("dependencyMeetingBody")], [FileLock2, t("dependencyPermitTitle"), t("dependencyPermitBody")], [Gavel, t("dependencyDisciplineTitle"), t("dependencyDisciplineBody")]].map(([Icon, title, body]) => (
          <article key={title as string} className="rounded-xl border bg-card p-5"><Icon className="size-5 text-primary" aria-hidden="true" /><h3 className="mt-3 font-heading text-sm font-semibold">{title as string}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{body as string}</p></article>
        ))}
      </div>
    </section>
  );
}

function MenteeCalendar({ model }: { model: ClassAttendanceViewModel }) {
  const t = useTranslations("attendance");
  const learner = model.learner!;
  const recordByMeeting = new Map(learner.records.map((record) => [record.meetingId, record]));
  return (
    <AttendanceCalendar
      model={model}
      title={t("menteeCalendarTitle")}
      description={t("menteeCalendarBody")}
      recordForMeeting={(meeting) => recordByMeeting.get(meeting.id)}
    />
  );
}

function TeacherAttendance({ model }: { model: ClassAttendanceViewModel }) {
  const t = useTranslations("attendance");
  const { activeClass } = useClassContext();
  const policy = attendanceUiPolicy(activeClass?.capabilities);
  const [view, setView] = useState<TeacherView>("calendar");
  const [selectedMeetingId, setSelectedMeetingId] = useState("");
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const manager = model.manager!;

  function openAttendanceDialog(meetingId: string) {
    setSelectedMeetingId(meetingId);
    setAttendanceDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-2 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label={t("teacherViewsLabel")} className="grid gap-1 sm:inline-grid sm:grid-cols-2">
          {(["calendar", "recap"] as const).map((item) => (
            <button key={item} type="button" aria-pressed={view === item} onClick={() => setView(item)} className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${view === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              {item === "calendar" ? <CalendarDays className="size-4" aria-hidden="true" /> : <ChartPie className="size-4" aria-hidden="true" />}{t(`teacherViews.${item}`)}
            </button>
          ))}
        </div>
        <p className="px-3 pb-2 text-sm text-muted-foreground sm:pb-0">{t("classLabel")} <span className="font-semibold text-foreground">{activeClass?.name}</span></p>
      </div>

      {view === "calendar" ? (
        <div className="space-y-6">
          <AttendanceCalendar model={model} title={t("teacherCalendarTitle")} description={t("teacherCalendarBody")} selectedMeetingId={selectedMeetingId} onSelectMeeting={policy.canManageRecords ? openAttendanceDialog : undefined} rosterForMeeting={(meeting) => findMeetingRoster(model, meeting.id)} />
          <AttendanceRosterDialog
            key={selectedMeetingId}
            model={model}
            meetingId={selectedMeetingId}
            open={attendanceDialogOpen}
            onOpenChange={setAttendanceDialogOpen}
          />
          <div className="grid gap-6 xl:grid-cols-2">
            <PermitInbox permits={manager.permitInbox} canReview={policy.canReviewPermit} timeZone={model.timeZone} />
            {policy.canReadDiscipline ? <DisciplineList cases={manager.disciplineCases} canManage={policy.canManageDiscipline} timeZone={model.timeZone} /> : null}
          </div>
        </div>
      ) : <MonthlyRecap summary={manager.monthlySummary} />}
    </div>
  );
}

function AttendanceCalendar({ model, title, description, recordForMeeting, rosterForMeeting, selectedMeetingId, onSelectMeeting }: { model: ClassAttendanceViewModel; title: string; description: string; recordForMeeting?: (meeting: AttendanceMeetingViewModel) => AttendanceRecordViewModel | undefined; rosterForMeeting?: (meeting: AttendanceMeetingViewModel) => AttendanceRecordViewModel[]; selectedMeetingId?: string; onSelectMeeting?: (meetingId: string) => void }) {
  const t = useTranslations("attendance");
  const initial = monthFromIso(model.updatedAt, model.timeZone);
  const [visibleMonth, setVisibleMonth] = useState<CalendarMonth>(initial);
  const cells = calendarCells(visibleMonth);
  const meetingsByDay = useMemo(() => {
    const map = new Map<string, AttendanceMeetingViewModel[]>();
    for (const meeting of model.meetings) {
      const key = dateKey(meeting.startsAt, model.timeZone);
      map.set(key, [...(map.get(key) ?? []), meeting]);
    }
    return map;
  }, [model.meetings, model.timeZone]);
  const todayKey = dateKey(model.updatedAt, model.timeZone);

  return (
    <section className="rounded-xl border bg-card p-4 sm:p-5" aria-labelledby="attendance-calendar-title">
      <div className="flex items-start gap-3"><CalendarDays className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden="true" /><div><h2 id="attendance-calendar-title" className="font-heading text-lg font-semibold">{title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p></div></div>
      <div className="mt-5 rounded-xl border bg-background p-2 sm:p-4">
        <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2">
          <Button type="button" variant="outline" size="icon" className="size-11" aria-label={t("previousMonth")} onClick={() => setVisibleMonth(shiftMonth(visibleMonth, -1))}><ChevronLeft className="size-4" aria-hidden="true" /></Button>
          <p className="text-center font-heading text-sm font-semibold sm:text-base">{formatMonth(visibleMonth)}</p>
          <Button type="button" variant="outline" size="icon" className="size-11" aria-label={t("nextMonth")} onClick={() => setVisibleMonth(shiftMonth(visibleMonth, 1))}><ChevronRight className="size-4" aria-hidden="true" /></Button>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1 sm:gap-2" aria-hidden="true">{(["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const).map((day) => <span key={day} className="py-1 text-center text-[10px] font-semibold uppercase text-muted-foreground sm:text-xs">{t(`weekdays.${day}`)}</span>)}</div>
        <div className="mt-1 grid grid-cols-7 gap-1 sm:gap-2">
          {cells.map((cell, index) => {
            if (!cell) return <span key={`empty-${index}`} className="min-h-20 rounded-lg bg-muted/15 sm:min-h-28" aria-hidden="true" />;
            const meetings = meetingsByDay.get(cell.key) ?? [];
            const meeting = meetings[0];
            const record = meeting ? recordForMeeting?.(meeting) : undefined;
            const roster = meeting ? rosterForMeeting?.(meeting) ?? [] : [];
            const counts = countStates(roster);
            const selected = Boolean(meeting && selectedMeetingId && meeting.id === selectedMeetingId);
            const weekend = cell.weekday === 0 || cell.weekday === 6;
            const content = <CalendarCell day={cell.day} meeting={meeting} additionalMeetings={Math.max(0, meetings.length - 1)} record={record} counts={counts} isToday={cell.key === todayKey} />;
            const className = `min-h-20 min-w-0 rounded-lg border p-1.5 text-left sm:min-h-28 sm:p-2 ${selected ? "border-primary ring-2 ring-primary/35" : weekend ? "border-destructive/20 bg-destructive/5" : meeting ? "border-primary/20 bg-primary/[0.03]" : "border-border bg-card"}`;
            return onSelectMeeting && meeting ? <button key={cell.key} type="button" aria-pressed={selected} aria-label={t("openMeetingDay", { day: cell.day, title: meeting.title })} onClick={() => onSelectMeeting(meeting.id)} className={`${className} cursor-pointer transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50`}>{content}</button> : <div key={cell.key} className={className}>{content}</div>;
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground"><LegendDot className="bg-emerald-500" label={t("attendanceStates.PRESENT")} /><LegendDot className="bg-amber-500" label={t("attendanceStates.LATE")} /><LegendDot className="bg-blue-500" label={t("attendanceStates.EXCUSED")} /><LegendDot className="bg-destructive" label={t("attendanceStates.ABSENT")} /><LegendDot className="bg-zinc-400" label={t("attendanceStates.UNKNOWN")} /></div>
      </div>
    </section>
  );
}

function CalendarCell({ day, meeting, additionalMeetings, record, counts, isToday }: { day: number; meeting?: AttendanceMeetingViewModel; additionalMeetings: number; record?: AttendanceRecordViewModel; counts: Record<AttendanceState, number>; isToday: boolean }) {
  const t = useTranslations("attendance");
  return <div className="flex h-full min-w-0 flex-col"><div className="flex items-center justify-between gap-1"><span className={`grid size-6 place-items-center rounded-full text-xs font-semibold ${isToday ? "bg-primary text-primary-foreground" : ""}`}>{day}</span>{meeting ? <span className="hidden text-[10px] text-muted-foreground sm:inline">{t(`meetingStates.${meeting.state}`)}</span> : null}</div>{meeting ? <div className="mt-auto min-w-0 space-y-1 pt-2"><p className="truncate text-[10px] font-semibold sm:text-xs" title={meeting.title}>{meeting.title}</p>{record ? <Badge variant="outline" className={`max-w-full px-1.5 text-[9px] sm:text-[10px] ${attendanceStyles[record.state]}`}>{t(`attendanceStates.${record.state}`)}</Badge> : null}{!record && sumCounts(counts) > 0 ? <div className="hidden space-y-1 sm:block">{states.filter((state) => counts[state] > 0).slice(0, 2).map((state) => <p key={state} className={`flex justify-between rounded px-1.5 py-0.5 text-[10px] ${attendanceStyles[state]}`}><span>{t(`attendanceStates.${state}`)}</span><span>{counts[state]}</span></p>)}</div> : null}{!record && sumCounts(counts) === 0 ? <p className="truncate rounded bg-muted px-1.5 py-0.5 text-center text-[9px] text-muted-foreground sm:text-[10px]">{t("notFilled")}</p> : null}{additionalMeetings > 0 ? <p className="text-[9px] text-muted-foreground">{t("moreMeetings", { count: additionalMeetings })}</p> : null}</div> : null}</div>;
}

function AttendanceRosterDialog({ model, meetingId, open, onOpenChange }: { model: ClassAttendanceViewModel; meetingId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations("attendance");
  const records = findMeetingRoster(model, meetingId);
  const meeting = model.meetings.find((item) => item.id === meetingId);
  const [draftStates, setDraftStates] = useState<Record<string, AttendanceState>>(() => Object.fromEntries(records.map((record) => [record.id, record.state])));
  const changedCount = records.filter((record) => draftStates[record.id] !== record.state).length;
  const pendingId = `attendance-command-pending-${meetingId || "empty"}`;

  if (!meeting) return null;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setDraftStates(Object.fromEntries(records.map((record) => [record.id, record.state])));
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="max-h-[calc(100dvh-1rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-6xl">
        <DialogHeader className="border-b p-5 pr-16 sm:p-6 sm:pr-20">
          <DialogTitle className="text-xl text-primary sm:text-2xl">{t("attendanceDialogTitle", { date: formatAttendanceDay(meeting.startsAt, model.timeZone) })}</DialogTitle>
          <DialogDescription className="leading-6">{t("attendanceDialogDescription")}</DialogDescription>
        </DialogHeader>
        <DialogClose render={<Button type="button" variant="ghost" size="icon" className="absolute right-3 top-3 size-11" aria-label={t("closeAttendanceDialog")} />}>
          <X className="size-5" aria-hidden="true" />
        </DialogClose>

        <div className="min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6">
          <section className="flex flex-col gap-4 rounded-xl border bg-muted/15 p-4 sm:flex-row sm:items-center sm:justify-between" aria-labelledby="learning-day-status">
            <div className="flex min-w-0 items-start gap-3">
              <CalendarDays className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0">
                <h3 id="learning-day-status" className="font-heading font-semibold">{t("learningDayStatus")}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{t("learningDayBody", { title: meeting.title, delivery: meeting.deliveryLabel ?? "—" })}</p>
              </div>
            </div>
            <Button type="button" variant="outline" className="min-h-11 whitespace-normal sm:shrink-0" disabled aria-describedby={pendingId}>{t("additionalAsyncDay")}</Button>
          </section>

          <p id={pendingId} className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-5 text-muted-foreground">{t("attendanceCommandPending")}</p>

          {records.length === 0 ? (
            <div className="mt-4 rounded-xl border"><EmptyState title={t("attendanceDialogEmptyTitle")} description={t("attendanceDialogEmptyBody")} /></div>
          ) : (
            <section className="mt-4 overflow-hidden rounded-xl border" aria-label={t("rosterTitle")}>
              <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(9rem,0.7fr)_minmax(12rem,0.8fr)] gap-4 bg-muted/50 px-5 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:grid">
                <span>{t("studentColumn")}</span>
                <span>{t("currentStatusColumn")}</span>
                <span>{t("chooseAttendanceColumn")}</span>
              </div>
              <ol className="divide-y">
                {records.map((record) => {
                  const studentName = record.studentName ?? t("studentFallback");
                  return (
                    <li key={record.id} className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(9rem,0.7fr)_minmax(12rem,0.8fr)] lg:items-center lg:px-5 lg:py-4">
                      <div className="min-w-0">
                        <h4 className="font-heading text-sm font-semibold sm:text-base">{studentName}</h4>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{record.studentEmail ?? t("revision", { revision: record.revision })}</p>
                      </div>
                      <div>
                        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">{t("currentStatusColumn")}</span>
                        <Badge variant="outline" className={attendanceStyles[record.state]}>{t(`attendanceStates.${record.state}`)}</Badge>
                      </div>
                      <div>
                        <label htmlFor={`attendance-state-${record.id}`} className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:sr-only">{t("attendanceSelectLabel", { name: studentName })}</label>
                        <select
                          id={`attendance-state-${record.id}`}
                          value={draftStates[record.id] ?? record.state}
                          onChange={(event) => setDraftStates((current) => ({ ...current, [record.id]: event.target.value as AttendanceState }))}
                          className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          <option value="UNKNOWN">{t("selectAttendanceStatus")}</option>
                          {states.filter((state) => state !== "UNKNOWN").map((state) => <option key={state} value={state}>{t(`attendanceStates.${state}`)}</option>)}
                        </select>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs leading-5 text-muted-foreground" aria-live="polite">{changedCount > 0 ? t("attendanceDraftChanged", { count: changedCount }) : t("attendanceDraftUnchanged")}</p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <DialogClose render={<Button type="button" variant="outline" className="min-h-11" />}>{t("closeAttendanceDialogAction")}</DialogClose>
            <Button type="button" className="min-h-11" disabled aria-describedby={pendingId}>{t("saveAttendance")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MonthlyRecap({ summary }: { summary?: AttendanceMonthlySummaryViewModel }) {
  const t = useTranslations("attendance");
  if (!summary) return <EmptyState title={t("recapEmptyTitle")} description={t("recapEmptyBody")} />;
  return <div className="space-y-6"><section className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><ChartPie className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden="true" /><div><h2 className="font-heading text-lg font-semibold">{t("recapTitle")}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("recapBody")}</p></div></div><div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-2"><Button type="button" variant="ghost" size="icon" className="size-11" disabled aria-label={t("previousMonth")}><ChevronLeft className="size-4" /></Button><div className="min-w-32 text-center"><p className="font-heading text-sm font-semibold">{summary.label}</p><p className="text-xs text-muted-foreground">{t("activeMeetingCount", { count: summary.activeMeetingCount })}</p></div><Button type="button" variant="ghost" size="icon" className="size-11" disabled aria-label={t("nextMonth")}><ChevronRight className="size-4" /></Button></div></section><div className="grid gap-6 xl:grid-cols-[minmax(19rem,0.8fr)_minmax(0,1.2fr)]"><AttendanceDonut summary={summary} /><div className="grid gap-3 sm:grid-cols-2"><StateSummaryCards summary={summary} /></div></div><StudentRecapTable summary={summary} /></div>;
}

function AttendanceDonut({ summary }: { summary: AttendanceMonthlySummaryViewModel }) {
  const t = useTranslations("attendance");
  return <section className="rounded-xl border bg-card p-5" aria-labelledby="proportion-title"><h3 id="proportion-title" className="font-heading font-semibold">{t("proportionTitle", { month: summary.label })}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("proportionBody")}</p><div className="mt-5 grid place-items-center"><div className="relative size-56"><svg viewBox="0 0 120 120" className="size-full -rotate-90" role="img" aria-label={t("proportionAria", { count: summary.totalRecords })}><circle cx="60" cy="60" r="44" fill="none" stroke="var(--color-muted)" strokeWidth="16" />{states.map((state, index) => { const percent = summary.totalRecords > 0 ? summary.totals[state] / summary.totalRecords * 100 : 0; const offset = states.slice(0, index).reduce((total, previous) => total + (summary.totalRecords > 0 ? summary.totals[previous] / summary.totalRecords * 100 : 0), 0); return <circle key={state} cx="60" cy="60" r="44" pathLength="100" fill="none" stroke={chartColors[state]} strokeWidth="16" strokeDasharray={`${percent} ${100 - percent}`} strokeDashoffset={-offset} />; })}</svg><div className="pointer-events-none absolute inset-0 grid place-content-center text-center"><span className="font-heading text-3xl font-semibold">{summary.totalRecords}</span><span className="text-xs uppercase tracking-wider text-muted-foreground">{t("totalRecords")}</span></div></div></div><div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2">{states.map((state) => <LegendDot key={state} className={stateDotClass(state)} label={`${t(`attendanceStates.${state}`)} ${summary.totals[state]}`} />)}</div></section>;
}

function StateSummaryCards({ summary }: { summary: AttendanceMonthlySummaryViewModel }) {
  const t = useTranslations("attendance");
  return <>{states.map((state, index) => { const percent = summary.totalRecords > 0 ? Math.round(summary.totals[state] / summary.totalRecords * 100) : 0; return <article key={state} className={`flex min-h-36 flex-col rounded-xl border p-5 ${stateSurface[state]} ${index === states.length - 1 ? "sm:col-span-2" : ""}`}><div className="flex items-start justify-between gap-3"><h3 className="font-heading text-sm font-semibold">{t(`attendanceStates.${state}`)}</h3><span className={`size-3 rounded-full ${stateDotClass(state)}`} aria-hidden="true" /></div><p className="mt-auto font-heading text-3xl font-semibold">{summary.totals[state]}</p><p className="text-xs text-muted-foreground">{t("percentOfTotal", { percent })}</p></article>; })}</>;
}

function StudentRecapTable({ summary }: { summary: AttendanceMonthlySummaryViewModel }) {
  const t = useTranslations("attendance");
  return <section className="overflow-hidden rounded-xl border bg-card" aria-labelledby="student-recap-title"><div className="flex items-start justify-between gap-3 border-b p-5"><div className="flex items-start gap-3"><UsersRound className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" /><div><h3 id="student-recap-title" className="font-heading font-semibold">{t("studentRecapTitle", { month: summary.label })}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("studentRecapBody")}</p></div></div><Badge variant="outline" className="shrink-0">{t("menteeCount", { count: summary.students.length })}</Badge></div><div className="grid gap-3 p-4 md:hidden">{summary.students.map((student) => <article key={student.studentId} className="rounded-xl border bg-muted/20 p-4"><div className="flex items-start justify-between gap-3"><div><h4 className="font-heading text-sm font-semibold">{student.studentName}</h4><p className="mt-1 text-xs text-muted-foreground">{t("recordedMeetings", { count: student.activeMeetingCount - student.counts.UNKNOWN, total: student.activeMeetingCount })}</p></div><Badge variant="outline" className={student.attendancePercent >= 75 ? attendanceStyles.PRESENT : attendanceStyles.ABSENT}>{student.attendancePercent}%</Badge></div><div className="mt-4 grid grid-cols-5 gap-1">{states.map((state) => <div key={state} className="text-center"><p className="text-[10px] text-muted-foreground">{t(`attendanceStateShort.${state}`)}</p><p className="mt-1 text-sm font-semibold">{student.counts[state]}</p></div>)}</div>{student.disciplineLevel ? <Badge variant="outline" className="mt-4 border-destructive/30 bg-destructive/10 text-destructive">{student.disciplineLevel}</Badge> : null}</article>)}</div><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[58rem] text-sm"><thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-5 py-4 font-semibold">{t("studentName")}</th><th className="px-4 py-4 text-center font-semibold">{t("recorded")}</th>{states.map((state) => <th key={state} className="px-3 py-4 text-center font-semibold">{t(`attendanceStateShort.${state}`)}</th>)}<th className="px-4 py-4 text-center font-semibold">{t("attendancePercent")}</th><th className="px-4 py-4 text-center font-semibold">{t("disciplineStatus")}</th></tr></thead><tbody className="divide-y">{summary.students.map((student) => <tr key={student.studentId}><td className="px-5 py-4 font-semibold">{student.studentName}</td><td className="px-4 py-4 text-center tabular-nums">{student.activeMeetingCount - student.counts.UNKNOWN}/{student.activeMeetingCount}</td>{states.map((state) => <td key={state} className="px-3 py-4 text-center"><span className={`inline-grid min-w-8 place-items-center rounded-full px-2 py-1 font-semibold tabular-nums ${attendanceStyles[state]}`}>{student.counts[state]}</span></td>)}<td className="px-4 py-4 text-center"><Badge variant="outline" className={student.attendancePercent >= 75 ? attendanceStyles.PRESENT : attendanceStyles.ABSENT}>{student.attendancePercent}%</Badge></td><td className="px-4 py-4 text-center"><Badge variant="outline" className={student.disciplineLevel ? "border-destructive/30 bg-destructive/10 text-destructive" : attendanceStyles.PRESENT}>{student.disciplineLevel ?? t("normal")}</Badge></td></tr>)}</tbody></table></div></section>;
}

function PermitInbox({ permits, canReview, timeZone }: { permits: PermitViewModel[]; canReview: boolean; timeZone: string }) {
  const t = useTranslations("attendance");
  const [query, setQuery] = useState("");
  const [state, setState] = useState<PermitState | "ALL">("ALL");
  const visible = useMemo(() => permits.filter((permit) => matchesPermit(permit, query, state)), [permits, query, state]);
  return <section className="rounded-xl border bg-card" aria-labelledby="permit-inbox-title"><div className="border-b p-5"><h2 id="permit-inbox-title" className="font-heading font-semibold">{t("permitInboxTitle")}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("permitInboxBody")}</p><div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem]"><div className="relative"><Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" aria-hidden="true" /><Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 pl-9" aria-label={t("permitSearchLabel")} placeholder={t("permitSearchPlaceholder")} /></div><select value={state} onChange={(event) => setState(event.target.value as PermitState | "ALL")} className="h-11 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50" aria-label={t("permitStateFilter")}><option value="ALL">{t("allPermitStates")}</option>{(["PENDING", "APPROVED", "REJECTED", "REVISION_REQUIRED"] as const).map((item) => <option key={item} value={item}>{t(`permitStates.${item}`)}</option>)}</select></div></div>{visible.length === 0 ? <div className="p-5"><EmptyState title={t("permitFilterEmptyTitle")} description={t("permitFilterEmptyBody")} /></div> : <ol className="divide-y">{visible.map((permit) => <PermitCard key={permit.id} permit={permit} timeZone={timeZone} reviewer={canReview} />)}</ol>}</section>;
}

function PermitCard({ permit, timeZone, reviewer }: { permit: PermitViewModel; timeZone: string; reviewer: boolean }) {
  const t = useTranslations("attendance");
  return <li className="p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><h3 className="font-heading text-sm font-semibold">{permit.studentName ?? t(`permitCategories.${permit.category}`)}</h3><p className="mt-1 text-xs text-muted-foreground">{t(`permitCategories.${permit.category}`)} · {formatAttendanceDate(permit.requestedAt, timeZone)} · {t("version", { version: permit.version })}</p>{permit.note ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{permit.note}</p> : null}{permit.decisionReason ? <p className="mt-2 text-sm leading-6"><span className="font-semibold">{t("decisionLabel")}</span> {permit.decisionReason}</p> : null}</div><Badge variant="outline" className={permitStyles[permit.state]}>{t(`permitStates.${permit.state}`)}</Badge></div>{permit.evidence ? <div className="mt-4 flex min-w-0 items-center gap-3 rounded-lg border bg-muted/20 p-3"><FileLock2 className="size-5 shrink-0 text-primary" aria-hidden="true" /><div className="min-w-0"><p className="truncate text-sm font-semibold">{permit.evidence.name}</p><p className="text-xs text-muted-foreground">{t(`fileStates.${permit.evidence.state}`)}</p></div></div> : null}{reviewer && permit.state === "PENDING" ? <div className="mt-4 flex flex-wrap justify-end gap-2" aria-describedby="permit-review-pending"><span id="permit-review-pending" className="mr-auto self-center text-xs leading-5 text-muted-foreground">{t("permitReviewPending")}</span><Button type="button" variant="outline" className="min-h-11" disabled>{t("rejectPermit")}</Button><Button type="button" className="min-h-11" disabled>{t("approvePermit")}</Button></div> : null}</li>;
}

function DisciplineList({ cases, canManage, timeZone }: { cases: DisciplineCaseViewModel[]; canManage: boolean; timeZone: string }) {
  const t = useTranslations("attendance");
  return <section className="rounded-xl border bg-card" aria-labelledby="discipline-manager-title"><div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-start sm:justify-between"><div><h2 id="discipline-manager-title" className="font-heading font-semibold">{t("disciplineTitle")}</h2><p id="discipline-local-scope" className="mt-1 text-sm leading-6 text-muted-foreground">{t("disciplineLocalBody")}</p></div>{canManage ? <Button type="button" variant="destructive" className="min-h-11 self-start" disabled aria-describedby="discipline-local-scope">{t("createDiscipline")}</Button> : null}</div>{cases.length === 0 ? <div className="p-5"><EmptyState title={t("disciplineEmptyTitle")} description={t("disciplineEmptyBody")} /></div> : <ol className="divide-y">{cases.map((item) => <li key={item.id} className="p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h3 className="font-heading text-sm font-semibold">{item.studentName}</h3><p className="mt-1 text-xs text-muted-foreground">{formatAttendanceDate(item.issuedAt, timeZone)} · {t("version", { version: item.version })}</p><p className="mt-3 text-sm leading-6 text-muted-foreground">{item.reason}</p>{item.correctionNote ? <p className="mt-2 text-sm leading-6"><span className="font-semibold">{t("correctionLabel")}</span> {item.correctionNote}</p> : null}</div><div className="flex shrink-0 gap-2"><Badge variant="outline">{item.level}</Badge><Badge variant="outline">{t(`disciplineStates.${item.state}`)}</Badge></div></div></li>)}</ol>}</section>;
}

function LegendDot({ className, label }: { className: string; label: string }) { return <span className="inline-flex items-center gap-1.5"><span className={`size-2.5 rounded-full ${className}`} aria-hidden="true" />{label}</span>; }
function stateDotClass(state: AttendanceState): string { return { PRESENT: "bg-emerald-500", LATE: "bg-amber-500", EXCUSED: "bg-blue-500", ABSENT: "bg-destructive", UNKNOWN: "bg-zinc-400" }[state]; }
function countStates(records: AttendanceRecordViewModel[]): Record<AttendanceState, number> { const counts = { PRESENT: 0, LATE: 0, EXCUSED: 0, ABSENT: 0, UNKNOWN: 0 }; for (const record of records) counts[record.state] += 1; return counts; }
function sumCounts(counts: Record<AttendanceState, number>): number { return states.reduce((total, state) => total + counts[state], 0); }
function dateKey(value: string, timeZone: string): string { const parts = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "2-digit", day: "2-digit", timeZone }).formatToParts(new Date(value)); const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? ""; return `${part("year")}-${part("month")}-${part("day")}`; }
function monthFromIso(value: string, timeZone: string): CalendarMonth { const [year, month] = dateKey(value, timeZone).split("-").map(Number); return { year, month: month - 1 }; }
function shiftMonth(value: CalendarMonth, amount: number): CalendarMonth { const date = new Date(Date.UTC(value.year, value.month + amount, 1)); return { year: date.getUTCFullYear(), month: date.getUTCMonth() }; }
function formatMonth(value: CalendarMonth): string { return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(value.year, value.month, 1))); }
function formatAttendanceDay(value: string, timeZone: string): string { return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone }).format(new Date(value)); }
function calendarCells(value: CalendarMonth): Array<{ day: number; key: string; weekday: number } | null> { const firstWeekday = new Date(Date.UTC(value.year, value.month, 1)).getUTCDay(); const days = new Date(Date.UTC(value.year, value.month + 1, 0)).getUTCDate(); const result: Array<{ day: number; key: string; weekday: number } | null> = Array.from({ length: firstWeekday }, () => null); for (let day = 1; day <= days; day += 1) result.push({ day, key: `${value.year}-${String(value.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`, weekday: new Date(Date.UTC(value.year, value.month, day)).getUTCDay() }); while (result.length % 7 !== 0) result.push(null); return result; }
