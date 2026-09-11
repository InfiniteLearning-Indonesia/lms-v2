import type { components, paths } from "@/lib/api/generated";
import { apiRequest } from "@/lib/api/request";
import type { ClassLifecycleAction, ParticipantRole, ParticipationAction } from "./model";

type ContractPath = keyof paths;
type ClassResponse = components["schemas"]["Class"];
type ParticipationResponse = components["schemas"]["Participation"];
export type CreateClassInput = components["schemas"]["CreateClass"];
export type EditClassInput = components["schemas"]["EditClass"];

const endpoints = {
  classes: "/v3/classes",
  detail: "/v3/classes/{class_id}",
  publish: "/v3/classes/{class_id}/publish",
  close: "/v3/classes/{class_id}/close",
  reopen: "/v3/classes/{class_id}/reopen",
  archive: "/v3/classes/{class_id}/archive",
  participants: "/v3/classes/{class_id}/participants",
  suspend: "/v3/classes/{class_id}/participants/{user_id}/suspend",
  reactivate: "/v3/classes/{class_id}/participants/{user_id}/reactivate",
  end: "/v3/classes/{class_id}/participants/{user_id}/end",
} as const satisfies Record<string, ContractPath>;

export async function createClass(input: CreateClassInput): Promise<ClassResponse> {
  return apiRequest<ClassResponse>(clientPath(endpoints.classes), { method: "POST", body: JSON.stringify(input) });
}

export async function editClass(classId: string, input: EditClassInput): Promise<ClassResponse> {
  return apiRequest<ClassResponse>(classPath(endpoints.detail, classId), { method: "PATCH", body: JSON.stringify(input) });
}

export async function transitionClass(classId: string, action: ClassLifecycleAction, version: number): Promise<ClassResponse> {
  return apiRequest<ClassResponse>(classPath(endpoints[action], classId), { method: "POST", body: JSON.stringify({ version }) });
}

export async function addClassParticipant(classId: string, userId: string, role: ParticipantRole): Promise<ParticipationResponse> {
  return apiRequest<ParticipationResponse>(classPath(endpoints.participants, classId), {
    method: "POST",
    body: JSON.stringify({ user_id: userId, role }),
  });
}

export async function transitionParticipation(
  classId: string,
  userId: string,
  action: ParticipationAction,
): Promise<ParticipationResponse> {
  return apiRequest<ParticipationResponse>(participantPath(endpoints[action], classId, userId), {
    method: "POST",
    body: "{}",
  });
}

function clientPath(contractPath: string): string {
  return contractPath.replace("/v3", "");
}

function classPath(contractPath: string, classId: string): string {
  return clientPath(contractPath).replace("{class_id}", encodeURIComponent(classId));
}

function participantPath(contractPath: string, classId: string, userId: string): string {
  return classPath(contractPath, classId).replace("{user_id}", encodeURIComponent(userId));
}
