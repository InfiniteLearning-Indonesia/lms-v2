"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Calendar,
  CalendarDays,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Lock,
  Notebook,
  Pencil,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompetencyItem, MentorClass } from "./types";
import { MentorLogbook } from "../mentor-logbook";
import { MentorAttendance } from "../mentor-attendance";

interface MentorPastBatchesProps {
  pastClasses: MentorClass[];
  competencies: CompetencyItem[];
  calculateCompetencyScore: (studentId: string, compId: string) => number;
  mentorId: string;
}

export function MentorPastBatches({
  pastClasses,
  competencies,
  calculateCompetencyScore,
  mentorId,
}: MentorPastBatchesProps) {
  const [selectedPastClassId, setSelectedPastClassId] = useState<string | null>(
    pastClasses.length > 0 ? pastClasses[0].id : null
  );

  const selectedPastCls = pastClasses.find((c) => c.id === selectedPastClassId) || pastClasses[0];

  if (pastClasses.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-xl bg-card font-sans">
        <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
        <h3 className="font-heading font-bold text-base text-foreground">Tidak Ada Batch Lama</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
          Anda belum memiliki riwayat angkatan atau batch kelas terdahulu yang telah selesai.
        </p>
      </div>
    );
  }

  const pastStudents = selectedPastCls?.enrolledStudents || [];

  return (
    <div className="space-y-6 font-sans">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
              <Lock className="w-3 h-3 mr-1" /> Mode Read-Only (Arsip Historis)
            </Badge>
          </div>
          <h2 className="font-heading font-bold text-xl mt-2 text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-brand-purple" />
            Riwayat Angkatan & Kelas Batch Lama
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Seluruh data materi, tugas, siswa binaan, logbook, dan nilai pada batch lama dikunci sebagai rekam jejak akademik historis Anda.
          </p>
        </div>
      </div>

      {/* Grid Selection of Past Classes */}
      <div className="grid gap-4 md:grid-cols-3">
        {pastClasses.map((cls) => {
          const isSelected = cls.id === selectedPastClassId;
          return (
            <div
              key={cls.id}
              onClick={() => setSelectedPastClassId(cls.id)}
              className="cursor-pointer transition-transform hover:-translate-y-0.5"
            >
              <Card
                className={`border shadow-sm overflow-hidden bg-card transition-all ${
                  isSelected
                    ? "border-brand-purple ring-2 ring-brand-purple/30 bg-brand-purple/5"
                    : "border-border hover:border-border/80"
                }`}
              >
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                      {cls.batch?.name}
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-slate-800 text-slate-300 border-slate-700">
                      Selesai
                    </Badge>
                  </div>
                  <h3 className="font-heading font-bold text-base text-foreground line-clamp-1">
                    {cls.program?.name}
                  </h3>
                  {cls.batch?.startDate && cls.batch?.endDate && (
                    <p className="text-2xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-brand-purple" />
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
                    </p>
                  )}
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-brand-purple" />
                      {cls.enrolledStudentsCount || 0} Siswa
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-brand-purple" />
                      {cls.materials?.length || 0} Materi
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Detailed Inspection for Selected Past Class */}
      {selectedPastCls && (
        <div className="space-y-6 pt-4 border-t border-border">
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-brand-purple uppercase tracking-wider">
                Detail Arsip Batch: {selectedPastCls.batch?.name}
              </span>
              <h3 className="font-heading font-bold text-xl text-foreground mt-0.5">
                {selectedPastCls.program?.name}
              </h3>
            </div>
            <Link
              href={`/dashboard/class/${selectedPastCls.id}`}
              className="px-3.5 py-2 rounded-lg bg-brand-purple text-white text-xs font-semibold hover:bg-brand-purple-hover transition-colors inline-flex items-center gap-1.5 shadow-xs self-start sm:self-center"
            >
              Lihat Halaman Berkas Kelas
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <Tabs defaultValue="materials" className="space-y-6">
            <TabsList className="bg-secondary/60 p-1.5 rounded-xl border border-border/60 flex flex-wrap min-h-12 w-full gap-1.5 justify-start md:justify-center">
              <TabsTrigger
                value="materials"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>Materi & Silabus ({selectedPastCls.materials?.length || 0})</span>
              </TabsTrigger>
              <TabsTrigger
                value="assignments"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4 shrink-0" />
                <span>Tugas Praktik ({selectedPastCls.assignments?.length || 0})</span>
              </TabsTrigger>
              <TabsTrigger
                value="students"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-1.5 cursor-pointer"
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Siswa Binaan ({pastStudents.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="logbook"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-1.5 cursor-pointer"
              >
                <Notebook className="w-4 h-4 shrink-0" />
                <span>Logbook Student</span>
              </TabsTrigger>
              <TabsTrigger
                value="attendance"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-1.5 cursor-pointer"
              >
                <CalendarDays className="w-4 h-4 shrink-0" />
                <span>Absensi</span>
              </TabsTrigger>
              <TabsTrigger
                value="assessment"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>Assessment & Rubrik</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB MATERI */}
            <TabsContent value="materials" className="space-y-4">
              <Card className="border-border bg-card shadow-sm">
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-base font-heading font-bold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-purple" />
                    Arsip Materi Pembelajaran ({selectedPastCls.materials?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  {selectedPastCls.materials && selectedPastCls.materials.length > 0 ? (
                    selectedPastCls.materials.map((mat, idx) => (
                      <div
                        key={mat.id || idx}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-purple/10 flex items-center justify-center text-brand-purple font-bold text-xs">
                            #{idx + 1}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{mat.title}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {mat.competency || "Kompetensi Umum"} • Tipe: {mat.type?.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/dashboard/class/${selectedPastCls.id}/material/${mat.id}`}
                          target="_blank"
                          className="text-xs font-medium text-brand-purple flex items-center gap-1 bg-card px-2.5 py-1 rounded border border-border hover:bg-brand-purple/5 transition-colors"
                        >
                          Lihat Modul
                        </Link>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground py-6 text-center border border-dashed rounded-lg">
                      Belum ada materi pembelajaran terdaftar di batch ini.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB TUGAS */}
            <TabsContent value="assignments" className="space-y-4">
              <Card className="border-border bg-card shadow-sm">
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-base font-heading font-bold flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    Arsip Tugas Praktik ({selectedPastCls.assignments?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  {selectedPastCls.assignments && selectedPastCls.assignments.length > 0 ? (
                    selectedPastCls.assignments.map((ass, idx) => (
                      <div
                        key={ass.id || idx}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-emerald-500/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-xs">
                            T{idx + 1}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{ass.title}</p>
                            <p className="text-[11px] text-muted-foreground">
                              Batas Waktu:{" "}
                              {ass.dueDate
                                ? new Date(ass.dueDate).toLocaleDateString("id-ID")
                                : "7 Hari"}
                            </p>
                          </div>
                        </div>
                        <Link href={`/dashboard/class/${selectedPastCls.id}/assignment/${ass.id}`}>
                          <span className="text-[11px] font-medium text-emerald-600 bg-white dark:bg-card hover:bg-emerald-50 px-2.5 py-1.5 rounded-md border border-border shadow-2xs transition-colors cursor-pointer flex items-center gap-1">
                            Lihat Detail Nilai <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground py-6 text-center border border-dashed rounded-lg">
                      Belum ada tugas praktik terdaftar di batch ini.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB SISWA */}
            <TabsContent value="students" className="space-y-4">
              <Card className="border-border bg-card shadow-sm">
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-base font-heading font-bold flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-purple" />
                    Siswa Binaan Batch Ini ({pastStudents.length} Siswa)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border bg-secondary/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          <th className="py-3 px-4">Nama Lengkap</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">WhatsApp</th>
                          <th className="py-3 px-4">Program</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {pastStudents.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-muted-foreground">
                              Belum ada siswa terdaftar di kelas batch lama ini.
                            </td>
                          </tr>
                        ) : (
                          pastStudents.map((student: any, idx: number) => (
                            <tr key={student.id || idx} className="hover:bg-secondary/20 transition-colors">
                              <td className="py-3 px-4 font-semibold text-foreground">{student.name}</td>
                              <td className="py-3 px-4 font-mono text-muted-foreground">{student.email}</td>
                              <td className="py-3 px-4 text-muted-foreground">{student.whatsapp || "-"}</td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
                                  {student.selectedProgram || selectedPastCls.program?.name}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB LOGBOOK */}
            <TabsContent value="logbook" className="space-y-4">
              <MentorLogbook batchId={selectedPastCls.batchId} />
            </TabsContent>

            {/* TAB ABSENSI */}
            <TabsContent value="attendance" className="space-y-4">
              <MentorAttendance batchId={selectedPastCls.batchId} mentorId={mentorId} />
            </TabsContent>

            {/* TAB ASSESSMENT */}
            <TabsContent value="assessment" className="space-y-4">
              <Card className="border-border bg-card shadow-sm">
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-base font-heading font-bold flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-brand-purple" />
                    Arsip Gradebook Assessment ({selectedPastCls.batch?.name})
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Nilai akhir siswa binaan pada batch ini. Mode Read-Only.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="overflow-x-auto border border-border rounded-xl">
                    <table className="w-full text-xs text-left whitespace-nowrap">
                      <thead className="bg-muted/50 border-b border-border font-semibold text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 sticky left-0 z-10 bg-muted/95 backdrop-blur">
                            Mentee
                          </th>
                          {competencies.map((comp) => (
                            <th key={comp.id} className="px-4 py-3 text-center border-l border-border">
                              {comp.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {pastStudents.length === 0 ? (
                          <tr>
                            <td
                              colSpan={competencies.length + 1}
                              className="px-4 py-8 text-center text-muted-foreground"
                            >
                              Belum ada data mentee pada batch ini.
                            </td>
                          </tr>
                        ) : (
                          pastStudents.map((student: any) => (
                            <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3 sticky left-0 z-10 bg-card">
                                <div className="font-semibold text-foreground">{student.name}</div>
                                <div className="text-[10px] text-muted-foreground">{student.email}</div>
                              </td>
                              {competencies.map((comp) => {
                                const score = calculateCompetencyScore(student.id, comp.id);
                                return (
                                  <td
                                    key={comp.id}
                                    className="px-4 py-3 text-center border-l border-border font-medium"
                                  >
                                    {score > 0 ? score.toFixed(1) : "-"}
                                  </td>
                                );
                              })}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
