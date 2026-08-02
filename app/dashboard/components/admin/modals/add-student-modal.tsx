"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldAlert, X } from "lucide-react";
import { UserListItem } from "../types";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  programName: string;
  enrollCase: string;
  setEnrollCase: (c: string) => void;
  usersList: UserListItem[];
  programStudents: { id: string; name: string; email: string }[];
  programMentors: { id: string; name: string; specialization?: string }[];
  selectedStudentId: string;
  setSelectedStudentId: (v: string) => void;
  selectedMentorId: string;
  setSelectedMentorId: (v: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddStudentModal({
  isOpen,
  onClose,
  programName,
  enrollCase,
  setEnrollCase,
  usersList,
  programStudents,
  programMentors,
  selectedStudentId,
  setSelectedStudentId,
  selectedMentorId,
  setSelectedMentorId,
  isSubmitting,
  onSubmit,
}: AddStudentModalProps) {
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
            className="relative z-10 bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-heading font-bold text-base text-foreground">
                Student Enrollment: {programName}
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-border">
              <button
                type="button"
                onClick={() => setEnrollCase("case1")}
                className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  enrollCase === "case1" || enrollCase === "case2"
                    ? "border-brand-purple text-brand-purple"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Case 1: Distribusi Mentor Personal
              </button>
              <button
                type="button"
                onClick={() => setEnrollCase("case3")}
                className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  enrollCase === "case3"
                    ? "border-red-500 text-red-500"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Case 2: Transfer Program (Clean Transfer)
              </button>
            </div>

            <div className="text-2xs text-muted-foreground bg-secondary/20 p-3 rounded-lg border border-border/50">
              {(enrollCase === "case1" || enrollCase === "case2") &&
                "Pendaftaran ulang siswa (atau distribusi mentor personal) di dalam program ini."}
              {enrollCase === "case3" && (
                <span className="text-red-600 dark:text-red-400 font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  PERINGATAN (CLEAN TRANSFER): Memindahkan murid antar program akan menghapus SELURUH
                  riwayat nilai, absen, dan tugas di program lama!
                </span>
              )}
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {enrollCase === "case3"
                    ? "Pilih Siswa dari Program Lain"
                    : "Pilih Siswa Program Ini"}
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {enrollCase === "case3"
                    ? usersList
                        .filter(
                          (u) =>
                            u.role === "student" &&
                            u.selectedProgram &&
                            u.selectedProgram !== programName
                        )
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} (asal: {s.selectedProgram})
                          </option>
                        ))
                    : programStudents?.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.email})
                        </option>
                      ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Pilih Mentor Program Ini
                </label>
                <select
                  value={selectedMentorId}
                  onChange={(e) => setSelectedMentorId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden"
                >
                  <option value="">-- Tanpa Personal Mentor / Otomatis (Opsional) --</option>
                  {programMentors?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.specialization || "Primary Mentor"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
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
                  className={`px-4 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm ${
                    enrollCase === "case3"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-brand-purple hover:bg-brand-purple-hover"
                  }`}
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {enrollCase === "case3" ? "Eksekusi Clean Transfer" : "Daftarkan Siswa"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
