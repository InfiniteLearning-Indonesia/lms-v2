"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MentorLogbook } from "./mentor-logbook";

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
  FileSpreadsheet,
  ChevronRight,
  Pencil,
  Trash2,
  User,
  Phone,
  School,
  GraduationCap,
  Upload,
  Save,
  Settings,
  Notebook
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

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

  // Suspend Dialog States
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [selectedStudentForSuspend, setSelectedStudentForSuspend] = useState<any | null>(null);
  const [isSuspending, setIsSuspending] = useState(false);
  const [suspendError, setSuspendError] = useState<string | null>(null);
  const [suspendActionType, setSuspendActionType] = useState<"suspend" | "unsuspend">("suspend");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuspendDialogOpen && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSuspendDialogOpen, countdown]);

  const searchParams = useSearchParams();

  // Listen to tab query parameter dynamically
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "settings") {
      setActiveTab("settings");
    } else if (!tab && activeTab === "settings") {
      setActiveTab("classes");
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

    if (!file.type.startsWith("image/")) {
      setProfileSaveError("Format file tidak didukung. Harap pilih gambar (PNG, JPG, JPEG, WEBP, dll).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileSaveError("Ukuran file foto maksimal 5MB.");
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

  const [weightUpdates, setWeightUpdates] = useState<Record<string, number>>({});
  const [isSavingWeights, setIsSavingWeights] = useState(false);

  const handleWeightChange = (assignmentId: string, val: string) => {
    setWeightUpdates(prev => ({
      ...prev,
      [assignmentId]: parseFloat(val) || 0
    }));
  };

  const handleSaveWeights = async () => {
    const updates = Object.keys(weightUpdates).map(id => ({
      id,
      weight: weightUpdates[id]
    }));
    if (updates.length === 0) return;

    setIsSavingWeights(true);
    try {
      const res = await fetch("http://localhost:7000/classes/assignments/weights", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ updates })
      });
      if (res.ok) {
        alert("Bobot berhasil disimpan!");
        setWeightUpdates({});
        fetchMentorData();
      } else {
        alert("Gagal menyimpan bobot.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setIsSavingWeights(false);
    }
  };

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
  }, []);

  useEffect(() => {
    if (classes.length > 0 && classes[0]?.program?.id) {
      fetchCompetencies(classes[0].program.id);
    }
  }, [classes]);

  const fetchCompetencies = async (programId: string) => {
    try {
      const res = await fetch(`http://localhost:7000/classes/competencies?programId=${programId}`, {
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
          phase: formData.get("phase"),
          programId: classes[0]?.program?.id,
        }),
        credentials: "include",
      });
      if (res.ok) {
        setIsAddCompetencyModalOpen(false);
        if (classes[0]?.program?.id) fetchCompetencies(classes[0].program.id);
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [editingCompetency, setEditingCompetency] = useState<any>(null);
  const [editingWeightCompetency, setEditingWeightCompetency] = useState<any>(null);

  const calculateCompetencyScore = (studentId: string, compId: string) => {
    let score = 0;
    const compAssignments = classes.flatMap((cls: any) =>
      (cls.assignments || []).filter((a: any) => a.competency === compId)
    );

    for (const assignment of compAssignments) {
      const weight = weightUpdates[assignment.id] !== undefined ? weightUpdates[assignment.id] : (assignment.weight || 0.1);
      const submission = (assignment.submissions || []).find((s: any) => s.studentId === studentId);
      if (submission && submission.score) {
        score += submission.score * weight;
      }
    }
    return score;
  };

  const handleUpdateCompetency = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCompetency) return;
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch(`http://localhost:7000/classes/competencies/${editingCompetency.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          category: formData.get("category"),
          phase: formData.get("phase"),
        }),
        credentials: "include",
      });
      if (res.ok) {
        setEditingCompetency(null);
        if (classes[0]?.program?.id) fetchCompetencies(classes[0].program.id);
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCompetency = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kompetensi ini?")) return;
    try {
      const res = await fetch(`http://localhost:7000/classes/competencies/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        if (classes[0]?.program?.id) fetchCompetencies(classes[0].program.id);
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

  const handleSuspendStudent = async () => {
    if (!selectedStudentForSuspend) return;
    setIsSuspending(true);
    setSuspendError(null);
    const endpoint = suspendActionType === "suspend" ? "suspend" : "unsuspend";
    try {
      const res = await fetch(`http://localhost:7000/users/${selectedStudentForSuspend.id}/${endpoint}`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        setIsSuspendDialogOpen(false);
        setSelectedStudentForSuspend(null);
        fetchMentorData();
      } else {
        const errData = await res.json();
        setSuspendError(errData.message || `Gagal ${suspendActionType === "suspend" ? "menangguhkan" : "mengaktifkan"} siswa.`);
      }
    } catch (err) {
      console.error(err);
      setSuspendError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSuspending(false);
    }
  };

  // Find the most recent active batch
  const activeBatches = classes
    .map(c => c.batch)
    .filter(b => b?.status === "active")
    .sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());

  const currentBatch = activeBatches[0];
  const activeClasses = classes.filter((cls) => cls.batchId === currentBatch?.id);
  const pastClasses = classes.filter((cls) => cls.batchId !== currentBatch?.id);
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
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-secondary/60 p-1.5 rounded-xl border border-border/60 flex flex-wrap min-h-14 w-full gap-1.5 justify-start md:justify-center">
          <TabsTrigger value="classes" className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2">
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Kelas & Silabus</span>
          </TabsTrigger>

          <TabsTrigger value="students" className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2">
            <Users className="w-4 h-4 shrink-0" />
            <span>Siswa ({allStudents.length})</span>
          </TabsTrigger>
          <TabsTrigger value="logbook" className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2">
            <Notebook className="w-4 h-4 shrink-0" />
            <span>Logbook Student</span>
          </TabsTrigger>
          <TabsTrigger value="rubric" className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2">
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>Rubrik Penilaian</span>
          </TabsTrigger>
          <TabsTrigger value="assessment" className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2">
            <Pencil className="w-4 h-4 shrink-0" />
            <span>Assessment</span>
          </TabsTrigger>
          {hasPastClasses && (
            <TabsTrigger value="past-batches" className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2">
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Batch Lama</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="settings" className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2">
            <Settings className="w-4 h-4 shrink-0" />
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
                      Spesialisasi Anda: <strong>{profile.specialization || "Belum Ditentukan"}</strong>.<br />
                      Program yang di-assign: <strong>{profile.selectedProgram}</strong>.<br /><br />
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
                        {cls.batch?.startDate && cls.batch?.endDate && (
                          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground bg-secondary/50 w-fit px-2 py-1 rounded-md border border-border">
                            <Calendar className="w-3 h-3" />
                            <span className="font-semibold">{new Date(cls.batch.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} - {new Date(cls.batch.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                          </div>
                        )}
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
                              {selectedCls.batch?.startDate && selectedCls.batch?.endDate && (
                                <span className="block mt-1 font-medium text-brand-purple flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  Durasi: {new Date(selectedCls.batch.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} - {new Date(selectedCls.batch.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                </span>
                              )}
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
                                  <div className="flex items-center gap-2">
                                    <Link href={`/dashboard/class/${selectedCls.id}/assignment/${ass.id}`}>
                                      <span className="text-[11px] font-medium text-emerald-600 bg-white dark:bg-card hover:bg-emerald-50 px-2.5 py-1.5 rounded-md border border-border shadow-sm transition-colors cursor-pointer flex items-center gap-1.5">
                                        Lihat Detail / Periksa Nilai <ChevronRight className="w-3 h-3" />
                                      </span>
                                    </Link>
                                  </div>
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
                              <div className="flex flex-wrap items-center justify-center gap-1">
                                {student.status === "suspended" ? (
                                  <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200 gap-1 text-[10px]">
                                    <AlertCircle className="w-3 h-3" />
                                    Suspended
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200 gap-1 text-[10px]">
                                    <UserCheck className="w-3 h-3" />
                                    Aktif
                                  </Badge>
                                )}
                                {isGmail ? (
                                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200 text-[10px] leading-none py-0.5">
                                    Gmail
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-300 text-[10px] leading-none py-0.5">
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
                                {!isReadOnly && (
                                  student.status === "suspended" ? (
                                    <button
                                      onClick={() => {
                                        setSelectedStudentForSuspend(student);
                                        setSuspendError(null);
                                        setSuspendActionType("unsuspend");
                                        setCountdown(5);
                                        setIsSuspendDialogOpen(true);
                                      }}
                                      className="px-2 py-1 rounded border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-emerald-600 text-[11px] font-medium transition-colors"
                                    >
                                      Aktifkan Kembali
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setSelectedStudentForSuspend(student);
                                        setSuspendError(null);
                                        setSuspendActionType("suspend");
                                        setCountdown(5);
                                        setIsSuspendDialogOpen(true);
                                      }}
                                      className="px-2 py-1 rounded border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-amber-600 text-[11px] font-medium transition-colors"
                                    >
                                      Suspend
                                    </button>
                                  )
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
                            onClick={() => setMyAvatarUrl(url)}
                            className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-105 hover:shadow-xs ${myAvatarUrl === url ? "border-brand-purple scale-105 shadow-sm" : "border-transparent"
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
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </TabsContent>
        )}

        {/* ── TAB 3: RUBRIK PENILAIAN ── */}
        <TabsContent value="rubric" className="space-y-6">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-heading font-bold text-foreground">
                  Manajemen Rubrik Kompetensi
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Atur patokan nilai dan kriteria evaluasi (rubrik) untuk masing-masing kompetensi secara global.
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsAddCompetencyModalOpen(true)}
                size="sm"
                variant="outline"
                className="h-8 text-xs flex items-center gap-1.5 border-brand-purple/20 hover:bg-brand-purple/5 text-brand-purple"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Kompetensi
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="py-3 px-4">Nama Kompetensi</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {competencies.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-muted-foreground">
                          Belum ada kompetensi.
                        </td>
                      </tr>
                    ) : (
                      competencies.map((comp: any) => (
                        <tr key={comp.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-foreground">
                            {comp.name}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
                              {comp.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/dashboard/competency/${comp.id}/rubric`}>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-purple hover:bg-brand-purple/90 text-white font-medium text-[11px] transition-colors shadow-sm cursor-pointer">
                                  <FileSpreadsheet className="w-3.5 h-3.5" /> Atur Rubrik
                                </span>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => setEditingCompetency(comp)}
                              >
                                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0 border-red-500/20 hover:bg-red-50"
                                onClick={() => handleDeleteCompetency(comp.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* ── TAB 4: ASSESSMENT (GRADEBOOK) ── */}
        <TabsContent value="assessment" className="space-y-6">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-heading font-bold text-foreground">
                  Assessment (Gradebook)
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Pantau nilai akhir mentee berdasarkan pencapaian kompetensi. Klik nama kompetensi untuk mengatur bobot tugas.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="Micro" className="w-full">
                <TabsList className="grid w-full max-w-sm grid-cols-2 mb-6">
                  <TabsTrigger value="Micro">Phase Micro</TabsTrigger>
                  <TabsTrigger value="Massive">Phase Massive</TabsTrigger>
                </TabsList>

                {["Micro", "Massive"].map((phase) => {
                  const microComps = competencies.filter(c => c.phase === "Micro" || (!c.phase && "Micro" === "Micro"));
                  const massiveComps = competencies.filter(c => c.phase === "Massive");
                  const displayComps = phase === "Micro" ? microComps : massiveComps;

                  return (
                    <TabsContent key={phase} value={phase} className="space-y-6">
                      <div className="overflow-x-auto border border-border rounded-xl">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                          <thead className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <tr>
                              <th className="px-4 py-3 sticky left-0 z-10 bg-muted/95 backdrop-blur shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#262626]">Mentee</th>
                              {phase === "Massive" && (
                                <th className="px-4 py-3 bg-brand-purple/10 text-brand-purple border-x border-border text-center">Akumulasi Micro</th>
                              )}
                              {displayComps.map(comp => (
                                <th
                                  key={comp.id}
                                  className="px-4 py-3 cursor-pointer hover:text-brand-purple hover:underline transition-colors text-center border-l border-border"
                                  onClick={() => setEditingWeightCompetency(comp)}
                                  title="Klik untuk mengatur bobot tugas di kompetensi ini"
                                >
                                  {comp.name}
                                  <Pencil className="w-3 h-3 inline-block ml-1 opacity-50" />
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {allStudents.length === 0 ? (
                              <tr>
                                <td colSpan={displayComps.length + (phase === "Massive" ? 2 : 1)} className="px-4 py-8 text-center text-muted-foreground">
                                  Belum ada mentee yang terdaftar.
                                </td>
                              </tr>
                            ) : (
                              allStudents.map((student) => {
                                const microTotal = microComps.reduce((acc, comp) => acc + calculateCompetencyScore(student.id, comp.id), 0);
                                return (
                                  <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 sticky left-0 z-10 bg-card shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#262626]">
                                      <div className="font-semibold text-foreground text-xs">{student.name}</div>
                                      <div className="text-[10px] text-muted-foreground">{student.email}</div>
                                    </td>

                                    {phase === "Massive" && (
                                      <td className="px-4 py-3 text-center border-x border-border font-bold text-brand-purple bg-brand-purple/5">
                                        {microTotal.toFixed(1)}
                                      </td>
                                    )}

                                    {displayComps.map(comp => {
                                      const score = calculateCompetencyScore(student.id, comp.id);
                                      return (
                                        <td key={comp.id} className="px-4 py-3 text-center border-l border-border text-xs font-medium">
                                          {score > 0 ? score.toFixed(1) : "-"}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB LOGBOOK ── */}
        <TabsContent value="logbook" className="space-y-6 outline-hidden">
          {activeClasses.length > 0 ? (
            <MentorLogbook batchId={activeClasses[0].batchId} />
          ) : (
            <Alert className="border-amber-500/50 bg-amber-500/10 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <AlertTitle>Tidak dapat mengakses logbook</AlertTitle>
              <AlertDescription>Anda belum terdaftar di kelas/angkatan aktif mana pun pada batch saat ini.</AlertDescription>
            </Alert>
          )}
        </TabsContent>
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
              <div>
                <label className="block text-sm font-medium mb-1">Fase</label>
                <select name="phase" required className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="Micro">Micro</option>
                  <option value="Massive">Massive</option>
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

      {/* Edit Competency Modal */}
      {editingCompetency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card p-6 rounded-xl border border-border shadow-xl w-[400px]">
            <h3 className="font-heading font-bold text-lg mb-4">Edit Kompetensi</h3>
            <form onSubmit={handleUpdateCompetency} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Kompetensi</label>
                <Input name="name" required defaultValue={editingCompetency.name} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <select name="category" required defaultValue={editingCompetency.category} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="Technical Skill">Technical Skill</option>
                  <option value="Soft Skills (CCA)">Soft Skills (CCA)</option>
                  <option value="Capstone Project">Capstone Project</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fase</label>
                <select name="phase" required defaultValue={editingCompetency.phase || 'Micro'} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="Micro">Micro</option>
                  <option value="Massive">Massive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setEditingCompetency(null)}>Batal</Button>
                <Button type="submit">Simpan Perubahan</Button>
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

      {/* Edit Weight Modal */}
      {editingWeightCompetency && (() => {
        const compAssignments = classes.flatMap((cls: any) => (cls.assignments || []).filter((a: any) => a.competency === editingWeightCompetency.id));
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card p-6 rounded-xl border border-border shadow-xl w-[600px] max-w-[90vw]">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-heading font-bold text-lg">Pengaturan Bobot: {editingWeightCompetency.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Atur bobot tugas untuk kompetensi ini.</p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={() => setEditingWeightCompetency(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto mb-6 pr-2">
                {compAssignments.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground bg-muted/20 rounded-lg">Tidak ada tugas di bawah kompetensi ini.</div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-2 font-medium">Judul Tugas</th>
                        <th className="px-4 py-2 font-medium">Kelas</th>
                        <th className="px-4 py-2 font-medium text-right w-48">Bobot (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {compAssignments.map((assignment: any) => {
                        const currentVal = weightUpdates[assignment.id] !== undefined ? weightUpdates[assignment.id] : assignment.weight || 0.1;
                        const cls = classes.find((c: any) => c.id === assignment.classId);
                        return (
                          <tr key={assignment.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-semibold text-foreground text-xs">{assignment.title}</span>
                              <div className="text-[10px] text-muted-foreground mt-0.5 max-w-[200px] truncate">{assignment.description}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] text-muted-foreground">{cls?.name}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="1"
                                  className="w-16 text-right h-7 text-xs font-medium border-border focus-visible:border-brand-purple"
                                  value={currentVal}
                                  onChange={(e) => handleWeightChange(assignment.id, e.target.value)}
                                />
                                <span className="text-muted-foreground text-[10px] font-medium w-8 text-left">
                                  ({(currentVal * 100).toFixed(0)}%)
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setEditingWeightCompetency(null)}>Tutup</Button>
                <Button
                  onClick={() => { handleSaveWeights(); setEditingWeightCompetency(null); }}
                  disabled={isSavingWeights || Object.keys(weightUpdates).length === 0}
                  className="bg-brand-purple hover:bg-brand-purple-hover text-white"
                >
                  {isSavingWeights ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Simpan Perubahan Bobot
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 font-heading font-bold text-base ${suspendActionType === "suspend" ? "text-amber-600" : "text-emerald-600"}`}>
              <ShieldAlert className="w-5 h-5" />
              {suspendActionType === "suspend" ? "Tangguhkan Akses Murid" : "Aktifkan Kembali Akses Murid"}
            </DialogTitle>
            <DialogDescription className="text-xs pt-1.5 leading-relaxed text-muted-foreground font-sans">
              {suspendActionType === "suspend"
                ? "Apakah Anda yakin ingin menangguhkan sementara (Suspend) akses masuk murid ini ke LMS?"
                : "Apakah Anda yakin ingin memulihkan/mengaktifkan kembali akses masuk murid ini ke LMS?"}
            </DialogDescription>
          </DialogHeader>

          {selectedStudentForSuspend && (
            <div className="bg-secondary/40 border border-border rounded-lg p-3.5 space-y-1.5 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nama Murid:</span>
                <span className="font-semibold text-foreground">{selectedStudentForSuspend.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-mono text-muted-foreground">{selectedStudentForSuspend.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Program Studi:</span>
                <span className="font-medium text-brand-purple">{selectedStudentForSuspend.selectedProgram || "Web Development"}</span>
              </div>
            </div>
          )}

          {suspendError && (
            <Alert variant="destructive" className="py-2.5 px-3">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-2xs font-medium">{suspendError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-0 font-sans border-t border-border/40 pt-3">
            <DialogClose render={<Button variant="outline" size="sm" className="text-xs font-semibold">Batal</Button>} />
            <Button
              variant={suspendActionType === "suspend" ? "destructive" : "default"}
              size="sm"
              disabled={isSuspending || countdown > 0}
              onClick={handleSuspendStudent}
              className={`text-xs font-semibold gap-1.5 ${suspendActionType === "unsuspend" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}
            >
              {isSuspending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Memproses...
                </>
              ) : (
                `${suspendActionType === "suspend" ? "Ya, Suspend Akses" : "Ya, Aktifkan Akses"}${countdown > 0 ? ` (${countdown}s)` : ""}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Edit Weight Modal */}
      {editingWeightCompetency && (() => {
        const compAssignments = classes.flatMap((cls: any) => (cls.assignments || []).filter((a: any) => a.competency === editingWeightCompetency.id));
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card p-6 rounded-xl border border-border shadow-xl w-[600px] max-w-[90vw]">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-heading font-bold text-lg">Pengaturan Bobot: {editingWeightCompetency.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Atur bobot tugas untuk kompetensi ini.</p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={() => setEditingWeightCompetency(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto mb-6 pr-2">
                {compAssignments.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground bg-muted/20 rounded-lg">Tidak ada tugas di bawah kompetensi ini.</div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-2 font-medium">Judul Tugas</th>
                        <th className="px-4 py-2 font-medium">Kelas</th>
                        <th className="px-4 py-2 font-medium text-right w-48">Bobot (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {compAssignments.map((assignment: any) => {
                        const currentVal = weightUpdates[assignment.id] !== undefined ? weightUpdates[assignment.id] : assignment.weight || 0.1;
                        const cls = classes.find((c: any) => c.id === assignment.classId);
                        return (
                          <tr key={assignment.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-semibold text-foreground text-xs">{assignment.title}</span>
                              <div className="text-[10px] text-muted-foreground mt-0.5 max-w-[200px] truncate">{assignment.description}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] text-muted-foreground">{cls?.name}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="1"
                                  className="w-16 text-right h-7 text-xs font-medium border-border focus-visible:border-brand-purple"
                                  value={currentVal}
                                  onChange={(e) => handleWeightChange(assignment.id, e.target.value)}
                                />
                                <span className="text-muted-foreground text-[10px] font-medium w-8 text-left">
                                  ({(currentVal * 100).toFixed(0)}%)
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setEditingWeightCompetency(null)}>Tutup</Button>
                <Button
                  onClick={() => { handleSaveWeights(); setEditingWeightCompetency(null); }}
                  disabled={isSavingWeights || Object.keys(weightUpdates).length === 0}
                  className="bg-brand-purple hover:bg-brand-purple-hover text-white"
                >
                  {isSavingWeights ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Simpan Perubahan Bobot
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 font-heading font-bold text-base ${suspendActionType === "suspend" ? "text-amber-600" : "text-emerald-600"}`}>
              <ShieldAlert className="w-5 h-5" />
              {suspendActionType === "suspend" ? "Tangguhkan Akses Murid" : "Aktifkan Kembali Akses Murid"}
            </DialogTitle>
            <DialogDescription className="text-xs pt-1.5 leading-relaxed text-muted-foreground font-sans">
              {suspendActionType === "suspend"
                ? "Apakah Anda yakin ingin menangguhkan sementara (Suspend) akses masuk murid ini ke LMS?"
                : "Apakah Anda yakin ingin memulihkan/mengaktifkan kembali akses masuk murid ini ke LMS?"}
            </DialogDescription>
          </DialogHeader>

          {selectedStudentForSuspend && (
            <div className="bg-secondary/40 border border-border rounded-lg p-3.5 space-y-1.5 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nama Murid:</span>
                <span className="font-semibold text-foreground">{selectedStudentForSuspend.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-mono text-muted-foreground">{selectedStudentForSuspend.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Program Studi:</span>
                <span className="font-medium text-brand-purple">{selectedStudentForSuspend.selectedProgram || "Web Development"}</span>
              </div>
            </div>
          )}

          {suspendError && (
            <Alert variant="destructive" className="py-2.5 px-3">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-2xs font-medium">{suspendError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-0 font-sans border-t border-border/40 pt-3">
            <DialogClose render={<Button variant="outline" size="sm" className="text-xs font-semibold">Batal</Button>} />
            <Button
              variant={suspendActionType === "suspend" ? "destructive" : "default"}
              size="sm"
              disabled={isSuspending || countdown > 0}
              onClick={handleSuspendStudent}
              className={`text-xs font-semibold gap-1.5 ${suspendActionType === "unsuspend" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}
            >
              {isSuspending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Memproses...
                </>
              ) : (
                `${suspendActionType === "suspend" ? "Ya, Suspend Akses" : "Ya, Aktifkan Akses"}${countdown > 0 ? ` (${countdown}s)` : ""}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  );
}
