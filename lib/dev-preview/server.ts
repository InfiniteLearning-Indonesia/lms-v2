import "server-only";

import type { ActorContext, ClassAccessSummary } from "@/lib/api/types";
import type { ClassOverviewViewModel } from "@/features/workspace/overview";

export interface DevelopmentPreview {
  actor: ActorContext;
  classes: ClassAccessSummary[];
  classOverviews: Record<string, ClassOverviewViewModel>;
}

const actorNames = ["student", "teacher", "teacherStudent", "facilitator", "siteAdmin"] as const;
type PreviewActorName = (typeof actorNames)[number];

export async function getDevelopmentPreview(): Promise<DevelopmentPreview | undefined> {
  if (process.env.NODE_ENV !== "development" || process.env.LMS_DEV_PREVIEW !== "true") return undefined;

  const requestedActor = process.env.LMS_DEV_PREVIEW_ACTOR ?? "student";
  if (!isPreviewActorName(requestedActor)) {
    throw new Error(`LMS_DEV_PREVIEW_ACTOR harus salah satu dari: ${actorNames.join(", ")}`);
  }

  const { actors, classes, classOverviews } = await import("@/mocks/fixtures");
  return {
    actor: actors[requestedActor],
    classes: classesForActor(requestedActor, classes),
    classOverviews: overviewForActor(requestedActor, classOverviews),
  };
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
  return Object.values(classes);
}
