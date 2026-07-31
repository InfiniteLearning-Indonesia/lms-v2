"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/config";
import { ExternalLink, Link2, Loader2, Plus, Trash2, Video, MapPin, FolderGit2, Headphones, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export interface ClassLinkItem {
  id: string;
  title: string;
  url: string;
  iconType?: string;
}

interface ManageClassLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  programName: string;
  initialLinks?: ClassLinkItem[];
  onSuccess?: () => void;
}

const DEFAULT_LINKS: ClassLinkItem[] = [
  { id: "1", title: "Link Zoom Kelas Harian", url: "", iconType: "video" },
  { id: "2", title: "Link Roadmap Program", url: "", iconType: "roadmap" },
  { id: "3", title: "Link Drive Record Zoom", url: "", iconType: "drive" },
  { id: "4", title: "Link Student Relation", url: "", iconType: "support" },
];

export function ManageClassLinksModal({
  isOpen,
  onClose,
  programId,
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

  const handleLinkChange = (id: string, field: "title" | "url", value: string) => {
    setLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddSpace = () => {
    const newId = Date.now().toString();
    setLinks((prev) => [
      ...prev,
      { id: newId, title: "Link Penting Baru", url: "", iconType: "link" },
    ]);
  };

  const handleDeleteLink = (id: string) => {
    setLinks((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programId) return;

    setIsSubmitting(true);
    try {
      const cleanedLinks = links.map((item) => ({
        id: item.id,
        title: item.title.trim(),
        url: item.url.trim(),
        iconType: item.iconType || "link",
      }));

      const res = await fetch(`${API_BASE_URL}/classes/programs/${programId}/links`, {
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
                Kelola Link Penting Kelas: {programName}
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
                      className="sm:col-span-2 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-purple"
                    />
                  </div>
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
