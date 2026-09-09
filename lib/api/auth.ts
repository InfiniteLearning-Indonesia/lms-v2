import type { components, paths } from "./generated";
import { apiRequest } from "./request";

export type AuthChallenge = components["schemas"]["Challenge"];
const authChallengeContractPath = "/v3/auth/challenge" satisfies keyof paths;
const authChallengeBrowserPath = authChallengeContractPath.slice("/v3".length);

/**
 * Starts the only browser auth operation currently frozen in the v3 contract.
 * The nonce remains an opaque server concern and must not be persisted or put
 * into a URL by the frontend.
 */
export function requestAuthChallenge(): Promise<AuthChallenge> {
  return apiRequest<AuthChallenge>(authChallengeBrowserPath, { method: "POST" });
}
