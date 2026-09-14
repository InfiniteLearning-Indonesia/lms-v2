import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GradebookContent } from "@/features/gradebook/components/gradebook-content";
import type { ClassGradebookViewModel } from "@/features/gradebook/model";
import { ClassContextProvider } from "@/features/workspace/context";
import { ActorSessionProvider } from "@/lib/auth/provider";
import type { ClassAccessSummary } from "@/lib/api/types";
import messages from "@/messages/id.json";
import { actors, classes, classGradebooks } from "@/mocks/fixtures";

const navigation = vi.hoisted(() => ({ pathname: "/app/classes/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/gradebook", replace: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname, useRouter: () => navigation }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderGradebook({ activeClass = classes.draft, model = classGradebooks.teacher[classes.draft.id], missing = false }: { activeClass?: ClassAccessSummary; model?: ClassGradebookViewModel; missing?: boolean } = {}) {
  navigation.pathname = `/app/classes/${activeClass.id}/gradebook`;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Number.POSITIVE_INFINITY } } });
  return render(<NextIntlClientProvider locale="id" messages={messages}><QueryClientProvider client={client}><ActorSessionProvider initialActor={actors.teacher} previewMode><ClassContextProvider initialClasses={[activeClass]} previewMode><GradebookContent initialGradebook={missing ? undefined : model} /></ClassContextProvider></ActorSessionProvider></QueryClientProvider></NextIntlClientProvider>);
}

describe("FE04 gradebook UI", () => {
  it("requires human review before an AI suggestion becomes a local draft", async () => {
    const user = userEvent.setup();
    renderGradebook();
    expect(screen.getByRole("heading", { level: 1, name: "Nilai & Rubrik" })).toBeInTheDocument();
    expect(screen.getByText("Saran AI siap ditinjau")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import nilai" })).toBeDisabled();
    expect(screen.getByText("0/100")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Gunakan sebagai draft lokal" }));
    expect(screen.getByText("79/100")).toBeInTheDocument();
    expect(screen.getByText("Draft nilai berubah secara lokal dan belum tersimpan.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Simpan draft nilai" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Rilis nilai" })).toBeDisabled();
  });

  it("shows provider failure explicitly without a fallback grade", async () => {
    const user = userEvent.setup();
    renderGradebook();
    await user.click(screen.getByRole("button", { name: /Arya Wijaya/ }));
    expect(screen.getByRole("heading", { name: "Saran AI tidak tersedia" })).toBeInTheDocument();
    expect(screen.getByText("Tidak ada nilai fallback yang diterapkan.")).toBeInTheDocument();
    expect(screen.getByLabelText("Alasan perubahan nilai")).toBeInTheDocument();
  });

  it("keeps released grades read-only and exposes safe import preview", async () => {
    const user = userEvent.setup();
    renderGradebook();
    await user.click(screen.getByRole("button", { name: /Salsa Ramadhani/ }));
    expect(screen.getAllByText("Dirilis").length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Nilai Hierarchy informasi/)).toBeDisabled();
    expect(screen.getByRole("heading", { name: "Preview import nilai" })).toBeInTheDocument();
    expect(screen.getByText("Baris 7: score melebihi batas criterion.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Commit import" })).toBeDisabled();
  });

  it("shows a production dependency state and rejects foreign gradebook data", () => {
    const { unmount } = renderGradebook({ missing: true });
    expect(screen.getByRole("heading", { name: "Gradebook menunggu backend" })).toBeInTheDocument();
    unmount();
    renderGradebook({ activeClass: { ...classes.published, capabilities: [...(classes.published.capabilities ?? []), "gradebook.read"] } });
    expect(screen.getByRole("heading", { name: "Gradebook tidak tersedia untuk Class ini" })).toBeInTheDocument();
    expect(screen.queryByText("Nabila Sari")).not.toBeInTheDocument();
  });

  it("uses a read-only surface when management capability is absent", () => {
    renderGradebook({ activeClass: { ...classes.draft, capabilities: ["class.read", "gradebook.read"] } });
    expect(screen.getByText(/Gradebook ditampilkan hanya baca/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nilai Hierarchy informasi/)).toBeDisabled();
    expect(screen.getByRole("button", { name: "Import nilai" })).toBeDisabled();
  });
});
