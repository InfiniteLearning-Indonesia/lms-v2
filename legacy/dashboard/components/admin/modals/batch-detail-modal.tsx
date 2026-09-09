"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Layers, X } from "lucide-react";

interface BatchDetail {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  status: string;
  classCount?: number;
  studentCount?: number;
  includedPrograms?: {
    id: string;
    name: string;
    mentorsCount?: number;
    studentsCount?: number;
  }[];
}

interface BatchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: BatchDetail | null;
}

export function BatchDetailModal({
  isOpen,
  onClose,
  batch,
}: BatchDetailModalProps) {
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 bg-card border border-border rounded-xl shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto font-sans"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-purple" />
                Statistik & Detail Batch: {batch.name}
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-secondary/30 border border-border rounded-xl text-center space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Total Program
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {batch.includedPrograms?.length || 0}
                  </p>
                </div>
                <div className="p-3 bg-secondary/30 border border-border rounded-xl text-center space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-sans">
                    Total Kelas
                  </p>
                  <p className="text-lg font-bold text-foreground">{batch.classCount || 0}</p>
                </div>
                <div className="p-3 bg-secondary/30 border border-border rounded-xl text-center space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-sans">
                    Total Murid
                  </p>
                  <p className="text-lg font-bold text-brand-purple">{batch.studentCount || 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3.5 bg-brand-purple/5 border border-brand-purple/20 rounded-xl">
                <Calendar className="w-4 h-4 text-brand-purple shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-brand-purple uppercase tracking-wider font-sans">
                    Durasi Cohort / Angkatan
                  </p>
                  <p className="text-xs font-semibold text-foreground">
                    {batch.startDate && batch.endDate ? (
                      <>
                        {new Date(batch.startDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                        {" s/d "}
                        {new Date(batch.endDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </>
                    ) : (
                      <span className="text-muted-foreground italic font-normal">
                        Tanggal durasi belum dikonfigurasi.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-heading font-bold text-sm text-foreground">
                  Distribusi Murid per Program Studi
                </h4>

                <div className="border border-border rounded-xl overflow-hidden bg-background">
                  <div className="grid grid-cols-3 border-b border-border bg-secondary/35 font-semibold p-2.5 text-foreground text-[10px] uppercase tracking-wider font-sans">
                    <div>Nama Program</div>
                    <div className="text-center">Jumlah Mentor</div>
                    <div className="text-center">Jumlah Murid</div>
                  </div>

                  {batch.includedPrograms && batch.includedPrograms.length > 0 ? (
                    batch.includedPrograms.map((prog) => (
                      <div
                        key={prog.id}
                        className="grid grid-cols-3 p-2.5 border-b border-border last:border-b-0 text-foreground items-center font-sans"
                      >
                        <div className="font-semibold text-xs truncate">{prog.name}</div>
                        <div className="text-center font-medium text-muted-foreground">
                          {prog.mentorsCount || 0} Mentor
                        </div>
                        <div className="text-center font-bold text-brand-purple">
                          {prog.studentsCount || 0} Murid
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-center text-muted-foreground text-xs font-sans">
                      Tidak ada program studi terdaftar
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-secondary/20 border border-border rounded-xl space-y-2">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-sans">
                  <span>Status Siklus Hidup</span>
                  <span
                    className={`px-2 py-0.5 rounded font-semibold capitalize font-sans ${
                      batch.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : batch.status === "draft"
                        ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        : "bg-slate-500/10 text-slate-600 border border-slate-500/20"
                    }`}
                  >
                    {batch.status === "completed" ? "Selesai (Diakhiri)" : batch.status}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                  {batch.status === "active"
                    ? "Siklus saat ini sedang berjalan aktif. Semua pendaftaran murid baru dan tugas diarahkan ke angkatan ini."
                    : batch.status === "draft"
                    ? "Batch ini sedang dipersiapkan (Draft) dan belum diumumkan ke sistem pembelajaran aktif."
                    : "Siklus angkatan ini sudah selesai diakhiri. Seluruh data historis bersifat Read-Only untuk integritas sistem."}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-secondary border border-border text-xs font-semibold cursor-pointer hover:bg-secondary/80 text-foreground transition-colors font-sans"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
