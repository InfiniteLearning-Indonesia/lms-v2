import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";
import { AdminAuditContent } from "@/features/admin/components/audit-content";
import { AdminMigrationsContent } from "@/features/admin/components/migrations-content";
import messages from "@/messages/id.json";
import { adminAudit, adminMigrations } from "@/mocks/fixtures";

afterEach(cleanup);
const Provider = ({ children }: { children: React.ReactNode }) => <NextIntlClientProvider locale="id" messages={messages}>{children}</NextIntlClientProvider>;

describe("FE07 immutable Audit", () => {
  it("filters events without exposing mutation actions", async () => {
    const user = userEvent.setup();
    render(<Provider><AdminAuditContent initialData={adminAudit} /></Provider>);
    await user.selectOptions(screen.getByLabelText("Outcome"), "DENIED");
    expect(screen.getByText("ACCOUNT_STATE_CHANGED")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /hapus|edit|repair/i })).not.toBeInTheDocument();
  });

  it("shows sanitized request correlation and redaction detail", async () => {
    const user = userEvent.setup();
    render(<Provider><AdminAuditContent initialData={adminAudit} /></Provider>);
    const row = screen.getByRole("row", { name: /REPORT_EXPORT_REQUESTED/ });
    await user.click(within(row).getByRole("button", { name: "Lihat" }));
    expect(screen.getByText("req-export-18")).toBeInTheDocument();
    expect(screen.getByText("1 field disamarkan")).toBeInTheDocument();
  });
});

describe("FE07 migration evidence", () => {
  it("keeps code, data, and ownership readiness separate", async () => {
    render(<Provider><AdminMigrationsContent initialData={adminMigrations} /></Provider>);
    expect(screen.getByText("Code readiness")).toBeInTheDocument();
    expect(screen.getByText("Data dan reconciliation")).toBeInTheDocument();
    expect(screen.getByText("Ownership dan cutover")).toBeInTheDocument();
    expect(screen.getAllByText("Terblokir").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Evidence per gate" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Backup" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recovery / restore" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pilot" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Wave" })).toBeInTheDocument();
    expect(screen.getByText("epoch-legacy-18")).toBeInTheDocument();
  });

  it("explains CLASS_MOVED and exposes no operational command", async () => {
    render(<Provider><AdminMigrationsContent initialData={adminMigrations} /></Provider>);
    expect(screen.getByText("Class dipindahkan: Legacy Web Batch 08")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /migrasi|switch|restore|deploy|rollout/i })).not.toBeInTheDocument();
  });
});
