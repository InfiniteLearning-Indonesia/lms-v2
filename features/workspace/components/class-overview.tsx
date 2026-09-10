"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  Layers3,
  LockKeyhole,
  NotebookPen,
  Unplug,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui-v3/states";
import { useClassContext } from "../context";
import {
  formatClassDeadline,
  type LogbookReminderState,
  type UpcomingAssignmentState,
} from "../overview";

export function ClassOverviewContent() {
  const { activeClass, activeClassOverview } = useClassContext();
  const locale = useLocale();
  const t = useTranslations("classOverview");
  if (!activeClass) return null;

  const canReadLearning = activeClass.capabilities?.includes("content.read") ?? false;
  const canReadAssignments = canReadLearning && (activeClass.capabilities?.includes("submission.read") ?? false);
  const canReadLogbook = activeClass.capabilities?.includes("logbook.read") ?? false;
  const roleLabels = activeClass.contextual_roles?.map((role) => t(`roles.${role}`)).join(" · ") || t("notAvailable");
  const classStatus = t(`states.${activeClass.state}`);
  const enrollmentStatus = activeClass.enrollment_state ? t(`enrollment.${activeClass.enrollment_state}`) : t("notAvailable");

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-brand-purple-hover to-brand-purple px-5 py-6 text-primary-foreground shadow-sm sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">
            <GraduationCap aria-hidden="true" />
            {t("roleView", { role: roleLabels })}
          </Badge>
          <Badge className="border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">{classStatus}</Badge>
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-brand-yellow">{t("eyebrow")}</p>
        <h1 className="mt-2 max-w-4xl font-heading text-2xl font-semibold tracking-tight sm:text-3xl">{activeClass.name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-primary-foreground/80">{t("summaryDescription")}</p>
        <dl className="mt-6 grid gap-3 border-t border-primary-foreground/15 pt-5 sm:grid-cols-2">
          <ClassMeta label={t("programLabel")} value={activeClass.program_label ?? t("notAvailable")} />
          <ClassMeta label={t("cohortLabel")} value={activeClass.cohort_label ?? t("notAvailable")} />
        </dl>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,1fr)]">
        <div className="min-w-0 space-y-6">
          <section aria-labelledby="learning-entry-title">
            <div className="mb-3">
              <h2 id="learning-entry-title" className="font-heading text-lg font-semibold">{t("learningTitle")}</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{t("learningSectionDescription")}</p>
            </div>
            {canReadLearning ? (
              <Link
                href={`/app/classes/${activeClass.id}/learning`}
                aria-label={t("openLearning")}
                className="group flex min-h-20 items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-[border-color,background-color,box-shadow] duration-200 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <BookOpenCheck className="size-6" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading font-semibold">{t("openLearning")}</span>
                  <span className="mt-1 block text-sm leading-5 text-muted-foreground">{t("learningDescription")}</span>
                </span>
                <ArrowRight className="size-5 shrink-0 text-primary transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            ) : (
              <EmptyState title={t("learningUnavailableTitle")} description={t("learningUnavailableBody")} />
            )}
          </section>

          <section aria-labelledby="upcoming-tasks-title">
            <div className="mb-3">
              <h2 id="upcoming-tasks-title" className="flex items-center gap-2 font-heading text-lg font-semibold">
                <ClipboardList className="size-5 text-primary" aria-hidden="true" />
                {t("upcomingTasksTitle")}
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{t("upcomingTasksDescription")}</p>
            </div>
            <Card>
              <CardContent>
                {!canReadAssignments ? (
                  <OverviewPanelState icon={LockKeyhole} title={t("tasksUnavailableTitle")} description={t("tasksUnavailableBody")} />
                ) : !activeClassOverview ? (
                  <OverviewPanelState icon={Unplug} title={t("tasksPendingTitle")} description={t("tasksPendingBody")} />
                ) : activeClassOverview.upcomingAssignments.length === 0 ? (
                  <OverviewPanelState icon={CheckCircle2} title={t("noUpcomingTasksTitle")} description={t("noUpcomingTasksBody")} />
                ) : (
                  <ul className="space-y-3" aria-label={t("upcomingTasksTitle")}>
                    {activeClassOverview.upcomingAssignments.map((assignment) => (
                      <li key={assignment.id}>
                        <Link
                          href={`/app/classes/${activeClass.id}/learning`}
                          aria-label={t("openTask", { title: assignment.title })}
                          className="group/item flex min-h-24 items-center gap-3 rounded-xl border bg-background p-4 transition-[border-color,background-color] duration-200 hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:gap-4"
                        >
                          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-brand-yellow/20 text-amber-900 dark:text-brand-yellow">
                            <ClipboardList className="size-5" aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-start justify-between gap-2">
                              <span className="min-w-0 font-heading font-semibold leading-5">{assignment.title}</span>
                              <Badge variant="outline" className={assignmentStateClass(assignment.state)}>
                                {t(`assignmentStates.${assignment.state}`)}
                              </Badge>
                            </span>
                            {assignment.activityType ? (
                              <span className="mt-1 block text-xs text-muted-foreground">{assignment.activityType}</span>
                            ) : null}
                            <span className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                              <CalendarClock className="size-3.5 shrink-0" aria-hidden="true" />
                              <time dateTime={assignment.dueAt}>
                                {t("deadline", { date: formatClassDeadline(assignment.dueAt, activeClassOverview.timeZone, locale) })}
                              </time>
                            </span>
                          </span>
                          <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover/item:translate-x-0.5 group-hover/item:text-primary" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        <aside className="min-w-0 space-y-6">
          <section aria-labelledby="logbook-reminders-title">
            <div className="mb-3">
              <h2 id="logbook-reminders-title" className="flex items-center gap-2 font-heading text-lg font-semibold">
                <NotebookPen className="size-5 text-primary" aria-hidden="true" />
                {t("logbookRemindersTitle")}
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{t("logbookRemindersDescription")}</p>
            </div>
            <Card className={canReadLogbook && activeClassOverview?.logbookReminders.length ? "ring-amber-500/30" : undefined}>
              <CardContent>
                {!canReadLogbook ? (
                  <OverviewPanelState icon={LockKeyhole} title={t("logbookUnavailableTitle")} description={t("logbookUnavailableBody")} />
                ) : !activeClassOverview ? (
                  <OverviewPanelState icon={Unplug} title={t("logbookPendingTitle")} description={t("logbookPendingBody")} />
                ) : activeClassOverview.logbookReminders.length === 0 ? (
                  <OverviewPanelState icon={CheckCircle2} title={t("noLogbookRemindersTitle")} description={t("noLogbookRemindersBody")} />
                ) : (
                  <ul className="space-y-3" aria-label={t("logbookRemindersTitle")}>
                    {activeClassOverview.logbookReminders.map((reminder) => (
                      <li key={reminder.id}>
                        <Link
                          href={`/app/classes/${activeClass.id}/logbook`}
                          aria-label={t("openLogbookReminder", { title: reminder.periodLabel })}
                          className="group/item flex min-h-24 items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 transition-[border-color,background-color] duration-200 hover:border-amber-500/60 hover:bg-amber-500/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-brand-yellow/25 text-amber-900 dark:text-brand-yellow">
                            <NotebookPen className="size-5" aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-start justify-between gap-2">
                              <span className="font-heading font-semibold leading-5">{reminder.periodLabel}</span>
                              <Badge variant="outline" className={logbookStateClass(reminder.state)}>
                                {t(`logbookStates.${reminder.state}`)}
                              </Badge>
                            </span>
                            {reminder.description ? (
                              <span className="mt-1 block text-xs leading-5 text-muted-foreground">{reminder.description}</span>
                            ) : null}
                            <span className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                              <CalendarClock className="size-3.5 shrink-0" aria-hidden="true" />
                              <time dateTime={reminder.dueAt}>
                                {t("deadline", { date: formatClassDeadline(reminder.dueAt, activeClassOverview.timeZone, locale) })}
                              </time>
                            </span>
                          </span>
                          <ChevronRight className="mt-3 size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover/item:translate-x-0.5 group-hover/item:text-primary" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader className="border-b">
              <CardTitle id="class-information-title" className="flex items-center gap-2">
                <Layers3 className="size-5 text-primary" aria-hidden="true" />
                {t("classInformationTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y">
                <InformationRow label={t("classStatusLabel")} value={classStatus} />
                <InformationRow label={t("enrollmentLabel")} value={enrollmentStatus} />
                <InformationRow label={t("roleLabel")} value={roleLabels} />
              </dl>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function OverviewPanelState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex min-h-28 items-start gap-3 rounded-xl border border-dashed bg-muted/20 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 pt-0.5">
        <h3 className="font-heading font-semibold leading-5">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function ClassMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-primary-foreground/65">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-primary-foreground">{value}</dd>
    </div>
  );
}

function InformationRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] text-right text-sm font-semibold">{value}</dd>
    </div>
  );
}

function assignmentStateClass(state: UpcomingAssignmentState): string {
  if (state === "SUBMITTED") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200";
  if (state === "RETURNED") return "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200";
  if (state === "DRAFT") return "border-blue-500/40 bg-blue-500/10 text-blue-800 dark:text-blue-200";
  return "border-border bg-muted text-foreground";
}

function logbookStateClass(state: LogbookReminderState): string {
  if (state === "ACCEPTED") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200";
  if (state === "REVISION_REQUIRED" || state === "DUE") return "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200";
  if (state === "SUBMITTED") return "border-blue-500/40 bg-blue-500/10 text-blue-800 dark:text-blue-200";
  return "border-border bg-muted text-foreground";
}
