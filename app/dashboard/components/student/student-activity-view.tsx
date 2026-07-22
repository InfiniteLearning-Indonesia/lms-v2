"use client";

import Link from "next/link";
import { BookOpen, Calendar, CheckCircle2, Info } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { StudentClass, StudentProfile } from "./types";

interface StudentActivityViewProps {
  profile: StudentProfile;
  activeClasses: StudentClass[];
  classes: StudentClass[];
}

export function StudentActivityView({
  profile,
  activeClasses,
  classes,
}: StudentActivityViewProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6 font-sans">
      <div className="md:col-span-2 space-y-6">
        {activeClasses.length === 0 ? (
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
        ) : (
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-purple" />
              Kelas Belajar Anda
            </h2>

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
                            {new Date(cls.batch.startDate).toLocaleDateString(
                              "id-ID",
                              { day: "numeric", month: "short", year: "numeric" }
                            )}{" "}
                            -{" "}
                            {new Date(cls.batch.endDate).toLocaleDateString(
                              "id-ID",
                              { day: "numeric", month: "short", year: "numeric" }
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                    <CardContent className="py-5 space-y-5">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>Penyelesaian Modul Keseluruhan</span>
                          <span className="text-brand-purple">0%</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden border border-border/50">
                          <div className="bg-brand-purple h-full w-[0%] rounded-full transition-all duration-500" />
                        </div>
                      </div>
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
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
          <h2 className="font-heading font-bold text-sm flex items-center gap-2 border-b border-border pb-3">
            <CheckCircle2 className="w-4 h-4 text-brand-purple" />
            Tugas Mendatang
          </h2>
          {classes.length > 0 ? (
            (() => {
              const allAssignments = classes.flatMap((c) =>
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
                                  {new Date(assignment.dueDate).toLocaleDateString(
                                    "id-ID"
                                  )}
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
                  <div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Semua Selesai!</p>
                  <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                    Belum ada tugas baru dari mentor untuk kelas {classes[0]?.program?.name}.
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
  );
}
