import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProgressContent } from "@/features/completion/components/progress-content";
import type { ClassCompletionViewModel } from "@/features/completion/model";
import { ClassContextProvider } from "@/features/workspace/context";
import { ActorSessionProvider } from "@/lib/auth/provider";
import type { ClassAccessSummary } from "@/lib/api/types";
import messages from "@/messages/id.json";
import { actors, classCompletions, classes } from "@/mocks/fixtures";

const navigation = vi.hoisted(() => ({ pathname: "/app/classes/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb/progress", replace: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname, useRouter: () => navigation }));

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function renderProgress({ activeClass = classes.published, model = classCompletions.student[classes.published.id], missing = false }: { activeClass?: ClassAccessSummary; model?: ClassCompletionViewModel; missing?: boolean } = {}) {
  navigation.pathname = `/app/classes/${activeClass.id}/progress`;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Number.POSITIVE_INFINITY } } });
  return render(<NextIntlClientProvider locale="id" messages={messages}><QueryClientProvider client={client}><ActorSessionProvider initialActor={activeClass.id === classes.draft.id ? actors.teacher : actors.student} previewMode><ClassContextProvider initialClasses={[activeClass]} previewMode><ProgressContent initialCompletion={missing ? undefined : model} /></ClassContextProvider></ActorSessionProvider></QueryClientProvider></NextIntlClientProvider>);
}

describe("FE05 progress UI", () => {
  it("explains Student evidence without equating grade, completion, and credential", () => {
    renderProgress();
    expect(screen.getByRole("heading", { level: 1, name: "Progres Pembelajaran" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Progres Class" })).toHaveAttribute("aria-valuenow", "68");
    expect(screen.getByText("Grade final dirilis")).toBeInTheDocument();
    expect(screen.getAllByText("Waived").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Lihat Transkrip & Sertifikat" })).toHaveAttribute("href", `/app/classes/${classes.published.id}/credentials`);
    expect(screen.queryByRole("button", { name: "Override outcome" })).not.toBeInTheDocument();
  });

  it("provides a filterable Teacher projection with disabled authoritative commands", async () => {
    const user = userEvent.setup();
    renderProgress({ activeClass: classes.draft, model: classCompletions.teacher[classes.draft.id] });
    expect(screen.getByRole("heading", { level: 1, name: "Progres Student" })).toBeInTheDocument();
    await user.type(screen.getByLabelText("Cari Student"), "arya");
    expect(screen.getAllByText("Arya Wijaya").length).toBeGreaterThan(0);
    expect(screen.queryByText("Nabila Sari")).not.toBeInTheDocument();
    expect(screen.getByText("Completion dibuka kembali")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Override outcome" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Buka kembali completion" })).toBeDisabled();
  });

  it("shows a production dependency state and never renders fixture details", () => {
    renderProgress({ missing: true });
    expect(screen.getByRole("heading", { name: "Completion menunggu backend" })).toBeInTheDocument();
    expect(screen.queryByText("68% selesai")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Override outcome" })).not.toBeInTheDocument();
  });

  it("rejects foreign Class data and missing capability", () => {
    const { unmount } = renderProgress({ model: classCompletions.teacher[classes.draft.id] });
    expect(screen.getByRole("heading", { name: "Progres tidak tersedia untuk Class ini" })).toBeInTheDocument();
    expect(screen.queryByText("Nabila Sari")).not.toBeInTheDocument();
    unmount();
    renderProgress({ activeClass: { ...classes.published, capabilities: ["class.read"] } });
    expect(screen.getByRole("heading", { name: "Akses tidak tersedia" })).toBeInTheDocument();
  });
});
