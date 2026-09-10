import type { components, paths } from "@/lib/api/generated";
import { apiRequest, setCsrfToken } from "@/lib/api/request";
import type { ActorContext } from "@/lib/api/types";
import { actorContextSchema } from "@/features/contracts/schemas";
import { ApiRequestError } from "@/lib/api/errors";

type ContractPath = keyof paths;
type Credential = components["schemas"]["Credential"];
type Status = components["schemas"]["Status"];

const endpoints = {
  actor: "/v3/auth/me",
  rotate: "/v3/auth/rotate",
  logout: "/v3/auth/logout",
  revokeAll: "/v3/auth/revoke-all",
} as const satisfies Record<string, ContractPath>;

export async function getActor(): Promise<ActorContext> {
  const response = await apiRequest<unknown>(endpoints.actor.replace("/v3", ""));
  const parsed = actorContextSchema.safeParse(response);
  if (!parsed.success) throw invalidContractResponse("Actor");
  return parsed.data;
}

export async function rotateSession(): Promise<Credential> {
  const credential = await apiRequest<Credential>(endpoints.rotate.replace("/v3", ""), {
    method: "POST",
    body: "{}",
  });
  setCsrfToken(credential.csrf_token);
  return credential;
}

export async function logoutSession(): Promise<Status> {
  const status = await apiRequest<Status>(endpoints.logout.replace("/v3", ""), {
    method: "POST",
    body: "{}",
  });
  setCsrfToken(undefined);
  return status;
}

export async function revokeAllSessions(): Promise<Status> {
  const status = await apiRequest<Status>(endpoints.revokeAll.replace("/v3", ""), {
    method: "POST",
    body: "{}",
  });
  setCsrfToken(undefined);
  return status;
}

function invalidContractResponse(resource: string): ApiRequestError {
  return new ApiRequestError({
    code: "CONTRACT_RESPONSE_INVALID",
    message: `Respons ${resource} tidak sesuai kontrak.`,
    status: 502,
  });
}
