"use client";

import { API_BASE_URL } from "@/lib/config";
import { Greeting } from "@/components/greeting";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  Loader2,
  User,
  Award,
  Info,
  AlertTriangle,
  Lock,
  KeyRound,
  Sparkles,
  Link2,
  ExternalLink,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

const STUDENT_QUOTES = [
  "Setiap langkah kecil yang Anda ambil hari ini mendekatkan Anda pada impian menjadi ahli teknologi.",
  "Konsistensi dalam belajar dan menyelesaikan tugas adalah kunci kesuksesan di dunia profesional.",
  "Jangan takut menghadapi kendala coding atau materi sulit, itulah tempat terbaik untuk berkembang.",
  "Manfaatkan setiap modul dan bimbingan mentor untuk mengasah keterampilan terbaik Anda.",
  "Perjalanan ratusan kode dimulai dari satu baris pertama. Tetap semangat belajar hari ini.",
  "Keberhasilan tidak datang dari kebetulan, melainkan dari kerja keras dan ketekunan harian.",
  "Asah kemampuan teknis dan logika Anda, masa depan industri digital ada di tangan Anda.",
  "Tetap fokus, selesaikan logbook tepat waktu, dan capai potensi maksimal dalam batch ini.",
];

export function StudentDashboard({ profile, onProfileUpdate }: StudentDashboardProps) {
  const [randomQuote] = useState(() => STUDENT_QUOTES[Math.floor(Math.random() * STUDENT_QUOTES.length)]);
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("activity");

  const searchParams = useSearchParams();
  const router = useRouter();

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
    const url = new URL(window.location.href);
    if (val === "settings") {
      url.searchParams.set("tab", "settings");
    } else {
      url.searchParams.delete("tab");
    }
    router.push(url.pathname + url.search, { scroll: false });
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
    fetch(`${API_BASE_URL}/classes/my-classes`, {
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
      const res = await fetch(`${API_BASE_URL}/users/${profile.id}`, {
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

    fetch(`${API_BASE_URL}/attendance?batchId=${activeCls.batchId}&studentId=${profile.id}`, {
      headers: { Accept: "application/json" },
      credentials: "include"
    })
      .then((res) => {
        if (!res.ok) return [];
        return res.json();
      })
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
              fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include" })
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
  const isGraduated = profile?.status === "graduated" || (classes.length > 0 && activeClasses.length === 0);

  const tabCols = hasPastClasses ? "grid-cols-7" : "grid-cols-6";

  const getSPContent = (level: number) => {
    if (level === 1) return { title: "SURAT PERINGATAN 1 (SP1)", color: "bg-amber-500", desc: "Anda telah mencapai 10% Alpha (tidak hadir tanpa keterangan) pada bulan ini. Harap tingkatkan kedisiplinan kehadiran Anda agar tidak mendapat Sanksi SP2." };
    if (level === 2) return { title: "SURAT PERINGATAN 2 (SP2)", color: "bg-orange-500", desc: "Anda telah mendapat Alpha lagi setelah SP1. Harap berhati-hati, 1x Alpha lagi akan menyebabkan terbitnya Surat Peringatan SP3." };
    return { title: "SURAT PERINGATAN 3 (SP3)", color: "bg-red-600", desc: "PERINGATAN TERAKHIR (SP3). Tambahan 1x Alpha lagi akan menyebabkan AKUN ANDA OTOMATIS DI-SUSPEND dari sistem LMS." };
  };

  const spContent = globalSpLevel > 0 ? getSPContent(globalSpLevel) : null;

  return (
    <div className="space-y-6 font-sans">
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

      {profile?.isPasswordChanged === false && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-700 dark:text-amber-300 font-sans shadow-xs mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-heading">Peringatan Keamanan Akun</h4>
              <p className="text-[11px] opacity-90">
                Anda masih menggunakan password awal. Harap segera ganti password Anda demi keamanan akun.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => handleTabChange("settings")}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold h-9 px-4 shrink-0 cursor-pointer"
          >
            Ganti Password Sekarang
          </Button>
        </div>
      )}

      {/* Banner / Welcome Student (Identical to Mentor Banner Design) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a103c] via-[#2d1b69] to-[#1e144a] p-6 md:p-8 text-white shadow-lg border border-white/10"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-brand-purple/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-brand-yellow/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-brand-yellow">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student View</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-white">
                <Greeting name={profile?.name || "Student"} />
              </h1>
              <p className="text-sm text-white/80 leading-relaxed font-sans">
                {randomQuote}
              </p>
            </div>
          </div>

          {/* Quick Links Widget inside Banner */}
          {(() => {
            const firstCls = (activeClasses[0] || classes[0]) as any;
            const classLinks = firstCls?.importantLinks && firstCls.importantLinks.length > 0
              ? firstCls.importantLinks
              : (firstCls?.program?.importantLinks || []);
            const activeLinks = (classLinks || []).filter((l: any) => l.url && l.url.trim() !== "");
            if (activeLinks.length === 0) return null;

            const mandatoryLinks = activeLinks.filter((l: any) => l.scope === "mandatory" || l.scope === "restricted");
            const mandatoryTitles = new Set(mandatoryLinks.map((l: any) => (l.title || '').toLowerCase().trim()));
            const personalLinks = activeLinks.filter((l: any) => 
              (l.scope !== "mandatory" && l.scope !== "restricted") && 
              !mandatoryTitles.has((l.title || '').toLowerCase().trim())
            );

            return (
              <div className="pt-4 border-t border-white/10 space-y-4">
                {mandatoryLinks.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5 font-heading">
                        <Link2 className="w-3.5 h-3.5 text-brand-yellow" />
                        📌 Link Wajib (Semua Program)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      {mandatoryLinks.map((item: any) => (
                        <a
                          key={item.id || item.title}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-brand-yellow/30 backdrop-blur-md transition-all duration-200 shadow-sm shadow-brand-yellow/10"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-1.5 rounded-lg bg-brand-yellow/20 text-brand-yellow group-hover:scale-105 transition-transform shrink-0">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-medium text-white truncate group-hover:text-brand-yellow transition-colors">
                              {item.title}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {personalLinks.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white/80 flex items-center gap-1.5 font-heading">
                        <Link2 className="w-3.5 h-3.5 text-white/60" />
                        🔗 Link Tambahan Kelas Ini
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      {personalLinks.map((item: any) => (
                        <a
                          key={item.id || item.title}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 backdrop-blur-md transition-all duration-200"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-1.5 rounded-lg bg-white/10 text-white/70 group-hover:scale-105 transition-transform shrink-0">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-medium text-white/90 truncate group-hover:text-white transition-colors">
                              {item.title}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6 w-full font-sans">
        <TabsList className="bg-secondary/60 p-1.5 rounded-xl border border-border/60 flex overflow-x-auto whitespace-nowrap min-h-14 w-full gap-1.5 justify-start md:justify-center scrollbar-none">
          <TabsTrigger
            value="activity"
            className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2.5 py-2 px-3 shrink-0 cursor-pointer"
          >
            <BookOpen className="w-5 h-5 shrink-0" />
            <span>Kelas & Aktivitas</span>
          </TabsTrigger>
          {hasPastClasses && (
            <TabsTrigger
              value="past-batches"
              className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2.5 py-2 px-3 shrink-0 cursor-pointer"
            >
              <GraduationCap className="w-5 h-5 shrink-0" />
              <span>Batch Lama</span>
            </TabsTrigger>
          )}
          <TabsTrigger
            value="permission"
            className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2.5 py-2 px-3 shrink-0 cursor-pointer"
          >
            <FileText className="w-5 h-5 shrink-0" />
            <span>Form Izin</span>
          </TabsTrigger>
          <TabsTrigger
            value="logbook"
            className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2.5 py-2 px-3 shrink-0 cursor-pointer"
          >
            <BookOpen className="w-5 h-5 shrink-0" />
            <span>Logbook</span>
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2.5 py-2 px-3 shrink-0 cursor-pointer"
          >
            <Calendar className="w-5 h-5 shrink-0" />
            <span>Absensi</span>
          </TabsTrigger>
          <TabsTrigger
            value="certificate"
            className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2.5 py-2 px-3 shrink-0 cursor-pointer"
          >
            <Award className="w-5 h-5 shrink-0" />
            <span>Transkrip & Sertifikat</span>
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2.5 py-2 px-3 shrink-0 cursor-pointer"
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
            onNavigateTab={handleTabChange}
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
          ) : isGraduated ? (
            <Alert className="border-brand-purple/30 bg-brand-purple/5 text-foreground p-5 font-sans">
              <Award className="w-6 h-6 text-brand-purple shrink-0 mt-0.5" />
              <div className="space-y-1">
                <AlertTitle className="font-heading font-bold text-base">Kegiatan Logbook Selesai</AlertTitle>
                <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
                  Seluruh kegiatan logbook harian telah selesai untuk batch ini. Anda dapat melihat rekapan penilaian dan transkrip nilai pada tab <strong>Transkrip & Sertifikat</strong> atau meninjau modul lama di tab <strong>Batch Lama</strong>.
                </AlertDescription>
              </div>
            </Alert>
          ) : (
            <Alert className="border-amber-500/50 bg-amber-500/10 text-amber-600 font-sans">
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
          ) : isGraduated ? (
            <Alert className="border-brand-purple/30 bg-brand-purple/5 text-foreground p-5 font-sans">
              <Award className="w-6 h-6 text-brand-purple shrink-0 mt-0.5" />
              <div className="space-y-1">
                <AlertTitle className="font-heading font-bold text-base">Kegiatan Absensi Selesai</AlertTitle>
                <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
                  Kegiatan perkuliahan dan absensi harian telah berakhir untuk batch ini. Rekapan nilai kehadiran Anda dapat dilihat di tab <strong>Transkrip & Sertifikat</strong>.
                </AlertDescription>
              </div>
            </Alert>
          ) : (
            <Alert className="border-amber-500/50 bg-amber-500/10 text-amber-600 font-sans">
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
    </div>
  );
}
