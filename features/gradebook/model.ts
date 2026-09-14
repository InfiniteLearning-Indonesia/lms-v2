import { z } from "zod";

export type GradeState = "UNGRADED" | "DRAFT" | "FINAL" | "RELEASED";

export interface RubricCriterionViewModel {
  id: string;
  title: string;
  description?: string;
  maxPoints: number;
}

export interface AiGradeSuggestionViewModel {
  state: "READY" | "FAILED" | "PENDING";
  summary?: string;
  criterionScores?: Record<string, number>;
  modelLabel?: string;
  generatedAt?: string;
  provenanceLabel?: string;
  failureReason?: string;
}

export interface GradeEntryViewModel {
  submissionId: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submissionRevision: number;
  gradeVersion: number;
  state: GradeState;
  criterionScores: Record<string, number>;
  feedback?: string;
  regradeReason?: string;
  releasedAt?: string;
  aiSuggestion?: AiGradeSuggestionViewModel;
}

export interface GradebookAssignmentViewModel {
  assignmentId: string;
  title: string;
  rubricVersion: number;
  maxPoints: number;
  criteria: RubricCriterionViewModel[];
  entries: GradeEntryViewModel[];
}

export interface GradeImportPreviewViewModel {
  previewId: string;
  fileName: string;
  policyVersion: number;
  expiresAt: string;
  validRows: number;
  invalidRows: number;
  unchangedRows: number;
  issues: string[];
}

export interface ClassGradebookViewModel {
  classId: string;
  timeZone: string;
  updatedAt: string;
  assignments: GradebookAssignmentViewModel[];
  importPreview?: GradeImportPreviewViewModel;
}

export interface GradebookUiPolicy {
  canRead: boolean;
  canGrade: boolean;
  canRelease: boolean;
  canImport: boolean;
  canReviewAi: boolean;
}

const criterionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(500),
  description: z.string().max(2_000).optional(),
  maxPoints: z.number().finite().positive(),
});

const suggestionSchema = z.object({
  state: z.enum(["READY", "FAILED", "PENDING"]),
  summary: z.string().max(5_000).optional(),
  criterionScores: z.record(z.string(), z.number().finite().nonnegative()).optional(),
  modelLabel: z.string().max(500).optional(),
  generatedAt: z.string().datetime({ offset: true }).optional(),
  provenanceLabel: z.string().max(1_000).optional(),
  failureReason: z.string().max(2_000).optional(),
});

const gradeEntrySchema = z.object({
  submissionId: z.string().min(1),
  assignmentId: z.string().min(1),
  studentId: z.string().min(1),
  studentName: z.string().min(1).max(500),
  submissionRevision: z.number().int().positive(),
  gradeVersion: z.number().int().nonnegative(),
  state: z.enum(["UNGRADED", "DRAFT", "FINAL", "RELEASED"]),
  criterionScores: z.record(z.string(), z.number().finite().nonnegative()),
  feedback: z.string().max(10_000).optional(),
  regradeReason: z.string().max(2_000).optional(),
  releasedAt: z.string().datetime({ offset: true }).optional(),
  aiSuggestion: suggestionSchema.optional(),
});

const assignmentSchema = z.object({
  assignmentId: z.string().min(1),
  title: z.string().min(1).max(500),
  rubricVersion: z.number().int().positive(),
  maxPoints: z.number().finite().positive(),
  criteria: z.array(criterionSchema).min(1).max(100),
  entries: z.array(gradeEntrySchema).max(5_000),
});

export const classGradebookViewModelSchema = z.object({
  classId: z.string().min(1),
  timeZone: z.string().min(1).max(100),
  updatedAt: z.string().datetime({ offset: true }),
  assignments: z.array(assignmentSchema).max(500),
  importPreview: z.object({
    previewId: z.string().min(1),
    fileName: z.string().min(1).max(500),
    policyVersion: z.number().int().positive(),
    expiresAt: z.string().datetime({ offset: true }),
    validRows: z.number().int().nonnegative(),
    invalidRows: z.number().int().nonnegative(),
    unchangedRows: z.number().int().nonnegative(),
    issues: z.array(z.string().max(1_000)).max(100),
  }).optional(),
});

export function gradebookBelongsToClass(model: ClassGradebookViewModel | undefined, classId: string | undefined): boolean {
  return Boolean(model && classId && model.classId === classId);
}

export function gradebookUiPolicy(capabilities?: readonly string[]): GradebookUiPolicy {
  const allowed = new Set(capabilities ?? []);
  const canRead = allowed.has("gradebook.read");
  // Provisional FE04 adapter: content.manage identifies the author fixture only.
  const canManage = canRead && allowed.has("content.manage");
  return { canRead, canGrade: canManage, canRelease: canManage, canImport: canManage, canReviewAi: canManage };
}

export function gradeTotal(entry: GradeEntryViewModel, assignment: GradebookAssignmentViewModel): number {
  return assignment.criteria.reduce((total, criterion) => total + (entry.criterionScores[criterion.id] ?? 0), 0);
}

export function clampCriterionScore(value: number, maxPoints: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(maxPoints, Math.max(0, value));
}

export function applyAiSuggestion(
  entry: GradeEntryViewModel,
  assignment: GradebookAssignmentViewModel,
): Record<string, number> {
  const suggestion = entry.aiSuggestion?.state === "READY" ? entry.aiSuggestion.criterionScores : undefined;
  if (!suggestion) return { ...entry.criterionScores };
  return Object.fromEntries(assignment.criteria.map((criterion) => [
    criterion.id,
    clampCriterionScore(suggestion[criterion.id] ?? entry.criterionScores[criterion.id] ?? 0, criterion.maxPoints),
  ]));
}

export function formatGradebookDate(value: string, timeZone: string, locale = "id-ID"): string {
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
