import { z } from "zod";
import type { CompletionOutcome } from "@/features/completion/model";

export type TranscriptState = "DRAFT" | "RELEASED" | "CORRECTED";
export type CredentialState = "NOT_ELIGIBLE" | "ELIGIBLE" | "PENDING_ISSUANCE" | "ISSUED" | "REVOKED" | "SUPERSEDED";
export type VerificationState = "VALID" | "REVOKED" | "SUPERSEDED" | "NOT_FOUND" | "SERVICE_UNAVAILABLE";

export interface TranscriptItemViewModel {
  id: string;
  title: string;
  outcome: CompletionOutcome;
  gradeDisplay?: string;
  releasedAt?: string;
}

export interface TranscriptSnapshotViewModel {
  snapshotId: string;
  version: number;
  state: TranscriptState;
  policyVersion: number;
  provenanceLabel: string;
  releasedAt?: string;
  correctionReason?: string;
  items: TranscriptItemViewModel[];
}

export interface CertificateViewModel {
  state: CredentialState;
  eligible: boolean;
  eligibilityReasons: string[];
  identifier?: string;
  issuedAt?: string;
  revokedAt?: string;
  revokeReason?: string;
  supersededBy?: string;
  verificationCode?: string;
  downloadState: "UNAVAILABLE" | "READY";
}

export interface CredentialSubjectViewModel {
  studentId: string;
  studentName: string;
  self: boolean;
  transcript: TranscriptSnapshotViewModel;
  certificate: CertificateViewModel;
}

export interface ClassCredentialViewModel {
  classId: string;
  timeZone: string;
  updatedAt: string;
  subjects: CredentialSubjectViewModel[];
}

export interface PublicCredentialVerificationViewModel {
  state: VerificationState;
  code: string;
  recipientName?: string;
  className?: string;
  issuedAt?: string;
  revokedAt?: string;
  replacementCode?: string;
}

export interface CredentialUiPolicy {
  canRead: boolean;
  canReleaseTranscript: boolean;
  canIssue: boolean;
  canRevoke: boolean;
  canSupersede: boolean;
}

const outcomeSchema = z.enum(["IN_PROGRESS", "COMPLETED", "PASSED", "NOT_PASSED", "WAIVED", "REOPENED"]);
const transcriptSchema = z.object({
  snapshotId: z.string().min(1),
  version: z.number().int().positive(),
  state: z.enum(["DRAFT", "RELEASED", "CORRECTED"]),
  policyVersion: z.number().int().positive(),
  provenanceLabel: z.string().min(1).max(1_000),
  releasedAt: z.string().datetime({ offset: true }).optional(),
  correctionReason: z.string().max(2_000).optional(),
  items: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1).max(500),
    outcome: outcomeSchema,
    gradeDisplay: z.string().max(200).optional(),
    releasedAt: z.string().datetime({ offset: true }).optional(),
  })).max(1_000),
});

const certificateSchema = z.object({
  state: z.enum(["NOT_ELIGIBLE", "ELIGIBLE", "PENDING_ISSUANCE", "ISSUED", "REVOKED", "SUPERSEDED"]),
  eligible: z.boolean(),
  eligibilityReasons: z.array(z.string().min(1).max(1_000)).max(100),
  identifier: z.string().max(500).optional(),
  issuedAt: z.string().datetime({ offset: true }).optional(),
  revokedAt: z.string().datetime({ offset: true }).optional(),
  revokeReason: z.string().max(2_000).optional(),
  supersededBy: z.string().max(500).optional(),
  verificationCode: z.string().max(500).optional(),
  downloadState: z.enum(["UNAVAILABLE", "READY"]),
});

export const classCredentialViewModelSchema = z.object({
  classId: z.string().min(1),
  timeZone: z.string().min(1).max(100),
  updatedAt: z.string().datetime({ offset: true }),
  subjects: z.array(z.object({
    studentId: z.string().min(1),
    studentName: z.string().min(1).max(500),
    self: z.boolean(),
    transcript: transcriptSchema,
    certificate: certificateSchema,
  })).max(5_000),
});

export const publicCredentialVerificationSchema = z.object({
  state: z.enum(["VALID", "REVOKED", "SUPERSEDED", "NOT_FOUND", "SERVICE_UNAVAILABLE"]),
  code: z.string().min(1).max(500),
  recipientName: z.string().max(500).optional(),
  className: z.string().max(500).optional(),
  issuedAt: z.string().datetime({ offset: true }).optional(),
  revokedAt: z.string().datetime({ offset: true }).optional(),
  replacementCode: z.string().max(500).optional(),
});

export function credentialBelongsToClass(model: ClassCredentialViewModel | undefined, classId: string | undefined): boolean {
  return Boolean(model && classId && model.classId === classId);
}

export function credentialUiPolicy(capabilities?: readonly string[]): CredentialUiPolicy {
  const allowed = new Set(capabilities ?? []);
  const canRead = allowed.has("credentials.read");
  // Provisional FE05 adapter: replace with distinct M10 lifecycle capabilities.
  const canManage = canRead && allowed.has("content.manage");
  return { canRead, canReleaseTranscript: canManage, canIssue: canManage, canRevoke: canManage, canSupersede: canManage };
}

export function formatCredentialDate(value: string, timeZone: string, locale = "id-ID"): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(date);
}
