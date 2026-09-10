import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClassOverviewContent } from "@/features/workspace/components/class-overview";
import { ClassContextProvider } from "@/features/workspace/context";
import { formatClassDeadline, type ClassOverviewViewModel } from "@/features/workspace/overview";
import { ActorSessionProvider } from "@/lib/auth/provider";
import type { ClassAccessSummary } from "@/lib/api/types";
import messages from "@/messages/id.json";
import { actors, classes, classOverviews } from "@/mocks/fixtures";

const navigation = vi.hoisted(() => ({ pathname: "/app/classes/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", replace: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname, useRouter: () => navigation }));

afterEach(cleanup);

function renderOverview(
  activeClass: ClassAccessSummary = classes.published,
  overview: ClassOverviewViewModel | null = classOverviews[classes.published.id],
) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Number.POSITIVE_INFINITY } } });
  navigation.pathname = `/app/classes/${activeClass.id}`;

  return render(
    <NextIntlClientProvider locale="id" messages={messages}>
      <QueryClientProvider client={client}>
        <ActorSessionProvider initialActor={actors.student} previewMode>
          <ClassContextProvider
            initialClasses={[activeClass]}
            initialClassOverviews={overview ? { [activeClass.id]: overview } : undefined}
            previewMode
          >
            <ClassOverviewContent />
          </ClassContextProvider>
        </ActorSessionProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe("Class overview dashboard", () => {
  it("shows development overview fixtures and routes each item to its owning feature", () => {
    renderOverview();

    expect(screen.getByRole("heading", { level: 1, name: "Product Engineering 2026" })).toBeInTheDocument();
    expect(screen.getByText("Software Engineering")).toBeInTheDocument();
    expect(screen.getByText("Batch 01")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Buka Pembelajaran/ })).toHaveAttribute("href", `/app/classes/${classes.published.id}/learning`);
    expect(screen.getByRole("heading", { name: "Tugas Mendatang" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Buka Project Brief: Learning Dashboard di Pembelajaran" })).toHaveAttribute("href", `/app/classes/${classes.published.id}/learning`);
    expect(screen.getByRole("heading", { name: "Pengingat Logbook" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Buka Logbook September 2026 di Logbook" })).toHaveAttribute("href", `/app/classes/${classes.published.id}/logbook`);
    expect(screen.getByText(/Tenggat 12 Sep 2026/)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Orang/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Pengumpulan/ })).not.toBeInTheDocument();
  });

  it("fails closed when the Learning capability is unavailable", () => {
    renderOverview({ ...classes.published, capabilities: ["class.read"] });

    expect(screen.getByRole("heading", { name: "Pembelajaran belum tersedia" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tugas tidak tersedia" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Logbook tidak tersedia" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Buka Pembelajaran/ })).not.toBeInTheDocument();
    expect(screen.queryByText("Project Brief: Learning Dashboard")).not.toBeInTheDocument();
  });

  it("shows honest backend dependency states when overview data is absent", () => {
    renderOverview(classes.published, null);

    expect(screen.getByRole("heading", { name: "Data tugas menunggu integrasi" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Data logbook menunggu integrasi" })).toBeInTheDocument();
    expect(screen.queryByText("Project Brief: Learning Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Logbook September 2026")).not.toBeInTheDocument();
  });

  it("distinguishes successful empty states from missing integration", () => {
    renderOverview(classes.published, {
      ...classOverviews[classes.published.id],
      logbookReminders: [],
      upcomingAssignments: [],
    });

    expect(screen.getByRole("heading", { name: "Tidak ada tugas mendatang" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Logbook sudah tertangani" })).toBeInTheDocument();
    expect(screen.queryByText(/menunggu integrasi/)).not.toBeInTheDocument();
  });

  it("formats an offset deadline in the Class timezone", () => {
    expect(formatClassDeadline("2026-09-12T23:59:00+07:00", "Asia/Jakarta")).toMatch(/12 Sep 2026.*23\.59.*WIB/);
  });
});
