"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen, Calendar, FileText, GraduationCap, Loader2, Settings, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentLogbook } from "./student-logbook";
import { StudentAttendance } from "./student-attendance";
import { StudentDashboardProps, StudentClass } from "./student/types";

// Sub-components
import { StudentActivityView } from "./student/student-activity-view";
import { StudentProfileSettings } from "./student/student-profile-settings";
import { StudentPastBatches } from "./student/student-past-batches";
import { StudentPermissionView } from "./student/student-permission-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

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
    .map((c) => c.batch)
    .filter((b) => b?.status === "active")
    .sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());

  const currentBatch = activeBatches[0];
  const activeClasses = classes.filter((cls) => cls.batchId === currentBatch?.id);
  const pastClasses = classes.filter((cls) => cls.batchId !== currentBatch?.id);
  const hasPastClasses = pastClasses.length > 0;

  const tabCols = hasPastClasses ? "grid-cols-6" : "grid-cols-5";

  return (
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
  );
}
