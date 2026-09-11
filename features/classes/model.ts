import type { ActorContext, ClassAccessSummary } from "@/lib/api/types";

export type ParticipantRole = "teacher" | "student";
export type ParticipationState = "ACTIVE" | "SUSPENDED" | "ENDED";
export type ClassLifecycleAction = "publish" | "close" | "reopen" | "archive";
export type ParticipationAction = "suspend" | "reactivate" | "end";

export interface ParticipantHistoryEventViewModel {
  id: string;
  action: "ADDED" | "SUSPENDED" | "REACTIVATED" | "ENDED";
  occurredAt: string;
  actorLabel: string;
}

// UI-facing read model. It does not assert a participant-list endpoint exists.
export interface ClassParticipantViewModel {
  enrollmentId: string;
  userId: string;
  displayName: string;
  email?: string;
  roles: ParticipantRole[];
  state: ParticipationState;
  joinedAt: string;
  history: ParticipantHistoryEventViewModel[];
}

// UI-facing identity candidate. Production must replace this with an owner-scoped search contract.
export interface IdentityCandidateViewModel {
  userId: string;
  displayName: string;
  email: string;
}

export const PARTICIPANT_MANAGE_CAPABILITY = "participants.manage";

export function matchesManagedClass(item: ClassAccessSummary, query: string, state: ClassAccessSummary["state"] | "ALL"): boolean {
  if (state !== "ALL" && item.state !== state) return false;
  const normalized = query.trim().toLocaleLowerCase("id-ID");
  if (!normalized) return true;
  return [item.name, item.program_label, item.cohort_label]
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLocaleLowerCase("id-ID").includes(normalized));
}

export function lifecycleActionsFor(state: ClassAccessSummary["state"]): ClassLifecycleAction[] {
  if (state === "DRAFT") return ["publish", "archive"];
  if (state === "PUBLISHED") return ["close", "archive"];
  if (state === "CLOSED") return ["reopen", "archive"];
  return [];
}

export function matchesParticipant(
  participant: ClassParticipantViewModel,
  query: string,
  role: ParticipantRole | "ALL",
  state: ParticipationState | "ALL",
): boolean {
  if (role !== "ALL" && !participant.roles.includes(role)) return false;
  if (state !== "ALL" && participant.state !== state) return false;
  const normalized = query.trim().toLocaleLowerCase("id-ID");
  if (!normalized) return true;
  return [participant.displayName, participant.email]
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLocaleLowerCase("id-ID").includes(normalized));
}

export function canManageParticipants(activeClass: ClassAccessSummary): boolean {
  return Boolean(activeClass.capabilities?.includes(PARTICIPANT_MANAGE_CAPABILITY));
}

export function assignableParticipantRoles(actor: ActorContext, activeClass: ClassAccessSummary): ParticipantRole[] {
  if (!canManageParticipants(activeClass)) return [];
  if (actor.site_admin) return ["teacher", "student"];
  if (activeClass.contextual_roles?.includes("teacher")) return ["student"];
  return [];
}

export function participationActionsFor(state: ParticipationState): ParticipationAction[] {
  if (state === "ACTIVE") return ["suspend", "end"];
  if (state === "SUSPENDED") return ["reactivate", "end"];
  return [];
}

export function formatParticipantDate(value: string, locale = "id-ID"): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
    timeZoneName: "short",
  }).format(date);
}
