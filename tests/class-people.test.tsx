import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClassPeopleContent } from "@/features/classes/components/class-people-content";
import type { ClassParticipantViewModel, IdentityCandidateViewModel } from "@/features/classes/model";
import { ClassContextProvider } from "@/features/workspace/context";
import { ActorSessionProvider } from "@/lib/auth/provider";
import type { ActorContext, ClassAccessSummary } from "@/lib/api/types";
import messages from "@/messages/id.json";
import { actors, classes, classParticipants, identityCandidates } from "@/mocks/fixtures";

const navigation = vi.hoisted(() => ({ pathname: "/app/classes/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb/people", replace: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname, useRouter: () => navigation }));

afterEach(cleanup);

function renderPeople(options: {
  actor?: ActorContext;
  activeClass?: ClassAccessSummary;
  participants?: ClassParticipantViewModel[];
  candidates?: IdentityCandidateViewModel[];
} = {}) {
  const actor = options.actor ?? actors.student;
  const activeClass = options.activeClass ?? classes.published;
  const participants = Object.hasOwn(options, "participants") ? options.participants : classParticipants[classes.published.id];
  const candidates = options.candidates;
  navigation.pathname = `/app/classes/${activeClass.id}/people`;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Number.POSITIVE_INFINITY } } });
  return render(
    <NextIntlClientProvider locale="id" messages={messages}>
      <QueryClientProvider client={client}>
        <ActorSessionProvider initialActor={actor} previewMode>
          <ClassContextProvider initialClasses={[activeClass]} previewMode>
            <ClassPeopleContent initialParticipants={participants} identityCandidates={candidates} />
          </ClassContextProvider>
        </ActorSessionProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe("Class People UI", () => {
  it("lets a Student inspect and filter the roster without management actions", async () => {
    const user = userEvent.setup();
    renderPeople();

    expect(screen.getByRole("heading", { level: 1, name: "Orang" })).toBeInTheDocument();
    expect(screen.getByText("4 dari 4 participant")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tambah participant" })).not.toBeInTheDocument();
    expect(screen.getByText(/Tidak tersedia self-enrollment/)).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Filter status"), "SUSPENDED");
    expect(screen.getByText("Dinda Maharani")).toBeInTheDocument();
    expect(screen.queryByText("Student Riyan")).not.toBeInTheDocument();
  });

  it("shows participant history but never exposes an editable raw user ID", async () => {
    const user = userEvent.setup();
    renderPeople();
    await user.click(screen.getByRole("button", { name: "Lihat detail Dinda Maharani" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Riwayat partisipasi" })).toBeInTheDocument();
    expect(within(dialog).getByText("Partisipasi ditangguhkan")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("33333333333333333333333333333333")).not.toBeInTheDocument();
  });

  it("gives Site Admin an owner-backed identity picker with locked mutation", async () => {
    const user = userEvent.setup();
    const managedClass = { ...classes.published, capabilities: [...(classes.published.capabilities ?? []), "participants.manage"] };
    renderPeople({ actor: actors.siteAdmin, activeClass: managedClass, candidates: identityCandidates });
    await user.click(screen.getByRole("button", { name: "Tambah participant" }));
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByText("Alya Rahman")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Teacher")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Student")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Tambahkan ke Class" })).toBeDisabled();
    expect(within(dialog).queryByLabelText(/user id/i)).not.toBeInTheDocument();
  });

  it("distinguishes the missing production directory from an empty roster", () => {
    renderPeople({ participants: undefined });
    expect(screen.getByText("Daftar participant menunggu backend")).toBeInTheDocument();
    expect(screen.queryByText("Student Riyan")).not.toBeInTheDocument();
  });
});
