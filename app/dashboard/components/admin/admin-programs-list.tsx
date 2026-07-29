"use client";

import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Layers,
  Loader2,
} from "lucide-react";
import { Batch, Program } from "./types";

interface AdminProgramsListProps {
  isLoadingPrograms: boolean;
  programsData: {
    programs?: Program[];
  } | null;
  batchesList: Batch[];
  selectedOldBatchId: string;
  setSelectedOldBatchId: (id: string) => void;
  onOpenProgramDetail: (prog: any) => void;
}

export function AdminProgramsList({
  isLoadingPrograms,
  programsData,
  batchesList,
  selectedOldBatchId,
  setSelectedOldBatchId,
  onOpenProgramDetail,
}: AdminProgramsListProps) {
  const activeBatch = batchesList.find((b) => b.status === "active");
  const allPrograms = programsData?.programs || [];

  const activePrograms = allPrograms.filter((prog: any) => {
    if (!activeBatch) return true;
    if (activeBatch.includedProgramIds && activeBatch.includedProgramIds.length > 0) {
      return activeBatch.includedProgramIds.includes(prog.id);
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {isLoadingPrograms ? (
        <div className="flex items-center justify-center p-12 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-brand-purple" />
          <span className="text-sm">Memuat data program studi...</span>
        </div>
      ) : (
        <>
          {/* Active Batch Header Banner */}
          {activeBatch ? (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white shadow-md border border-white/10">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-purple/20 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 text-brand-purple rounded-lg shrink-0 border border-white/10">
                    <Calendar className="w-5 h-5 text-brand-purple" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-white">
                      Batch Aktif Saat Ini
                    </h3>
                    <p className="text-xs text-indigo-200/85 mt-0.5 font-sans">
                      Seluruh kegiatan belajar mengajar berjalan di batch ini.
                    </p>
                  </div>
                </div>
                <div className="px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {activeBatch.name}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between border border-amber-500/20 bg-amber-500/5 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-600 rounded-lg shrink-0">
                  <AlertCircle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-foreground">
                    Tidak Ada Batch Aktif
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Silakan buat atau aktifkan angkatan/batch baru di tab Batch.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Programs Grid */}
          {activePrograms.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl bg-secondary/15">
              <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50 animate-pulse" />
              <p className="text-xs text-muted-foreground font-semibold">
                Belum ada program studi yang diikutsertakan pada batch aktif ini.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {activePrograms.map((prog: any) => (
                <div
                  key={prog.id}
                  className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-brand-purple/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading font-bold text-base text-foreground">
                        {prog.name}
                      </h3>
                      <span
                        className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded-full text-2xs font-semibold ${
                          (prog.studentsCount || 0) > 0
                            ? "bg-brand-purple/10 text-brand-purple border border-brand-purple/20"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {prog.studentsCount || 0} Murid
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {prog.description || "Program studi pembelajaran LMS."}
                    </p>
                  </div>

                  <div className="border-t border-border/60 pt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <GraduationCap className="w-4 h-4 text-brand-purple" />
                        {prog.mentorsCount || 0} Mentor Assigned
                      </span>
                    </div>
                    <button
                      onClick={() => onOpenProgramDetail(prog)}
                      className="px-3.5 py-1.5 rounded-lg bg-brand-purple/10 hover:bg-brand-purple text-brand-purple hover:text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Kelola & Enrollment
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Historical Batches Archive Section */}
          <div className="border-t border-border pt-6 mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-purple" />
                  Arsip & Riwayat Batch Lama
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pilih angkatan lama yang sudah selesai untuk melihat kembali data murid dan mentor.
                </p>
              </div>
              <select
                value={selectedOldBatchId}
                onChange={(e) => setSelectedOldBatchId(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden font-medium cursor-pointer"
              >
                <option value="none">-- Pilih Batch Lama --</option>
                {batchesList
                  .filter((b) => b.status === "completed")
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
              </select>
            </div>

            {selectedOldBatchId !== "none" && (() => {
              const selectedBatch = batchesList.find((b) => b.id === selectedOldBatchId);
              if (!selectedBatch) return null;
              if (!selectedBatch.includedPrograms || selectedBatch.includedPrograms.length === 0) {
                return (
                  <p className="text-xs text-muted-foreground py-4 text-center border border-dashed border-border rounded-xl bg-secondary/15">
                    Tidak ada program studi yang terdaftar di batch ini.
                  </p>
                );
              }
              return (
                <div className="grid md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                  {selectedBatch.includedPrograms.map((prog: any) => (
                    <div
                      key={prog.id}
                      className="bg-card/70 border border-border/80 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 opacity-90"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-heading font-bold text-base text-foreground/80">
                              {prog.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <span className="px-2 py-0.5 rounded text-3xs font-semibold bg-secondary/60 text-muted-foreground border border-border/20">
                                Selesai (Read-Only)
                              </span>
                            </div>
                          </div>
                          <span className="whitespace-nowrap shrink-0 px-2.5 py-1 rounded-full text-2xs font-semibold bg-secondary text-muted-foreground">
                            {prog.studentsCount || 0} Murid
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground/80 line-clamp-2">
                          {prog.description}
                        </p>
                      </div>

                      <div className="border-t border-border/40 pt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5 font-medium text-foreground/75">
                          <GraduationCap className="w-4 h-4 text-brand-purple/75" />
                          {prog.mentorsCount || 0} Mentor
                        </span>
                        <button
                          onClick={() => onOpenProgramDetail({ ...prog, isReadOnly: true })}
                          className="px-3.5 py-1.5 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          Lihat Detail & Murid
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}
