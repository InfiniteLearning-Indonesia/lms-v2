"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen, Calendar, FileText, GraduationCap, Loader2, Settings, User, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentLogbook } from "./student-logbook";
import { StudentAttendance } from "./student-attendance";
import { StudentDashboardProps, StudentClass } from "./student/types";

// Sub-components
import { StudentActivityView } from "./student/student-activity-view";
import { StudentProfileSettings } from "./student/student-profile-settings";
import { StudentPastBatches } from "./student/student-past-batches";
import { StudentPermissionView } from "./student/student-permission-view";
import { StudentCertificateView } from "./student/student-certificate-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertTriangle, Lock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

export function StudentDashboard({ profile, onProfileUpdate }: StudentDashboardProps) {
  const [classes, setClasses] = useState<StudentClass[]>([]);
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
        headers: { "Content-Type": "application/json" },
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

  // SP Global Modal States
  const [globalSpLevel, setGlobalSpLevel] = useState<number>(0);
  const [globalSpPopupOpen, setGlobalSpPopupOpen] = useState(false);
  const [globalSpAgreed, setGlobalSpAgreed] = useState(false);
  const [globalSpCountdown, setGlobalSpCountdown] = useState(10);

  useEffect(() => {
    if (!profile?.id || classes.length === 0) return;
    const activeCls = classes.find((c) => c.batch?.status === "active");
    if (!activeCls?.batchId) return;

    fetch(`http://localhost:7000/attendance?batchId=${activeCls.batchId}&studentId=${profile.id}`, {
      headers: { Accept: "application/json" },
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const maxSp = Math.max(...data.map((d: any) => d.spLevel || 0));
          if (maxSp >= 1 && maxSp <= 3) {
            setGlobalSpLevel(maxSp);
            setGlobalSpPopupOpen(true);
            setGlobalSpCountdown(10);
          }
        }
      })
      .catch(console.error);
  }, [profile?.id, classes]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (globalSpPopupOpen && globalSpCountdown > 0) {
      timer = setInterval(() => {
        setGlobalSpCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [globalSpPopupOpen, globalSpCountdown]);

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

  // 🚫 Check if student account is Suspended
  if (profile?.status === "suspended") {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-lg w-full bg-card border border-red-500/30 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />
          <div className="mx-auto w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600">
            <Lock className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 font-bold text-xs uppercase tracking-wider border border-red-500/20">
              <Info className="w-4 h-4" /> Akun Ter-Suspend
            </span>
            <h2 className="text-2xl font-heading font-extrabold text-foreground tracking-tight">
              Akses LMS Anda Dibatasi
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed pt-2">
              Akun Anda telah <strong>di-suspend</strong> secara otomatis oleh sistem karena telah melampaui ambang batas Surat Peringatan (SP3) akibat ketidakhadiran tanpa keterangan (Alpha).
            </p>
          </div>
          <div className="bg-secondary/40 p-4 rounded-xl text-left border border-border text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Dampak Status Suspended:</p>
            <ul className="list-disc list-inside space-y-1 pt-1">
              <li>Seluruh modul, tugas, dan fitur LMS Anda dikunci.</li>
              <li>Status absensi harian Anda otomatis Alpha secara berkelanjutan.</li>
              <li>Silakan hubungi Mentor Utama atau Admin untuk permohonan <em>Unsuspend</em>.</li>
            </ul>
          </div>
          <button
            onClick={() => {
              fetch("http://localhost:7000/auth/logout", { method: "POST", credentials: "include" })
                .then(() => (window.location.href = "/login"))
                .catch(() => (window.location.href = "/login"));
            }}
            className="w-full h-11 border border-red-500/30 text-red-600 hover:bg-red-500/10 text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            Keluar Akun
          </button>
        </div>
      </div>
    );
  }

  // Find the most recent active batch
  const activeBatches = classes
    .map((c) => c.batch)
    .filter((b) => b?.status === "active")
    .sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());

  const currentBatch = activeBatches[0];
  const activeClasses = classes.filter((cls) => cls.batchId === currentBatch?.id);
  const pastClasses = classes.filter((cls) => cls.batchId !== currentBatch?.id);
  const hasPastClasses = pastClasses.length > 0;

  const tabCols = hasPastClasses ? "grid-cols-7" : "grid-cols-6";

  const getSPContent = (level: number) => {
    if (level === 1) return { title: "SURAT PERINGATAN 1 (SP1)", color: "bg-amber-500", desc: "Anda telah mencapai 10% Alpha (tidak hadir tanpa keterangan) pada bulan ini. Harap tingkatkan kedisiplinan kehadiran Anda agar tidak mendapat Sanksi SP2." };
    if (level === 2) return { title: "SURAT PERINGATAN 2 (SP2)", color: "bg-orange-500", desc: "Anda telah mendapat Alpha lagi setelah SP1. Harap berhati-hati, 1x Alpha lagi akan menyebabkan terbitnya Surat Peringatan SP3." };
    return { title: "SURAT PERINGATAN 3 (SP3)", color: "bg-red-600", desc: "PERINGATAN TERAKHIR (SP3). Tambahan 1x Alpha lagi akan menyebabkan AKUN ANDA OTOMATIS DI-SUSPEND dari sistem LMS." };
  };

  const spContent = globalSpLevel > 0 ? getSPContent(globalSpLevel) : null;

  return (
    <>
      {/* ⚠️ Global SP Warning Modal on Login */}
      {spContent && (
        <AlertDialog open={globalSpPopupOpen}>
          <AlertDialogContent className="max-w-xl max-h-[90vh] overflow-hidden p-0 border border-border shadow-2xl">
            <div className={`${spContent.color} px-6 py-5 relative overflow-hidden`}>
              <div className="relative flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-white" />
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">{spContent.title}</h2>
                  <p className="text-white/80 text-xs font-medium">Batas ketidakhadiran telah terlampaui.</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4 text-sm text-foreground">
              <p>{spContent.desc}</p>
              <p className="text-xs text-muted-foreground">
                Satu tingkat Alpha lagi berpotensi menyebabkan sanksi yang lebih berat hingga suspend otomatis dari sistem.
              </p>
              
              <label className={`flex items-start gap-3 mt-4 ${globalSpCountdown > 0 ? 'opacity-50' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={globalSpAgreed}
                  onChange={e => setGlobalSpAgreed(e.target.checked)}
                  disabled={globalSpCountdown > 0}
                  className="mt-1"
                />
                <span className="text-xs text-muted-foreground select-none">
                  Saya telah membaca peringatan ini dan akan berkomitmen untuk memperbaiki kehadiran saya.
                </span>
              </label>
            </div>
            <AlertDialogFooter className="px-6 pb-5 pt-0">
              <AlertDialogAction
                disabled={globalSpCountdown > 0 || !globalSpAgreed}
                onClick={() => setGlobalSpPopupOpen(false)}
                className={`w-full ${globalSpCountdown > 0 || !globalSpAgreed ? 'bg-secondary text-muted-foreground' : spContent.color + ' text-white'} transition-all`}
              >
                {globalSpCountdown > 0 ? `Mohon dibaca (${globalSpCountdown}s)` : 'Saya Mengerti dan Setuju'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6 w-full font-sans">
      <TabsList
        className={`bg-secondary/60 p-1.5 rounded-xl border border-border/60 grid w-full min-h-14 ${tabCols}`}
      >
        <TabsTrigger
          value="activity"
          className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-3 py-2 cursor-pointer"
        >
          <BookOpen className="w-5 h-5 shrink-0" />
          <span>Kelas & Aktivitas</span>
        </TabsTrigger>
        {hasPastClasses && (
          <TabsTrigger
            value="past-batches"
            className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-3 py-2 cursor-pointer"
          >
            <GraduationCap className="w-5 h-5 shrink-0" />
            <span>Batch Lama</span>
          </TabsTrigger>
        )}
        <TabsTrigger
          value="permission"
          className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-3 py-2 cursor-pointer"
        >
          <FileText className="w-5 h-5 shrink-0" />
          <span>Form Izin</span>
        </TabsTrigger>
        <TabsTrigger
          value="logbook"
          className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-3 py-2 cursor-pointer"
        >
          <BookOpen className="w-5 h-5 shrink-0" />
          <span>Logbook</span>
        </TabsTrigger>
        <TabsTrigger
          value="attendance"
          className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-3 py-2 cursor-pointer"
        >
          <Calendar className="w-5 h-5 shrink-0" />
          <span>Absensi</span>
        </TabsTrigger>
        <TabsTrigger
          value="certificate"
          className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-3 py-2 cursor-pointer"
        >
          <Award className="w-5 h-5 shrink-0" />
          <span>Transkrip & Sertifikat</span>
        </TabsTrigger>
        <TabsTrigger
          value="settings"
          className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-3 py-2 cursor-pointer"
        >
          <User className="w-5 h-5 shrink-0" />
          <span>Profil</span>
        </TabsTrigger>
      </TabsList>

      {/* ── TAB 1: KELAS & AKTIVITAS ── */}
      <TabsContent value="activity" className="space-y-6 outline-hidden">
        <StudentActivityView
          profile={profile}
          activeClasses={activeClasses}
          classes={classes}
        />
      </TabsContent>

      {/* ── TAB FORM IZIN ── */}
      <TabsContent value="permission" className="space-y-6 outline-hidden">
        <StudentPermissionView profile={profile} activeClasses={activeClasses} />
      </TabsContent>

      {/* ── TAB TRANSKRIP & SERTIFIKAT ── */}
      <TabsContent value="certificate" className="space-y-6 outline-hidden">
        <StudentCertificateView profile={profile} />
      </TabsContent>

      {/* ── TAB 2: PENGATURAN AKUN ── */}
      <TabsContent value="settings" className="space-y-6 outline-hidden">
        <StudentProfileSettings
          profile={profile}
          name={name}
          setName={setName}
          whatsapp={whatsapp}
          setWhatsapp={setWhatsapp}
          institution={institution}
          setInstitution={setInstitution}
          studyProgram={studyProgram}
          setStudyProgram={setStudyProgram}
          avatarUrl={avatarUrl}
          setAvatarUrl={setAvatarUrl}
          isSaving={isSaving}
          saveError={saveError}
          saveSuccess={saveSuccess}
          handleFileChange={handleFileChange}
          handleSaveProfile={handleSaveProfile}
        />
      </TabsContent>

      {/* ── TAB LOGBOOK ── */}
      <TabsContent value="logbook" className="space-y-6 outline-hidden">
        {activeClasses.length > 0 ? (
          <StudentLogbook batchId={activeClasses[0].batchId} />
        ) : (
          <Alert className="border-amber-500/50 bg-amber-500/10 text-amber-600">
            <Info className="w-5 h-5" />
            <AlertTitle>Tidak dapat mengakses logbook</AlertTitle>
            <AlertDescription>
              Anda belum terdaftar di kelas aktif mana pun pada batch saat ini.
            </AlertDescription>
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
            <AlertDescription>
              Anda belum terdaftar di kelas aktif mana pun pada batch saat ini.
            </AlertDescription>
          </Alert>
        )}
      </TabsContent>

      {hasPastClasses && (
        <TabsContent value="past-batches" className="space-y-6 outline-hidden">
          <StudentPastBatches pastClasses={pastClasses} studentId={profile.id} />
        </TabsContent>
      )}
    </Tabs>
    </>
  );
}
