"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Layers, Loader2, X } from "lucide-react";
import { Program } from "../types";

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  setName: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  status: "draft" | "active";
  setStatus: (v: "draft" | "active") => void;
  programsList: Program[];
  selectedProgramIds: string[];
  setSelectedProgramIds: (ids: string[]) => void;
  customProgramInput: string;
  setCustomProgramInput: (v: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreateBatchModal({
  isOpen,
  onClose,
  name,
  setName,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  status,
  setStatus,
  programsList,
  selectedProgramIds,
  setSelectedProgramIds,
  customProgramInput,
  setCustomProgramInput,
  isSubmitting,
  onSubmit,
}: CreateBatchModalProps) {
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
                <Layers className="w-4 h-4 text-brand-purple" />
                Buat Angkatan / Batch Baru (Global Cohort)
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
                  className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden"
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
                <label className="text-xs font-semibold text-foreground">Status Awal</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "draft" | "active")}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden font-medium"
                >
                  <option value="draft">Persiapan / Draft (Tidak Mengganggu Batch Aktif)</option>
                  <option value="active">Active Cohort (Otomatis Selesaikan Batch Aktif Lainnya)</option>
                </select>
                {status === "active" && (
                  <p className="text-3xs text-amber-500 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    Peringatan: Mengaktifkan batch ini akan langsung mengunci batch aktif saat ini menjadi Read-Only.
                  </p>
                )}
              </div>

              <div className="space-y-2 border-t border-b border-border py-3">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Program Studi yang Diikutsertakan</span>
                  <span className="text-2xs font-normal text-muted-foreground">Pilih program yang akan dibuka</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                  {programsList.map((prog) => {
                    const isChecked = selectedProgramIds.includes(prog.id);
                    return (
                      <label
                        key={prog.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-xs ${
                          isChecked
                            ? "border-brand-purple bg-brand-purple/5 font-medium text-foreground"
                            : "border-border bg-secondary/30 text-muted-foreground"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProgramIds([...selectedProgramIds, prog.id]);
                            } else {
                              setSelectedProgramIds(selectedProgramIds.filter((id) => id !== prog.id));
                            }
                          }}
                          className="rounded border-input text-brand-purple focus:ring-brand-purple"
                        />
                        <span className="truncate">{prog.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Tambah Program Baru</span>
                  <span className="text-3xs font-normal text-brand-purple">Ekspansi Kurikulum</span>
                </label>
                <input
                  type="text"
                  value={customProgramInput}
                  onChange={(e) => setCustomProgramInput(e.target.value)}
                  placeholder="misal: Cybersecurity Development, Cloud Engineering (pisahkan dengan koma)"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden"
                />
                <p className="text-3xs text-muted-foreground">
                  Program baru yang Anda ketik akan otomatis dibuat dan langsung diikutsertakan ke dalam batch ini.
                </p>
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
                  Simpan Angkatan / Batch
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
