import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { delay, http, HttpResponse } from "msw";
import messages from "@/messages/id.json";
import { ProfileContent } from "@/features/identity/components/profile";
import { ActorSessionProvider } from "@/lib/auth/provider";
import { setCsrfToken } from "@/lib/api/request";
import { actors } from "@/mocks/fixtures";
import { server } from "@/mocks/server";

const navigation = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => navigation }));

afterEach(() => {
  cleanup();
  setCsrfToken(undefined);
  navigation.replace.mockReset();
});

function renderProfile() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Number.POSITIVE_INFINITY } } });
  return render(
    <NextIntlClientProvider locale="id" messages={messages}>
      <QueryClientProvider client={client}>
        <ActorSessionProvider initialActor={actors.student}><ProfileContent /></ActorSessionProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe("FE01 profile and session controls", () => {
  it("keeps unsafe controls disabled while CSRF bootstrap is unavailable", () => {
    renderProfile();
    expect(screen.getByText(/CSRF bootstrap\/refresh/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rotasi session" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Keluar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cabut semua session" })).toBeDisabled();
  });

  it("locks a session command immediately against double click", async () => {
    setCsrfToken("a".repeat(64));
    let requests = 0;
    server.use(http.post("/api/v3/auth/rotate", async () => {
      requests += 1;
      await delay(40);
      return HttpResponse.json({ csrf_token: "b".repeat(64) });
    }));
    renderProfile();
    const button = screen.getByRole("button", { name: "Rotasi session" });
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(requests).toBe(1));
    await waitFor(() => expect(button).toBeEnabled());
  });

  it("shows backend failure and request ID without logging the actor out", async () => {
    setCsrfToken("a".repeat(64));
    server.use(http.post("/api/v3/auth/rotate", () => HttpResponse.json({ error: "UNAVAILABLE" }, { status: 503, headers: { "X-Request-ID": "req-rotate-503" } })));
    renderProfile();
    fireEvent.click(screen.getByRole("button", { name: "Rotasi session" }));
    expect(await screen.findByText(/req-rotate-503/)).toBeInTheDocument();
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("clears the workspace when a session command returns 401", async () => {
    setCsrfToken("a".repeat(64));
    server.use(http.post("/api/v3/auth/rotate", () => HttpResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 })));
    renderProfile();
    fireEvent.click(screen.getByRole("button", { name: "Rotasi session" }));
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/login"));
  });
});
