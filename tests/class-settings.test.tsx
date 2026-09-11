import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClassSettingsContent } from "@/features/classes/components/class-settings-content";
import { ClassContextProvider } from "@/features/workspace/context";
import { ActorSessionProvider } from "@/lib/auth/provider";
import type { ClassAccessSummary } from "@/lib/api/types";
import messages from "@/messages/id.json";
import { actors, classes } from "@/mocks/fixtures";

const navigation = vi.hoisted(() => ({ pathname: "/app/classes/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/settings", replace: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname, useRouter: () => navigation }));

afterEach(cleanup);

function renderSettings(activeClass: ClassAccessSummary = classes.draft) {
  navigation.pathname = `/app/classes/${activeClass.id}/settings`;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Number.POSITIVE_INFINITY } } });
  return render(
    <NextIntlClientProvider locale="id" messages={messages}>
      <QueryClientProvider client={client}>
        <ActorSessionProvider initialActor={actors.teacher} previewMode>
          <ClassContextProvider initialClasses={[activeClass]} previewMode>
            <ClassSettingsContent />
          </ClassContextProvider>
        </ActorSessionProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe("Class settings UI", () => {
  it("shows metadata, version, and only valid Draft transitions", async () => {
    const user = userEvent.setup();
    renderSettings();

    expect(screen.getByRole("heading", { level: 1, name: "Pengaturan Class" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nama Class")).toHaveValue("Class Draft");
    expect(screen.getByText("Versi 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Simpan perubahan" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Publikasikan/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Arsipkan/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Tutup Class/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Publikasikan/ }));
    const alertDialog = screen.getByRole("alertdialog");
    expect(within(alertDialog).getByText("Konfirmasi belum aktif sampai integration gate tersedia.")).toBeInTheDocument();
    expect(within(alertDialog).getByRole("button", { name: "Publikasikan" })).toBeDisabled();
  });

  it("makes an archived Class explicitly read-only", () => {
    renderSettings({ ...classes.archived, enrollment_state: "ACTIVE", capabilities: ["class.read", "class.manage"] });
    expect(screen.getByLabelText("Nama Class")).toBeDisabled();
    expect(screen.getByRole("heading", { name: "Tidak ada transisi berikutnya" })).toBeInTheDocument();
    expect(screen.getByText("Class yang diarsipkan dipertahankan sebagai read-only.")).toBeInTheDocument();
  });
});
