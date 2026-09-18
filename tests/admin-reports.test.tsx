import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";
import { AdminReportsContent } from "@/features/admin/components/reports-content";
import messages from "@/messages/id.json";
import { adminReports } from "@/mocks/fixtures";

afterEach(cleanup);
const renderReports = (data: typeof adminReports | undefined = adminReports) => render(<NextIntlClientProvider locale="id" messages={messages}><AdminReportsContent initialData={data} /></NextIntlClientProvider>);

describe("FE07 Reports and jobs", () => {
  it("switches between backend-owned report projections", async () => {
    const user = userEvent.setup();
    renderReports();
    expect(screen.getAllByText("Product Engineering 2026").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: /Status akun global/ }));
    expect(screen.getByRole("cell", { name: "Dinonaktifkan" })).toBeInTheDocument();
    expect(screen.getByText("Perlu diperbarui")).toBeInTheDocument();
  });

  it("shows durable job states but keeps private export disabled", async () => {
    const user = userEvent.setup();
    renderReports();
    expect(screen.getByText("Sebagian")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Minta export" }));
    expect(within(screen.getByRole("dialog")).getByRole("button", { name: "Minta private export" })).toBeDisabled();
  });
});
