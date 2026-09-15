import { z } from "zod";

export type EvidenceState = "SATISFIED" | "MISSING" | "WAIVED" | "NOT_APPLICABLE";
export type ActivityCompletionState = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "WAIVED" | "REOPENED";
export type CompletionOutcome = "IN_PROGRESS" | "COMPLETED" | "PASSED" | "NOT_PASSED" | "WAIVED" | "REOPENED";

export interface CompletionEvidenceViewModel {
  id: string;
  label: string;
  description?: string;
  state: EvidenceState;
  recordedAt?: string;
  provenanceLabel?: string;
}

export interface ActivityCompletionViewModel {
  activityId: string;
  title: string;
  state: ActivityCompletionState;
  outcome?: CompletionOutcome;
  reason?: string;
  completedAt?: string;
  evidences: CompletionEvidenceViewModel[];
}

export interface CompletionSectionViewModel {
  sectionId: string;
  title: string;
  activities: ActivityCompletionViewModel[];
}

export interface LearnerCompletionViewModel {
  studentId: string;
  studentName: string;
  policyVersion: number;
  outcomeVersion: number;
  outcome: CompletionOutcome;
  progressPercent: number;
  satisfiedEvidence: number;
  requiredEvidence: number;
  outcomeReason?: string;
  correctedAt?: string;
  sections: CompletionSectionViewModel[];
}

export interface ClassCompletionViewModel {
  classId: string;
  timeZone: string;
  updatedAt: string;
  learnerProgress?: LearnerCompletionViewModel;
  teacherRoster?: LearnerCompletionViewModel[];
}

export interface CompletionUiPolicy {
  canRead: boolean;
  canManageOutcome: boolean;
  canOverride: boolean;
  canReopen: boolean;
}

const evidenceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(500),
  description: z.string().max(2_000).optional(),
  state: z.enum(["SATISFIED", "MISSING", "WAIVED", "NOT_APPLICABLE"]),
  recordedAt: z.string().datetime({ offset: true }).optional(),
  provenanceLabel: z.string().max(1_000).optional(),
});

const activitySchema = z.object({
  activityId: z.string().min(1),
  title: z.string().min(1).max(500),
  state: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "WAIVED", "REOPENED"]),
  outcome: z.enum(["IN_PROGRESS", "COMPLETED", "PASSED", "NOT_PASSED", "WAIVED", "REOPENED"]).optional(),
  reason: z.string().max(2_000).optional(),
  completedAt: z.string().datetime({ offset: true }).optional(),
  evidences: z.array(evidenceSchema).max(100),
});

const learnerSchema = z.object({
  studentId: z.string().min(1),
  studentName: z.string().min(1).max(500),
  policyVersion: z.number().int().positive(),
  outcomeVersion: z.number().int().nonnegative(),
  outcome: z.enum(["IN_PROGRESS", "COMPLETED", "PASSED", "NOT_PASSED", "WAIVED", "REOPENED"]),
  progressPercent: z.number().finite().min(0).max(100),
  satisfiedEvidence: z.number().int().nonnegative(),
  requiredEvidence: z.number().int().nonnegative(),
  outcomeReason: z.string().max(2_000).optional(),
  correctedAt: z.string().datetime({ offset: true }).optional(),
  sections: z.array(z.object({
    sectionId: z.string().min(1),
    title: z.string().min(1).max(500),
    activities: z.array(activitySchema).max(500),
  })).max(200),
}).refine((value) => value.satisfiedEvidence <= value.requiredEvidence, {
  message: "Satisfied evidence cannot exceed required evidence",
  path: ["satisfiedEvidence"],
});

export const classCompletionViewModelSchema = z.object({
  classId: z.string().min(1),
  timeZone: z.string().min(1).max(100),
  updatedAt: z.string().datetime({ offset: true }),
  learnerProgress: learnerSchema.optional(),
  teacherRoster: z.array(learnerSchema).max(5_000).optional(),
}).refine((value) => (value.learnerProgress === undefined) !== (value.teacherRoster === undefined), {
  message: "Exactly one actor-scoped completion projection is required",
});

export function completionBelongsToClass(model: ClassCompletionViewModel | undefined, classId: string | undefined): boolean {
  return Boolean(model && classId && model.classId === classId);
}

export function completionUiPolicy(capabilities?: readonly string[]): CompletionUiPolicy {
  const allowed = new Set(capabilities ?? []);
  const canRead = allowed.has("progress.read");
  // Provisional FE05 adapter: replace with canonical M10 capabilities when published.
  const canManage = canRead && allowed.has("content.manage");
  return { canRead, canManageOutcome: canManage, canOverride: canManage, canReopen: canManage };
}

export function matchesLearnerCompletion(
  learner: LearnerCompletionViewModel,
  query: string,
  outcome: CompletionOutcome | "ALL",
): boolean {
  const normalized = query.trim().toLocaleLowerCase("id-ID");
  const matchesQuery = !normalized || learner.studentName.toLocaleLowerCase("id-ID").includes(normalized);
  return matchesQuery && (outcome === "ALL" || learner.outcome === outcome);
}

export function activityCount(learner: LearnerCompletionViewModel): number {
  return learner.sections.reduce((total, section) => total + section.activities.length, 0);
}

export function completedActivityCount(learner: LearnerCompletionViewModel): number {
  return learner.sections.reduce((total, section) => total + section.activities.filter((activity) => activity.state === "COMPLETED" || activity.state === "WAIVED").length, 0);
}

export function formatCompletionDate(value: string, timeZone: string, locale = "id-ID"): string {
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
