import { afterEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { getActor, logoutSession, revokeAllSessions, rotateSession } from "@/lib/auth/api";
import { hasCsrfToken, setCsrfToken } from "@/lib/api/request";
import { server } from "@/mocks/server";

afterEach(() => setCsrfToken(undefined));

describe("FE01 cookie session transport", () => {
  it("bootstraps the actor with cookies and without Authorization", async () => {
    let observed: Request | undefined;
    server.use(http.get("/api/v3/auth/me", ({ request }) => {
      observed = request;
      return HttpResponse.json({ id: "actor-test", site_admin: false });
    }));

    await expect(getActor()).resolves.toMatchObject({ id: "actor-test" });
    expect(observed?.credentials).toBe("include");
    expect(observed?.headers.get("Authorization")).toBeNull();
  });

  it("fails closed when the actor response violates the canonical boundary", async () => {
    server.use(http.get("/api/v3/auth/me", () => HttpResponse.json({ site_admin: false })));
    await expect(getActor()).rejects.toMatchObject({ apiError: { code: "CONTRACT_RESPONSE_INVALID", status: 502 } });
  });

  it("rotates with memory-only CSRF and adopts the replacement CSRF", async () => {
    setCsrfToken("a".repeat(64));
    let observed: Request | undefined;
    server.use(http.post("/api/v3/auth/rotate", ({ request }) => {
      observed = request;
      return HttpResponse.json({ csrf_token: "b".repeat(64) });
    }));

    await rotateSession();
    expect(observed?.credentials).toBe("include");
    expect(observed?.headers.get("X-CSRF-Token")).toBe("a".repeat(64));
    expect(observed?.headers.get("Authorization")).toBeNull();

    let replacementHeader: string | null = null;
    server.use(http.post("/api/v3/auth/logout", ({ request }) => {
      replacementHeader = request.headers.get("X-CSRF-Token");
      return HttpResponse.json({ status: "revoked" });
    }));
    await logoutSession();
    expect(replacementHeader).toBe("b".repeat(64));
    expect(hasCsrfToken()).toBe(false);
  });

  it("clears memory-only CSRF after revoke-all", async () => {
    setCsrfToken("c".repeat(64));
    await revokeAllSessions();
    expect(hasCsrfToken()).toBe(false);
  });
});
