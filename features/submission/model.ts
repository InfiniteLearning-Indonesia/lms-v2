import { z } from "zod";

export type SubmissionState = "NOT_STARTED" | "DRAFT" | "SUBMITTED" | "RETURNED" | "GRADED" | "LOCKED";
export type DeadlineState = "UPCOMING" | "DUE_SOON" | "LATE_WINDOW" | "CLOSED";

export interface SubmissionReceiptViewModel {
  code: string;
  submittedAt: string;
  serverRecordedAt: string;
}

export interface SubmissionAttachmentViewModel {
  id: string;
  name: string;
  sizeBytes: number;
  state: "READY" | "SCANNING" | "QUARANTINED" | "REJECTED";
}

export interface SubmissionTimelineEventViewModel {
  id: string;
  type: "DRAFT_SAVED" | "SUBMITTED" | "RETURNED" | "RESUBMITTED" | "GRADED";
  occurredAt: string;
  label?: string;
}

export interface LearnerAssignmentViewModel {
  assignmentId: string;
  activityId: string;
  title: string;
  summary?: string;
  dueAt: string;
  cutoffAt?: string;
  deadlineState: DeadlineState;
  state: SubmissionState;
  currentRevision: number;
  draftText?: string;
  savedAt?: string;
  receipt?: SubmissionReceiptViewModel;
  attachments: SubmissionAttachmentViewModel[];
  timeline: SubmissionTimelineEventViewModel[];
  teacherFeedback?: string;
}

export interface TeacherSubmissionViewModel {
  submissionId: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  state: Exclude<SubmissionState, "NOT_STARTED">;
  deadlineState: DeadlineState;
  currentRevision: number;
  submittedAt?: string;
  excerpt?: string;
  receipt?: SubmissionReceiptViewModel;
  attachments: SubmissionAttachmentViewModel[];
  timeline: SubmissionTimelineEventViewModel[];
}

export interface ClassSubmissionViewModel {
  classId: string;
  timeZone: string;
  updatedAt: string;
  learnerAssignments?: LearnerAssignmentViewModel[];
  teacherInbox?: TeacherSubmissionViewModel[];
}

export interface SubmissionUiPolicy {
  canRead: boolean;
  canReview: boolean;
}

const receiptSchema = z.object({
  code: z.string().min(1).max(200),
  submittedAt: z.string().datetime({ offset: true }),
  serverRecordedAt: z.string().datetime({ offset: true }),
});

const attachmentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(500),
  sizeBytes: z.number().int().nonnegative(),
  state: z.enum(["READY", "SCANNING", "QUARANTINED", "REJECTED"]),
});

const timelineSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["DRAFT_SAVED", "SUBMITTED", "RETURNED", "RESUBMITTED", "GRADED"]),
  occurredAt: z.string().datetime({ offset: true }),
  label: z.string().max(1_000).optional(),
});

const deadlineSchema = z.enum(["UPCOMING", "DUE_SOON", "LATE_WINDOW", "CLOSED"]);
const submissionStateSchema = z.enum(["NOT_STARTED", "DRAFT", "SUBMITTED", "RETURNED", "GRADED", "LOCKED"]);

const learnerAssignmentSchema = z.object({
  assignmentId: z.string().min(1),
  activityId: z.string().min(1),
  title: z.string().min(1).max(500),
  summary: z.string().max(2_000).optional(),
  dueAt: z.string().datetime({ offset: true }),
  cutoffAt: z.string().datetime({ offset: true }).optional(),
  deadlineState: deadlineSchema,
  state: submissionStateSchema,
  currentRevision: z.number().int().nonnegative(),
  draftText: z.string().max(50_000).optional(),
  savedAt: z.string().datetime({ offset: true }).optional(),
  receipt: receiptSchema.optional(),
  attachments: z.array(attachmentSchema).max(50),
  timeline: z.array(timelineSchema).max(100),
  teacherFeedback: z.string().max(10_000).optional(),
});

const teacherSubmissionSchema = z.object({
  submissionId: z.string().min(1),
  assignmentId: z.string().min(1),
  assignmentTitle: z.string().min(1).max(500),
  studentId: z.string().min(1),
  studentName: z.string().min(1).max(500),
  studentEmail: z.string().email().optional(),
  state: z.enum(["DRAFT", "SUBMITTED", "RETURNED", "GRADED", "LOCKED"]),
  deadlineState: deadlineSchema,
  currentRevision: z.number().int().positive(),
  submittedAt: z.string().datetime({ offset: true }).optional(),
  excerpt: z.string().max(10_000).optional(),
  receipt: receiptSchema.optional(),
  attachments: z.array(attachmentSchema).max(50),
  timeline: z.array(timelineSchema).max(100),
});

export const classSubmissionViewModelSchema = z.object({
  classId: z.string().min(1),
  timeZone: z.string().min(1).max(100),
  updatedAt: z.string().datetime({ offset: true }),
  learnerAssignments: z.array(learnerAssignmentSchema).max(500).optional(),
  teacherInbox: z.array(teacherSubmissionSchema).max(5_000).optional(),
}).refine((value) => value.learnerAssignments !== undefined || value.teacherInbox !== undefined, {
  message: "At least one actor-scoped submission projection is required",
});

export function submissionBelongsToClass(model: ClassSubmissionViewModel | undefined, classId: string | undefined): boolean {
  return Boolean(model && classId && model.classId === classId);
}

export function submissionUiPolicy(capabilities?: readonly string[]): SubmissionUiPolicy {
  const allowed = new Set(capabilities ?? []);
  const canRead = allowed.has("submission.read");
  return {
    canRead,
    // Provisional FE04 adapter: replace with canonical M08 review capability when published.
    canReview: canRead && allowed.has("content.manage"),
  };
}

export function matchesTeacherSubmission(
  submission: TeacherSubmissionViewModel,
  query: string,
  state: SubmissionState | "ALL",
  assignmentId: string | "ALL",
): boolean {
  const normalized = query.trim().toLocaleLowerCase("id-ID");
  const textMatches = !normalized || [submission.studentName, submission.studentEmail, submission.assignmentTitle]
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLocaleLowerCase("id-ID").includes(normalized));
  return textMatches && (state === "ALL" || submission.state === state) && (assignmentId === "ALL" || submission.assignmentId === assignmentId);
}

export function formatSubmissionDate(value: string, timeZone: string, locale = "id-ID"): string {
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

export function formatSubmissionFileSize(bytes: number, locale = "id-ID"): string {
  if (bytes < 1_000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(bytes / 1_000)} KB`;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(bytes / 1_000_000)} MB`;
}
