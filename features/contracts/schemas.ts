import { z } from "zod";

export const actorFixtureSchema = z.object({ id: z.string().min(1), display_name: z.string().min(1), site_admin: z.boolean(), account_state: z.enum(["ACTIVE", "DISABLED", "LOCKED"]) });
export const classFixtureSchema = z.object({ id: z.string().min(1), name: z.string().min(1), state: z.enum(["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"]), version: z.number().int().positive() });
export const classOverviewFixtureSchema = z.object({
  classId: z.string().min(1),
  timeZone: z.string().min(1),
  logbookReminders: z.array(z.object({
    id: z.string().min(1),
    periodLabel: z.string().min(1),
    dueAt: z.string().datetime({ offset: true }),
    state: z.enum(["DUE", "DRAFT", "SUBMITTED", "REVISION_REQUIRED", "ACCEPTED"]),
    description: z.string().optional(),
  })),
  upcomingAssignments: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    dueAt: z.string().datetime({ offset: true }),
    cutoffAt: z.string().datetime({ offset: true }).optional(),
    state: z.enum(["NOT_STARTED", "DRAFT", "SUBMITTED", "RETURNED", "LOCKED"]),
    activityType: z.string().optional(),
  })),
});
export const classParticipantFixtureSchema = z.object({
  enrollmentId: z.string().min(1),
  userId: z.string().regex(/^[a-f0-9]{32}$/),
  displayName: z.string().min(1),
  email: z.string().email().optional(),
  roles: z.array(z.enum(["teacher", "student"])).min(1),
  state: z.enum(["ACTIVE", "SUSPENDED", "ENDED"]),
  joinedAt: z.string().datetime({ offset: true }),
  history: z.array(z.object({
    id: z.string().min(1),
    action: z.enum(["ADDED", "SUSPENDED", "REACTIVATED", "ENDED"]),
    occurredAt: z.string().datetime({ offset: true }),
    actorLabel: z.string().min(1),
  })),
});
export const identityCandidateFixtureSchema = z.object({
  userId: z.string().regex(/^[a-f0-9]{32}$/),
  displayName: z.string().min(1),
  email: z.string().email(),
});

export const actorContextSchema = z.object({
  id: z.string().min(1),
  site_admin: z.boolean().optional(),
  display_name: z.string().min(1).optional(),
  account_state: z.enum(["ACTIVE", "DISABLED", "LOCKED"]).optional(),
  site_capabilities: z.array(z.string().min(1)).optional(),
  session_expires_at: z.string().datetime().optional(),
}).passthrough();

export const classAccessSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  program_label: z.string().optional(),
  cohort_label: z.string().optional(),
  state: z.enum(["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"]),
  version: z.number().int().positive(),
  contextual_roles: z.array(z.enum(["teacher", "student", "facilitator", "mentor"])).optional(),
  capabilities: z.array(z.string().min(1)).optional(),
  enrollment_state: z.enum(["ACTIVE", "SUSPENDED", "ENDED"]).optional(),
  next_actions: z.array(z.string()).optional(),
}).passthrough();

export function assertFixture<T>(schema: z.ZodType<T>, fixture: unknown): T { return schema.parse(fixture); }
