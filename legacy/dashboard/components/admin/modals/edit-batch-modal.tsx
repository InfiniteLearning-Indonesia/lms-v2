"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Settings, X } from "lucide-react";
import { Program } from "../types";

interface EditBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: { id: string; name: string; status: string } | null;
  name: string;
  setName: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  programsList: Program[];
  includedProgramIds: string[];
  setIncludedProgramIds: (ids: string[]) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function EditBatchModal({
  isOpen,
  onClose,
  batch,
  name,
  setName,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  programsList,
  includedProgramIds,
  setIncludedProgramIds,
  isSubmitting,
  onSubmit,
}: EditBatchModalProps) {
  if (!batch) return null;
  const isDraft = batch.status === "draft";

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
            className="relative z-10 bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                <Settings className="w-4 h-4 text-brand-purple" />
                Edit Angkatan / Batch
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Nama Angkatan / Batch</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="misal: Batch 8 - Q3 2026"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Tanggal Mulai Cohort</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden font-sans"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Tanggal Selesai Cohort</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Status Batch saat ini</span>
                </label>
                <div className="px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-xs font-semibold capitalize w-fit">
                  {batch.status === "completed" ? "selesai (diakhiri)" : batch.status}
                </div>
              </div>

              <div className="space-y-2 border-t border-b border-border py-3">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Program Studi yang Diikutsertakan</span>
                  {!isDraft && (
                    <span className="text-3xs text-amber-500 font-semibold font-sans">
                      Terkunci (Batch sudah berjalan/selesai)
                    </span>
                  )}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                  {programsList.map((prog) => {
                    const isChecked = includedProgramIds.includes(prog.id);
                    return (
                      <label
                        key={prog.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition-all ${
                          !isDraft
                            ? "opacity-75 border-border bg-secondary/20 text-muted-foreground cursor-not-allowed"
                            : "cursor-pointer"
                        } ${
                          isChecked && isDraft
                            ? "border-brand-purple bg-brand-purple/5 font-medium text-foreground"
                            : ""
                        } ${
                          isChecked && !isDraft
                            ? "border-border bg-secondary/40 font-medium text-foreground"
                            : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={!isDraft}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setIncludedProgramIds([...includedProgramIds, prog.id]);
                            } else {
                              setIncludedProgramIds(
                                includedProgramIds.filter((id) => id !== prog.id)
                              );
                            }
                          }}
                          className="rounded border-input text-brand-purple focus:ring-brand-purple cursor-pointer disabled:cursor-not-allowed"
                        />
                        <span className="truncate">{prog.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
