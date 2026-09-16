import { z } from "zod";

export const ATTENDANCE_READ_CAPABILITY = "attendance.read";
export const ATTENDANCE_MANAGE_CAPABILITY = "attendance.manage";
export const PERMIT_CREATE_CAPABILITY = "permit.create";
export const PERMIT_REVIEW_CAPABILITY = "permit.review";
export const DISCIPLINE_READ_CAPABILITY = "discipline.read";
export const DISCIPLINE_MANAGE_CAPABILITY = "discipline.manage";

export type MeetingState = "SCHEDULED" | "COMPLETED" | "CANCELLED";
export type AttendanceState = "PRESENT" | "LATE" | "EXCUSED" | "ABSENT" | "UNKNOWN";
export type PermitState = "PENDING" | "APPROVED" | "REJECTED" | "REVISION_REQUIRED";
export type DisciplineState = "ACTIVE" | "CORRECTED" | "RESOLVED";

export interface AttendanceMeetingViewModel {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  state: MeetingState;
  deliveryLabel?: string;
}

export interface AttendanceRecordViewModel {
  id: string;
  meetingId: string;
  state: AttendanceState;
  revision: number;
  recordedAt?: string;
  correctedAt?: string;
  reason?: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
}

export interface PermitEvidenceViewModel {
  id: string;
  name: string;
  state: "READY" | "SCANNING" | "QUARANTINED" | "REJECTED";
}

export interface PermitViewModel {
  id: string;
  meetingId: string;
  category: "MEDICAL" | "PERSONAL" | "OTHER";
  state: PermitState;
  requestedAt: string;
  note?: string;
  studentId?: string;
  studentName?: string;
  evidence?: PermitEvidenceViewModel;
  decisionReason?: string;
  decidedAt?: string;
  version: number;
}

export interface DisciplineCaseViewModel {
  id: string;
  studentId: string;
  studentName: string;
  level: "SP1" | "SP2" | "SP3";
  state: DisciplineState;
  issuedAt: string;
  reason: string;
  version: number;
  resolvedAt?: string;
  correctionNote?: string;
}

export interface AttendanceLearnerProjection {
  studentId: string;
  records: AttendanceRecordViewModel[];
  permits: PermitViewModel[];
  disciplineCases: DisciplineCaseViewModel[];
}

export interface MeetingRosterViewModel {
  meetingId: string;
  records: AttendanceRecordViewModel[];
}

export interface StudentAttendanceMonthlySummaryViewModel {
  studentId: string;
  studentName: string;
  activeMeetingCount: number;
  counts: Record<AttendanceState, number>;
  attendancePercent: number;
  disciplineLevel?: "SP1" | "SP2" | "SP3";
}

export interface AttendanceMonthlySummaryViewModel {
  month: string;
  label: string;
  activeMeetingCount: number;
  totalRecords: number;
  totals: Record<AttendanceState, number>;
  students: StudentAttendanceMonthlySummaryViewModel[];
}

export interface AttendanceManagerProjection {
  rosters: MeetingRosterViewModel[];
  permitInbox: PermitViewModel[];
  disciplineCases: DisciplineCaseViewModel[];
  monthlySummary?: AttendanceMonthlySummaryViewModel;
}

export interface ClassAttendanceViewModel {
  classId: string;
  timeZone: string;
  updatedAt: string;
  meetings: AttendanceMeetingViewModel[];
  learner?: AttendanceLearnerProjection;
  manager?: AttendanceManagerProjection;
}

export interface AttendanceUiPolicy {
  canRead: boolean;
  canManageRecords: boolean;
  canCreatePermit: boolean;
  canReviewPermit: boolean;
  canReadDiscipline: boolean;
  canManageDiscipline: boolean;
}

const meetingSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(500),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }),
  state: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]),
  deliveryLabel: z.string().max(500).optional(),
});

const attendanceRecordSchema = z.object({
  id: z.string().min(1),
  meetingId: z.string().min(1),
  state: z.enum(["PRESENT", "LATE", "EXCUSED", "ABSENT", "UNKNOWN"]),
  revision: z.number().int().positive(),
  recordedAt: z.string().datetime({ offset: true }).optional(),
  correctedAt: z.string().datetime({ offset: true }).optional(),
  reason: z.string().max(2_000).optional(),
  studentId: z.string().min(1).optional(),
  studentName: z.string().min(1).max(500).optional(),
  studentEmail: z.string().email().max(320).optional(),
});

const permitEvidenceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(500),
  state: z.enum(["READY", "SCANNING", "QUARANTINED", "REJECTED"]),
});

const permitSchema = z.object({
  id: z.string().min(1),
  meetingId: z.string().min(1),
  category: z.enum(["MEDICAL", "PERSONAL", "OTHER"]),
  state: z.enum(["PENDING", "APPROVED", "REJECTED", "REVISION_REQUIRED"]),
  requestedAt: z.string().datetime({ offset: true }),
  note: z.string().max(5_000).optional(),
  studentId: z.string().min(1).optional(),
  studentName: z.string().min(1).max(500).optional(),
  evidence: permitEvidenceSchema.optional(),
  decisionReason: z.string().max(5_000).optional(),
  decidedAt: z.string().datetime({ offset: true }).optional(),
  version: z.number().int().positive(),
});

const disciplineCaseSchema = z.object({
  id: z.string().min(1),
  studentId: z.string().min(1),
  studentName: z.string().min(1).max(500),
  level: z.enum(["SP1", "SP2", "SP3"]),
  state: z.enum(["ACTIVE", "CORRECTED", "RESOLVED"]),
  issuedAt: z.string().datetime({ offset: true }),
  reason: z.string().min(1).max(5_000),
  version: z.number().int().positive(),
  resolvedAt: z.string().datetime({ offset: true }).optional(),
  correctionNote: z.string().max(5_000).optional(),
});

const attendanceCountsSchema = z.object({
  PRESENT: z.number().int().nonnegative(),
  LATE: z.number().int().nonnegative(),
  EXCUSED: z.number().int().nonnegative(),
  ABSENT: z.number().int().nonnegative(),
  UNKNOWN: z.number().int().nonnegative(),
});

const monthlySummarySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  label: z.string().min(1).max(100),
  activeMeetingCount: z.number().int().nonnegative(),
  totalRecords: z.number().int().nonnegative(),
  totals: attendanceCountsSchema,
  students: z.array(z.object({
    studentId: z.string().min(1),
    studentName: z.string().min(1).max(500),
    activeMeetingCount: z.number().int().nonnegative(),
    counts: attendanceCountsSchema,
    attendancePercent: z.number().min(0).max(100),
    disciplineLevel: z.enum(["SP1", "SP2", "SP3"]).optional(),
  })).max(10_000),
});

export const classAttendanceViewModelSchema = z.object({
  classId: z.string().min(1),
  timeZone: z.string().min(1).max(100),
  updatedAt: z.string().datetime({ offset: true }),
  meetings: z.array(meetingSchema).max(1_000),
  learner: z.object({
    studentId: z.string().min(1),
    records: z.array(attendanceRecordSchema).max(1_000),
    permits: z.array(permitSchema).max(1_000),
    disciplineCases: z.array(disciplineCaseSchema).max(1_000),
  }).optional(),
  manager: z.object({
    rosters: z.array(z.object({ meetingId: z.string().min(1), records: z.array(attendanceRecordSchema).max(10_000) })).max(1_000),
    permitInbox: z.array(permitSchema).max(10_000),
    disciplineCases: z.array(disciplineCaseSchema).max(10_000),
    monthlySummary: monthlySummarySchema.optional(),
  }).optional(),
}).refine((value) => value.learner !== undefined || value.manager !== undefined, {
  message: "At least one actor-scoped attendance projection is required",
});

export function attendanceBelongsToClass(model: ClassAttendanceViewModel | undefined, classId: string | undefined): boolean {
  return Boolean(model && classId && model.classId === classId);
}

export function attendanceUiPolicy(capabilities?: readonly string[]): AttendanceUiPolicy {
  const allowed = new Set(capabilities ?? []);
  return {
    canRead: allowed.has(ATTENDANCE_READ_CAPABILITY),
    canManageRecords: allowed.has(ATTENDANCE_MANAGE_CAPABILITY),
    canCreatePermit: allowed.has(PERMIT_CREATE_CAPABILITY),
    canReviewPermit: allowed.has(PERMIT_REVIEW_CAPABILITY),
    canReadDiscipline: allowed.has(DISCIPLINE_READ_CAPABILITY),
    canManageDiscipline: allowed.has(DISCIPLINE_MANAGE_CAPABILITY),
  };
}

export function findMeetingRoster(model: ClassAttendanceViewModel, meetingId: string): AttendanceRecordViewModel[] {
  return model.manager?.rosters.find((roster) => roster.meetingId === meetingId)?.records ?? [];
}

export function matchesPermit(permit: PermitViewModel, query: string, state: PermitState | "ALL"): boolean {
  if (state !== "ALL" && permit.state !== state) return false;
  const normalized = query.trim().toLocaleLowerCase("id-ID");
  if (!normalized) return true;
  return [permit.studentName, permit.note]
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLocaleLowerCase("id-ID").includes(normalized));
}

export function formatAttendanceDate(value: string, timeZone: string, locale = "id-ID"): string {
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
