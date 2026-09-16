import "server-only";

import type { ClassParticipantViewModel, IdentityCandidateViewModel } from "@/features/classes/model";
import type { ActorContext, ClassAccessSummary } from "@/lib/api/types";
import type { ClassOverviewViewModel } from "@/features/workspace/overview";
import type { ClassLearningViewModel } from "@/features/learning/model";
import type { ClassSubmissionViewModel } from "@/features/submission/model";
import type { ClassGradebookViewModel } from "@/features/gradebook/model";
import type { ClassCompletionViewModel } from "@/features/completion/model";
import type { ClassCredentialViewModel, PublicCredentialVerificationViewModel } from "@/features/credential/model";
import type { ClassAttendanceViewModel } from "@/features/attendance/model";
import type { ClassLogbookViewModel } from "@/features/logbook/model";

export interface DevelopmentPreview {
  actor: ActorContext;
  classes: ClassAccessSummary[];
  classOverviews: Record<string, ClassOverviewViewModel>;
  classLearning: Record<string, ClassLearningViewModel>;
  classSubmissions: Record<string, ClassSubmissionViewModel>;
  classGradebooks: Record<string, ClassGradebookViewModel>;
  classCompletions: Record<string, ClassCompletionViewModel>;
  classCredentials: Record<string, ClassCredentialViewModel>;
  classAttendances: Record<string, ClassAttendanceViewModel>;
  classLogbooks: Record<string, ClassLogbookViewModel>;
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

  const { actors, classes, classOverviews, classLearning, classSubmissions, classGradebooks, classCompletions, classCredentials, classAttendances, classLogbooks, classParticipants, identityCandidates } = await import("@/mocks/fixtures");
  const scopedClasses = classesForActor(requestedActor, classes);
  return {
    actor: actors[requestedActor],
    classes: scopedClasses,
    classOverviews: overviewForActor(requestedActor, classOverviews),
    classLearning: learningForClasses(scopedClasses, classLearning),
    classSubmissions: submissionForActor(requestedActor, scopedClasses, classSubmissions),
    classGradebooks: gradebookForActor(requestedActor, scopedClasses, classGradebooks),
    classCompletions: completionForActor(requestedActor, scopedClasses, classCompletions),
    classCredentials: credentialForActor(requestedActor, scopedClasses, classCredentials),
    classAttendances: attendanceForActor(requestedActor, scopedClasses, classAttendances),
    classLogbooks: logbookForActor(requestedActor, scopedClasses, classLogbooks),
    adminClasses: requestedActor === "siteAdmin" ? scopedClasses : undefined,
    classParticipants: participantsForClasses(scopedClasses, classParticipants),
    identityCandidates: canPreviewIdentityDirectory(requestedActor) ? identityCandidates : undefined,
  };
}

function attendanceForActor(
  actorName: PreviewActorName,
  scopedClasses: ClassAccessSummary[],
  attendances: typeof import("@/mocks/fixtures")["classAttendances"],
): Record<string, ClassAttendanceViewModel> {
  const projection = actorName === "student"
    ? attendances.student
    : actorName === "teacher" || actorName === "teacherStudent"
      ? attendances.teacher
      : {};
  return Object.fromEntries(scopedClasses.flatMap((item) => projection[item.id] ? [[item.id, projection[item.id]]] : []));
}

function logbookForActor(
  actorName: PreviewActorName,
  scopedClasses: ClassAccessSummary[],
  logbooks: typeof import("@/mocks/fixtures")["classLogbooks"],
): Record<string, ClassLogbookViewModel> {
  const projection = actorName === "student"
    ? logbooks.student
    : actorName === "teacher" || actorName === "teacherStudent"
      ? logbooks.teacher
      : {};
  return Object.fromEntries(scopedClasses.flatMap((item) => projection[item.id] ? [[item.id, projection[item.id]]] : []));
}

export async function getDevelopmentCredentialVerification(code: string): Promise<PublicCredentialVerificationViewModel | undefined> {
  if (process.env.NODE_ENV !== "development" || process.env.LMS_DEV_PREVIEW !== "true") return undefined;
  const { publicCredentialVerifications } = await import("@/mocks/fixtures");
  const verifications: Record<string, PublicCredentialVerificationViewModel> = publicCredentialVerifications;
  return verifications[code];
}

function submissionForActor(
  actorName: PreviewActorName,
  scopedClasses: ClassAccessSummary[],
  submissions: typeof import("@/mocks/fixtures")["classSubmissions"],
): Record<string, ClassSubmissionViewModel> {
  const projection = actorName === "student"
    ? submissions.student
    : actorName === "teacher" || actorName === "teacherStudent"
      ? submissions.teacher
      : {};
  return Object.fromEntries(scopedClasses.flatMap((item) => projection[item.id] ? [[item.id, projection[item.id]]] : []));
}

function gradebookForActor(
  actorName: PreviewActorName,
  scopedClasses: ClassAccessSummary[],
  gradebooks: typeof import("@/mocks/fixtures")["classGradebooks"],
): Record<string, ClassGradebookViewModel> {
  const projection = actorName === "teacher" || actorName === "teacherStudent" ? gradebooks.teacher : {};
  return Object.fromEntries(scopedClasses.flatMap((item) => projection[item.id] ? [[item.id, projection[item.id]]] : []));
}

function completionForActor(
  actorName: PreviewActorName,
  scopedClasses: ClassAccessSummary[],
  completions: typeof import("@/mocks/fixtures")["classCompletions"],
): Record<string, ClassCompletionViewModel> {
  const projection = actorName === "student"
    ? completions.student
    : actorName === "teacher" || actorName === "teacherStudent"
      ? completions.teacher
      : {};
  return Object.fromEntries(scopedClasses.flatMap((item) => projection[item.id] ? [[item.id, projection[item.id]]] : []));
}

function credentialForActor(
  actorName: PreviewActorName,
  scopedClasses: ClassAccessSummary[],
  credentials: typeof import("@/mocks/fixtures")["classCredentials"],
): Record<string, ClassCredentialViewModel> {
  const projection = actorName === "student"
    ? credentials.student
    : actorName === "teacher" || actorName === "teacherStudent"
      ? credentials.teacher
      : {};
  return Object.fromEntries(scopedClasses.flatMap((item) => projection[item.id] ? [[item.id, projection[item.id]]] : []));
}

function learningForClasses(
  scopedClasses: ClassAccessSummary[],
  learning: Record<string, ClassLearningViewModel>,
): Record<string, ClassLearningViewModel> {
  return Object.fromEntries(
    scopedClasses.flatMap((item) => learning[item.id] ? [[item.id, learning[item.id]]] : []),
  );
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
    const operationalCapabilities = new Set([
      "attendance.read",
      "attendance.manage",
      "permit.create",
      "permit.review",
      "discipline.read",
      "discipline.manage",
      "logbook.read",
      "logbook.write",
      "logbook.review",
      "mentoring.read",
    ]);
    return Object.values(classes).map((item) => ({
      ...item,
      contextual_roles: [],
      enrollment_state: "ACTIVE",
      capabilities: Array.from(new Set([
        ...(item.capabilities ?? []).filter((capability) => !operationalCapabilities.has(capability)),
        "class.read",
        "class.manage",
        "participants.read",
        "participants.manage",
      ])),
    }));
  }
  return Object.values(classes);
}
