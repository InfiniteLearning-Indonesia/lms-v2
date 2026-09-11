import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";
import { AdminClassDirectory } from "@/features/classes/components/admin-class-directory";
import messages from "@/messages/id.json";
import { classes } from "@/mocks/fixtures";

afterEach(cleanup);

function renderDirectory(initialClasses?: Parameters<typeof AdminClassDirectory>[0]["initialClasses"]) {
  return render(<NextIntlClientProvider locale="id" messages={messages}><AdminClassDirectory initialClasses={initialClasses} /></NextIntlClientProvider>);
}

describe("Admin Class directory", () => {
  it("searches and filters the development read model", async () => {
    const user = userEvent.setup();
    renderDirectory(Object.values(classes));

    expect(screen.getByRole("heading", { level: 1, name: "Kelola Class" })).toBeInTheDocument();
    expect(screen.getByText("4 dari 4 Class")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Aksi" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit Class Draft" })).toHaveAttribute("href", `/app/classes/${classes.draft.id}/settings`);
    expect(screen.getByRole("link", { name: "Lihat pengaturan Class Archived" })).toHaveAttribute("href", `/app/classes/${classes.archived.id}/settings`);
    const draftActions = within(screen.getByRole("row", { name: /Class Draft/ })).getAllByRole("link");
    expect(draftActions.map((link) => link.getAttribute("aria-label"))).toEqual(["Edit Class Draft", "Buka Class Draft"]);
    expect(draftActions[1]).toHaveClass("bg-primary");
    await user.selectOptions(screen.getByLabelText("Filter status"), "DRAFT");
    expect(screen.getByText("Class Draft")).toBeInTheDocument();
    expect(screen.queryByText("Product Engineering 2026")).not.toBeInTheDocument();
    expect(screen.getByText("1 dari 4 Class")).toBeInTheDocument();
  });

  it("keeps Create visible but prevents a mutation request", async () => {
    const user = userEvent.setup();
    renderDirectory(Object.values(classes));
    await user.click(screen.getByRole("button", { name: "Buat Class" }));
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByText("Pembuatan Class belum aktif")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Buat Class" })).toBeDisabled();
    await user.click(within(dialog).getByLabelText("Nama Class"));
    await user.tab();
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Nama Class wajib diisi");
  });

  it("renders an honest dependency state without development fixtures", () => {
    renderDirectory(undefined);
    expect(screen.getByText("Direktori Class menunggu backend")).toBeInTheDocument();
    expect(screen.queryByText("Product Engineering 2026")).not.toBeInTheDocument();
  });
});
