import { z } from "zod";

export const LOGBOOK_READ_CAPABILITY = "logbook.read";
export const LOGBOOK_WRITE_CAPABILITY = "logbook.write";
export const LOGBOOK_REVIEW_CAPABILITY = "logbook.review";
export const MENTORING_READ_CAPABILITY = "mentoring.read";

export type LogbookPeriodState = "UPCOMING" | "OPEN" | "CLOSED";
export type LogbookEntryState = "DRAFT" | "SUBMITTED" | "REVISION_REQUIRED" | "ACCEPTED";

export interface LogbookPeriodViewModel {
  id: string;
  label: string;
  startsAt: string;
  dueAt: string;
  state: LogbookPeriodState;
}

export interface LogbookEntryViewModel {
  id: string;
  periodId: string;
  state: LogbookEntryState;
  revision: number;
  activitySummary?: string;
  reflection?: string;
  savedAt?: string;
  submittedAt?: string;
  feedback?: string;
  reviewedAt?: string;
}

export interface LogbookReviewViewModel extends LogbookEntryViewModel {
  studentId: string;
  studentName: string;
  mentorName: string;
}

export interface MentorAssignmentViewModel {
  id: string;
  mentorId: string;
  mentorName: string;
  startsAt: string;
  endsAt?: string;
  reason?: string;
}

export interface GroupContextViewModel {
  id: string;
  name: string;
  memberCount: number;
}

export interface LogbookLearnerProjection {
  studentId: string;
  entries: LogbookEntryViewModel[];
  mentorHistory: MentorAssignmentViewModel[];
  group?: GroupContextViewModel;
}

export interface LogbookReviewerProjection {
  reviewInbox: LogbookReviewViewModel[];
  mentorHistory: MentorAssignmentViewModel[];
  groups: GroupContextViewModel[];
}

export interface ClassLogbookViewModel {
  classId: string;
  timeZone: string;
  updatedAt: string;
  periods: LogbookPeriodViewModel[];
  learner?: LogbookLearnerProjection;
  reviewer?: LogbookReviewerProjection;
}

export interface LogbookUiPolicy {
  canRead: boolean;
  canWrite: boolean;
  canReview: boolean;
  canReadMentoring: boolean;
}

const periodSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(500),
  startsAt: z.string().datetime({ offset: true }),
  dueAt: z.string().datetime({ offset: true }),
  state: z.enum(["UPCOMING", "OPEN", "CLOSED"]),
});

const entrySchema = z.object({
  id: z.string().min(1),
  periodId: z.string().min(1),
  state: z.enum(["DRAFT", "SUBMITTED", "REVISION_REQUIRED", "ACCEPTED"]),
  revision: z.number().int().positive(),
  activitySummary: z.string().max(20_000).optional(),
  reflection: z.string().max(20_000).optional(),
  savedAt: z.string().datetime({ offset: true }).optional(),
  submittedAt: z.string().datetime({ offset: true }).optional(),
  feedback: z.string().max(20_000).optional(),
  reviewedAt: z.string().datetime({ offset: true }).optional(),
});

const reviewSchema = entrySchema.extend({
  studentId: z.string().min(1),
  studentName: z.string().min(1).max(500),
  mentorName: z.string().min(1).max(500),
});

const mentorSchema = z.object({
  id: z.string().min(1),
  mentorId: z.string().min(1),
  mentorName: z.string().min(1).max(500),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }).optional(),
  reason: z.string().max(2_000).optional(),
});

const groupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(500),
  memberCount: z.number().int().nonnegative(),
});

export const classLogbookViewModelSchema = z.object({
  classId: z.string().min(1),
  timeZone: z.string().min(1).max(100),
  updatedAt: z.string().datetime({ offset: true }),
  periods: z.array(periodSchema).max(1_000),
  learner: z.object({
    studentId: z.string().min(1),
    entries: z.array(entrySchema).max(1_000),
    mentorHistory: z.array(mentorSchema).max(1_000),
    group: groupSchema.optional(),
  }).optional(),
  reviewer: z.object({
    reviewInbox: z.array(reviewSchema).max(10_000),
    mentorHistory: z.array(mentorSchema).max(10_000),
    groups: z.array(groupSchema).max(1_000),
  }).optional(),
}).refine((value) => value.learner !== undefined || value.reviewer !== undefined, {
  message: "At least one actor-scoped logbook projection is required",
});

export function logbookBelongsToClass(model: ClassLogbookViewModel | undefined, classId: string | undefined): boolean {
  return Boolean(model && classId && model.classId === classId);
}

export function logbookUiPolicy(capabilities?: readonly string[]): LogbookUiPolicy {
  const allowed = new Set(capabilities ?? []);
  return {
    canRead: allowed.has(LOGBOOK_READ_CAPABILITY),
    canWrite: allowed.has(LOGBOOK_WRITE_CAPABILITY),
    canReview: allowed.has(LOGBOOK_REVIEW_CAPABILITY),
    canReadMentoring: allowed.has(MENTORING_READ_CAPABILITY),
  };
}

export function matchesLogbookReview(review: LogbookReviewViewModel, query: string, state: LogbookEntryState | "ALL"): boolean {
  if (state !== "ALL" && review.state !== state) return false;
  const normalized = query.trim().toLocaleLowerCase("id-ID");
  if (!normalized) return true;
  return [review.studentName, review.mentorName, review.activitySummary]
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLocaleLowerCase("id-ID").includes(normalized));
}

export function formatLogbookDate(value: string, timeZone: string, locale = "id-ID"): string {
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
