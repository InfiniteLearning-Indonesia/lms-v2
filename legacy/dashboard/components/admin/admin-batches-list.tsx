"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Layers,
  Loader2,
  Lock,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { Batch } from "./types";

interface AdminBatchesListProps {
  isLoadingBatches: boolean;
  batchesList: Batch[];
  onOpenCreateBatch: () => void;
  onOpenBatchDetail: (batch: any) => void;
  onOpenEditBatch: (batch: any) => void;
  onActivateBatch: (batchId: string, name: string) => void;
  onOpenMentorMatrix: (batch: any) => void;
}

export function AdminBatchesList({
  isLoadingBatches,
  batchesList,
  onOpenCreateBatch,
  onOpenBatchDetail,
  onOpenEditBatch,
  onActivateBatch,
  onOpenMentorMatrix,
}: AdminBatchesListProps) {
  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card border border-border rounded-xl p-6 shadow-sm">
        <div>
          <h2 className="font-heading font-bold text-lg flex items-center gap-2 text-foreground">
            <Layers className="w-5 h-5 text-brand-purple" />
            Manajemen Angkatan / Batch (Global Cohort)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Aturan Mutlak: Hanya boleh ada 1 (satu) Batch berstatus ACTIVE pada satu waktu. Tiap batch berjalan berbarengan untuk program studi yang diikutsertakan.
          </p>
        </div>
        <button
          onClick={onOpenCreateBatch}
          className="px-4 py-2 bg-brand-purple text-white hover:bg-brand-purple/90 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Buat Batch Baru
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="font-heading font-semibold text-sm text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-purple" />
          Daftar Cohort
        </h3>

        {isLoadingBatches ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-brand-purple" />
          </div>
        ) : batchesList.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl bg-secondary/20">
            <Layers className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-xs text-muted-foreground font-medium">
              Belum ada data angkatan / batch yang dibuat.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {batchesList.map((batch) => {
              const isActive = batch.status === "active";
              const isDraft = batch.status === "draft";
              const isCompleted = batch.status === "completed";

              return (
                <div
                  key={batch.id}
                  className={`relative overflow-hidden rounded-xl p-5 border transition-all hover:shadow-xs w-full flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
                    isActive
                      ? "bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-500/50 shadow-md shadow-indigo-950/20"
                      : isDraft
                      ? "bg-card text-foreground border-amber-500/30 hover:border-amber-500/50"
                      : "bg-card/60 text-foreground/90 border-border hover:border-muted-foreground/35 opacity-90"
                  }`}
                >
                  <div className="space-y-1.5 w-full lg:w-[240px] shrink-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4
                        className={`font-heading font-black text-lg ${
                          isActive ? "text-white" : "text-foreground"
                        }`}
                      >
                        {batch.name}
                      </h4>

                      {isActive && (
                        <span className="bg-emerald-600/90 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm font-sans">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Aktif
                        </span>
                      )}
                      {isDraft && (
                        <span className="bg-amber-500/90 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm font-sans">
                          <AlertCircle className="w-2.5 h-2.5" />
                          Draft
                        </span>
                      )}
                      {isCompleted && (
                        <span className="bg-slate-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 border border-white/10 font-sans">
                          <Lock className="w-2.5 h-2.5" />
                          Selesai
                        </span>
                      )}
                    </div>
                    {batch.startDate && batch.endDate && (
                      <p
                        className={`text-3xs font-sans font-medium flex items-center gap-1 mt-1 ${
                          isActive ? "text-indigo-200" : "text-brand-purple"
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        {new Date(batch.startDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        -{" "}
                        {new Date(batch.endDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>

                  <div className="flex-1 min-w-[200px] space-y-1 font-sans">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isActive ? "text-indigo-200/70" : "text-muted-foreground"
                      }`}
                    >
                      Program Studi ({batch.includedPrograms?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {batch.includedPrograms?.map((prog: any) => (
                        <span
                          key={prog.id}
                          className={`px-2 py-0.5 text-3xs font-medium rounded-md border ${
                            isActive
                              ? "bg-white/10 text-white border-white/10"
                              : "bg-secondary text-foreground border-border/60"
                          }`}
                        >
                          {prog.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="w-full lg:w-[150px] shrink-0 space-y-1 font-sans">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isActive ? "text-indigo-200/70" : "text-muted-foreground"
                      }`}
                    >
                      Statistik
                    </span>
                    <div className="flex flex-col gap-0.5 text-2xs mt-0.5">
                      <div className="flex items-center gap-1.5">
                        <Layers
                          className={`w-3.5 h-3.5 ${
                            isActive ? "text-indigo-300" : "text-brand-purple"
                          }`}
                        />
                        <span>
                          <strong>{batch.classCount || 0}</strong> Kelas
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users
                          className={`w-3.5 h-3.5 ${
                            isActive ? "text-indigo-300" : "text-brand-purple"
                          }`}
                        />
                        <span>
                          <strong>{batch.studentCount || 0}</strong> Murid
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0 lg:self-center">
                    <button
                      onClick={() => onOpenBatchDetail(batch)}
                      className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isActive
                          ? "bg-brand-purple/20 hover:bg-brand-purple/40 text-brand-purple dark:text-purple-300 border border-brand-purple/30"
                          : "bg-brand-purple/10 hover:bg-brand-purple/20 text-brand-purple border border-brand-purple/20"
                      }`}
                    >
                      Detail
                    </button>

                    <button
                      onClick={() => onOpenEditBatch(batch)}
                      className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isActive
                          ? "bg-white/10 hover:bg-white/20 text-white border border-white/15"
                          : "bg-secondary hover:bg-secondary/80 text-foreground border border-border"
                      }`}
                    >
                      <Settings className="w-3 h-3" />
                      Edit
                    </button>

                    {!isActive && !isCompleted && (
                      <button
                        onClick={() => onActivateBatch(batch.id, batch.name)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-2xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Aktifkan
                      </button>
                    )}

                    <button
                      onClick={() => onOpenMentorMatrix(batch)}
                      className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border text-2xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <GraduationCap className="w-3 h-3 text-brand-purple" />
                      Assign Matrix
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
