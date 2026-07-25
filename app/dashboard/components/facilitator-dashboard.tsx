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

        // Filter batches that include the facilitator's assigned program and are ACTIVE
        const filteredBatches = batchesData.filter((b: any) => {
          if (b.status !== "active") return false;
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
              {/* Active Batch Showcase Card (Redesigned Overview) */}
              <Card className="border-border shadow-xs bg-card rounded-2xl overflow-hidden relative">
                <CardHeader className="border-b border-border bg-secondary/20 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                        Cohort / Batch Aktif Berjalan
                      </div>
                      <CardTitle className="text-xl font-bold font-heading text-foreground flex items-center gap-2 pt-0.5">
                        <Layers className="w-5 h-5 text-brand-purple" />
                        {activeBatch ? activeBatch.name : "Belum Ada Batch Aktif"}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {activeBatch?.startDate
                          ? `${new Date(activeBatch.startDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })} — ${new Date(activeBatch.endDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}`
                          : "Periode pelaksanaan batch aktif."}
                      </CardDescription>
                    </div>

                    {activeBatch && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs px-3 py-1.5 font-bold shadow-2xs w-fit">
                        {activeBatch.status.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {!activeBatch ? (
                    <div className="p-10 text-center border border-dashed rounded-xl bg-secondary/10">
                      <p className="text-xs text-muted-foreground italic">
                        Saat ini belum ada Batch/Cohort yang berstatus AKTIF untuk program {programName}.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-border/80 bg-secondary/20 shadow-2xs space-y-1">
                          <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider block">
                            Peserta Enrolled Batch Ini
                          </span>
                          <div className="text-2xl font-extrabold text-foreground font-heading flex items-baseline gap-2">
                            {activeStudentsCount} <span className="text-xs font-normal text-muted-foreground">Siswa</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Terdaftar aktif pada program {programName}.
                          </p>
                        </div>

                        <div className="p-4 rounded-xl border border-border/80 bg-secondary/20 shadow-2xs space-y-1">
                          <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider block">
                            Mentor Pengampu Batch Ini
                          </span>
                          <div className="text-2xl font-extrabold text-foreground font-heading flex items-baseline gap-2">
                            {activeMentorsCount} <span className="text-xs font-normal text-muted-foreground">Mentor</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Bertugas mengampu modul & absensi kelas.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-brand-purple/5 border border-brand-purple/20">
                        <div className="text-xs space-y-0.5">
                          <span className="font-bold text-brand-purple block font-heading">Kelola Absensi Program</span>
                          <span className="text-muted-foreground">
                            Input jadwal absensi harian, kalender kelas, dan rekapitulasi siswa untuk {activeBatch.name}.
                          </span>
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedBatchId(activeBatch.id);
                            setActiveTab("attendance");
                          }}
                          className="bg-brand-purple hover:bg-brand-purple-hover text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
                        >
                          Masuk & Kelola Absensi Batch
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
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
