import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CredentialsContent } from "@/features/credential/components/credentials-content";
import type { ClassCredentialViewModel } from "@/features/credential/model";
import { ClassContextProvider } from "@/features/workspace/context";
import { ActorSessionProvider } from "@/lib/auth/provider";
import type { ClassAccessSummary } from "@/lib/api/types";
import messages from "@/messages/id.json";
import { actors, classCredentials, classes } from "@/mocks/fixtures";

const navigation = vi.hoisted(() => ({ pathname: "/app/classes/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb/credentials", replace: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname, useRouter: () => navigation }));

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function renderCredentials({ activeClass = classes.published, model = classCredentials.student[classes.published.id], missing = false }: { activeClass?: ClassAccessSummary; model?: ClassCredentialViewModel; missing?: boolean } = {}) {
  navigation.pathname = `/app/classes/${activeClass.id}/credentials`;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Number.POSITIVE_INFINITY } } });
  return render(<NextIntlClientProvider locale="id" messages={messages}><QueryClientProvider client={client}><ActorSessionProvider initialActor={activeClass.id === classes.draft.id ? actors.teacher : actors.student} previewMode><ClassContextProvider initialClasses={[activeClass]} previewMode><CredentialsContent initialCredential={missing ? undefined : model} /></ClassContextProvider></ActorSessionProvider></QueryClientProvider></NextIntlClientProvider>);
}

describe("FE05 credentials UI", () => {
  it("keeps an in-progress Student ineligible without fabricating issuance or download", () => {
    renderCredentials();
    expect(screen.getByRole("heading", { level: 1, name: "Transkrip & Sertifikat" })).toBeInTheDocument();
    expect(screen.getByText("Snapshot v1")).toBeInTheDocument();
    expect(screen.getByText("Outcome Class masih berjalan.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unduh sertifikat" })).toBeDisabled();
    expect(screen.queryByRole("link", { name: "Buka verifikasi publik" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Terbitkan sertifikat" })).not.toBeInTheDocument();
  });

  it("lets Teacher inspect correction state while all lifecycle commands stay disabled", async () => {
    const user = userEvent.setup();
    renderCredentials({ activeClass: classes.draft, model: classCredentials.teacher[classes.draft.id] });
    await user.selectOptions(screen.getByLabelText("Pilih Student"), "student-arya");
    expect(screen.getByText("Transcript memiliki correction")).toBeInTheDocument();
    expect(screen.getByText("Dibuka kembali")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rilis transkrip" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Terbitkan sertifikat" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cabut sertifikat" })).toBeDisabled();
    await user.selectOptions(screen.getByLabelText("Pilih Student"), "student-salsa");
    expect(screen.getByText("IL-CERT-DRAFT-000012")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Buka verifikasi publik" })).toHaveAttribute("href", "/certificate/verify/IL-PE26-SALSA-0012");
  });

  it("shows production dependency and foreign Class states", () => {
    const { unmount } = renderCredentials({ missing: true });
    expect(screen.getByRole("heading", { name: "Transkrip dan sertifikat menunggu backend" })).toBeInTheDocument();
    expect(screen.queryByText("IL-CERT-DRAFT-000012")).not.toBeInTheDocument();
    unmount();
    renderCredentials({ model: classCredentials.teacher[classes.draft.id] });
    expect(screen.getByRole("heading", { name: "Kredensial tidak tersedia untuk Class ini" })).toBeInTheDocument();
    expect(screen.queryByText("Nabila Sari")).not.toBeInTheDocument();
  });

  it("requires credentials.read capability", () => {
    renderCredentials({ activeClass: { ...classes.published, capabilities: ["class.read"] } });
    expect(screen.getByRole("heading", { name: "Akses tidak tersedia" })).toBeInTheDocument();
  });
});
