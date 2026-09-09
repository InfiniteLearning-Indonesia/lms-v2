import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { http, HttpResponse, delay } from "msw";
import LoginPage from "@/app/login/page";
import messages from "@/messages/id.json";
import { server } from "@/mocks/server";

function renderLogin() {
  return render(
    <NextIntlClientProvider locale="id" messages={messages}>
      <LoginPage />
    </NextIntlClientProvider>,
  );
}

afterEach(cleanup);

describe("FE00 secure login boundary", () => {
  it("keeps credential fields disabled and sends only an empty challenge request", async () => {
    let challengeRequest: Request | undefined;
    server.use(
      http.post("/api/v3/auth/challenge", ({ request }) => {
        challengeRequest = request;
        return HttpResponse.json({ nonce: "opaque-test-nonce" });
      }),
    );

    renderLogin();

    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByLabelText("Password")).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Lanjutkan ke Login Aman" }));

    expect(await screen.findByText("Integrasi identity owner belum tersedia")).toBeInTheDocument();
    expect(await challengeRequest?.clone().text()).toBe("");
    expect(challengeRequest?.credentials).toBe("include");
    expect(challengeRequest?.headers.get("Authorization")).toBeNull();
    expect(challengeRequest?.url.endsWith("/api/v3/auth/challenge")).toBe(true);
  });

  it("locks the request immediately so a double click creates one challenge", async () => {
    let requests = 0;
    server.use(
      http.post("/api/v3/auth/challenge", async () => {
        requests += 1;
        await delay(40);
        return HttpResponse.json({ nonce: "opaque-test-nonce" });
      }),
    );

    renderLogin();
    const button = screen.getByRole("button", { name: "Lanjutkan ke Login Aman" });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(await screen.findByRole("button", { name: "Menyiapkan login aman…" })).toBeDisabled();
    expect(await screen.findByText("Integrasi identity owner belum tersedia")).toBeInTheDocument();
    expect(requests).toBe(1);
  });

  it.each([
    [401, "Sesi login tidak dapat dimulai"],
    [429, "Terlalu banyak percobaan"],
    [503, "Layanan login sedang tidak tersedia"],
  ])("shows the tailored %s state and request ID", async (status, title) => {
    server.use(
      http.post("/api/v3/auth/challenge", () =>
        HttpResponse.json(
          { code: `HTTP_${status}`, message: "upstream failure" },
          { status, headers: { "X-Request-ID": `req-login-${status}` } },
        ),
      ),
    );

    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: "Lanjutkan ke Login Aman" }));

    expect(await screen.findByText(title)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`ID permintaan: req-login-${status}`))).toBeInTheDocument();
  });

  it("skips disabled credential fields in the keyboard focus order", async () => {
    const user = userEvent.setup();
    renderLogin();
    const email = screen.getByLabelText("Email");
    const password = screen.getByLabelText("Password");
    const loginButton = screen.getByRole("button", { name: "Lanjutkan ke Login Aman" });
    const visited: Element[] = [];

    for (let step = 0; step < 6 && document.activeElement !== loginButton; step += 1) {
      await user.tab();
      if (document.activeElement) visited.push(document.activeElement);
    }

    expect(document.activeElement).toBe(loginButton);
    expect(visited).not.toContain(email);
    expect(visited).not.toContain(password);
  });
});
