/** Runtime configuration for the v3 boundary. */
export const API_BASE_PATH = "/api/v3" as const;

/** Server-only upstream origin. Never import this from client components. */
export function getUpstreamApiOrigin(): string {
  const origin = process.env.LMS_API_ORIGIN;
  if (!origin) {
    throw new Error("LMS_API_ORIGIN is required by the v3 server transport");
  }
  return origin.replace(/\/$/, "");
}

/** @deprecated Legacy source compatibility; v3 uses the same-origin boundary. */
export const API_BASE_URL = API_BASE_PATH;
