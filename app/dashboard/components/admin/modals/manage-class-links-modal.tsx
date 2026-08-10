"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/config";
import { ExternalLink, Link2, Loader2, Plus, Trash2, Video, MapPin, FolderGit2, Headphones, X, CheckCircle2, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";

export interface ClassLinkItem {
  id: string;
  title: string;
  url: string;
  iconType?: string;
  scope?: "mandatory" | "restricted" | "personal";
  programs?: string[];
}

interface ManageClassLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId?: string | null;
  classId?: string | null;
  programName?: string;
  initialLinks?: ClassLinkItem[];
  onSuccess?: () => void;
}

const AVAILABLE_PROGRAMS = [
  "Web Development and UI/UX Design",
  "AI Development",
  "Mobile Development and UI/UX Design",
  "Game Development",
];

const PROGRAM_SHORT_NAMES: Record<string, string> = {
  "Web Development and UI/UX Design": "Web",
  "AI Development": "AI",
  "Mobile Development and UI/UX Design": "Mobile",
  "Game Development": "Game",
};

const DEFAULT_LINKS: ClassLinkItem[] = [
  { id: "1", title: "Link Zoom Kelas Harian", url: "", iconType: "video", scope: "mandatory" },
  { id: "2", title: "Link Roadmap Program", url: "", iconType: "roadmap", scope: "mandatory" },
  { id: "3", title: "Link Drive Record Zoom", url: "", iconType: "drive", scope: "mandatory" },
  { id: "4", title: "Link Student Relation", url: "", iconType: "support", scope: "mandatory" },
];

function ProgramMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (programs: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleProgram = (program: string) => {
    const isGame = program === "Game Development";
    if (isGame) {
      // Game is exclusive — selecting it deselects everything else
      if (selected.includes(program)) {
        onChange(selected.filter((p) => p !== program));
      } else {
        onChange([program]);
      }
    } else {
      // Non-game — remove Game if present, then toggle
      const withoutGame = selected.filter((p) => p !== "Game Development");
      if (withoutGame.includes(program)) {
        onChange(withoutGame.filter((p) => p !== program));
      } else {
        onChange([...withoutGame, program]);
      }
    }
  };

  const displayText =
    selected.length === 0
      ? "Pilih program..."
      : selected.map((p) => PROGRAM_SHORT_NAMES[p] || p).join(", ");

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-purple cursor-pointer hover:border-brand-purple/50 transition-colors"
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown className={`w-3.5 h-3.5 ml-1.5 text-muted-foreground transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-xl py-1 max-h-48 overflow-y-auto">
          {AVAILABLE_PROGRAMS.map((program) => {
            const isSelected = selected.includes(program);
            const isGame = program === "Game Development";
            const hasNonGameSelected = selected.some((p) => p !== "Game Development");
            const isGameSelected = selected.includes("Game Development");
            // Disable non-game options if Game is selected, and disable Game if non-game is selected
            const isDisabled = (isGame && hasNonGameSelected && !isGameSelected) || (!isGame && isGameSelected && !isSelected);

            return (
              <button
                key={program}
                type="button"
                onClick={() => !isDisabled && toggleProgram(program)}
                disabled={isDisabled}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors cursor-pointer
                  ${isSelected ? "bg-brand-purple/10 text-brand-purple" : "text-foreground hover:bg-secondary"}
                  ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}
                `}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-brand-purple border-brand-purple" : "border-border"}`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="truncate">{PROGRAM_SHORT_NAMES[program] || program}</span>
                {isGame && <span className="text-[9px] text-muted-foreground ml-auto">(Eksklusif)</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ManageClassLinksModal({
  isOpen,
  onClose,
  programId,
  classId,
  programName,
  initialLinks = [],
  onSuccess,
}: ManageClassLinksModalProps) {
  const [links, setLinks] = useState<ClassLinkItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialLinks && initialLinks.length > 0) {
        // Merge with default 4 items if some defaults are missing
        const existingTitles = initialLinks.map((l) => l.title.toLowerCase());
        const missingDefaults = DEFAULT_LINKS.filter(
          (d) => !existingTitles.includes(d.title.toLowerCase())
        );
        setLinks([...initialLinks, ...missingDefaults]);
      } else {
        setLinks(DEFAULT_LINKS);
      }
    }
  }, [isOpen, initialLinks]);

  const handleLinkChange = (id: string, field: "title" | "url" | "scope", value: string) => {
    setLinks((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        // Clear programs when switching away from restricted
        if (field === "scope" && value !== "restricted") {
          updated.programs = [];
        }
        return updated;
      })
    );
  };

  const handleProgramsChange = (id: string, programs: string[]) => {
    setLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, programs } : item))
    );
  };

  const handleAddSpace = () => {
    const newId = Date.now().toString();
    setLinks((prev) => [
      ...prev,
      { id: newId, title: "Link Penting Baru", url: "", iconType: "link", scope: "personal" },
    ]);
  };

  const handleDeleteLink = (id: string) => {
    setLinks((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId && !programId) return;

    // Validate: restricted links must have at least one program selected
    const invalidRestricted = links.find(
      (l) => l.scope === "restricted" && (!l.programs || l.programs.length === 0)
    );
    if (invalidRestricted) {
      toast.error(`Link "${invalidRestricted.title}" berskope Restricted tapi belum dipilih program-nya.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanedLinks = links.map((item) => ({
        id: item.id,
        title: item.title.trim(),
        url: item.url.trim(),
        iconType: item.iconType || "link",
        scope: item.scope || "personal",
        programs: item.scope === "restricted" ? (item.programs || []) : [],
      }));

      const endpoint = classId
        ? `${API_BASE_URL}/classes/${classId}/links`
        : `${API_BASE_URL}/classes/programs/${programId}/links`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links: cleanedLinks }),
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Link penting kelas berhasil disimpan!");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        const err = await res.json();
        toast.error(err.message || "Gagal memperbarui link penting.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[85vh] overflow-y-auto"
        >
          <div className="flex items-start justify-between border-b border-border pb-4">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-foreground flex items-center gap-2">
                <Link2 className="w-5 h-5 text-brand-purple" />
                Kelola Link Penting Kelas{programName ? `: ${programName}` : ""}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Atur link Zoom, roadmap, drive rekaman, dan kontak SR yang akan tampil di banner dasbor mentor & siswa.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              {links.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-border bg-secondary/20 space-y-2 hover:border-brand-purple/30 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      {item.iconType === "video" && <Video className="w-3.5 h-3.5 text-indigo-500" />}
                      {item.iconType === "roadmap" && <MapPin className="w-3.5 h-3.5 text-emerald-500" />}
                      {item.iconType === "drive" && <FolderGit2 className="w-3.5 h-3.5 text-blue-500" />}
                      {item.iconType === "support" && <Headphones className="w-3.5 h-3.5 text-amber-500" />}
                      {(!item.iconType || item.iconType === "link") && <Link2 className="w-3.5 h-3.5 text-brand-purple" />}
                      Space Link #{idx + 1}
                      {item.scope === "mandatory" && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-brand-purple/20 text-brand-purple font-bold">GLOBAL</span>
                      )}
                      {item.scope === "restricted" && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-600 font-bold">RESTRICTED</span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteLink(item.id)}
                      className="p-1 rounded-md text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Hapus space link ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleLinkChange(item.id, "title", e.target.value)}
                      placeholder="Judul Link (misal: Link Zoom)"
                      className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-purple"
                      required
                    />
                    <input
                      type="url"
                      value={item.url}
                      onChange={(e) => handleLinkChange(item.id, "url", e.target.value)}
                      placeholder="https://..."
                      className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    />
                    <select
                      value={item.scope || "personal"}
                      onChange={(e) => handleLinkChange(item.id, "scope", e.target.value)}
                      className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    >
                      <option value="mandatory">Mandatory (Semua Program)</option>
                      <option value="restricted">Restricted (Program Tertentu)</option>
                      <option value="personal">Personal Mentee Only</option>
                    </select>
                  </div>

                  {/* Program selector — only shown when scope is restricted */}
                  {item.scope === "restricted" && (
                    <div className="pt-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                        Tampilkan di program:
                      </label>
                      <ProgramMultiSelect
                        selected={item.programs || []}
                        onChange={(programs) => handleProgramsChange(item.id, programs)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddSpace}
              className="w-full py-2.5 rounded-xl border border-dashed border-brand-purple/40 hover:border-brand-purple bg-brand-purple/5 hover:bg-brand-purple/10 text-brand-purple text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              + Tambah Space Link Baru
            </button>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-secondary hover:bg-muted text-foreground text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Simpan Perubahan Link
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
