"use client";

import { API_BASE_URL } from "@/lib/config";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Info,
  Notebook,
  ExternalLink,
  FolderGit2,
  Headphones,
  Link2,
  MapPin,
  Video,
} from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { StudentClass, StudentProfile } from "./types";

interface StudentActivityViewProps {
  profile: StudentProfile;
  activeClasses: StudentClass[];
  classes: StudentClass[];
  onNavigateTab?: (tab: string) => void;
}

export function StudentActivityView({
  profile,
  activeClasses,
  classes,
  onNavigateTab,
}: StudentActivityViewProps) {
  const [logbookData, setLogbookData] = useState<{
    totalMonths?: number;
    logbooks?: any[];
  } | null>(null);
  const [isLogbookLoading, setIsLogbookLoading] = useState(false);

  const activeBatchId = activeClasses[0]?.batchId;
  const isGraduated = profile?.status === "graduated" || (classes.length > 0 && activeClasses.length === 0);

  // Live fetch logbook status for current active batch
  useEffect(() => {
    if (!activeBatchId) return;

    setIsLogbookLoading(true);
    fetch(`${API_BASE_URL}/classes/batches/${activeBatchId}/logbooks/student`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setLogbookData(data);
      })
      .catch(() => {})
      .finally(() => setIsLogbookLoading(false));
  }, [activeBatchId]);

  // Determine current month logbook status
  const currentMonthIndex = (() => {
    if (!logbookData?.logbooks || logbookData.logbooks.length === 0) return 1;
    return Math.max(...logbookData.logbooks.map((l: any) => l.monthIndex), 1);
  })();

  const currentLogbook = logbookData?.logbooks?.find(
    (l: any) => l.monthIndex === currentMonthIndex
  );

  const isLogbookCompleted =
    currentLogbook &&
    (currentLogbook.status === "pending" ||
      currentLogbook.status === "accepted" ||
      currentLogbook.status === "revision");

  return (
    <div className="grid md:grid-cols-3 gap-6 font-sans">
      {/* Left Column: Kelas Belajar Anda */}
      <div className="md:col-span-2 space-y-6">
        <h2 className="font-heading font-bold text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-purple" />
          Kelas Belajar Anda
        </h2>

        {activeClasses.length === 0 ? (
          isGraduated ? (
            <Card className="border-brand-purple/30 bg-gradient-to-br from-brand-purple/10 via-card to-amber-500/10 shadow-md overflow-hidden relative p-6 space-y-4 font-sans">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-brand-purple shrink-0 mt-1">
                  <Award className="w-7 h-7" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-purple text-white">
                      🎓 Status: Lulus (Alumni)
                    </span>
                  </div>
                  <h3 className="font-heading font-extrabold text-lg text-foreground">
                    Selamat! Anda Telah Lulus dari Program {profile?.selectedProgram || "Studi IL"}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                    Seluruh rangkaian pembelajaran dan modul pada Cohort ini telah dinyatakan selesai. Anda dapat meninjau kembali riwayat materi, nilai, dan mengunduh sertifikat kelulusan pada tab <strong>Batch Lama</strong> dan <strong>Transkrip & Sertifikat</strong>.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Alert className="border-border bg-card shadow-sm p-5">
              <Info className="w-6 h-6 text-brand-purple shrink-0 mt-0.5" />
              <div className="space-y-2">
                <AlertTitle className="font-heading font-bold text-base text-foreground">
                  Program Terdaftar: {profile?.selectedProgram || "Belum Ditentukan"}
                </AlertTitle>
                <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
                  {profile?.selectedProgram ? (
                    <>
                      Anda terdaftar pada program <strong>{profile.selectedProgram}</strong>.
                      Saat ini kelas pembelajaran belum dijadwalkan oleh Mentor Utama atau
                      Admin belum meluncurkan/mengaktifkan Batch Cohort berjalan. Silakan
                      tunggu atau hubungi administrator Anda.
                    </>
                  ) : (
                    <>
                      Akun Anda belum dikaitkan dengan Program Studi manapun. Harap hubungi
                      administrator untuk menentukan program Anda.
                    </>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )
        ) : (
          <div className="grid gap-6">
            {activeClasses.map((cls) => (
              <Link
                key={cls.id}
                href={`/dashboard/class/${cls.id}`}
                className="block transition-transform hover:-translate-y-1"
              >
                <Card className="border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="bg-gradient-to-r from-brand-purple to-brand-gradient-end px-6 py-5 text-white">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-yellow">
                      Sedang Berjalan • {cls.batch?.name}
                    </p>
                    <CardTitle className="text-white text-xl mt-1.5">
                      {cls.program?.name}
                    </CardTitle>
                    <p className="text-xs text-white/80 mt-1">
                      Mentor: {cls.mentor?.name || "Belum ditentukan"}
                    </p>
                    {cls.batch?.startDate && cls.batch?.endDate && (
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] bg-white/10 w-fit px-2 py-1 rounded-md border border-white/10">
                        <Calendar className="w-3 h-3 text-brand-yellow" />
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
                  </div>
                  <CardContent className="py-5 space-y-5">
                    {(() => {
                      let progressPct = 0;
                      if (cls.batch?.startDate && cls.batch?.endDate) {
                        const s = new Date(cls.batch.startDate);
                        const e = new Date(cls.batch.endDate);
                        const n = new Date();

                        const startDate = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0);
                        const endDate = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999);
                        const today = new Date(n.getFullYear(), n.getMonth(), n.getDate(), 12, 0, 0, 0);

                        const msPerDay = 1000 * 60 * 60 * 24;
                        const totalDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / msPerDay));

                        if (n.getTime() >= startDate.getTime()) {
                          if (n.getTime() > endDate.getTime()) {
                            progressPct = 100;
                          } else {
                            const elapsedDays = Math.min(
                              totalDays,
                              Math.max(1, Math.floor((today.getTime() - startDate.getTime()) / msPerDay) + 1)
                            );
                            progressPct = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
                          }
                        }
                      }
                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Penyelesaian Modul Keseluruhan</span>
                            <span className="text-brand-purple">{progressPct}%</span>
                          </div>
                          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden border border-border/50">
                            <div
                              className="bg-brand-purple h-full rounded-full transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}



                    <div className="flex items-center justify-between bg-secondary/30 p-3 rounded-lg border border-border/40">
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-yellow shrink-0 shadow-[0_0_8px_rgba(255,205,41,0.6)]" />
                        Anda baru saja terdaftar.
                      </div>
                      <span className="text-xs font-semibold bg-brand-purple text-white px-3 py-1.5 rounded-md hover:bg-brand-purple-hover transition-colors shadow-sm inline-flex items-center gap-1">
                        Masuk Kelas
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Pengingat & Aktivitas (100% Aligned at top) */}
      <div className="space-y-6">
        <h2 className="font-heading font-bold text-lg flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-purple" />
          Pengingat & Aktivitas
        </h2>

        <div className="space-y-4">
          {/* Live Logbook Reminder Card */}
          {activeBatchId && (
            <div
              onClick={() => {
                if (!isLogbookCompleted && onNavigateTab) {
                  onNavigateTab("logbook");
                }
              }}
              className={`p-4 rounded-xl border transition-all ${
                isLogbookCompleted
                  ? "bg-emerald-500/10 border-emerald-500/20 text-foreground"
                  : "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 cursor-pointer shadow-xs"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isLogbookCompleted
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {isLogbookCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Notebook className="w-5 h-5 animate-pulse" />
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading font-bold text-xs">
                      {isLogbookCompleted
                        ? "Logbook Bulan Ini"
                        : `Logbook Bulan ke-${currentMonthIndex}`}
                    </h4>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isLogbookCompleted
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {isLogbookCompleted ? "Selesai" : "Perlu Diisi"}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isLogbookCompleted
                      ? "Kamu sudah mengerjakan logbook bulan ini. Terima kasih!"
                      : `Kamu belum mengisi logbook untuk bulan ke-${currentMonthIndex}. Klik di sini untuk segera mengisinya.`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tugas Mendatang Card */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-xs flex items-center gap-2 border-b border-border pb-3 text-foreground">
              <CheckCircle2 className="w-4 h-4 text-brand-purple" />
              Tugas Mendatang
            </h3>
            {isGraduated ? (
              <div className="text-center py-6 space-y-2">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-foreground">🎉 Selamat atas Kelulusan Anda!</p>
                <p className="text-[11px] text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                  Seluruh tugas pembelajaran telah diselesaikan dengan baik.
                </p>
              </div>
            ) : classes.length > 0 ? (
              (() => {
                const allAssignments = activeClasses.flatMap((c) =>
                  (c.assignments || []).map((a: any) => ({
                    ...a,
                    classId: c.id,
                    programName: c.program?.name,
                  }))
                );

                if (allAssignments.length > 0) {
                  return (
                    <div className="space-y-3">
                      {allAssignments.map((assignment: any) => (
                        <Link
                          href={`/dashboard/class/${assignment.classId}/assignment/${assignment.id}`}
                          key={assignment.id}
                          className="block"
                        >
                          <div className="p-3 border border-border rounded-lg hover:border-brand-purple/50 transition-colors bg-secondary/10">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-md bg-brand-yellow/20 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-heading font-semibold text-xs text-foreground line-clamp-1">
                                  {assignment.title}
                                </h4>
                                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                                  {assignment.programName}
                                </p>
                                {assignment.dueDate && (
                                  <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded bg-brand-yellow/10 text-amber-600 font-mono">
                                    Tenggat:{" "}
                                    {new Date(assignment.dueDate).toLocaleDateString("id-ID")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  );
                }

                return (
                  <div className="text-center py-6 space-y-2">
                    <div className="w-10 h-10 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground/50" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">Semua Selesai!</p>
                    <p className="text-[11px] text-muted-foreground max-w-[200px] mx-auto">
                      Belum ada tugas baru dari mentor untuk kelas ini.
                    </p>
                  </div>
                );
              })()
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Belum ada tugas karena Anda belum terdaftar di kelas apapun.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
