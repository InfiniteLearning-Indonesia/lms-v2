export type LogbookReminderState = "DUE" | "DRAFT" | "SUBMITTED" | "REVISION_REQUIRED" | "ACCEPTED";
export type UpcomingAssignmentState = "NOT_STARTED" | "DRAFT" | "SUBMITTED" | "RETURNED" | "LOCKED";

export interface LogbookReminderViewModel {
  id: string;
  periodLabel: string;
  dueAt: string;
  state: LogbookReminderState;
  description?: string;
}

export interface UpcomingAssignmentViewModel {
  id: string;
  title: string;
  dueAt: string;
  cutoffAt?: string;
  state: UpcomingAssignmentState;
  activityType?: string;
}

// UI-facing adapter model. This does not assert that a backend endpoint already exists.
export interface ClassOverviewViewModel {
  classId: string;
  timeZone: string;
  logbookReminders: LogbookReminderViewModel[];
  upcomingAssignments: UpcomingAssignmentViewModel[];
}

export function formatClassDeadline(value: string, timeZone: string, locale = "id-ID"): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(date);
}
