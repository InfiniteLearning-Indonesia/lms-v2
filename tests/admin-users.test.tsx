import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";
import { AdminUsersContent } from "@/features/admin/components/users-content";
import messages from "@/messages/id.json";
import { adminUsers } from "@/mocks/fixtures";

afterEach(cleanup);
const renderUsers = (data?: typeof adminUsers) => render(<NextIntlClientProvider locale="id" messages={messages}><AdminUsersContent initialData={data} /></NextIntlClientProvider>);

describe("FE07 admin Users", () => {
  it("filters the actor-scoped identity directory", async () => {
    const user = userEvent.setup();
    renderUsers(adminUsers);
    expect(screen.getByText("4 dari 4 user")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox", { name: "Cari user" }), "pengajar");
    expect(screen.getByText("Pengajar Demo")).toBeInTheDocument();
    expect(screen.queryByText("Alya Rahman")).not.toBeInTheDocument();
  });

  it("keeps invitation intent visible without enabling a backend command", async () => {
    const user = userEvent.setup();
    renderUsers(adminUsers);
    await user.click(screen.getByRole("button", { name: "Undang user" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Perintah belum aktif")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Kirim invitation" })).toBeDisabled();
    await user.type(within(dialog).getByLabelText("Email"), "bukan-email");
    await user.tab();
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Masukkan alamat email yang valid");
  });

  it("uses an honest production dependency state", () => {
    renderUsers(undefined);
    expect(screen.getByText("Read model admin menunggu backend")).toBeInTheDocument();
    expect(screen.queryByText("Site Admin", { selector: "p" })).not.toBeInTheDocument();
  });
});
