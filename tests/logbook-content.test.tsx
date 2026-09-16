import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LogbookContent } from "@/features/logbook/components/logbook-content";
import type { ClassLogbookViewModel } from "@/features/logbook/model";
import { ClassContextProvider } from "@/features/workspace/context";
import { ActorSessionProvider } from "@/lib/auth/provider";
import type { ClassAccessSummary } from "@/lib/api/types";
import messages from "@/messages/id.json";
import { actors, classLogbooks, classes } from "@/mocks/fixtures";

const navigation = vi.hoisted(() => ({ pathname: "", replace: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname, useRouter: () => navigation }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function renderLogbook({ activeClass = classes.published, model = classLogbooks.student[classes.published.id], missing = false }: { activeClass?: ClassAccessSummary; model?: ClassLogbookViewModel; missing?: boolean } = {}) {
  navigation.pathname = `/app/classes/${activeClass.id}/logbook`;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<NextIntlClientProvider locale="id" messages={messages}><QueryClientProvider client={client}><ActorSessionProvider initialActor={activeClass.id === classes.draft.id ? actors.teacher : actors.student} previewMode><ClassContextProvider initialClasses={[activeClass]} previewMode><LogbookContent initialLogbook={missing ? undefined : model} /></ClassContextProvider></ActorSessionProvider></QueryClientProvider></NextIntlClientProvider>);
}

describe("FE06 logbook UI", () => {
  it("shows a flexible learner period, revision feedback, and disabled commands", () => {
    renderLogbook();
    expect(screen.getByRole("heading", { level: 1, name: "Logbook" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Wawancara pengguna dan menyusun temuan awal.")).toBeInTheDocument();
    expect(screen.getByText("Tambahkan keputusan yang berubah setelah wawancara kedua.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kirim revisi" })).toBeDisabled();
    expect(screen.getByText("Hafara Putri (Peja)")).toBeInTheDocument();
  });

  it("filters reviewer scope and keeps review commands disabled", async () => {
    const user = userEvent.setup();
    renderLogbook({ activeClass: classes.draft, model: classLogbooks.teacher[classes.draft.id] });
    await user.type(screen.getByLabelText("Cari Student atau isi logbook"), "arya");
    expect(screen.getAllByText("Arya Wijaya").length).toBeGreaterThan(0);
    expect(screen.queryByText("Nabila Sari")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Minta revisi" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Terima entry" })).toBeDisabled();
  });

  it("fails closed without projection and rejects foreign data", () => {
    const { unmount } = renderLogbook({ missing: true });
    expect(screen.getByRole("heading", { name: "Logbook menunggu backend" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Kirim logbook" })).not.toBeInTheDocument();
    unmount();
    renderLogbook({ model: classLogbooks.teacher[classes.draft.id] });
    expect(screen.getByRole("heading", { name: "Logbook tidak tersedia untuk Class ini" })).toBeInTheDocument();
  });
});
