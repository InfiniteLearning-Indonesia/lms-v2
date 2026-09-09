"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X } from "lucide-react";

interface AssignMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  programName: string;
  availableMentors: { id: string; name: string; specialization?: string; selectedProgram?: string }[];
  selectedMentorId: string;
  setSelectedMentorId: (v: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function AssignMentorModal({
  isOpen,
  onClose,
  programName,
  availableMentors,
  selectedMentorId,
  setSelectedMentorId,
  isSubmitting,
  onSubmit,
}: AssignMentorModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-heading font-bold text-base text-foreground">
                Assign Mentor ke {programName}
              </h3>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Pilih Mentor Aktif</label>
                <select
                  value={selectedMentorId}
                  onChange={(e) => setSelectedMentorId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden"
                >
                  <option value="">-- Pilih Mentor --</option>
                  {availableMentors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.specialization || m.selectedProgram || "Belum Ada Program"})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Simpan Penugasan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
