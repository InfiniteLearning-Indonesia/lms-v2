import React, { useState } from "react";
import { X, Sparkles, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CloneClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: any[];
  currentClass: any;
  onClone: (sourceClassId: string) => void;
  isSubmitting: boolean;
}

export function CloneClassModal({
  isOpen,
  onClose,
  classes,
  currentClass,
  onClone,
  isSubmitting,
}: CloneClassModalProps) {
  const [selectedSourceId, setSelectedSourceId] = useState("");

  if (!currentClass) return null;

  // Filter only classes from the SAME program but DIFFERENT batch
  const availableSourceClasses = classes.filter(
    (c) =>
      c.id !== currentClass.id &&
      c.program?.id === currentClass.program?.id &&
      (c.materials?.length > 0 || c.assignments?.length > 0)
  );

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
            className="relative z-10 bg-card border border-border rounded-xl shadow-lg max-w-md w-full p-6 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Duplikat Materi AI
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tarik riwayat materi dan tugas dari angkatan sebelumnya.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-muted rounded-lg text-muted-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {availableSourceClasses.length === 0 ? (
                <div className="bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-4 text-sm text-amber-600 dark:text-amber-400">
                  Tidak ditemukan riwayat kelas sebelumnya untuk program <strong>{currentClass.program?.name}</strong> yang memiliki materi atau tugas.
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Pilih Kelas Sumber (Angkatan Sebelumnya):
                  </label>
                  <select
                    value={selectedSourceId}
                    onChange={(e) => setSelectedSourceId(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand-purple"
                  >
                    <option value="">-- Pilih Angkatan --</option>
                    {availableSourceClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.batch?.name || "Batch Tidak Diketahui"} (
                        {c.materials?.length || 0} Materi, {c.assignments?.length || 0} Tugas)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    *Tenggat waktu (due date) pada tugas akan di-reset otomatis agar Anda dapat mengaturnya ulang.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => onClone(selectedSourceId)}
                disabled={!selectedSourceId || isSubmitting}
                className="px-4 py-2 rounded-lg bg-brand-purple hover:bg-brand-purple-hover text-white text-sm font-semibold shadow-xs disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Memproses...</span>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Duplikat Sekarang
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
