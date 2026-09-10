import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { http, HttpResponse } from "msw";
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

describe("FE01 temporary login boundary", () => {
  it("keeps the temporary login controls disabled and never requests a challenge", async () => {
    let challengeRequests = 0;
    server.use(
      http.post("/api/v3/auth/challenge", () => {
        challengeRequests += 1;
        return HttpResponse.json({ nonce: "opaque-test-nonce" });
      }),
    );

    renderLogin();

    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByLabelText("Password")).toBeDisabled();
    const button = screen.getByRole("button", { name: "Lanjutkan ke Login Aman" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-describedby", "login-integration-note");
    expect(screen.getByText("Login sedang menunggu integrasi identity owner")).toBeInTheDocument();

    fireEvent.click(button);
    fireEvent.submit(button.closest("form")!);
    await Promise.resolve();

    expect(challengeRequests).toBe(0);
  });

  it("skips all disabled login controls and reaches the service status link", async () => {
    const user = userEvent.setup();
    renderLogin();
    const email = screen.getByLabelText("Email");
    const password = screen.getByLabelText("Password");
    const loginButton = screen.getByRole("button", { name: "Lanjutkan ke Login Aman" });
    const serviceStatus = screen.getByRole("link", { name: "Cek Status Layanan LMS" });
    const visited: Element[] = [];

    for (let step = 0; step < 8 && document.activeElement !== serviceStatus; step += 1) {
      await user.tab();
      if (document.activeElement) visited.push(document.activeElement);
    }

    expect(document.activeElement).toBe(serviceStatus);
    expect(visited).not.toContain(email);
    expect(visited).not.toContain(password);
    expect(visited).not.toContain(loginButton);
  });
});
