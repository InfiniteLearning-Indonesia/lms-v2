"use client";

import Link from "next/link";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileText,
  Info,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Sliders,
  Users,
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
}: MentorClassesViewProps) {
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
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isSelected
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
                <Badge className="bg-brand-purple text-white hover:bg-brand-purple-hover self-start sm:self-center">
                  Silabus Berjalan
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Progres Pembelajaran Silabus</span>
                  <span className="text-brand-purple">65%</span>
                </div>
                <Progress value={65} className="h-2 bg-secondary" />
              </div>

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
                          Distribusi Alokasi Murid (Round-Robin & Modulo)
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
                      Sesuai Bab 5 & Bab 9 Source of Truth: Sistem akan membagi siswa secara
                      merata ke Primary Mentor. Remainder modulo dialokasikan secara
                      otomatis ke Secondary Mentor.
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

              {/* Materials Section */}
              <div className="space-y-3">
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
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-purple/10 flex items-center justify-center text-brand-purple font-bold text-xs">
                            #{idx + 1}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">
                              {mat.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {mat.competency || "Kompetensi Umum"} • Tipe:{" "}
                              {mat.type?.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/dashboard/class/${selectedCls.id}/material/${mat.id}`}
                          target="_blank"
                          className="text-xs font-medium text-brand-purple flex items-center gap-1 bg-card px-2.5 py-1 rounded border border-border shadow-2xs hover:bg-brand-purple/5 transition-colors"
                        >
                          Lihat Modul
                        </Link>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                      Belum ada materi pembelajaran untuk kelas ini.
                    </p>
                  )}
                </div>
              </div>

              {/* Assignments Section */}
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
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-xs">
                            T{idx + 1}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">
                              {ass.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Batas Waktu:{" "}
                              {ass.dueDate
                                ? new Date(ass.dueDate).toLocaleDateString("id-ID")
                                : "7 Hari"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/class/${selectedCls.id}/assignment/${ass.id}`}>
                            <span className="text-[11px] font-medium text-emerald-600 bg-white dark:bg-card hover:bg-emerald-50 px-2.5 py-1.5 rounded-md border border-border shadow-sm transition-colors cursor-pointer flex items-center gap-1.5">
                              Lihat Detail / Periksa Nilai <ChevronRight className="w-3 h-3" />
                            </span>
                          </Link>
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
    </div>
  );
}
