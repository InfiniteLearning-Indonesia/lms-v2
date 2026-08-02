"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  Info,
  Layers,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  User,
  Users,
  Video,
  MapPin,
  FolderGit2,
  Headphones,
  Link2,
  Sliders,
  Trash2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MentorClass, MentorProfile } from "./types";

interface MentorClassesViewProps {
  profile?: MentorProfile;
  classes: MentorClass[];
  activeClasses: MentorClass[];
  selectedClassId: string | null;
  setSelectedClassId: (id: string) => void;
  selectedCls: MentorClass | undefined;
  isReadOnly: boolean;
  isDistributing: boolean;
  distributeMessage: string | null;
  handleDistributeModulo: (progName: string) => void;
  onOpenAddMaterial: () => void;
  onOpenAddAssignment: () => void;
  onOpenAddCompetency?: () => void;
  onOpenAddProgramCompetency?: () => void;
  onEditCompetency?: (comp: any) => void;
  competencies?: any[];
  onDeleteMaterial?: (id: string) => void;
  onDeleteAssignment?: (id: string) => void;
  onDeleteCompetency?: (id: string) => void;
  onOpenCloneModal?: () => void;
}

export function MentorClassesView({
  profile,
  classes,
  activeClasses,
  selectedClassId,
  setSelectedClassId,
  selectedCls,
  isReadOnly,
  isDistributing,
  distributeMessage,
  handleDistributeModulo,
  onOpenAddMaterial,
  onOpenAddAssignment,
  onOpenAddCompetency,
  onOpenAddProgramCompetency,
  onEditCompetency,
  competencies = [],
  onDeleteMaterial,
  onDeleteAssignment,
  onDeleteCompetency,
  onOpenCloneModal,
}: MentorClassesViewProps) {
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: "competency" | "material" | "assignment";
    id: string;
    title: string;
  } | null>(null);
  const [deleteCountdown, setDeleteCountdown] = useState(5);

  const [isEasterEggLoading, setIsEasterEggLoading] = useState(false);
  const [showCloneButton, setShowCloneButton] = useState(false);

  useEffect(() => {
    if (selectedCls && selectedCls.materials?.length === 0 && selectedCls.assignments?.length === 0) {
      setIsEasterEggLoading(true);
      setShowCloneButton(false);
      const timer = setTimeout(() => {
        setIsEasterEggLoading(false);
        setShowCloneButton(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setIsEasterEggLoading(false);
      setShowCloneButton(false);
    }
  }, [selectedCls?.id, selectedCls?.materials?.length, selectedCls?.assignments?.length]);

  useEffect(() => {
    if (!deleteConfirmTarget) {
      setDeleteCountdown(5);
      return;
    }

    setDeleteCountdown(5);
    const interval = setInterval(() => {
      setDeleteCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [deleteConfirmTarget]);

  const handleExecuteDelete = () => {
    if (!deleteConfirmTarget) return;
    const { type, id } = deleteConfirmTarget;

    if (type === "competency") {
      onDeleteCompetency?.(id);
    } else if (type === "material") {
      onDeleteMaterial?.(id);
    } else if (type === "assignment") {
      onDeleteAssignment?.(id);
    }

    setDeleteConfirmTarget(null);
  };

  if (activeClasses.length === 0) {
    return (
      <Alert className="border-border bg-card shadow-sm p-6 font-sans">
        <Info className="w-6 h-6 text-brand-purple shrink-0 mt-0.5" />
        <div className="space-y-2">
          <AlertTitle className="font-heading font-bold text-base text-foreground">
            Belum Ada Kelas Aktif
          </AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
            {profile?.selectedProgram ? (
              <>
                Spesialisasi Anda: <strong>{profile.specialization || "Belum Ditentukan"}</strong>.<br />
                Program yang di-assign: <strong>{profile.selectedProgram}</strong>.<br /><br />
                Saat ini belum ada kelas ajar aktif untuk Anda di Batch berjalan. Hal ini bisa disebabkan karena:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Belum ada Batch Cohort aktif yang didefinisikan/dijalankan oleh Administrator.</li>
                  <li>Siswa belum terdaftar (atau belum dijalankan alokasi Modulo/pembagian kelas oleh Admin).</li>
                </ul>
              </>
            ) : (
              <>
                Anda belum dikaitkan dengan Program Studi spesifik apa pun. Hubungi Administrator untuk meng-assign Anda ke Program yang sesuai.
              </>
            )}
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 font-sans">
      {/* Class List Sidebar */}
      <div className="md:col-span-1 space-y-4">
        <div className="space-y-3">
          {activeClasses.map((cls) => {
            const isSelected = cls.id === selectedClassId;
            return (
              <div
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${isSelected
                    ? "bg-brand-purple/10 border-brand-purple shadow-sm"
                    : "bg-card border-border hover:border-border/80 hover:bg-secondary/30"
                  }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                    {cls.batch?.name || "Batch 7"}
                  </span>
                  {cls.batch?.status === "active" ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-200"
                    >
                      Aktif
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-200"
                    >
                      Selesai
                    </Badge>
                  )}
                </div>
                <h3 className="font-heading font-bold text-base mt-2 text-foreground">
                  {cls.program?.name || "Program Studi"}
                </h3>
                {cls.batch?.startDate && cls.batch?.endDate && (
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground bg-secondary/50 w-fit px-2 py-1 rounded-md border border-border">
                    <Calendar className="w-3 h-3" />
                    <span className="font-semibold">
                      {new Date(cls.batch.startDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(cls.batch.endDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {cls.enrolledStudentsCount || 0} Siswa
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {cls.materials?.length || 0} Materi
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Class Details & Syllabus Progress */}
      <div className="md:col-span-2 space-y-6">
        {selectedCls && (
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-secondary/20 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-heading font-bold text-foreground">
                    {selectedCls.program?.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1">
                    {selectedCls.batch?.name} • Dikelola oleh Tim Mentor
                    {selectedCls.batch?.startDate && selectedCls.batch?.endDate && (
                      <span className="block mt-1 font-medium text-brand-purple flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Durasi:{" "}
                        {new Date(selectedCls.batch.startDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}{" "}
                        -{" "}
                        {new Date(selectedCls.batch.endDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-xs font-semibold py-1">
                    Silabus Berjalan
                  </Badge>
                  <Link
                    href={`/dashboard/class/${selectedCls.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
                  >
                    <span>Masuk Ruang Kelas</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Clone AI UI / Easter Egg */}
              {isEasterEggLoading ? (
                <div className="flex flex-col items-center justify-center py-6 px-4 border border-brand-purple/20 bg-brand-purple/5 rounded-xl border-dashed">
                  <Sparkles className="w-8 h-8 text-amber-500 animate-pulse mb-3" />
                  <p className="text-sm font-semibold text-brand-purple animate-pulse">
                    ✨ Sedang Cek Data Lama..
                  </p>
                </div>
              ) : showCloneButton && !isReadOnly ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-5 border border-brand-purple/30 bg-brand-purple/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-brand-purple">
                        Kelas masih kosong?
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Tarik materi dan tugas dari angkatan sebelumnya secara otomatis.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={onOpenCloneModal}
                    className="bg-brand-purple hover:bg-brand-purple-hover text-white cursor-pointer shadow-sm shadow-brand-purple/20 transition-all hover:scale-105"
                  >
                    <Sparkles className="w-4 h-4 mr-2 text-amber-400" />
                    Tarik Materi
                  </Button>
                </div>
              ) : null}

              {/* Live Cohort Progress Bar */}
              {(() => {
                let progress = 0;
                let elapsedDays = 0;
                let totalDays = 0;

                if (selectedCls.batch?.startDate && selectedCls.batch?.endDate) {
                  const s = new Date(selectedCls.batch.startDate);
                  const e = new Date(selectedCls.batch.endDate);
                  const n = new Date();

                  const startDate = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0);
                  const endDate = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999);
                  const today = new Date(n.getFullYear(), n.getMonth(), n.getDate(), 12, 0, 0, 0);

                  const msPerDay = 1000 * 60 * 60 * 24;
                  totalDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / msPerDay));

                  if (n.getTime() >= startDate.getTime()) {
                    if (n.getTime() > endDate.getTime()) {
                      progress = 100;
                      elapsedDays = totalDays;
                    } else {
                      elapsedDays = Math.min(
                        totalDays,
                        Math.max(1, Math.floor((today.getTime() - startDate.getTime()) / msPerDay) + 1)
                      );
                      progress = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
                    }
                  }
                }

                return (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-foreground">
                        <Calendar className="w-3.5 h-3.5 text-brand-purple" />
                        Progres Pembelajaran Cohort ({elapsedDays} dari {totalDays} Hari Terlewati)
                      </span>
                      <span className="text-brand-purple font-bold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-secondary" />
                  </div>
                );
              })()}

              {/* Modulo Distribution Banner */}
              {(() => {
                const progName = selectedCls.program?.name || "";
                const isCollab =
                  progName.toLowerCase().includes("web") ||
                  progName.toLowerCase().includes("mobile");
                if (!isCollab) return null;
                return (
                  <div className="border border-brand-purple/30 bg-brand-purple/5 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-brand-purple" />
                        <h4 className="font-heading font-bold text-sm text-foreground">
                          Distribusi Alokasi Murid (Setara & Merata)
                        </h4>
                      </div>
                      {!isReadOnly && (
                        <Button
                          onClick={() => handleDistributeModulo(progName)}
                          disabled={isDistributing}
                          size="sm"
                          className="bg-brand-purple hover:bg-brand-purple-hover text-white text-xs h-8 cursor-pointer"
                        >
                          {isDistributing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5 mr-1" />
                          )}
                          Jalankan Distribusi
                        </Button>
                      )}
                    </div>
                    <p className="text-2xs text-muted-foreground leading-relaxed">
                      Sistem akan membagi siswa secara setara dan merata ke seluruh mentor yang mengampu program ini sebagai program utama.
                    </p>
                    {distributeMessage && (
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{distributeMessage}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 1. Competencies Section */}
              <div className="space-y-3">
                <h4 className="font-heading font-bold text-sm text-foreground flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brand-purple" />
                    Kompetensi Pembelajaran ({competencies?.length || 0})
                  </span>
                  {!isReadOnly && (onOpenAddProgramCompetency || onOpenAddCompetency) && (
                    <Button
                      onClick={onOpenAddProgramCompetency || onOpenAddCompetency}
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs flex items-center gap-1.5 cursor-pointer border-brand-purple/30 text-brand-purple hover:bg-brand-purple/10"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Kompetensi
                    </Button>
                  )}
                </h4>
                <div className="grid gap-2">
                  {competencies && competencies.length > 0 ? (
                    competencies.map((comp: any, idx: number) => (
                      <div
                        key={comp.id || idx}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-brand-purple/5 hover:bg-brand-purple/10 transition-colors h-14"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-brand-purple/10 flex items-center justify-center text-brand-purple font-bold text-xs shrink-0">
                            K{idx + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate max-w-[180px] sm:max-w-[260px] md:max-w-[320px]" title={comp.name}>
                              {comp.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[180px] sm:max-w-[260px] md:max-w-[320px]">
                              Kategori: {comp.category || "General"} • Phase: {comp.phase || "Micro"} • Bobot: {comp.weight || 0}%
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/dashboard/competency/${comp.id}/rubric`}
                            className="text-[11px] font-medium text-brand-purple bg-card hover:bg-brand-purple/10 px-2.5 py-1 rounded-md border border-border shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                            title="Klik untuk mengedit Rubrik Kriteria"
                          >
                            <span>{comp.rubric?.criteria?.length || 0} Rubrik Kriteria</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>

                          {!isReadOnly && onEditCompetency && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0 border-brand-purple/30 hover:bg-brand-purple/10 cursor-pointer"
                              onClick={() => onEditCompetency(comp)}
                              title="Edit Kompetensi (Nama, Kategori, Phase)"
                            >
                              <Pencil className="w-3.5 h-3.5 text-brand-purple" />
                            </Button>
                          )}

                          {!isReadOnly && onDeleteCompetency && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0 border-red-500/20 hover:bg-red-50 cursor-pointer"
                              onClick={() => setDeleteConfirmTarget({ type: "competency", id: comp.id, title: comp.name })}
                              title="Hapus Kompetensi"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground py-3 text-center border border-dashed rounded-lg">
                      Belum ada kompetensi terdaftar. Klik "+ Tambah Kompetensi" untuk membuat baru.
                    </p>
                  )}
                </div>
              </div>

              {/* 2. Materials Section */}
              <div className="space-y-3 pt-2">
                <h4 className="font-heading font-bold text-sm text-foreground flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-purple" />
                    Materi Pembelajaran Terdaftar ({selectedCls.materials?.length || 0})
                  </span>
                  {!isReadOnly && (
                    <Button
                      onClick={onOpenAddMaterial}
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Materi
                    </Button>
                  )}
                </h4>
                <div className="grid gap-2">
                  {selectedCls.materials && selectedCls.materials.length > 0 ? (
                    selectedCls.materials.map((mat: any, idx: number) => (
                      <div
                        key={mat.id || idx}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors h-14"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-brand-purple/10 flex items-center justify-center text-brand-purple font-bold text-xs shrink-0">
                            #{idx + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate max-w-[180px] sm:max-w-[260px] md:max-w-[320px]" title={mat.title}>
                              {mat.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[180px] sm:max-w-[260px] md:max-w-[320px]">
                              {mat.competency || "Kompetensi Umum"} • Tipe:{" "}
                              {mat.type?.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/dashboard/class/${selectedCls.id}/material/${mat.id}`}
                            className="text-xs font-medium text-brand-purple flex items-center gap-1 bg-card px-2.5 py-1 rounded border border-border shadow-2xs hover:bg-brand-purple/5 transition-colors"
                          >
                            Lihat Modul
                          </Link>

                          {!isReadOnly && onDeleteMaterial && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0 border-red-500/20 hover:bg-red-50 cursor-pointer"
                              onClick={() => setDeleteConfirmTarget({ type: "material", id: mat.id, title: mat.title })}
                              title="Hapus Materi"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                      Belum ada materi pembelajaran untuk kelas ini.
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Assignments Section */}
              <div className="space-y-3 pt-2">
                <h4 className="font-heading font-bold text-sm text-foreground flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    Tugas & Praktik ({selectedCls.assignments?.length || 0})
                  </span>
                  {!isReadOnly && (
                    <Button
                      onClick={onOpenAddAssignment}
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs flex items-center gap-1.5 border-emerald-200 hover:bg-emerald-50 text-emerald-700 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Tugas
                    </Button>
                  )}
                </h4>
                <div className="grid gap-2">
                  {selectedCls.assignments && selectedCls.assignments.length > 0 ? (
                    selectedCls.assignments.map((ass: any, idx: number) => (
                      <div
                        key={ass.id || idx}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors h-14"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-xs shrink-0">
                            T{idx + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate max-w-[180px] sm:max-w-[240px] md:max-w-[300px]" title={ass.title}>
                              {ass.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[180px] sm:max-w-[240px] md:max-w-[300px]">
                              Batas Waktu:{" "}
                              {ass.dueDate
                                ? new Date(ass.dueDate).toLocaleDateString("id-ID")
                                : "7 Hari"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link href={`/dashboard/class/${selectedCls.id}/assignment/${ass.id}`}>
                            <span className="text-[11px] font-medium text-emerald-600 bg-white dark:bg-card hover:bg-emerald-50 px-2.5 py-1.5 rounded-md border border-border shadow-sm transition-colors cursor-pointer flex items-center gap-1.5">
                              Lihat Detail / Periksa Nilai <ChevronRight className="w-3 h-3" />
                            </span>
                          </Link>

                          {!isReadOnly && onDeleteAssignment && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0 border-red-500/20 hover:bg-red-50 cursor-pointer"
                              onClick={() => setDeleteConfirmTarget({ type: "assignment", id: ass.id, title: ass.title })}
                              title="Hapus Tugas"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                      Belum ada tugas praktik untuk kelas ini.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Delete Confirmation Modal Overlay (5-Second Countdown) ── */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans animate-in fade-in duration-150">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-red-500/10 text-red-600 shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base text-foreground">
                  Konfirmasi Hapus {deleteConfirmTarget.type === "competency" ? "Kompetensi" : deleteConfirmTarget.type === "material" ? "Materi" : "Tugas"}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Apakah Anda yakin ingin menghapus{" "}
                  <strong className="text-foreground">"{deleteConfirmTarget.title}"</strong>?
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  ⚠️ Tindakan ini tidak dapat dibatalkan. Data yang terhapus tidak dapat dipulihkan.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmTarget(null)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button
                size="sm"
                disabled={deleteCountdown > 0}
                onClick={handleExecuteDelete}
                className={`text-xs font-semibold text-white cursor-pointer flex items-center gap-1.5 ${deleteCountdown > 0
                    ? "bg-red-500/50 cursor-not-allowed opacity-70"
                    : "bg-red-600 hover:bg-red-700 shadow-sm"
                  }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deleteCountdown > 0
                  ? `Ya, Hapus (${deleteCountdown}s)`
                  : "Ya, Hapus Sekarang"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
