import { API_BASE_PATH } from "@/lib/config";
import { ApiRequestError, normalizeApiError } from "./errors";
import type { UnsafeMethod } from "./types";

let csrfToken: string | undefined;

export function setCsrfToken(token: string | undefined): void {
  csrfToken = token;
}

export function createIdempotencyKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function isUnsafeMethod(method: string): method is UnsafeMethod {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (isUnsafeMethod(method)) {
    if (csrfToken) headers.set("X-CSRF-Token", csrfToken);
    if (!headers.has("Idempotency-Key")) headers.set("Idempotency-Key", createIdempotencyKey());
  }

  const response = await fetch(`${API_BASE_PATH}${path}`, {
    ...init,
    method,
    headers,
    credentials: "include",
    signal: init.signal,
  });
  const requestId = response.headers.get("X-Request-ID") ?? undefined;
  const text = await response.text();
  let body: unknown;
  try { body = text ? JSON.parse(text) : undefined; } catch { body = undefined; }
  if (!response.ok) throw new ApiRequestError(normalizeApiError(body, response.status, requestId));
  return body as T;
}
