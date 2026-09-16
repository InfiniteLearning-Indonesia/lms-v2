import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AttendanceContent } from "@/features/attendance/components/attendance-content";
import type { ClassAttendanceViewModel } from "@/features/attendance/model";
import { ClassContextProvider } from "@/features/workspace/context";
import { ActorSessionProvider } from "@/lib/auth/provider";
import type { ClassAccessSummary } from "@/lib/api/types";
import messages from "@/messages/id.json";
import { actors, classAttendances, classes } from "@/mocks/fixtures";

const navigation = vi.hoisted(() => ({ pathname: "", replace: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname, useRouter: () => navigation }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function renderAttendance({ activeClass = classes.published, model = classAttendances.student[classes.published.id], missing = false }: { activeClass?: ClassAccessSummary; model?: ClassAttendanceViewModel; missing?: boolean } = {}) {
  navigation.pathname = `/app/classes/${activeClass.id}/attendance`;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<NextIntlClientProvider locale="id" messages={messages}><QueryClientProvider client={client}><ActorSessionProvider initialActor={activeClass.id === classes.draft.id ? actors.teacher : actors.student} previewMode><ClassContextProvider initialClasses={[activeClass]} previewMode><AttendanceContent initialAttendance={missing ? undefined : model} /></ClassContextProvider></ActorSessionProvider></QueryClientProvider></NextIntlClientProvider>);
}

describe("FE06 attendance UI", () => {
  it("keeps the Mentee projection calendar-only", () => {
    renderAttendance();
    expect(screen.getByRole("heading", { level: 1, name: "Kalender Kehadiran" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kalender Kehadiran Mentee" })).toBeInTheDocument();
    expect(screen.getByText("Tidak diketahui")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Izin Saya")).not.toBeInTheDocument();
    expect(screen.queryByText("surat-keterangan.pdf")).not.toBeInTheDocument();
    expect(screen.queryByText("Status Disiplin")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Rekap Kehadiran Bulanan" })).not.toBeInTheDocument();
  });

  it("gives Teacher calendar input and monthly recap views while commands stay disabled", async () => {
    const user = userEvent.setup();
    renderAttendance({ activeClass: classes.draft, model: classAttendances.teacher[classes.draft.id] });
    expect(screen.getByRole("heading", { level: 1, name: "Kehadiran Class" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kalender Kehadiran Teacher" })).toBeInTheDocument();
    const meetingDay = screen.getByRole("button", { name: "Buka tanggal 14, Kickoff Project" });
    await user.click(meetingDay);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Absensi — Senin, 14 September 2026" })).toBeInTheDocument();
    expect(within(dialog).getByText("Salsa Ramadhani")).toBeInTheDocument();
    expect(within(dialog).getByText("salsa.ramadhani@example.test")).toBeInTheDocument();
    const salsaStatus = within(dialog).getByRole("combobox", { name: "Status kehadiran Salsa Ramadhani" });
    await user.selectOptions(salsaStatus, "PRESENT");
    expect(within(dialog).getByText("1 perubahan lokal belum tersimpan.")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Simpan Kehadiran" })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "+ Tandai Hari Asynchronous Tambahan" })).toBeDisabled();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(meetingDay).toHaveFocus();
    expect(screen.getByRole("button", { name: "Setujui" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Buat SP" })).toBeDisabled();
    expect(screen.getByText("SP hanya berlaku pada Class ini dan tidak menangguhkan akun global.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Rekap Kehadiran Bulanan" }));
    expect(screen.getByRole("heading", { name: "Proporsi Kehadiran (September 2026)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Detail Rekap per Mentee (September 2026)" })).toBeInTheDocument();
    expect(screen.getAllByText("50%", { selector: "span" }).length).toBeGreaterThan(0);
  });

  it("fails closed when the backend projection is missing", () => {
    renderAttendance({ missing: true });
    expect(screen.getByRole("heading", { name: "Attendance menunggu backend" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ajukan izin" })).not.toBeInTheDocument();
  });

  it("does not expose the attendance modal without the contextual manage capability", () => {
    renderAttendance({
      activeClass: { ...classes.draft, capabilities: ["class.read", "attendance.read"] },
      model: classAttendances.teacher[classes.draft.id],
    });
    expect(screen.queryByRole("button", { name: "Buka tanggal 14, Kickoff Project" })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("rejects foreign Class data and missing read capability", () => {
    const { unmount } = renderAttendance({ model: classAttendances.teacher[classes.draft.id] });
    expect(screen.getByRole("heading", { name: "Kehadiran tidak tersedia untuk Class ini" })).toBeInTheDocument();
    unmount();
    renderAttendance({ activeClass: { ...classes.published, capabilities: ["class.read"] } });
    expect(screen.getByRole("heading", { name: "Akses tidak tersedia" })).toBeInTheDocument();
  });
});
