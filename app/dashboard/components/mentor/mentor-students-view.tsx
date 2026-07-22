"use client";

import { AlertCircle, MessageSquare, Search, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface MentorStudentsViewProps {
  allStudents: any[];
  filteredStudents: any[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  isReadOnly: boolean;
  onOpenSuspendDialog: (student: any, action: "suspend" | "unsuspend") => void;
}

export function MentorStudentsView({
  allStudents,
  filteredStudents,
  searchQuery,
  setSearchQuery,
  isReadOnly,
  onOpenSuspendDialog,
}: MentorStudentsViewProps) {
  return (
    <Card className="border-border bg-card shadow-sm font-sans">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-heading font-bold text-foreground">
              Manajemen Siswa Binaan ({allStudents.length} Siswa)
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Daftar siswa yang berada di bawah bimbingan dan kepemilikan personal Anda sesuai jurusan.
            </CardDescription>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau email siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-secondary/50"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Email Terdaftar</th>
                <th className="py-3 px-4">WhatsApp</th>
                <th className="py-3 px-4">Program Studi</th>
                <th className="py-3 px-4 text-center">Status Akun</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    Tidak ditemukan siswa yang sesuai dengan pencarian Anda.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student: any, idx: number) => {
                  const isGmail =
                    student.email && student.email.toLowerCase().endsWith("@gmail.com");
                  return (
                    <tr
                      key={student.id || idx}
                      className="hover:bg-secondary/20 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        {student.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-muted-foreground">
                        {student.email}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {student.whatsapp || "-"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
                          {student.selectedProgram || "Web Development"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          {student.status === "suspended" ? (
                            <Badge
                              variant="outline"
                              className="bg-red-500/10 text-red-600 border-red-200 gap-1 text-[10px]"
                            >
                              <AlertCircle className="w-3 h-3" />
                              Suspended
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-600 border-emerald-200 gap-1 text-[10px]"
                            >
                              <UserCheck className="w-3 h-3" />
                              Aktif
                            </Badge>
                          )}
                          {isGmail ? (
                            <Badge
                              variant="outline"
                              className="bg-blue-500/10 text-blue-600 border-blue-200 text-[10px] leading-none py-0.5"
                            >
                              Gmail
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-500/10 text-amber-600 border-amber-300 text-[10px] leading-none py-0.5"
                            >
                              Non-Gmail
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {student.whatsapp && (
                            <a
                              href={`https://wa.me/${student.whatsapp.replace(/^0/, "62")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] transition-colors shadow-2xs"
                            >
                              <MessageSquare className="w-3 h-3" />
                              WA
                            </a>
                          )}
                          {!isReadOnly &&
                            (student.status === "suspended" ? (
                              <button
                                onClick={() => onOpenSuspendDialog(student, "unsuspend")}
                                className="px-2 py-1 rounded border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-emerald-600 text-[11px] font-medium transition-colors cursor-pointer"
                              >
                                Aktifkan Kembali
                              </button>
                            ) : (
                              <button
                                onClick={() => onOpenSuspendDialog(student, "suspend")}
                                className="px-2 py-1 rounded border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-amber-600 text-[11px] font-medium transition-colors cursor-pointer"
                              >
                                Suspend
                              </button>
                            ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
