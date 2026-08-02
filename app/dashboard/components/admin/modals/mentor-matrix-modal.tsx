"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Loader2, UserCheck, X } from "lucide-react";
import { UserListItem } from "../types";

interface BatchForMatrix {
  id: string;
  name: string;
  includedPrograms?: { id: string; name: string }[];
}

interface MentorMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: BatchForMatrix | null;
  usersList: UserListItem[];
  matrixProgramMentors: Record<string, string[]>;
  setMatrixProgramMentors: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  isSubmitting: boolean;
  onSave: () => void;
}

export function MentorMatrixModal({
  isOpen,
  onClose,
  batch,
  usersList,
  matrixProgramMentors,
  setMatrixProgramMentors,
  isSubmitting,
  onSave,
}: MentorMatrixModalProps) {
  if (!batch) return null;

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
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="relative z-10 bg-card border border-border rounded-xl shadow-lg max-w-2xl w-full p-6 space-y-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-brand-purple" />
                  Matrix Penugasan Mentor - {batch.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pilih mentor yang bertugas membimbing murid di masing-masing program studi pada angkatan ini.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-muted rounded-lg text-muted-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {batch.includedPrograms?.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  Belum ada program studi di dalam batch ini.
                </p>
              ) : (
                batch.includedPrograms?.map((prog) => {
                  const allMentors = usersList.filter(
                    (u) => u.role === "mentor" && u.status === "active"
                  );
                  const selectedForProg = matrixProgramMentors[prog.id] || [];

                  return (
                    <div
                      key={prog.id}
                      className="border border-border rounded-xl p-4 bg-secondary/20 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-brand-purple" />
                          {prog.name}
                        </h4>
                        <span className="text-2xs font-semibold px-2 py-0.5 bg-brand-purple/10 text-brand-purple rounded-full">
                          {selectedForProg.length} Mentor Ditugaskan
                        </span>
                      </div>

                      {allMentors.length === 0 ? (
                        <p className="text-2xs text-muted-foreground">
                          Belum ada akun Mentor yang berstatus ACTIVE di sistem.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {allMentors.map((m) => {
                            const isChecked = selectedForProg.includes(m.id);
                            return (
                              <label
                                key={m.id}
                                className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                  isChecked
                                    ? "bg-brand-purple/10 border-brand-purple/40 text-foreground font-semibold"
                                    : "bg-card border-border text-muted-foreground hover:border-border/80"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setMatrixProgramMentors((prev) => {
                                      const current = prev[prog.id] || [];
                                      return {
                                        ...prev,
                                        [prog.id]: checked
                                          ? [...current, m.id]
                                          : current.filter((id) => id !== m.id),
                                      };
                                    });
                                  }}
                                  className="rounded border-border text-brand-purple focus:ring-brand-purple w-4 h-4 cursor-pointer"
                                />
                                <div className="overflow-hidden">
                                  <div className="truncate text-foreground font-medium">
                                    {m.name}
                                  </div>
                                  <div className="text-3xs text-muted-foreground truncate">
                                    {m.email}{" "}
                                    {m.specialization ? `• ${m.specialization}` : ""}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted/50 text-foreground text-xs font-semibold font-heading transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={onSave}
                disabled={isSubmitting}
                className="px-5 py-2 bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold font-heading rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan Penugasan...
                  </>
                ) : (
                  "Simpan Penugasan Mentor"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
