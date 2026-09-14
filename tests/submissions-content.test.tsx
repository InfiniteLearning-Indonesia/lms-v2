import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SubmissionsContent } from "@/features/submission/components/submissions-content";
import type { ClassSubmissionViewModel } from "@/features/submission/model";
import { ClassContextProvider } from "@/features/workspace/context";
import { ActorSessionProvider } from "@/lib/auth/provider";
import type { ClassAccessSummary } from "@/lib/api/types";
import messages from "@/messages/id.json";
import { actors, classes, classSubmissions } from "@/mocks/fixtures";

const navigation = vi.hoisted(() => ({ pathname: "/app/classes/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb/submissions", replace: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname, useRouter: () => navigation }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderSubmissions({ activeClass = classes.published, model = classSubmissions.student[classes.published.id], missing = false }: { activeClass?: ClassAccessSummary; model?: ClassSubmissionViewModel; missing?: boolean } = {}) {
  navigation.pathname = `/app/classes/${activeClass.id}/submissions`;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Number.POSITIVE_INFINITY } } });
  return render(<NextIntlClientProvider locale="id" messages={messages}><QueryClientProvider client={client}><ActorSessionProvider initialActor={activeClass.id === classes.draft.id ? actors.teacher : actors.student} previewMode><ClassContextProvider initialClasses={[activeClass]} previewMode><SubmissionsContent initialSubmissions={missing ? undefined : model} /></ClassContextProvider></ActorSessionProvider></QueryClientProvider></NextIntlClientProvider>);
}

describe("FE04 submissions UI", () => {
  it("shows an editable local Student draft while final commands stay disabled", async () => {
    const user = userEvent.setup();
    renderSubmissions();
    expect(screen.getByRole("heading", { level: 1, name: "Tugas & Pengumpulan" })).toBeInTheDocument();
    expect(screen.getByText("Segera jatuh tempo")).toBeInTheDocument();
    const answer = screen.getByLabelText("Jawaban tugas");
    await user.type(answer, " Tambahan evidence.");
    expect(screen.getByText("Perubahan lokal belum tersimpan.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Simpan draft" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Kumpulkan tugas" })).toBeDisabled();
    const unload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(true);
  });

  it("preserves a returned revision, receipt, feedback, and immutable timeline", async () => {
    const user = userEvent.setup();
    renderSubmissions();
    await user.click(screen.getByRole("button", { name: /UI\/UX Design: Information Architecture/ }));
    expect(screen.getByRole("heading", { name: "Feedback Teacher" })).toBeInTheDocument();
    expect(screen.getByText("RCPT-PE26-IA-0001")).toBeInTheDocument();
    expect(screen.getByText("Dikembalikan untuk revisi")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kumpulkan revisi" })).toBeDisabled();
  });

  it("provides a filterable Teacher inbox without a grading command", async () => {
    const user = userEvent.setup();
    renderSubmissions({ activeClass: classes.draft, model: classSubmissions.teacher[classes.draft.id] });
    expect(screen.getByRole("heading", { level: 1, name: "Inbox Pengumpulan" })).toBeInTheDocument();
    expect(screen.getAllByText("Nabila Sari").length).toBeGreaterThan(0);
    await user.type(screen.getByLabelText("Cari Student"), "arya");
    expect(screen.getAllByText("Arya Wijaya").length).toBeGreaterThan(0);
    expect(screen.queryByText("Nabila Sari")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buka penilaian" })).toBeDisabled();
  });

  it("shows a production dependency state and rejects foreign Class data", () => {
    const { unmount } = renderSubmissions({ missing: true });
    expect(screen.getByRole("heading", { name: "Submission menunggu backend" })).toBeInTheDocument();
    unmount();
    renderSubmissions({ model: classSubmissions.teacher[classes.draft.id] });
    expect(screen.getByRole("heading", { name: "Submission tidak tersedia untuk Class ini" })).toBeInTheDocument();
    expect(screen.queryByText("Nabila Sari")).not.toBeInTheDocument();
  });

  it("does not expose a Teacher projection through read-only Student capability", () => {
    const readOnlyClass = { ...classes.draft, capabilities: ["class.read", "submission.read"] };
    renderSubmissions({ activeClass: readOnlyClass, model: classSubmissions.teacher[classes.draft.id] });
    expect(screen.getByRole("heading", { name: "Tampilan submission belum tersedia" })).toBeInTheDocument();
    expect(screen.queryByText("Nabila Sari")).not.toBeInTheDocument();
  });
});
