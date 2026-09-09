import type { ApiError } from "./types";

const statusCodes = new Set([401, 403, 404, 409, 413, 422, 429, 503]);

export function normalizeApiError(value: unknown, status = 0, requestId?: string): ApiError {
  if (typeof value === "object" && value !== null) {
    const body = value as Record<string, unknown>;
    const code = typeof body.code === "string" ? body.code : statusCodes.has(status) ? `HTTP_${status}` : "UNKNOWN_ERROR";
    return {
      code,
      message: typeof body.message === "string" ? body.message : "Terjadi kendala. Coba lagi.",
      request_id: typeof body.request_id === "string" ? body.request_id : requestId,
      field_errors: isFieldErrors(body.field_errors) ? body.field_errors : undefined,
      current_version: typeof body.current_version === "number" ? body.current_version : undefined,
      retry_after_seconds: typeof body.retry_after_seconds === "number" ? body.retry_after_seconds : undefined,
      details: body.details,
      status,
    };
  }
  return { code: status ? `HTTP_${status}` : "UNKNOWN_ERROR", message: "Terjadi kendala. Coba lagi.", request_id: requestId, status };
}

function isFieldErrors(value: unknown): value is Record<string, string[]> {
  return typeof value === "object" && value !== null && Object.values(value).every((item) => Array.isArray(item));
}

export class ApiRequestError extends Error {
  constructor(public readonly apiError: ApiError) {
    super(apiError.message);
    this.name = "ApiRequestError";
  }
}

export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof ApiRequestError)) return error instanceof TypeError;
  return [408, 425, 429, 502, 503, 504].includes(error.apiError.status) && error.apiError.code !== "CONFLICT";
}
