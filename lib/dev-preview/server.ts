import "server-only";

import type { ClassParticipantViewModel, IdentityCandidateViewModel } from "@/features/classes/model";
import type { ActorContext, ClassAccessSummary } from "@/lib/api/types";
import type { ClassOverviewViewModel } from "@/features/workspace/overview";

export interface DevelopmentPreview {
  actor: ActorContext;
  classes: ClassAccessSummary[];
  classOverviews: Record<string, ClassOverviewViewModel>;
  adminClasses?: ClassAccessSummary[];
  classParticipants: Record<string, ClassParticipantViewModel[]>;
  identityCandidates?: IdentityCandidateViewModel[];
}

const actorNames = ["student", "teacher", "teacherStudent", "facilitator", "siteAdmin"] as const;
type PreviewActorName = (typeof actorNames)[number];

export async function getDevelopmentPreview(): Promise<DevelopmentPreview | undefined> {
  if (process.env.NODE_ENV !== "development" || process.env.LMS_DEV_PREVIEW !== "true") return undefined;

  const requestedActor = process.env.LMS_DEV_PREVIEW_ACTOR ?? "student";
  if (!isPreviewActorName(requestedActor)) {
    throw new Error(`LMS_DEV_PREVIEW_ACTOR harus salah satu dari: ${actorNames.join(", ")}`);
  }

  const { actors, classes, classOverviews, classParticipants, identityCandidates } = await import("@/mocks/fixtures");
  const scopedClasses = classesForActor(requestedActor, classes);
  return {
    actor: actors[requestedActor],
    classes: scopedClasses,
    classOverviews: overviewForActor(requestedActor, classOverviews),
    adminClasses: requestedActor === "siteAdmin" ? scopedClasses : undefined,
    classParticipants: participantsForClasses(scopedClasses, classParticipants),
    identityCandidates: canPreviewIdentityDirectory(requestedActor) ? identityCandidates : undefined,
  };
}

function canPreviewIdentityDirectory(actorName: PreviewActorName): boolean {
  return actorName === "siteAdmin" || actorName === "teacher" || actorName === "teacherStudent";
}

function participantsForClasses(
  scopedClasses: ClassAccessSummary[],
  participants: Record<string, ClassParticipantViewModel[]>,
): Record<string, ClassParticipantViewModel[]> {
  return Object.fromEntries(
    scopedClasses.map((item) => [item.id, participants[item.id] ?? []]),
  );
}

function overviewForActor(
  actorName: PreviewActorName,
  overviews: Record<string, ClassOverviewViewModel>,
): Record<string, ClassOverviewViewModel> {
  if (actorName === "student" || actorName === "teacherStudent") return overviews;
  return {};
}

function isPreviewActorName(value: string): value is PreviewActorName {
  return actorNames.some((name) => name === value);
}

function classesForActor(
  actorName: PreviewActorName,
  classes: typeof import("@/mocks/fixtures")["classes"],
): ClassAccessSummary[] {
  if (actorName === "student") return [classes.published, classes.archived];
  if (actorName === "teacher") return [classes.draft, classes.closed];
  if (actorName === "facilitator") {
    return [{
      ...classes.published,
      contextual_roles: ["facilitator"],
      capabilities: ["class.read", "participants.read", "progress.read", "attendance.read"],
      next_actions: ["Tinjau progres cohort"],
    }];
  }
  if (actorName === "siteAdmin") {
    return Object.values(classes).map((item) => ({
      ...item,
      contextual_roles: [],
      enrollment_state: "ACTIVE",
      capabilities: Array.from(new Set([
        ...(item.capabilities ?? []),
        "class.read",
        "class.manage",
        "participants.read",
        "participants.manage",
      ])),
    }));
  }
  return Object.values(classes);
}
