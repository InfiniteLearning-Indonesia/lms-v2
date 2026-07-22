"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileSpreadsheet, ShieldAlert, X } from "lucide-react";

export interface ParsedCsvStudent {
  name: string;
  email: string;
  whatsapp?: string;
  institution?: string;
  studyProgram?: string;
  selectedProgram: string;
}

interface ReviewCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedStudents: ParsedCsvStudent[];
  onConfirmImport: () => void;
}

export function ReviewCsvModal({
  isOpen,
  onClose,
  parsedStudents,
  onConfirmImport,
}: ReviewCsvModalProps) {
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
            className="relative z-10 bg-card border border-border rounded-xl shadow-xl max-w-4xl w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]"
          >
            <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
              <div>
                <h3 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-brand-purple" />
                  Konfirmasi Pendaftaran Massal
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Silakan tinjau data hasil parsing CSV sebelum dimasukkan ke database.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-700 dark:text-amber-400 leading-normal flex items-start gap-2 shrink-0">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>Informasi Penting:</strong> Pendaftaran massal ini berstatus{" "}
                <strong>Invited (Belum Terverifikasi)</strong>. Akun murid akan dibuat di database
                tetapi <strong>tidak akan</strong> mengirim email blast otomatis secara massal atau
                didistribusikan ke mentor. Anda harus mengirimkan undangan email secara manual satu
                per satu dari tab daftar pengguna.
              </span>
            </div>

            <div className="flex-1 overflow-y-auto border border-border rounded-lg bg-secondary/10">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-secondary border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">Nama Lengkap</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">WhatsApp</th>
                    <th className="p-3">Institusi</th>
                    <th className="p-3">Program Studi</th>
                    <th className="p-3">Program Pilihan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {parsedStudents.map((student, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium text-foreground">{student.name}</td>
                      <td className="p-3 font-mono text-2xs text-muted-foreground">
                        {student.email}
                      </td>
                      <td className="p-3 text-muted-foreground">{student.whatsapp || "-"}</td>
                      <td className="p-3 text-muted-foreground">{student.institution || "-"}</td>
                      <td className="p-3 text-muted-foreground">{student.studyProgram || "-"}</td>
                      <td className="p-3 font-semibold text-brand-purple">
                        {student.selectedProgram}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4 shrink-0">
              <span className="text-xs font-semibold text-foreground bg-secondary px-3 py-1.5 rounded-lg border border-border">
                Total data terdeteksi:{" "}
                <strong className="text-brand-purple">{parsedStudents.length} Murid</strong>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold font-heading transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={onConfirmImport}
                  className="px-5 py-2.5 bg-brand-purple hover:bg-brand-purple-hover text-white font-semibold text-xs rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  Ya, Daftarkan Murid
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
