import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { WorkspaceShell } from "@/components/workspace/shell";
import { WorkspaceHomeContent } from "@/features/workspace/components/home";
import { ClassContextProvider } from "@/features/workspace/context";
import { ActorSessionProvider } from "@/lib/auth/provider";
import { actors, classes } from "@/mocks/fixtures";
import messages from "@/messages/id.json";

const navigation = vi.hoisted(() => ({ pathname: "/app", replace: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname, useRouter: () => navigation }));

afterEach(() => {
  cleanup();
  navigation.pathname = "/app";
  navigation.replace.mockReset();
  navigation.push.mockReset();
});

function renderWorkspace(pathname = "/app", initialClasses = [classes.published, classes.archived]) {
  navigation.pathname = pathname;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Number.POSITIVE_INFINITY } } });
  return render(
    <NextIntlClientProvider locale="id" messages={messages}>
      <QueryClientProvider client={client}>
        <ActorSessionProvider initialActor={actors.student} previewMode>
          <ClassContextProvider initialClasses={initialClasses} previewMode>
            <WorkspaceShell>
              {pathname === "/app" ? <WorkspaceHomeContent /> : <p>Class content</p>}
            </WorkspaceShell>
          </ClassContextProvider>
        </ActorSessionProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe("workspace Class discovery", () => {
  it("searches only the Classes already available to the actor", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    expect(screen.getByText("Product Engineering 2026")).toBeInTheDocument();
    expect(screen.getByText("Class Archived")).toBeInTheDocument();
    const search = screen.getByRole("searchbox", { name: "Cari di Kelas Saya" });
    await user.type(search, "software");

    expect(screen.getByText("Product Engineering 2026")).toBeInTheDocument();
    expect(screen.queryByText("Class Archived")).not.toBeInTheDocument();
    expect(screen.getAllByText("1 dari 2 Class").length).toBeGreaterThan(0);
    expect(screen.queryByText(/gabung|enroll/i)).not.toBeInTheDocument();
  });

  it("provides a recoverable no-results state", async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await user.type(screen.getByRole("searchbox", { name: "Cari di Kelas Saya" }), "tidak ada");

    expect(screen.getByRole("heading", { name: "Class tidak ditemukan di Kelas Saya" })).toBeInTheDocument();
    await user.click(screen.getByText("Hapus pencarian"));
    expect(screen.getByText("Product Engineering 2026")).toBeInTheDocument();
  });

  it("explains that an empty assigned Class list is managed by Admin or Teacher", () => {
    renderWorkspace("/app", []);

    expect(screen.getByRole("heading", { name: "Belum ada Class yang dapat diakses" })).toBeInTheDocument();
    expect(screen.getByText("Class akan muncul setelah Admin atau Teacher menambahkan Anda sebagai Student.")).toBeInTheDocument();
    expect(screen.queryByRole("searchbox", { name: "Cari di Kelas Saya" })).not.toBeInTheDocument();
    expect(screen.queryByText(/gabung|enroll/i)).not.toBeInTheDocument();
  });

  it("replaces Workspace search and menu with a back link inside a Class", () => {
    renderWorkspace(`/app/classes/${classes.published.id}`);

    expect(screen.queryByRole("searchbox", { name: "Cari di Kelas Saya" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Workspace" })).toHaveAttribute("href", "/app");
    expect(screen.queryByRole("link", { name: "Workspace" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pembelajaran" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Progress" })).not.toBeInTheDocument();
  });

  it("marks only the current Class navigation item as active", () => {
    renderWorkspace(`/app/classes/${classes.published.id}/learning`);

    expect(screen.getByRole("link", { name: "Ringkasan" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Pembelajaran" })).toHaveAttribute("aria-current", "page");
  });
});
