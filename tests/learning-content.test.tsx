import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ActivityEditorContent, LearningContent } from "@/features/learning/components/learning-content";
import { StructuredContent } from "@/features/learning/components/structured-content";
import type { ClassLearningViewModel } from "@/features/learning/model";
import { ClassContextProvider } from "@/features/workspace/context";
import { ActorSessionProvider } from "@/lib/auth/provider";
import type { ActorContext, ClassAccessSummary } from "@/lib/api/types";
import messages from "@/messages/id.json";
import { actors, classLearning, classes } from "@/mocks/fixtures";

const navigation = vi.hoisted(() => ({ pathname: "/app/classes/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb/learning", replace: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname, useRouter: () => navigation }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderLearning(options: {
  actor?: ActorContext;
  activeClass?: ClassAccessSummary;
  learning?: ClassLearningViewModel;
  missingLearning?: boolean;
} = {}) {
  const actor = options.actor ?? actors.student;
  const activeClass = options.activeClass ?? classes.published;
  const learning = options.learning ?? classLearning[activeClass.id as keyof typeof classLearning];
  navigation.pathname = `/app/classes/${activeClass.id}/learning`;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Number.POSITIVE_INFINITY } } });
  return render(
    <NextIntlClientProvider locale="id" messages={messages}>
      <QueryClientProvider client={client}>
        <ActorSessionProvider initialActor={actor} previewMode>
          <ClassContextProvider initialClasses={[activeClass]} previewMode>
            <LearningContent initialLearning={options.missingLearning ? undefined : learning} />
          </ClassContextProvider>
        </ActorSessionProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

function renderEditor(options: {
  actor?: ActorContext;
  activeClass?: ClassAccessSummary;
  learning?: ClassLearningViewModel;
  activityId?: string;
  missingLearning?: boolean;
} = {}) {
  const actor = options.actor ?? actors.teacher;
  const activeClass = options.activeClass ?? classes.draft;
  const learning = options.learning ?? classLearning[activeClass.id as keyof typeof classLearning];
  const activityId = options.activityId ?? learning?.sections[0]?.activities[0]?.id ?? "missing-activity";
  navigation.pathname = `/app/classes/${activeClass.id}/learning/activities/${activityId}/edit`;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Number.POSITIVE_INFINITY } } });
  return render(
    <NextIntlClientProvider locale="id" messages={messages}>
      <QueryClientProvider client={client}>
        <ActorSessionProvider initialActor={actor} previewMode>
          <ClassContextProvider initialClasses={[activeClass]} previewMode>
            <ActivityEditorContent initialLearning={options.missingLearning ? undefined : learning} activityId={activityId} />
          </ClassContextProvider>
        </ActorSessionProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe("FE03 learning UI", () => {
  it("shows only published learner content and explains a locked prerequisite", async () => {
    const user = userEvent.setup();
    renderLearning();

    expect(screen.getByRole("heading", { level: 1, name: "Pembelajaran" })).toBeInTheDocument();
    expect(screen.queryByText("Preview Student Mode")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Section/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Tambah Activity/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit Urutan" })).not.toBeInTheDocument();
    expect(screen.queryByText("legacy-demo.html")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Simpan draft" })).not.toBeInTheDocument();
    await user.click(screen.getByText("Project Brief: Learning Dashboard").closest("button")!);
    expect(screen.getByRole("link", { name: "Buka Pengumpulan" })).toHaveAttribute("href", `/app/classes/${classes.published.id}/submissions`);
    expect(screen.getByText(/Tenggat 18 Sep 2026, 23.59 WIB/)).toBeInTheDocument();
    expect(screen.getByText(/Batas akhir 20 Sep 2026, 23.59 WIB/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Usability review dan handoff/ }));
    expect(screen.getByRole("heading", { name: "Activity masih terkunci" })).toBeInTheDocument();
    expect(screen.getByText("Prerequisite:").parentElement).toHaveTextContent("Project Brief: Learning Dashboard");
    expect(screen.queryByText("Konten terkunci dan tidak boleh ditampilkan")).not.toBeInTheDocument();
  });

  it("gives a Teacher an informative preview with contextual Activity edit links", async () => {
    const user = userEvent.setup();
    renderLearning({ actor: actors.teacher, activeClass: classes.draft, learning: classLearning[classes.draft.id] });

    expect(screen.getByText("Preview Student Mode")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Kelola" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pratinjau Student" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Judul Activity")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit Urutan" })).toBeInTheDocument();
    expect(screen.getAllByText("Selamat datang di Product Engineering")[0].closest("button")).toHaveClass("w-full");
    expect(screen.getByRole("button", { name: "Edit Section Orientasi dan fondasi" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hapus Section Orientasi dan fondasi" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tambah Activity ke Orientasi dan fondasi" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tambah Activity ke Discovery dan information architecture" })).toBeInTheDocument();
    expect(screen.queryByText("Belum ada Activity di Section ini.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tambah Section" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit Selamat datang di Product Engineering" })).toHaveAttribute("href", `/app/classes/${classes.draft.id}/learning/activities/activity-welcome/edit`);
    await user.click(screen.getByText("Menyusun fondasi design system").closest("button")!);
    expect(screen.getByRole("link", { name: "Edit Menyusun fondasi design system" })).toHaveAttribute("href", `/app/classes/${classes.draft.id}/learning/activities/activity-design-system/edit`);
    expect(screen.getAllByText("Draft").length).toBeGreaterThan(0);
  });

  it("opens a Section-scoped Activity draft dialog without inventing its write contract", async () => {
    const user = userEvent.setup();
    renderLearning({ actor: actors.teacher, activeClass: classes.draft, learning: classLearning[classes.draft.id] });

    await user.click(screen.getByRole("button", { name: "Tambah Activity ke Discovery dan information architecture" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Tambah Activity" })).toBeInTheDocument();
    expect(within(dialog).getByText(/Section Discovery dan information architecture/)).toBeInTheDocument();
    expect(within(dialog).getByText(/Jenis Activity, posisi, lifecycle awal, version/)).toBeInTheDocument();
    const title = within(dialog).getByLabelText("Judul Activity");
    await user.type(title, "Riset kebutuhan pengguna");
    expect(within(dialog).getByText("Perubahan lokal belum tersimpan.")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Buat Activity" })).toBeDisabled();
  });

  it("exposes honest Section authoring dialogs without sending a command", async () => {
    const user = userEvent.setup();
    renderLearning({ actor: actors.teacher, activeClass: classes.draft, learning: classLearning[classes.draft.id] });

    await user.click(screen.getByRole("button", { name: "Edit Section Orientasi dan fondasi" }));
    const editDialog = screen.getByRole("dialog");
    expect(within(editDialog).getByRole("heading", { name: "Edit Section" })).toBeInTheDocument();
    const title = within(editDialog).getByLabelText("Nama Section");
    expect(title).toHaveValue("Orientasi dan fondasi");
    await user.clear(title);
    await user.type(title, "Fondasi produk");
    expect(within(editDialog).getByText("Perubahan lokal belum tersimpan.")).toBeInTheDocument();
    expect(within(editDialog).getByRole("button", { name: "Simpan Section" })).toBeDisabled();
    await user.click(within(editDialog).getByRole("button", { name: "Batal" }));

    await user.click(screen.getByRole("button", { name: "Hapus Section Orientasi dan fondasi" }));
    const deleteDialog = screen.getByRole("alertdialog");
    expect(within(deleteDialog).getByRole("heading", { name: "Hapus Section?" })).toBeInTheDocument();
    expect(within(deleteDialog).getByRole("button", { name: "Hapus Section" })).toBeDisabled();
    await user.click(within(deleteDialog).getByRole("button", { name: "Batal" }));

    await user.click(screen.getByRole("button", { name: "Tambah Section" }));
    const createDialog = screen.getByRole("dialog");
    expect(within(createDialog).getByRole("heading", { name: "Tambah Section" })).toBeInTheDocument();
    expect(within(createDialog).getByLabelText("Nama Section")).toHaveValue("");
    expect(within(createDialog).getByRole("button", { name: "Simpan Section" })).toBeDisabled();
  });

  it("centralizes keyboard-accessible ordering on the Learning outline", async () => {
    const user = userEvent.setup();
    renderLearning({ actor: actors.teacher, activeClass: classes.draft, learning: classLearning[classes.draft.id] });

    const outline = screen.getByRole("complementary", { name: "Susunan pembelajaran" });
    await user.click(within(outline).getByRole("button", { name: "Edit Urutan" }));

    expect(within(outline).getByRole("button", { name: "Batal Edit Urutan" })).toBeInTheDocument();
    expect(within(outline).getByText(/Gunakan tombol Naik dan Turun/)).toBeInTheDocument();
    expect(within(outline).queryByRole("button", { name: "Edit Section Orientasi dan fondasi" })).not.toBeInTheDocument();
    expect(within(outline).queryByRole("button", { name: "Hapus Section Orientasi dan fondasi" })).not.toBeInTheDocument();
    expect(within(outline).queryByRole("button", { name: /Tambah Activity/ })).not.toBeInTheDocument();
    expect(within(outline).queryByRole("button", { name: "Tambah Section" })).not.toBeInTheDocument();

    const moveSectionButton = within(outline).getByRole("button", { name: "Turunkan Section Orientasi dan fondasi" });
    moveSectionButton.focus();
    await user.keyboard("{Enter}");
    expect(within(outline).getByRole("button", { name: "Naikkan Section Orientasi dan fondasi" })).toHaveFocus();
    expect(within(outline).getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)).toEqual([
      "Discovery dan information architecture",
      "Orientasi dan fondasi",
    ]);
    expect(within(outline).getByText("Urutan berubah secara lokal")).toBeInTheDocument();
    expect(within(outline).getByRole("button", { name: "Simpan urutan" })).toBeDisabled();
    expect(within(outline).getByRole("group", { name: "Atur urutan Activity Menyusun fondasi design system" })).toBeInTheDocument();
    const confirmNavigation = vi.spyOn(window, "confirm").mockReturnValue(false);
    const editLink = screen.getByRole("link", { name: "Edit Selamat datang di Product Engineering" });
    const navigationEvent = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    expect(editLink.dispatchEvent(navigationEvent)).toBe(false);
    expect(confirmNavigation).toHaveBeenCalledWith("Perubahan lokal belum tersimpan. Tinggalkan halaman dan abaikan perubahan?");

    await user.click(within(outline).getByRole("button", { name: "Batal Edit Urutan" }));
    expect(within(outline).getByRole("button", { name: "Edit Urutan" })).toBeInTheDocument();
    expect(within(outline).getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)).toEqual([
      "Orientasi dan fondasi",
      "Discovery dan information architecture",
    ]);
    expect(within(outline).queryByText("Urutan berubah secara lokal")).not.toBeInTheDocument();
    expect(within(outline).getByRole("button", { name: "Tambah Activity ke Orientasi dan fondasi" })).toBeInTheDocument();
  });

  it("opens authoring controls only inside the dedicated Activity editor", async () => {
    const user = userEvent.setup();
    renderEditor({ activityId: "activity-design-system" });

    expect(screen.getByRole("heading", { level: 1, name: "Detail Activity" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Revision yang Anda buka sudah tidak terbaru" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tinjau revision terbaru" })).toBeDisabled();
    expect(screen.queryByRole("heading", { name: "Posisi dalam susunan" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Turunkan Menyusun fondasi design system" })).not.toBeInTheDocument();
    const title = screen.getByLabelText("Judul Activity");
    await user.clear(title);
    await user.type(title, "Fondasi UI yang direvisi");
    expect(screen.getByText("Perubahan lokal belum tersimpan.")).toBeInTheDocument();
    const unloadEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unloadEvent);
    expect(unloadEvent.defaultPrevented).toBe(true);
    expect(screen.getByRole("button", { name: "Simpan draft" })).toBeDisabled();
    expect(screen.getByRole("heading", { name: "Konten terstruktur" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Paragraf" })).toBeDisabled();
    expect(screen.getByText("wireframe-reference.pdf")).toBeInTheDocument();
    expect(screen.getByText("legacy-demo.html")).toBeInTheDocument();
    expect(screen.getByText("interactive-reference.svg")).toBeInTheDocument();
    expect(screen.getByText("Ditolak")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Publikasikan" }));
    expect(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Publikasikan" })).toBeDisabled();
  });

  it("validates a selected file locally but keeps upload disabled", async () => {
    const user = userEvent.setup();
    renderEditor();
    const input = screen.getByLabelText("Pilih file");
    await user.upload(input, new File(["safe preview"], "activity-brief.pdf", { type: "application/pdf" }));

    expect(screen.getByText("activity-brief.pdf")).toBeInTheDocument();
    expect(screen.getByText("File lolos pemeriksaan awal. Belum diunggah atau dinyatakan aman.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unggah file" })).toBeDisabled();
  });

  it("fails closed when a Student opens the Activity editor directly", () => {
    renderEditor({ actor: actors.student, activeClass: classes.published, learning: classLearning[classes.published.id] });

    expect(screen.getByRole("heading", { name: "Akses tidak tersedia" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Judul Activity")).not.toBeInTheDocument();
  });

  it("explains a scheduled activity using the server timezone", () => {
    const scheduledLearning: ClassLearningViewModel = {
      ...classLearning[classes.published.id],
      sections: [{
        id: "section-scheduled",
        title: "Jadwal berikutnya",
        version: 1,
        activities: [{
          ...classLearning[classes.draft.id].sections[0].activities[2],
          lifecycle: "PUBLISHED",
        }],
      }],
    };
    renderLearning({ learning: scheduledLearning });
    expect(screen.getByRole("heading", { name: "Activity belum memasuki jadwal" })).toBeInTheDocument();
    expect(screen.getByText(/15 Sep 2026, 08.00 WIB/)).toBeInTheDocument();
    expect(screen.queryByText("Susun satu learning dashboard")).not.toBeInTheDocument();
  });

  it("keeps production honest when the M06-M07 read model is missing", () => {
    renderLearning({ missingLearning: true });
    expect(screen.getByRole("heading", { name: "Konten pembelajaran menunggu backend" })).toBeInTheDocument();
    expect(screen.queryByText("Mulai di sini")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Buka file" })).not.toBeInTheDocument();
  });

  it("keeps the production Activity editor in a dependency state", () => {
    renderEditor({ activityId: "activity-contract-placeholder", missingLearning: true });

    expect(screen.getByRole("heading", { level: 1, name: "Detail Activity" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Konten pembelajaran menunggu backend" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Judul Activity")).not.toBeInTheDocument();
  });

  it("fails closed when Learning data belongs to a different Class", () => {
    renderLearning({ actor: actors.teacher, activeClass: classes.draft, learning: classLearning[classes.published.id] });

    expect(screen.getByRole("heading", { name: "Konten tidak tersedia untuk Class ini" })).toBeInTheDocument();
    expect(screen.queryByText("Latihan terarah")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit Urutan" })).not.toBeInTheDocument();

    cleanup();
    renderEditor({
      actor: actors.teacher,
      activeClass: classes.draft,
      learning: classLearning[classes.published.id],
      activityId: "activity-student-welcome",
    });
    expect(screen.getByRole("heading", { name: "Konten tidak tersedia untuk Class ini" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Judul Activity")).not.toBeInTheDocument();
  });

  it("does not grant authoring controls from a Site Admin label alone", () => {
    renderLearning({ actor: actors.siteAdmin, activeClass: classes.published });
    expect(screen.queryByText("Preview Student Mode")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Kelola" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tambah Section" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Tambah Activity/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit Urutan" })).not.toBeInTheDocument();
  });

  it("supports successful empty and unknown activity presentation", () => {
    const emptyLearning = { ...classLearning[classes.published.id], sections: [] };
    renderLearning({ learning: emptyLearning });
    expect(screen.getByRole("heading", { name: "Belum ada materi dipublikasikan" })).toBeInTheDocument();

    const unknownLearning = {
      ...classLearning[classes.published.id],
      sections: [{
        id: "section-unknown",
        title: "Activity tambahan",
        version: 1,
        activities: [{
          id: "activity-unknown",
          type: "EXTERNAL_TOOL",
          title: "Tool eksternal",
          lifecycle: "PUBLISHED" as const,
          revision: 1,
          availability: { state: "AVAILABLE" as const },
          content: [],
          attachments: [],
        }],
      }],
    };
    cleanup();
    renderLearning({ learning: unknownLearning });
    expect(screen.getAllByText("Activity lain").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Tool eksternal" })).toBeInTheDocument();
  });

  it("renders unsafe content as inert text and blocks a non-HTTPS link", () => {
    const { container } = render(
      <StructuredContent blocks={[
        { type: "paragraph", text: "<script>window.pwned = true</script>" },
        { type: "link", label: "Tautan tidak aman", url: "javascript:alert(1)" },
      ]} />,
    );
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText("<script>window.pwned = true</script>")).toBeInTheDocument();
    expect(screen.getByText("Tautan tidak aman").closest("a")).toBeNull();
  });
});
