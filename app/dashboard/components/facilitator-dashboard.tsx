"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Layers,
  Loader2,
  Settings,
  ShieldCheck,
  User,
  Users,
  AlertCircle,
  Building2,
  GraduationCap,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { MentorAttendance } from "./mentor-attendance";

export interface FacilitatorProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  roles?: string[];
  selectedProgram?: string | null;
  programId?: string | null;
  whatsapp?: string | null;
  institution?: string | null;
  studyProgram?: string | null;
  avatarUrl?: string | null;
  status?: string | null;
}

export function FacilitatorDashboard({
  profile,
  onProfileUpdate,
}: {
  profile: FacilitatorProfile;
  onProfileUpdate?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"program" | "attendance" | "profile-settings">("program");
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [totalMentorsCount, setTotalMentorsCount] = useState<number>(0);
  const [totalStudentsCount, setTotalStudentsCount] = useState<number>(0);

  // Profile Settings States
  const [name, setName] = useState(profile.name || "");
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp || "");
  const [institution, setInstitution] = useState(profile.institution || "");
  const [studyProgram, setStudyProgram] = useState(profile.studyProgram || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchProgramDetails();
  }, [profile.selectedProgram, profile.programId]);

  const fetchProgramDetails = async () => {
    setLoading(true);
    try {
      const resBatches = await fetch(`http://localhost:7000/classes/batches`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (resBatches.ok) {
        const batchesData = await resBatches.json();
        const programName = profile.selectedProgram || "";

        // Filter batches that include the facilitator's assigned program
        const filteredBatches = batchesData.filter((b: any) => {
          if (!programName) return true;
          if (!b.includedPrograms || !Array.isArray(b.includedPrograms) || b.includedPrograms.length === 0) {
            return true;
          }
          return b.includedPrograms.some((p: any) => {
            if (typeof p === "string") return p.toLowerCase() === programName.toLowerCase();
            return p.name && p.name.toLowerCase() === programName.toLowerCase();
          });
        });

        setBatches(filteredBatches);
        if (filteredBatches.length > 0) {
          const activeB = filteredBatches.find((b: any) => b.status === "active");
          setSelectedBatchId(activeB ? activeB.id : filteredBatches[0].id);
        }

        // Calculate total students & mentors from includedPrograms
        let totalSt = 0;
        const mentorsSet = new Set<string>();

        filteredBatches.forEach((b: any) => {
          if (b.includedPrograms && Array.isArray(b.includedPrograms)) {
            const prog = b.includedPrograms.find((p: any) =>
              typeof p === "object" && p.name && p.name.toLowerCase() === programName.toLowerCase()
            );
            if (prog) {
              totalSt += prog.studentsCount || (prog.students ? prog.students.length : 0);
              if (prog.mentors && Array.isArray(prog.mentors)) {
                prog.mentors.forEach((m: any) => mentorsSet.add(m.id || m.email));
              }
            }
          }
        });

        setTotalStudentsCount(totalSt);
        setTotalMentorsCount(mentorsSet.size);
      }
    } catch (err) {
      console.error("Failed to load facilitator program details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMsg(null);

    try {
      const res = await fetch(`http://localhost:7000/users/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          whatsapp,
          institution,
          studyProgram,
        }),
        credentials: "include",
      });

      if (res.ok) {
        setProfileMsg({ type: "success", text: "Profil berhasil diperbarui!" });
        if (onProfileUpdate) onProfileUpdate();
      } else {
        const err = await res.json();
        setProfileMsg({ type: "error", text: err.message || "Gagal memperbarui profil" });
      }
    } catch (err) {
      setProfileMsg({ type: "error", text: "Terjadi kesalahan jaringan" });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const programName = profile.selectedProgram || "Program Belum Dipilih";

  // Derive active batch & specific statistics
  const activeBatch = batches.find((b) => b.status === "active") || batches[0];
  const activeBatchProg = activeBatch?.includedPrograms?.find(
    (p: any) => typeof p === "object" && p.name && p.name.toLowerCase() === programName.toLowerCase()
  );
  const activeStudentsCount = activeBatchProg?.studentsCount || (activeBatchProg?.students ? activeBatchProg.students.length : 0);
  const activeMentorsCount = activeBatchProg?.mentorsCount || (activeBatchProg?.mentors ? activeBatchProg.mentors.length : 0);

  return (
    <div className="w-full space-y-6 font-sans">
      {/* ── Sub-Header & Clean Tab Buttons ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border p-3.5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2.5 rounded-xl bg-brand-purple/10 text-brand-purple">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground font-heading">{programName}</span>
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-[10px] font-bold">
                Facilitator Access
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Manajemen informasi program dan koordinasi absensi seluruh siswa.
            </p>
          </div>
        </div>

        {/* Clean Pill Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-secondary/50 p-1.5 rounded-xl border border-border w-full sm:w-auto">
          <Button
            variant={activeTab === "program" ? "default" : "ghost"}
            onClick={() => setActiveTab("program")}
            className={`rounded-lg text-xs font-semibold gap-1.5 py-2 px-3.5 cursor-pointer transition-all ${
              activeTab === "program"
                ? "bg-brand-purple text-white hover:bg-brand-purple/90 shadow-xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Program
          </Button>
          <Button
            variant={activeTab === "attendance" ? "default" : "ghost"}
            onClick={() => setActiveTab("attendance")}
            className={`rounded-lg text-xs font-semibold gap-1.5 py-2 px-3.5 cursor-pointer transition-all ${
              activeTab === "attendance"
                ? "bg-brand-purple text-white hover:bg-brand-purple/90 shadow-xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Absensi
          </Button>
          <Button
            variant={activeTab === "profile-settings" ? "default" : "ghost"}
            onClick={() => setActiveTab("profile-settings")}
            className={`rounded-lg text-xs font-semibold gap-1.5 py-2 px-3.5 cursor-pointer transition-all ${
              activeTab === "profile-settings"
                ? "bg-brand-purple text-white hover:bg-brand-purple/90 shadow-xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Profil
          </Button>
        </div>
      </div>

      {/* ── TAB 1: PROGRAM GENERAL INFO ── */}
      {activeTab === "program" && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 bg-card border border-border rounded-2xl">
              <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
              <p className="mt-3 text-xs text-muted-foreground animate-pulse font-medium">
                Memuat informasi program {programName}...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stat Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-card border-border shadow-xs p-5 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Cohort / Batch Active
                    </span>
                    <div className="p-2 bg-brand-purple/10 text-brand-purple rounded-xl">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl font-extrabold text-foreground font-heading">
                      {batches.filter((b) => b.status === "active").length} Batch
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Dari total {batches.length} angkatan terdaftar.
                    </p>
                  </div>
                </Card>

                <Card className="bg-card border-border shadow-xs p-5 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Siswa Terdaftar (Batch Aktif)
                    </span>
                    <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl font-extrabold text-foreground font-heading">
                      {activeStudentsCount} Siswa
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {activeBatch ? `Pada ${activeBatch.name}. ` : ""}Total {totalStudentsCount} di seluruh angkatan.
                    </p>
                  </div>
                </Card>

                <Card className="bg-card border-border shadow-xs p-5 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Mentor Bertugas (Batch Aktif)
                    </span>
                    <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl font-extrabold text-foreground font-heading">
                      {activeMentorsCount} Mentor
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {activeBatch ? `Mengampu kelas pada ${activeBatch.name}.` : `Total ${totalMentorsCount} mentor terdaftar.`}
                    </p>
                  </div>
                </Card>
              </div>

              {/* General Program Info Card */}
              <Card className="border-border shadow-xs bg-card rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-border bg-secondary/20 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-brand-purple" />
                        Informasi Umum Program: {programName}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Daftar cohort/batch yang berjalan beserta rincian jumlah siswa dan mentor.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-brand-purple/10 text-brand-purple border-brand-purple/20 text-xs px-3 py-1 font-bold w-fit">
                      Tinjauan Facilitator
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground font-heading flex items-center gap-1.5 uppercase tracking-wider">
                      <Layers className="w-4 h-4 text-brand-purple" />
                      Daftar Batch / Cohort Terkait ({batches.length})
                    </h4>
                  </div>

                  {batches.length === 0 ? (
                    <div className="p-10 text-center border border-dashed rounded-xl bg-secondary/10">
                      <p className="text-xs text-muted-foreground italic">
                        Belum ada Batch/Cohort terdaftar untuk program {programName}.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {batches.map((b) => {
                        const progDetails = b.includedPrograms?.find(
                          (p: any) => typeof p === "object" && p.name && p.name.toLowerCase() === programName.toLowerCase()
                        );
                        return (
                          <div
                            key={b.id}
                            className="p-5 rounded-2xl border border-border bg-card hover:bg-secondary/30 transition-all shadow-2xs flex flex-col justify-between space-y-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h5 className="font-bold text-base text-foreground font-heading flex items-center gap-2">
                                  {b.name}
                                </h5>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {b.startDate
                                    ? `${new Date(b.startDate).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })} — ${new Date(b.endDate).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })}`
                                    : "Tanggal Belum Diatur"}
                                </p>
                              </div>
                              <Badge
                                className={
                                  b.status === "active"
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold"
                                    : "bg-secondary text-muted-foreground text-[10px] font-bold"
                                }
                              >
                                {b.status === "active" ? "AKTIF" : b.status.toUpperCase()}
                              </Badge>
                            </div>

                            {/* Program Stats in Batch */}
                            <div className="grid grid-cols-2 gap-2 bg-secondary/40 p-2.5 rounded-xl text-xs">
                              <div>
                                <span className="text-[10px] text-muted-foreground block font-medium">Siswa Enrolled</span>
                                <span className="font-bold text-foreground">
                                  {progDetails?.studentsCount || (progDetails?.students ? progDetails.students.length : 0)} Siswa
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground block font-medium">Mentor Program</span>
                                <span className="font-bold text-foreground">
                                  {progDetails?.mentorsCount || (progDetails?.mentors ? progDetails.mentors.length : 0)} Mentor
                                </span>
                              </div>
                            </div>

                            <div className="pt-2 flex items-center justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedBatchId(b.id);
                                  setActiveTab("attendance");
                                }}
                                className="text-xs text-brand-purple border-brand-purple/30 hover:bg-brand-purple/10 cursor-pointer font-bold gap-1.5 h-8"
                              >
                                Kelola Absensi Batch
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: ABSENSI PROGRAM ── */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          {batches.length === 0 ? (
            <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <AlertTitle>Belum Ada Batch Terdaftar</AlertTitle>
              <AlertDescription>
                Belum terdapat batch terdaftar pada program {programName} untuk melihat dan mengelola absensi.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {/* Batch Selector Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-purple/10 text-brand-purple rounded-xl">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground block font-heading">
                      Pilih Batch / Cohort Absensi:
                    </label>
                    <span className="text-[11px] text-muted-foreground">
                      Pilih batch untuk mengisi absensi harian dan melihat rekapitulasi bulanan.
                    </span>
                  </div>
                </div>

                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="bg-background border border-border text-foreground font-bold text-xs px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-purple cursor-pointer min-w-[240px]"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.status === "active" ? "Aktif" : b.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Embed Mentor Attendance Component with programName prop */}
              {selectedBatchId ? (
                <MentorAttendance batchId={selectedBatchId} mentorId={profile.id} programName={programName} />
              ) : (
                <div className="p-12 text-center text-muted-foreground border rounded-2xl">
                  Pilih batch terlebih dahulu.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: PENGATURAN PROFIL ── */}
      {activeTab === "profile-settings" && (
        <Card className="border-border shadow-xs bg-card max-w-2xl rounded-2xl">
          <CardHeader className="border-b border-border bg-secondary/20 p-5">
            <CardTitle className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-brand-purple" />
              Pengaturan Profil Facilitator
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Perbarui informasi identitas diri dan nomor kontak Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {profileMsg && (
              <Alert
                className={`text-xs ${
                  profileMsg.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                    : "bg-red-500/10 border-red-500/30 text-red-600"
                }`}
              >
                <AlertDescription>{profileMsg.text}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-brand-purple text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Alamat Email (Google)</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-3 py-2 rounded-xl border border-border bg-secondary/50 text-muted-foreground cursor-not-allowed text-xs"
                />
                <span className="text-[10px] text-muted-foreground">Email tidak dapat diubah (digunakan untuk login Google).</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Program Terkait</label>
                <input
                  type="text"
                  value={programName}
                  disabled
                  className="w-full px-3 py-2 rounded-xl border border-border bg-secondary/50 text-muted-foreground font-bold cursor-not-allowed text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">No. WhatsApp</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="08123456789"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-brand-purple text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Institusi / Perusahaan</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Contoh: Infinite Learning"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-brand-purple text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Program Studi / Divisi</label>
                  <input
                    type="text"
                    value={studyProgram}
                    onChange={(e) => setStudyProgram(e.target.value)}
                    placeholder="Contoh: Operations"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-brand-purple text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="bg-brand-purple hover:bg-brand-purple-hover text-white font-bold text-xs px-6 py-2 rounded-xl cursor-pointer shadow-xs"
                >
                  {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
