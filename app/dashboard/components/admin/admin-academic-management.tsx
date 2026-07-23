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
  Lock,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { Batch, Program } from "./types";

interface AdminAcademicManagementProps {
  isLoadingPrograms: boolean;
  isLoadingBatches: boolean;
  programsData: {
    programs?: Program[];
  } | null;
  batchesList: Batch[];
  selectedOldBatchId: string;
  setSelectedOldBatchId: (id: string) => void;
  onOpenProgramDetail: (prog: any) => void;
  onOpenCreateBatch: () => void;
  onOpenBatchDetail: (batch: any) => void;
  onOpenEditBatch: (batch: any) => void;
  onActivateBatch: (batchId: string, name: string) => void;
  onOpenMentorMatrix: (batch: any) => void;
}

export function AdminAcademicManagement({
  isLoadingPrograms,
  isLoadingBatches,
  programsData,
  batchesList,
  selectedOldBatchId,
  setSelectedOldBatchId,
  onOpenProgramDetail,
  onOpenCreateBatch,
  onOpenBatchDetail,
  onOpenEditBatch,
  onActivateBatch,
  onOpenMentorMatrix,
}: AdminAcademicManagementProps) {
  const activeBatch = batchesList.find((b) => b.status === "active");
  const activePrograms =
    programsData?.programs?.filter((prog: any) => prog.activeBatch) || [];

  return (
    <div className="space-y-6 font-sans">
      {isLoadingPrograms ? (
        <div className="flex items-center justify-center p-12 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-brand-purple" />
          <span className="text-sm">Memuat data program dan batch akademik...</span>
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
                    Silakan buat atau aktifkan angkatan/batch baru di daftar batch.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Active Programs Grid */}
          {activePrograms.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl bg-secondary/15">
              <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50 animate-pulse" />
              <p className="text-xs text-muted-foreground font-semibold">
                Tidak ada program studi yang diikutsertakan pada Batch Aktif saat ini.
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
                          prog.studentsCount > 0
                            ? "bg-brand-purple/10 text-brand-purple border border-brand-purple/20"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {prog.studentsCount} Murid
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {prog.description}
                    </p>
                  </div>

                  <div className="border-t border-border/60 pt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <GraduationCap className="w-4 h-4 text-brand-purple" />
                        {prog.mentorsCount} Mentor Assigned
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

          {/* Batches Cohort Management Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card border border-border rounded-xl p-6 shadow-sm mt-8">
            <div>
              <h2 className="font-heading font-bold text-lg flex items-center gap-2 text-foreground">
                <Layers className="w-5 h-5 text-brand-purple" />
                Manajemen Angkatan / Batch (Global Cohort)
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Aturan Mutlak: Hanya boleh ada 1 (satu) Batch berstatus ACTIVE pada satu waktu.
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
          </div>
        </>
      )}
    </div>
  );
}
