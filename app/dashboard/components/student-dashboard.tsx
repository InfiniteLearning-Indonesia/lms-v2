import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, Loader2, Info, Settings, User, Phone, School, GraduationCap, Upload, Save, Calendar } from "lucide-react";
import {
  Card,
  CardTitle,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { StudentLogbook } from "./student-logbook";
import { StudentAttendance } from "./student-attendance";

interface StudentDashboardProps {
  profile: {
    id: string;
    email: string;
    name: string;
    role: string;
    roles?: string[];
    whatsapp?: string | null;
    institution?: string | null;
    studyProgram?: string | null;
    selectedProgram?: string | null;
    avatarUrl?: string | null;
  };
  onProfileUpdate?: () => void;
}

export function StudentDashboard({ profile, onProfileUpdate }: StudentDashboardProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("activity");

  const searchParams = useSearchParams();

  // Listen to tab query parameter dynamically
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "settings") {
      setActiveTab("settings");
    } else if (!tab && activeTab === "settings") {
      setActiveTab("activity");
    }
  }, [searchParams]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (val === "settings") {
        url.searchParams.set("tab", "settings");
      } else {
        url.searchParams.delete("tab");
      }
      window.history.pushState({}, "", url.toString());
    }
  };

  // Profile Form States
  const [name, setName] = useState(profile?.name || "");
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp || "");
  const [institution, setInstitution] = useState(profile?.institution || "");
  const [studyProgram, setStudyProgram] = useState(profile?.studyProgram || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const defaultAvatars = [
    "/avatars/avatar_1.png",
    "/avatars/avatar_2.png",
    "/avatars/avatar_3.png",
    "/avatars/avatar_4.png",
    "/avatars/avatar_5.png",
  ];

  const getEffectiveAvatar = () => {
    if (avatarUrl) return avatarUrl;
    const code = profile.id ? profile.id.charCodeAt(0) + profile.id.charCodeAt(profile.id.length - 1) : 1;
    const index = (code % 5) + 1;
    return `/avatars/avatar_${index}.png`;
  };

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setWhatsapp(profile.whatsapp || "");
      setInstitution(profile.institution || "");
      setStudyProgram(profile.studyProgram || "");
      setAvatarUrl(profile.avatarUrl || "");
    }
  }, [profile]);

  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:7000/classes/my-classes", {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil kelas");
        return res.json();
      })
      .then((data) => {
        setClasses(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching student classes:", err);
        setClasses([]);
        setIsLoading(false);
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSaveError("Format file tidak didukung. Harap pilih gambar (PNG, JPG, JPEG, WEBP, dll).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveError("Ukuran file foto maksimal 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const res = await fetch(`http://localhost:7000/users/${profile.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          whatsapp,
          institution,
          studyProgram,
          avatarUrl: avatarUrl || null,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal memperbarui profil");
      }

      setSaveSuccess("Profil Anda berhasil diperbarui!");
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || "Terjadi kesalahan saat menyimpan profil.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
        <p className="mt-4 text-xs text-muted-foreground animate-pulse font-heading">
          Menarik data kelas...
        </p>
      </div>
    );
  }

  // Find the most recent active batch
  const activeBatches = classes
    .map(c => c.batch)
    .filter(b => b?.status === "active")
    .sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());
  
  const currentBatch = activeBatches[0];
  const activeClasses = classes.filter((cls) => cls.batchId === currentBatch?.id);
  const pastClasses = classes.filter((cls) => cls.batchId !== currentBatch?.id);
  const hasPastClasses = pastClasses.length > 0;

  const tabCols = hasPastClasses ? "grid-cols-5" : "grid-cols-4";

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6 w-full">
      <TabsList className={`bg-secondary/60 p-1.5 rounded-xl border border-border/60 grid w-full min-h-14 ${tabCols}`}>
        <TabsTrigger value="activity" className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-3 py-2">
          <BookOpen className="w-5 h-5 shrink-0" />
          <span>Kelas & Aktivitas</span>
        </TabsTrigger>
        {hasPastClasses && (
          <TabsTrigger value="past-batches" className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-3 py-2">
            <GraduationCap className="w-5 h-5 shrink-0" />
            <span>Batch Lama</span>
          </TabsTrigger>
        )}
        <TabsTrigger value="logbook" className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-3 py-2">
          <BookOpen className="w-5 h-5 shrink-0" />
          <span>Logbook</span>
        </TabsTrigger>
        <TabsTrigger value="attendance" className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-3 py-2">
          <Calendar className="w-5 h-5 shrink-0" />
          <span>Absensi</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-3 py-2">
          <Settings className="w-5 h-5 shrink-0" />
          <span>Pengaturan Akun</span>
        </TabsTrigger>
      </TabsList>

      {/* ── TAB 1: KELAS & AKTIVITAS ── */}
      <TabsContent value="activity" className="space-y-6 outline-hidden">
        <div className="grid md:grid-cols-3 gap-6">
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
                        Anda terdaftar pada program <strong>{profile.selectedProgram}</strong>. Saat ini kelas pembelajaran belum dijadwalkan oleh Mentor Utama atau Admin belum meluncurkan/mengaktifkan Batch Cohort berjalan. Silakan tunggu atau hubungi administrator Anda.
                      </>
                    ) : (
                      <>
                        Akun Anda belum dikaitkan dengan Program Studi manapun. Harap hubungi administrator untuk menentukan program Anda.
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
                    <Link key={cls.id} href={`/dashboard/class/${cls.id}`} className="block transition-transform hover:-translate-y-1">
                      <Card className="border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-gradient-to-r from-brand-purple to-brand-gradient-end px-6 py-5 text-white">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-yellow">
                            Sedang Berjalan • {cls.batch?.name}
                          </p>
                          <CardTitle className="text-white text-xl mt-1.5">{cls.program?.name}</CardTitle>
                          <p className="text-xs text-white/80 mt-1">Mentor: {cls.mentor?.name || "Belum ditentukan"}</p>
                          {cls.batch?.startDate && cls.batch?.endDate && (
                            <div className="flex items-center gap-1.5 mt-2 text-[10px] bg-white/10 w-fit px-2 py-1 rounded-md border border-white/10">
                              <Calendar className="w-3 h-3 text-brand-yellow" />
                              <span className="font-semibold">{new Date(cls.batch.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} - {new Date(cls.batch.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
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
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
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
                    (c.assignments || []).map((a: any) => ({ ...a, classId: c.id, programName: c.program?.name }))
                  );
                  
                  if (allAssignments.length > 0) {
                    return (
                      <div className="space-y-3">
                        {allAssignments.map((assignment: any) => (
                          <Link href={`/dashboard/class/${assignment.classId}/assignment/${assignment.id}`} key={assignment.id} className="block">
                            <div className="p-3 border border-border rounded-lg hover:border-brand-purple/50 transition-colors bg-secondary/10">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-md bg-brand-yellow/20 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="font-heading font-semibold text-xs text-foreground line-clamp-1">{assignment.title}</h4>
                                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                                    {assignment.programName}
                                  </p>
                                  {assignment.dueDate && (
                                    <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded bg-brand-yellow/10 text-amber-600 font-mono">
                                      Tenggat: {new Date(assignment.dueDate).toLocaleDateString("id-ID")}
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
                        Belum ada tugas baru dari mentor untuk kelas {classes[0].program?.name}.
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
      </TabsContent>

      {/* ── TAB 2: PENGATURAN AKUN ── */}
      <TabsContent value="settings" className="space-y-6 outline-hidden">
        <Card className="border-border bg-card shadow-sm w-full">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="font-heading font-bold text-lg flex items-center gap-2 text-foreground">
              <Settings className="w-5 h-5 text-brand-purple" />
              Edit Profil Saya
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Perbarui data pribadi Anda yang tersimpan di sistem.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {saveSuccess && (
                <Alert className="border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400">
                  <AlertDescription className="text-xs font-medium">{saveSuccess}</AlertDescription>
                </Alert>
              )}
              {saveError && (
                <Alert className="border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400">
                  <AlertDescription className="text-xs font-medium">{saveError}</AlertDescription>
                </Alert>
              )}

              {/* Avatar Management */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-border/50">
                <div className="relative group shrink-0">
                  <img
                    src={getEffectiveAvatar()}
                    alt="Foto Profil"
                    className="w-24 h-24 rounded-full object-cover border-2 border-brand-purple/20 shadow-md transition-all group-hover:brightness-90"
                  />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                    <Upload className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="space-y-4 w-full">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Unggah Foto Profil Baru</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-xs text-muted-foreground file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-purple/10 file:text-brand-purple hover:file:bg-brand-purple/20 cursor-pointer"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Mendukung format PNG, JPG, JPEG, WEBP, dll. Maksimal 5MB.</p>
                  </div>

                  {/* Choose from Default Avatars */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pilih dari Avatar Default:</label>
                    <div className="flex gap-2">
                      {defaultAvatars.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(url)}
                          className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-105 hover:shadow-xs ${
                            avatarUrl === url ? "border-brand-purple scale-105 shadow-sm" : "border-transparent"
                          }`}
                        >
                          <img src={url} alt={`Avatar default ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-brand-purple" />
                    Nama Lengkap
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Nama Anda"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-brand-purple" />
                    Nomor WhatsApp
                  </label>
                  <Input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Contoh: 08123456789"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <School className="w-3.5 h-3.5 text-brand-purple" />
                    Asal Institusi / Kampus
                  </label>
                  <Input
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Contoh: Universitas Indonesia"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-brand-purple" />
                    Program Studi
                  </label>
                  <Input
                    value={studyProgram}
                    onChange={(e) => setStudyProgram(e.target.value)}
                    placeholder="Contoh: Teknik Informatika"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold h-10 px-6 flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── TAB LOGBOOK ── */}
      <TabsContent value="logbook" className="space-y-6 outline-hidden">
        {activeClasses.length > 0 ? (
          <StudentLogbook batchId={activeClasses[0].batchId} />
        ) : (
          <Alert className="border-amber-500/50 bg-amber-500/10 text-amber-600">
            <Info className="w-5 h-5" />
            <AlertTitle>Tidak dapat mengakses logbook</AlertTitle>
            <AlertDescription>Anda belum terdaftar di kelas aktif mana pun pada batch saat ini.</AlertDescription>
          </Alert>
        )}
      </TabsContent>

      {/* ── TAB ABSENSI ── */}
      <TabsContent value="attendance" className="space-y-6 outline-hidden">
        {activeClasses.length > 0 ? (
          <StudentAttendance
            batchId={activeClasses[0].batchId}
            studentId={profile.id}
          />
        ) : (
          <Alert className="border-amber-500/50 bg-amber-500/10 text-amber-600">
            <Info className="w-5 h-5" />
            <AlertTitle>Tidak dapat mengakses absensi</AlertTitle>
            <AlertDescription>Anda belum terdaftar di kelas aktif mana pun pada batch saat ini.</AlertDescription>
          </Alert>
        )}
      </TabsContent>

      {hasPastClasses && (
        <TabsContent value="past-batches" className="space-y-6 outline-hidden">
          <div className="space-y-4 font-sans">
            <h2 className="font-heading font-bold text-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-brand-purple" />
              Riwayat Angkatan / Batch Lama Anda
            </h2>
            <p className="text-xs text-muted-foreground">
              Berikut adalah daftar program studi yang Anda ikuti pada angkatan sebelumnya. Anda tetap dapat mengakses materi pembelajaran dalam mode baca (Read-Only).
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              {pastClasses.map((cls) => (
                <Link key={cls.id} href={`/dashboard/class/${cls.id}`} className="block transition-transform hover:-translate-y-1">
                  <Card className="border-border shadow-sm overflow-hidden bg-card hover:shadow-md transition-shadow">
                    <div className="bg-slate-800 px-6 py-5 text-white">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                        Selesai • {cls.batch?.name}
                      </p>
                      <CardTitle className="text-white text-lg mt-1.5">{cls.program?.name}</CardTitle>
                      <p className="text-2xs text-white/85 mt-1">Mentor Pendamping: {cls.mentor?.name || "Belum ditentukan"}</p>
                    </div>
                    <CardContent className="py-4 flex justify-between items-center text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        Kelas diarsipkan
                      </span>
                      <span className="text-brand-purple font-semibold hover:underline flex items-center gap-1">
                        Lihat Materi
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}
