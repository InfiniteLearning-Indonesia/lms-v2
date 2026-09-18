import { z } from "zod";
import type { ActorContext } from "@/lib/api/types";

const isoDateTime = z.string().datetime({ offset: true });
const evidenceState = z.enum(["VERIFIED", "EVIDENCE_PENDING", "BLOCKED", "UNKNOWN"]);
const migrationEvidenceItemSchema = z.object({
  state: evidenceState,
  summary: z.string().min(1),
  evidenceLabel: z.string().min(1).optional(),
});

export const adminInvitationFormSchema = z.object({
  email: z.string().trim().email("Masukkan alamat email yang valid."),
  purpose: z.string().trim().min(1, "Tujuan invitation wajib diisi.").max(200, "Tujuan maksimal 200 karakter."),
});

export const adminJobSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["REPORT_EXPORT", "MIGRATION_EVIDENCE"]),
  label: z.string().min(1),
  state: z.enum(["queued", "running", "succeeded", "partial", "failed"]),
  progress: z.number().int().min(0).max(100).optional(),
  attempts: z.number().int().nonnegative(),
  updatedAt: isoDateTime,
  retryable: z.boolean(),
  receiptId: z.string().min(1).optional(),
  detail: z.string().min(1).optional(),
});

export const adminUserDirectorySchema = z.object({
  updatedAt: isoDateTime,
  users: z.array(z.object({
    id: z.string().min(1),
    displayName: z.string().min(1),
    email: z.string().email(),
    accountState: z.enum(["ACTIVE", "DISABLED", "LOCKED"]),
    identityState: z.enum(["VERIFIED", "INVITED", "INVITATION_EXPIRED", "PROVISIONING_PENDING"]),
    classCount: z.number().int().nonnegative(),
    version: z.number().int().positive(),
    immutableSubjectLabel: z.string().min(1).optional(),
    lastSeenAt: isoDateTime.optional(),
    history: z.array(z.object({ id: z.string().min(1), label: z.string().min(1), occurredAt: isoDateTime })),
  })),
});

const reportRowSchema = z.record(z.string(), z.union([z.string(), z.number(), z.null()]));

export const adminReportsSchema = z.object({
  updatedAt: isoDateTime,
  reports: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    scopeLabel: z.string().min(1),
    freshness: z.enum(["FRESH", "STALE", "UNAVAILABLE"]),
    watermark: z.string().min(1),
    columns: z.array(z.object({ key: z.string().min(1), label: z.string().min(1) })).min(1),
    rows: z.array(reportRowSchema),
  })).min(1),
  jobs: z.array(adminJobSchema),
});

export const adminAuditSchema = z.object({
  updatedAt: isoDateTime,
  nextCursor: z.string().min(1).optional(),
  events: z.array(z.object({
    id: z.string().min(1),
    occurredAt: isoDateTime,
    actorLabel: z.string().min(1),
    action: z.string().min(1),
    resource: z.string().min(1),
    outcome: z.enum(["SUCCESS", "DENIED", "FAILED"]),
    requestId: z.string().min(1),
    correlationId: z.string().min(1).optional(),
    summary: z.string().min(1),
    redactedFields: z.number().int().nonnegative(),
  })),
});

export const adminMigrationsSchema = z.object({
  updatedAt: isoDateTime,
  maintenance: z.object({
    state: z.enum(["NORMAL", "READ_ONLY", "MAINTENANCE"]),
    detail: z.string().min(1),
  }),
  movedClass: z.object({
    className: z.string().min(1),
    targetLabel: z.string().min(1),
    detail: z.string().min(1),
  }).optional(),
  readiness: z.array(z.object({
    dimension: z.enum(["CODE", "DATA", "OWNERSHIP"]),
    state: evidenceState,
    summary: z.string().min(1),
    evidenceLabel: z.string().min(1),
  })).length(3),
  ownership: z.object({
    writer: z.enum(["LEGACY", "V3", "NONE", "UNKNOWN"]),
    fence: z.enum(["OPEN", "READ_ONLY", "CLOSED", "UNKNOWN"]),
    ownerEpochLabel: z.string().min(1),
  }),
  evidence: z.object({
    preflight: migrationEvidenceItemSchema,
    backup: migrationEvidenceItemSchema,
    mapping: migrationEvidenceItemSchema,
    reconciliation: migrationEvidenceItemSchema,
    quarantine: migrationEvidenceItemSchema,
    rehearsal: migrationEvidenceItemSchema,
    recovery: migrationEvidenceItemSchema,
    fence: migrationEvidenceItemSchema,
    pilot: migrationEvidenceItemSchema,
    wave: migrationEvidenceItemSchema,
    approval: migrationEvidenceItemSchema,
  }),
  units: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    stage: z.enum(["PREFLIGHT", "RECONCILIATION", "QUARANTINED", "APPROVAL_PENDING"]),
    evidence: z.string().min(1),
    unresolvedCount: z.number().int().nonnegative(),
  })),
  jobs: z.array(adminJobSchema),
});

export type AdminJobViewModel = z.infer<typeof adminJobSchema>;
export type AdminUserDirectoryViewModel = z.infer<typeof adminUserDirectorySchema>;
export type AdminReportsViewModel = z.infer<typeof adminReportsSchema>;
export type AdminAuditViewModel = z.infer<typeof adminAuditSchema>;
export type AdminMigrationsViewModel = z.infer<typeof adminMigrationsSchema>;
export type AdminMigrationEvidenceKey = keyof AdminMigrationsViewModel["evidence"];
export type AdminInvitationFormValues = z.infer<typeof adminInvitationFormSchema>;

export function validateAdminInvitationField(field: keyof AdminInvitationFormValues, value: string): true | string {
  const result = adminInvitationFormSchema.shape[field].safeParse(value);
  return result.success ? true : result.error.issues[0]?.message ?? "Nilai tidak valid.";
}

export function canEnterAdminOperations(actor: Pick<ActorContext, "site_capabilities">): boolean {
  return actor.site_capabilities?.includes("site.admin") === true;
}

export function matchesAdminUser(user: AdminUserDirectoryViewModel["users"][number], query: string, accountState: string): boolean {
  const normalized = query.trim().toLocaleLowerCase("id");
  const matchesQuery = !normalized || [user.displayName, user.email].some((value) => value.toLocaleLowerCase("id").includes(normalized));
  return matchesQuery && (accountState === "ALL" || user.accountState === accountState);
}

export function parseAdminPreviewFixtures(input: {
  users: unknown;
  reports: unknown;
  audit: unknown;
  migrations: unknown;
}) {
  return {
    users: adminUserDirectorySchema.parse(input.users),
    reports: adminReportsSchema.parse(input.reports),
    audit: adminAuditSchema.parse(input.audit),
    migrations: adminMigrationsSchema.parse(input.migrations),
  };
}
