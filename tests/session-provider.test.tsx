import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { http, HttpResponse } from "msw";
import { ActorSessionProvider, useActorSession } from "@/lib/auth/provider";
import type { ActorContext } from "@/lib/api/types";
import { actors } from "@/mocks/fixtures";
import { server } from "@/mocks/server";
import messages from "@/messages/id.json";

const navigation = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => navigation }));

afterEach(() => {
  cleanup();
  navigation.replace.mockReset();
  navigation.push.mockReset();
});

function Probe() {
  const { actor, csrfReady, previewMode, rotate } = useActorSession();
  return <div><p>{actor.display_name ?? actor.id}</p><p>{previewMode ? "preview" : "live"}</p><p>{csrfReady ? "csrf-ready" : "csrf-blocked"}</p><button onClick={() => void rotate().catch(() => undefined)}>Rotasi test</button></div>;
}

function renderProvider(client: QueryClient, initialActor?: ActorContext, previewMode = false) {
  return render(
    <NextIntlClientProvider locale="id" messages={messages}>
      <QueryClientProvider client={client}><ActorSessionProvider initialActor={initialActor} previewMode={previewMode}><Probe /></ActorSessionProvider></QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

function queryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Number.POSITIVE_INFINITY } } });
}

describe("FE01 actor session provider", () => {
  it("provides a typed actor to the workspace", () => {
    renderProvider(queryClient(), actors.student);
    expect(screen.getByText("Student Demo")).toBeInTheDocument();
    expect(screen.getByText("live")).toBeInTheDocument();
  });

  it("uses the injected preview actor without calling the identity API", async () => {
    let actorRequests = 0;
    let rotateRequests = 0;
    server.use(http.get("/api/v3/auth/me", () => {
      actorRequests += 1;
      return HttpResponse.json(actors.student);
    }), http.post("/api/v3/auth/rotate", () => {
      rotateRequests += 1;
      return HttpResponse.json({ csrf_token: "a".repeat(64) });
    }));

    renderProvider(queryClient(), actors.teacher, true);
    fireEvent.click(screen.getByRole("button", { name: "Rotasi test" }));
    await Promise.resolve();

    expect(screen.getByText("Pengajar Demo")).toBeInTheDocument();
    expect(screen.getByText("preview")).toBeInTheDocument();
    expect(screen.getByText("csrf-blocked")).toBeInTheDocument();
    expect(actorRequests).toBe(0);
    expect(rotateRequests).toBe(0);
  });

  it("clears sensitive query state and leaves the workspace on 401", async () => {
    const client = queryClient();
    client.setQueryData(["actor", "old", "classes", "secret"], { grade: 100 });
    server.use(http.get("/api/v3/auth/me", () => HttpResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 })));
    renderProvider(client);

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/login"));
    expect(client.getQueryData(["actor", "old", "classes", "secret"])).toBeUndefined();
    expect(screen.queryByText("Student Demo")).not.toBeInTheDocument();
  });

  it("renders 403 with its request ID without treating it as expiry", async () => {
    server.use(http.get("/api/v3/auth/me", () => HttpResponse.json({ error: "FORBIDDEN" }, { status: 403, headers: { "X-Request-ID": "req-actor-403" } })));
    renderProvider(queryClient());

    expect(await screen.findByText(/req-actor-403/)).toBeInTheDocument();
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("fails closed for a disabled account", () => {
    renderProvider(queryClient(), { ...actors.student, account_state: "DISABLED" });
    expect(screen.getByText("Akun tidak aktif")).toBeInTheDocument();
  });
});
