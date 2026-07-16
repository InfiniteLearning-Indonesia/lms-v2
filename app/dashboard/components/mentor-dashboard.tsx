"use client";

import Link from "next/link";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Users,
  Award,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  Loader2,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  ShieldAlert,
  Mail,
  UserCheck,
  MessageSquare,
  BookMarked,
  HelpCircle,
  Info,
  Lock,
  Play,
  UserPlus,
  RefreshCw,
  Sliders,
  X,
  Plus,
  Settings,
  User,
  Phone,
  School,
  GraduationCap,
  Upload,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

interface MentorDashboardProps {
  profile?: {
    id: string;
    name: string;
    email: string;
    role: string;
    roles?: string[];
    whatsapp?: string | null;
    institution?: string | null;
    studyProgram?: string | null;
    specialization?: string | null;
    selectedProgram?: string | null;
    avatarUrl?: string | null;
  };
  onProfileUpdate?: () => void;
}

export function MentorDashboard({ profile, onProfileUpdate }: MentorDashboardProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("classes");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Listen to tab query parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "settings") {
        setActiveTab("settings");
      }
    }
  }, []);

  // Profile Form States
  const [myName, setMyName] = useState(profile?.name || "");
  const [myWhatsapp, setMyWhatsapp] = useState(profile?.whatsapp || "");
  const [myInstitution, setMyInstitution] = useState(profile?.institution || "");
  const [myStudyProgram, setMyStudyProgram] = useState(profile?.studyProgram || "");
  const [myAvatarUrl, setMyAvatarUrl] = useState(profile?.avatarUrl || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState<string | null>(null);

  const defaultAvatars = [
    "/avatars/avatar_1.png",
    "/avatars/avatar_2.png",
    "/avatars/avatar_3.png",
    "/avatars/avatar_4.png",
    "/avatars/avatar_5.png",
  ];

  const getEffectiveAvatar = () => {
    if (myAvatarUrl) return myAvatarUrl;
    const code = profile?.id ? profile.id.charCodeAt(0) + profile.id.charCodeAt(profile.id.length - 1) : 1;
    const index = (code % 5) + 1;
    return `/avatars/avatar_${index}.png`;
  };

  // Sync state if profile changes
  useEffect(() => {
    if (profile) {
      setMyName(profile.name || "");
      setMyWhatsapp(profile.whatsapp || "");
      setMyInstitution(profile.institution || "");
      setMyStudyProgram(profile.studyProgram || "");
      setMyAvatarUrl(profile.avatarUrl || "");
    }
  }, [profile]);

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileSaveError("Ukuran file foto maksimal 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setMyAvatarUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    setIsSavingProfile(true);
    setProfileSaveError(null);
    setProfileSaveSuccess(null);

    try {
      const res = await fetch(`http://localhost:7000/users/${profile.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: myName,
          whatsapp: myWhatsapp,
          institution: myInstitution,
          studyProgram: myStudyProgram,
          avatarUrl: myAvatarUrl || null,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal memperbarui profil");
      }

      setProfileSaveSuccess("Profil Anda berhasil diperbarui!");
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (err: any) {
      console.error(err);
      setProfileSaveError(err.message || "Terjadi kesalahan saat menyimpan profil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const [distributeMessage, setDistributeMessage] = useState<string | null>(null);
  const [isDistributing, setIsDistributing] = useState(false);

  const [competencies, setCompetencies] = useState<any[]>([]);
  const [isAddCompetencyModalOpen, setIsAddCompetencyModalOpen] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] = useState(false);
  const [materialType, setMaterialType] = useState("pdf");

  const handleDistributeModulo = async (progName: string) => {
    setIsDistributing(true);
    setDistributeMessage(null);
    try {
      const res = await fetch("http://localhost:7000/classes/program-distribute-modulo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programName: progName }),
        credentials: "include",
      });
      if (res.ok) {
        const d = await res.json();
        setDistributeMessage(d.message || "Distribusi Modulo berhasil dijalankan.");
        fetchMentorData();
      }
    } catch (err) {
      console.error("Gagal distribusi modulo:", err);
    } finally {
      setIsDistributing(false);
    }
  };

  useEffect(() => {
    fetchMentorData();
    fetchCompetencies();
  }, []);

  const fetchCompetencies = async () => {
    try {
      const res = await fetch(`http://localhost:7000/classes/competencies`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCompetencies(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCompetency = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("http://localhost:7000/classes/competencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          category: formData.get("category"),
          programId: classes[0]?.program?.id,
        }),
        credentials: "include",
      });
      if (res.ok) {
        setIsAddCompetencyModalOpen(false);
        fetchCompetencies();
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch(`http://localhost:7000/classes/${selectedClassId}/material`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          type: formData.get("type"),
          competency: formData.get("competency"),
          url: formData.get("url") || formData.get("caption") || "",
          content: formData.get("content") || "",
        }),
        credentials: "include",
      });
      if (res.ok) {
        setIsAddMaterialModalOpen(false);
        fetchMentorData();
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch(`http://localhost:7000/classes/${selectedClassId}/assignment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          competency: formData.get("competency"),
          dueDate: formData.get("dueDate"),
          submissionType: formData.get("submissionType"),
        }),
        credentials: "include",
      });
      if (res.ok) {
        setIsAddAssignmentModalOpen(false);
        fetchMentorData();
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMentorData = async () => {
    setIsLoading(true);
    try {
      const resClasses = await fetch("http://localhost:7000/classes/mentor-classes", {
        headers: { Accept: "application/json" },
        credentials: "include",
      });

      if (resClasses.ok) {
        const dataClasses = await resClasses.json();
        setClasses(dataClasses);
        const active = dataClasses.find((cls: any) => cls.batch?.status === "active");
        if (active) {
          setSelectedClassId(active.id);
        } else if (dataClasses.length > 0) {
          setSelectedClassId(dataClasses[0].id);
        }
      }
    } catch (err) {
      console.error("Gagal memuat data mentor, menggunakan fallback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeClasses = classes.filter((cls) => cls.batch?.status === "active");
  const pastClasses = classes.filter((cls) => cls.batch?.status === "completed");
  const hasPastClasses = pastClasses.length > 0;

  // Calculate stats
  const totalClasses = activeClasses.length;
  const totalStudents = activeClasses.reduce((acc, cls) => acc + (cls.enrolledStudentsCount || 0), 0);
  const allStudents = activeClasses.flatMap((cls) => cls.enrolledStudents || []);
  const totalMaterials = activeClasses.reduce((acc, cls) => acc + (cls.materials?.length || 0), 0);
  const totalAssignments = activeClasses.reduce((acc, cls) => acc + (cls.assignments?.length || 0), 0);

  // Filter students based on search query
  const filteredStudents = allStudents.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      (student.name && student.name.toLowerCase().includes(query)) ||
      (student.email && student.email.toLowerCase().includes(query)) ||
      (student.selectedProgram && student.selectedProgram.toLowerCase().includes(query))
    );
  });

  const selectedCls = classes.find((c) => c.id === selectedClassId) || classes[0];
  const isReadOnly = selectedCls?.batch?.status === "completed";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-card border border-border rounded-xl shadow-sm">
        <Loader2 className="w-10 h-10 text-brand-purple animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground animate-pulse font-heading font-medium">
          Menyiapkan dasbor mentor akademik...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Banner / Welcome Mentor ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a103c] via-[#2d1b69] to-[#1e144a] p-6 md:p-8 text-white shadow-lg border border-white/10"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-brand-purple/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-brand-yellow/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-brand-yellow">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal Akademik Mentor LMS v2</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-white">
              Manajemen Pembelajaran & Siswa Binaan
            </h1>
            <p className="text-sm text-white/80 leading-relaxed">
              Pantau progres kelas, kelola materi kompetensi, serta bimbing siswa sesuai dengan filosofi dan aturan kepemilikan program (<strong className="text-white">Source of Truth v2.0</strong>).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Button
              onClick={fetchMentorData}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:text-white transition-all text-xs shadow-sm"
            >
              <Loader2 className={`w-3.5 h-3.5 mr-2 ${isLoading ? "animate-spin" : "hidden"}`} />
              Segarkan Data
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Ringkasan Statistik ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Kelas Ajar Aktif
            </CardTitle>
            <div className="p-2 bg-brand-purple/10 rounded-lg text-brand-purple">
              <BookOpen className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">{totalClasses}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-medium">Aktif</span> semester ini
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Siswa Binaan
            </CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">{totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tersebar di {totalClasses} batch kelas
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Modul & Materi
            </CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
              <Layers className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">{totalMaterials}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Materi pembelajaran terdaftar
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tugas & Praktik
            </CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">{totalAssignments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tugas aktif untuk dievaluasi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Read-Only / Status Banner ── */}
      {isReadOnly && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3 text-amber-700 dark:text-amber-400">
          <Lock className="w-6 h-6 shrink-0 text-amber-600" />
          <div>
            <h4 className="font-heading font-bold text-sm">Mode Read-Only Aktif</h4>
            <p className="text-xs mt-0.5">
              Batch akademik ini telah selesai. Seluruh data kelas, materi, tugas, dan nilai siswa dikunci menjadi arsip historis. Modifikasi data ditiadakan.
            </p>
          </div>
        </div>
      )}

      {/* ── Main Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`bg-secondary/60 p-1.5 rounded-xl border border-border/60 grid w-full min-h-14 ${hasPastClasses ? "grid-cols-4" : "grid-cols-3"}`}>
          <TabsTrigger value="classes" className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-3 py-2">
            <BookOpen className="w-5 h-5 shrink-0" />
            <span>Kelas & Silabus</span>
          </TabsTrigger>
          {hasPastClasses && (
            <TabsTrigger value="past-batches" className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-3 py-2">
              <GraduationCap className="w-5 h-5 shrink-0" />
              <span>Batch Lama</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="students" className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-3 py-2">
            <Users className="w-5 h-5 shrink-0" />
            <span>Siswa Binaan ({allStudents.length})</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-3 py-2">
            <Settings className="w-5 h-5 shrink-0" />
            <span>Pengaturan Akun</span>
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: KELAS & SILABUS ── */}
        <TabsContent value="classes" className="space-y-6">
          {activeClasses.length === 0 ? (
            <Alert className="border-border bg-card shadow-sm p-6">
              <Info className="w-6 h-6 text-brand-purple shrink-0 mt-0.5" />
              <div className="space-y-2">
                <AlertTitle className="font-heading font-bold text-base text-foreground">
                  Belum Ada Kelas Aktif
                </AlertTitle>
                <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
                  {profile?.selectedProgram ? (
                    <>
                      Spesialisasi Anda: <strong>{profile.specialization || "Belum Ditentukan"}</strong>.<br/>
                      Program yang di-assign: <strong>{profile.selectedProgram}</strong>.<br/><br/>
                      Saat ini belum ada kelas ajar aktif untuk Anda di Batch berjalan. Hal ini bisa disebabkan karena:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Belum ada Batch Cohort aktif yang didefinisikan/dijalankan oleh Administrator.</li>
                        <li>Siswa belum terdaftar (atau belum dijalankan alokasi Modulo/pembagian kelas oleh Admin).</li>
                      </ul>
                    </>
                  ) : (
                    <>
                      Anda belum dikaitkan dengan Program Studi spesifik apa pun. Hubungi Administrator untuk meng-assign Anda ke Program yang sesuai.
                    </>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Class List */}
              <div className="md:col-span-1 space-y-4">
                <div className="space-y-3">
                  {classes.map((cls) => {
                    const isSelected = cls.id === selectedClassId;
                    return (
                      <div
                        key={cls.id}
                        onClick={() => setSelectedClassId(cls.id)}
                        className={`cursor-pointer rounded-xl border p-4 transition-all ${isSelected
                            ? "bg-brand-purple/10 border-brand-purple shadow-sm"
                            : "bg-card border-border hover:border-border/80 hover:bg-secondary/30"
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                            {cls.batch?.name || "Batch 7"}
                          </span>
                          {cls.batch?.status === 'active' ? (
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-200">
                              Aktif
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-200">
                              Selesai
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-heading font-bold text-base mt-2 text-foreground">
                          {cls.program?.name || "Program Studi"}
                        </h3>
                        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {cls.enrolledStudentsCount || 0} Siswa
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            {cls.materials?.length || 0} Materi
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Class Details & Syllabus Progress */}
              <div className="md:col-span-2 space-y-6">
                {(() => {
                  if (!selectedCls) return null;

                  return (
                    <Card className="border-border bg-card shadow-sm">
                      <CardHeader className="border-b border-border bg-secondary/20 pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg font-heading font-bold text-foreground">
                              {selectedCls.program?.name}
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground mt-1">
                              {selectedCls.batch?.name} • Dikelola oleh Tim Mentor
                            </CardDescription>
                          </div>
                          <Badge className="bg-brand-purple text-white hover:bg-brand-purple-hover self-start sm:self-center">
                            Silabus Berjalan
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 space-y-6">
                        {/* Syllabus Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Progres Pembelajaran Silabus</span>
                            <span className="text-brand-purple">65%</span>
                          </div>
                          <Progress value={65} className="h-2 bg-secondary" />
                        </div>

                        {/* Otomatisasi Alokasi Murid (Round-Robin & Modulo) */}
                        {(() => {
                          const progName = selectedCls.program?.name || "";
                          const isCollab = progName.toLowerCase().includes("web") || progName.toLowerCase().includes("mobile");
                          if (!isCollab) return null;
                          return (
                            <div className="border border-brand-purple/30 bg-brand-purple/5 rounded-xl p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Sliders className="w-4 h-4 text-brand-purple" />
                                  <h4 className="font-heading font-bold text-sm text-foreground">
                                    Distribusi Alokasi Murid (Round-Robin & Modulo)
                                  </h4>
                                </div>
                                {!isReadOnly && (
                                  <Button
                                    onClick={() => handleDistributeModulo(progName)}
                                    disabled={isDistributing}
                                    size="sm"
                                    className="bg-brand-purple hover:bg-brand-purple-hover text-white text-xs h-8"
                                  >
                                    {isDistributing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
                                    Jalankan Distribusi
                                  </Button>
                                )}
                              </div>
                              <p className="text-2xs text-muted-foreground leading-relaxed">
                                Sesuai Bab 5 & Bab 9 Source of Truth: Sistem akan membagi siswa secara merata ke Primary Mentor. Sisa pembagian (Modulo remainder) akan dialokasikan secara otomatis ke Supporting/Secondary Mentor (UI/UX & Professional).
                              </p>
                              {distributeMessage && (
                                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-medium flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                                  <span>{distributeMessage}</span>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Materials Section */}
                        <div className="space-y-3">
                          <h4 className="font-heading font-bold text-sm text-foreground flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-brand-purple" />
                              Materi Pembelajaran Terdaftar ({selectedCls.materials?.length || 0})
                            </span>
                            {!isReadOnly && (
                              <Button
                                onClick={() => setIsAddMaterialModalOpen(true)}
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs flex items-center gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Tambah Materi
                              </Button>
                            )}
                          </h4>
                          <div className="grid gap-2">
                            {selectedCls.materials && selectedCls.materials.length > 0 ? (
                              selectedCls.materials.map((mat: any, idx: number) => (
                                <div key={mat.id || idx} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-brand-purple/10 flex items-center justify-center text-brand-purple font-bold text-xs">
                                      #{idx + 1}
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-foreground">{mat.title}</p>
                                      <p className="text-[11px] text-muted-foreground">{mat.competency || "Kompetensi Umum"} • Tipe: {mat.type?.toUpperCase()}</p>
                                    </div>
                                  </div>
                                  <Link
                                    href={`/dashboard/class/${selectedCls.id}/material/${mat.id}`}
                                    target="_blank"
                                    className="text-xs font-medium text-brand-purple flex items-center gap-1 bg-card px-2.5 py-1 rounded border border-border shadow-2xs hover:bg-brand-purple/5 transition-colors"
                                  >
                                    Lihat Modul
                                  </Link>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                                Belum ada materi pembelajaran untuk kelas ini.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Assignments Section */}
                        <div className="space-y-3 pt-2">
                          <h4 className="font-heading font-bold text-sm text-foreground flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-emerald-600" />
                              Tugas & Praktik ({selectedCls.assignments?.length || 0})
                            </span>
                            {!isReadOnly && (
                              <Button
                                onClick={() => setIsAddAssignmentModalOpen(true)}
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs flex items-center gap-1.5 border-emerald-200 hover:bg-emerald-50 text-emerald-700"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Tambah Tugas
                              </Button>
                            )}
                          </h4>
                          <div className="grid gap-2">
                            {selectedCls.assignments && selectedCls.assignments.length > 0 ? (
                              selectedCls.assignments.map((ass: any, idx: number) => (
                                <div key={ass.id || idx} className="flex items-center justify-between p-3 rounded-lg border border-border bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-xs">
                                      T{idx + 1}
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-foreground">{ass.title}</p>
                                      <p className="text-[11px] text-muted-foreground">Batas Waktu: {ass.dueDate ? new Date(ass.dueDate).toLocaleDateString("id-ID") : "7 Hari"}</p>
                                    </div>
                                  </div>
                                  <span className="text-xs font-medium text-emerald-600 bg-white dark:bg-card px-2.5 py-1 rounded border border-border shadow-2xs">
                                    Periksa Nilai
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                                Belum ada tugas praktik untuk kelas ini.
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── TAB 2: SISWA BINAAN ── */}
        <TabsContent value="students" className="space-y-6">
          <Card className="border-border bg-card shadow-sm">
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
                        const isGmail = student.email && student.email.toLowerCase().endsWith("@gmail.com");
                        return (
                          <tr key={student.id || idx} className="hover:bg-secondary/20 transition-colors">
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
                              {isGmail ? (
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200 gap-1 text-[10px]">
                                  <UserCheck className="w-3 h-3" />
                                  Gmail Aktif
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-300 gap-1 text-[10px]">
                                  <AlertCircle className="w-3 h-3" />
                                  Non-Gmail
                                </Badge>
                              )}
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
                                {!isReadOnly && (
                                  <button
                                    onClick={() => alert("Sesuai aturan keselamatan (Safety Rule): Penghapusan permanen dilarang. Fitur ini akan menonaktifkan sementara (Suspend) akses murid.")}
                                    className="px-2 py-1 rounded border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-amber-600 text-[11px] font-medium transition-colors"
                                  >
                                    Suspend / Handover
                                  </button>
                                )}
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
        </TabsContent>

        {/* ── TAB 3: PENGATURAN AKUN ── */}
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
                {profileSaveSuccess && (
                  <Alert className="border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400">
                    <AlertDescription className="text-xs font-medium">{profileSaveSuccess}</AlertDescription>
                  </Alert>
                )}
                {profileSaveError && (
                  <Alert className="border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400">
                    <AlertDescription className="text-xs font-medium">{profileSaveError}</AlertDescription>
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
                        onChange={handleProfileFileChange}
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
                        onChange={handleProfileFileChange}
                        className="block w-full text-xs text-muted-foreground file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-purple/10 file:text-brand-purple hover:file:bg-brand-purple/20 cursor-pointer"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">Mendukung format PNG, JPG, JPEG. Maksimal 2MB.</p>
                    </div>

                    {/* Choose from Default Avatars */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pilih dari Avatar Default:</label>
                      <div className="flex gap-2">
                        {defaultAvatars.map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setMyAvatarUrl(url)}
                            className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-105 hover:shadow-xs ${
                              myAvatarUrl === url ? "border-brand-purple scale-105 shadow-sm" : "border-transparent"
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
                      value={myName}
                      onChange={(e) => setMyName(e.target.value)}
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
                      value={myWhatsapp}
                      onChange={(e) => setMyWhatsapp(e.target.value)}
                      placeholder="Contoh: 08123456789"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <School className="w-3.5 h-3.5 text-brand-purple" />
                      Asal Institusi / Kampus
                    </label>
                    <Input
                      value={myInstitution}
                      onChange={(e) => setMyInstitution(e.target.value)}
                      placeholder="Contoh: Universitas Indonesia"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-brand-purple" />
                      Program Studi
                    </label>
                    <Input
                      value={myStudyProgram}
                      onChange={(e) => setMyStudyProgram(e.target.value)}
                      placeholder="Contoh: Teknik Informatika"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                  <Button
                    type="submit"
                    disabled={isSavingProfile}
                    className="bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold h-10 px-6 flex items-center gap-1.5"
                  >
                    {isSavingProfile ? (
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

        {hasPastClasses && (
          <TabsContent value="past-batches" className="space-y-6 outline-hidden">
            <div className="space-y-4 font-sans">
              <h2 className="font-heading font-bold text-lg flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-brand-purple" />
                Riwayat Angkatan / Batch Lama Anda
              </h2>
              <p className="text-xs text-muted-foreground">
                Berikut adalah daftar kelas ajar bimbingan Anda di angkatan sebelumnya. Anda tetap dapat mengakses arsip kelas, siswa, materi, dan tugas ini dalam mode baca (Read-Only).
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
                        <p className="text-2xs text-white/85 mt-1">Total Murid: {cls.enrolledStudentsCount || 0} Siswa</p>
                      </div>
                      <CardContent className="py-4 flex justify-between items-center text-xs">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                          Ruang kelas diarsipkan
                        </span>
                        <span className="text-brand-purple font-semibold hover:underline flex items-center gap-1">
                          Buka Arsip Kelas
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
      {/* Add Competency Modal */}
      {isAddCompetencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card p-6 rounded-xl border border-border shadow-xl w-[400px]">
            <h3 className="font-heading font-bold text-lg mb-4">Tambah Kompetensi Baru</h3>
            <form onSubmit={handleCreateCompetency} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Kompetensi</label>
                <Input name="name" required placeholder="Contoh: Intro to React" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kategori (Pilih salah satu)</label>
                <select name="category" required className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="Technical Skill">Technical Skill</option>
                  <option value="Soft Skills (CCA)">Soft Skills (CCA)</option>
                  <option value="Capstone Project">Capstone Project</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddCompetencyModalOpen(false)}>Batal</Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Material Modal */}
      {isAddMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card p-6 rounded-xl border border-border shadow-xl w-[500px]">
            <h3 className="font-heading font-bold text-lg mb-4">Tambah Materi Baru</h3>
            <form onSubmit={handleCreateMaterial} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul Materi</label>
                <Input name="title" required placeholder="Contoh: Fundamental State Management" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipe Materi</label>
                <select
                  name="type"
                  required
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value)}
                >
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="link">Tautan Luar</option>
                  <option value="custom">Custom Editor (HTML Embed)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center justify-between">
                  Kompetensi Terkait
                  <button type="button" onClick={() => { setIsAddMaterialModalOpen(false); setIsAddCompetencyModalOpen(true); }} className="text-xs text-brand-purple hover:underline">+ Buat Baru</button>
                </label>
                <select name="competency" required className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="">Pilih Kompetensi...</option>
                  {competencies.map((c) => (
                    <option key={c.id} value={c.name}>{c.name} ({c.category})</option>
                  ))}
                </select>
              </div>
              {materialType === "custom" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Kode HTML Embed (Canva, YouTube, dll)</label>
                    <textarea name="content" required className="w-full p-3 rounded-md border border-input bg-background text-sm font-mono" rows={4} placeholder="<iframe src='...' />"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Keterangan / Caption (Opsional)</label>
                    <textarea name="caption" className="w-full p-3 rounded-md border border-input bg-background text-sm" rows={2} placeholder="Tuliskan instruksi atau keterangan tambahan di sini..."></textarea>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">URL / Link Materi</label>
                  <Input name="url" type="url" required placeholder="https://..." />
                </div>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddMaterialModalOpen(false)}>Batal</Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Assignment Modal */}
      {isAddAssignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card p-6 rounded-xl border border-border shadow-xl w-[500px]">
            <h3 className="font-heading font-bold text-lg mb-4">Tambah Tugas Baru</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul Tugas</label>
                <Input name="title" required placeholder="Contoh: Proyek Akhir React" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center justify-between">
                  Kompetensi Terkait
                  <button type="button" onClick={() => { setIsAddAssignmentModalOpen(false); setIsAddCompetencyModalOpen(true); }} className="text-xs text-brand-purple hover:underline">+ Buat Baru</button>
                </label>
                <select name="competency" required className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="">Pilih Kompetensi...</option>
                  {competencies.map((c) => (
                    <option key={c.id} value={c.name}>{c.name} ({c.category})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center justify-between">
                  Tipe Pengumpulan
                  <span className="text-[10px] text-muted-foreground font-normal bg-secondary px-2 py-0.5 rounded-full">Format Wajib</span>
                </label>
                <select name="submissionType" required className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="github">Link GitHub (Tugas Kode & Automasi)</option>
                  <option value="figma">Link Figma (Tugas UI/UX)</option>
                  <option value="drive">Link Google Drive (Gambar/Lainnya)</option>
                  <option value="any">Link Bebas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi & Instruksi</label>
                <textarea name="description" required className="w-full p-3 rounded-md border border-input bg-background text-sm" rows={4} placeholder="Jelaskan detail instruksi tugas..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tenggat Waktu (Due Date)</label>
                <Input name="dueDate" type="datetime-local" required />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddAssignmentModalOpen(false)}>Batal</Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
