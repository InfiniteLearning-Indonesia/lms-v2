"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FileText,
  GraduationCap,
  Lock,
  Notebook,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentClass } from "./types";
import { StudentLogbook } from "../student-logbook";
import { StudentAttendance } from "../student-attendance";

interface StudentPastBatchesProps {
  pastClasses: StudentClass[];
  studentId: string;
}

export function StudentPastBatches({ pastClasses, studentId }: StudentPastBatchesProps) {
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
          Anda belum memiliki riwayat angkatan atau batch kelas terdahulu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
              <Lock className="w-3 h-3 mr-1" /> Mode Read-Only (Arsip Historis)
            </Badge>
          </div>
          <h2 className="font-heading font-bold text-xl mt-2 text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-brand-purple" />
            Riwayat Angkatan / Batch Lama Anda
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Seluruh data materi, tugas, logbook, dan rekaman kehadiran Anda pada angkatan sebelumnya dikunci sebagai arsip historis.
          </p>
        </div>
      </div>

      {/* Grid Selection of Past Classes */}
      <div className="grid gap-4 md:grid-cols-2">
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
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                      Selesai • {cls.batch?.name}
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-slate-800 text-slate-300 border-slate-700">
                      Read-Only
                    </Badge>
                  </div>
                  <h3 className="font-heading font-bold text-base text-foreground line-clamp-1">
                    {cls.program?.name}
                  </h3>
                  <p className="text-2xs text-muted-foreground">
                    Mentor Pendamping: {cls.mentor?.name || "Belum ditentukan"}
                  </p>
                  {cls.batch?.startDate && cls.batch?.endDate && (
                    <p className="text-2xs text-muted-foreground flex items-center gap-1 pt-1">
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
              Masuk Berkas Kelas
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList className="bg-secondary/60 p-1.5 rounded-xl border border-border/60 flex flex-wrap min-h-12 w-full gap-1.5 justify-start md:justify-center">
              <TabsTrigger
                value="activity"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>Kelas & Aktivitas</span>
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
            </TabsList>

            {/* TAB KELAS & AKTIVITAS */}
            <TabsContent value="activity" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <Card className="border-border shadow-sm overflow-hidden bg-card">
                    <div className="bg-slate-800 px-6 py-5 text-white">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                        Selesai • {selectedPastCls.batch?.name}
                      </p>
                      <CardTitle className="text-white text-xl mt-1.5">
                        {selectedPastCls.program?.name}
                      </CardTitle>
                      <p className="text-xs text-white/80 mt-1">
                        Mentor Pendamping: {selectedPastCls.mentor?.name || "Belum ditentukan"}
                      </p>
                    </div>
                    <CardContent className="py-5 flex justify-between items-center text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        Kelas diarsipkan (Read-Only)
                      </span>
                      <Link
                        href={`/dashboard/class/${selectedPastCls.id}`}
                        className="text-brand-purple font-semibold hover:underline flex items-center gap-1"
                      >
                        Buka Materi Kelas
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card className="border-border bg-card shadow-sm p-5 space-y-4">
                    <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
                      <Award className="w-4 h-4 text-brand-purple" />
                      Tugas Pada Batch Ini
                    </h3>
                    {selectedPastCls.assignments && selectedPastCls.assignments.length > 0 ? (
                      <div className="space-y-2">
                        {selectedPastCls.assignments.map((ass) => (
                          <Link
                            key={ass.id}
                            href={`/dashboard/class/${selectedPastCls.id}/assignment/${ass.id}`}
                            className="block p-3 border border-border rounded-lg hover:border-brand-purple/40 transition-colors bg-secondary/10"
                          >
                            <div className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-xs text-foreground line-clamp-1">{ass.title}</h4>
                                {ass.dueDate && (
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    Tenggat: {new Date(ass.dueDate).toLocaleDateString("id-ID")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground py-4 text-center">
                        Belum ada tugas terdaftar di batch ini.
                      </p>
                    )}
                  </Card
>
                </div>
              </div>
            </TabsContent>

            {/* TAB LOGBOOK */}
            <TabsContent value="logbook" className="space-y-4">
              <StudentLogbook batchId={selectedPastCls.batchId} />
            </TabsContent>

            {/* TAB ABSENSI */}
            <TabsContent value="attendance" className="space-y-4">
              <StudentAttendance batchId={selectedPastCls.batchId} studentId={studentId} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
