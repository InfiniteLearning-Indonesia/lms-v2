"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Edit2, X } from "lucide-react";
import { UserListItem, Batch } from "../types";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUserId: string | null;
  usersList: UserListItem[];
  batchesList: Batch[];
  nameValue: string;
  setNameValue: (v: string) => void;
  emailValue: string;
  setEmailValue: (v: string) => void;
  whatsappValue: string;
  setWhatsappValue: (v: string) => void;
  institutionValue: string;
  setInstitutionValue: (v: string) => void;
  studyProgramValue: string;
  setStudyProgramValue: (v: string) => void;
  selectedProgramValue: string;
  setSelectedProgramValue: (v: string) => void;
  statusValue?: string;
  setStatusValue?: (v: string) => void;
  userBatches: string[];
  setUserBatches: (v: string[]) => void;
  onSave: () => void;
}

export function EditUserModal({
  isOpen,
  onClose,
  editingUserId,
  usersList,
  batchesList,
  nameValue,
  setNameValue,
  emailValue,
  setEmailValue,
  whatsappValue,
  setWhatsappValue,
  institutionValue,
  setInstitutionValue,
  studyProgramValue,
  setStudyProgramValue,
  selectedProgramValue,
  setSelectedProgramValue,
  statusValue,
  setStatusValue,
  userBatches,
  setUserBatches,
  onSave,
}: EditUserModalProps) {
  const user = editingUserId ? usersList.find((u) => u.id === editingUserId) : null;
  const isAdmin = user?.role === "admin" || user?.roles?.includes("admin");
  const isFacilitator =
    !isAdmin && (user?.role === "facilitator" || user?.roles?.includes("facilitator"));
  const isStudentOrMentor =
    !isAdmin &&
    !isFacilitator &&
    (user?.role === "student" ||
      user?.role === "mentor" ||
      user?.roles?.includes("student") ||
      user?.roles?.includes("mentor"));

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
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-brand-purple" />
                Edit Profil Pengguna
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Nama Lengkap</label>
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground flex justify-between">
                  <span>Email Google</span>
                  <span className="text-3xs text-red-500 italic">Mengubah email me-reset binding login</span>
                </label>
                <input
                  type="email"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">No WhatsApp</label>
                <input
                  type="text"
                  value={whatsappValue}
                  onChange={(e) => setWhatsappValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Institusi / Kampus</label>
                <input
                  type="text"
                  value={institutionValue}
                  onChange={(e) => setInstitutionValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Program Studi / Jurusan</label>
                <input
                  type="text"
                  value={studyProgramValue}
                  onChange={(e) => setStudyProgramValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Program IL</label>
                <select
                  value={selectedProgramValue}
                  onChange={(e) => setSelectedProgramValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                >
                  {user?.specialization !== "Professional" && (
                    <option value="AI Development">AI Development</option>
                  )}
                  <option value="Web Development and UI/UX Design">Web Development and UI/UX Design</option>
                  <option value="Mobile Development and UI/UX Design">Mobile Development and UI/UX Design</option>
                  {user?.specialization !== "Professional" && (
                    <option value="Game Development">Game Development</option>
                  )}
                </select>
              </div>

              {statusValue !== undefined && setStatusValue && (
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Status Akun</label>
                  <select
                    value={statusValue}
                    onChange={(e) => setStatusValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple capitalize"
                  >
                    <option value="active">Active (Aktif)</option>
                    <option value="invited">Invited</option>
                    <option value="graduated font-bold">Graduated (Lulus)</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              )}

              {isFacilitator && (
                <div className="col-span-2 space-y-1.5 pt-2 border-t border-border/60">
                  <label className="font-semibold text-muted-foreground block mb-1">
                    Cohort/Batch Ditugaskan (1 Batch Aktif):
                  </label>
                  <select
                    value={userBatches[0] || ""}
                    onChange={(e) => setUserBatches(e.target.value ? [e.target.value] : [])}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple text-xs font-semibold cursor-pointer"
                  >
                    <option value="">-- Pilih Batch Ditugaskan --</option>
                    {batchesList.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name} ({batch.status.toUpperCase()})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Facilitator hanya memiliki 1 batch aktif yang dipantau. Admin dapat memindahkan Facilitator ke batch manapun.
                  </p>
                </div>
              )}

              {isStudentOrMentor && (
                <div className="col-span-2 space-y-1.5 pt-2 border-t border-border/60">
                  <label className="font-semibold text-muted-foreground block mb-1">
                    Daftar Cohort/Batch Keikutsertaan:
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-secondary/20 border border-border/50 rounded-lg p-3">
                    {batchesList.map((batch) => {
                      const isChecked = userBatches.includes(batch.id);
                      return (
                        <label
                          key={batch.id}
                          className="flex items-center gap-2 text-2xs text-foreground cursor-pointer font-sans select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setUserBatches(userBatches.filter((id) => id !== batch.id));
                              } else {
                                setUserBatches([...userBatches, batch.id]);
                              }
                            }}
                            className="rounded border-border text-brand-purple focus:ring-brand-purple h-3.5 w-3.5 cursor-pointer accent-brand-purple"
                          />
                          <span>
                            {batch.name}{" "}
                            <span className="text-3xs text-muted-foreground uppercase">
                              ({batch.status})
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted/50 text-foreground text-xs font-semibold font-heading transition-colors"
              >
                Batal
              </button>
              <button
                onClick={onSave}
                className="px-4 py-2 rounded-lg bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold font-heading transition-colors shadow-sm"
              >
                Simpan Perubahan
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
