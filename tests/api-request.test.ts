import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/mocks/server";
import { apiRequest, setCsrfToken } from "@/lib/api/request";
import { ApiRequestError } from "@/lib/api/errors";

describe("same-origin API request boundary", () => {
  it("sends credentials, CSRF, and one idempotency key without Authorization", async () => {
    setCsrfToken("csrf-test");
    let request: Request | undefined;
    server.use(http.post("/api/v3/test", ({ request: incoming }) => { request = incoming; return HttpResponse.json({ ok: true }); }));
    await apiRequest<{ ok: boolean }>("/test", { method: "POST", body: "{}" });
    expect(request?.credentials).toBe("include");
    expect(request?.headers.get("X-CSRF-Token")).toBe("csrf-test");
    expect(request?.headers.get("Idempotency-Key")).toMatch(/^[a-f0-9]{32}$/);
    expect(request?.headers.get("Idempotency-Key")).toMatch(/^[a-f0-9]{32}$/);
    expect(request?.headers.get("Authorization")).toBeNull();
  });

  it("normalizes structured conflict errors", async () => {
    server.use(http.patch("/api/v3/test", () => HttpResponse.json({ code: "VERSION_CONFLICT", message: "changed", current_version: 2 }, { status: 409, headers: { "X-Request-ID": "req-1" } })));
    await expect(apiRequest("/test", { method: "PATCH", body: "{}" })).rejects.toMatchObject({ apiError: { code: "VERSION_CONFLICT", status: 409, request_id: "req-1" } });
    try { await apiRequest("/test", { method: "PATCH", body: "{}" }); } catch (error) { expect(error).toBeInstanceOf(ApiRequestError); }
  });
});
