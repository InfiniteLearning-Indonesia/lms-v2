"use client";

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
    name: string;
    email: string;
    role: string;
    specialization?: string | null;
    selectedProgram?: string | null;
  };
}

export function MentorDashboard({ profile }: MentorDashboardProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("classes");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollCase, setEnrollCase] = useState<"case1" | "case2">("case2");
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [isSubmittingEnroll, setIsSubmittingEnroll] = useState(false);
  const [distributeMessage, setDistributeMessage] = useState<string | null>(null);
  const [isDistributing, setIsDistributing] = useState(false);

  const openEnrollModal = async () => {
    setIsEnrollModalOpen(true);
    try {
      const res = await fetch("http://localhost:7000/classes/programs-list", {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const d = await res.json();
        setAvailableStudents(d.noProgramStudents || []);
      }
    } catch (err) {
      console.error("Gagal memuat siswa tanpa program:", err);
    }
  };

  const handleMentorEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    setIsSubmittingEnroll(true);
    const targetProgramName = classes[0]?.program?.name || profile?.selectedProgram || "Web Development";
    try {
      const res = await fetch("http://localhost:7000/classes/program-enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          programName: targetProgramName,
          mentorId: profile?.email ? undefined : undefined,
        }),
        credentials: "include",
      });
      if (res.ok) {
        setIsEnrollModalOpen(false);
        fetchMentorData();
      }
    } catch (err) {
      console.error("Gagal daftarkan siswa:", err);
    } finally {
      setIsSubmittingEnroll(false);
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
        if (dataClasses.length > 0) {
          setSelectedClassId(dataClasses[0].id);
        }
      }
    } catch (err) {
      console.error("Gagal memuat data mentor, menggunakan fallback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const totalClasses = classes.length;
  const totalStudents = classes.reduce((acc, cls) => acc + (cls.enrolledStudentsCount || 0), 0);
  const allStudents = classes.flatMap((cls) => cls.enrolledStudents || []);
  const totalMaterials = classes.reduce((acc, cls) => acc + (cls.materials?.length || 0), 0);
  const totalAssignments = classes.reduce((acc, cls) => acc + (cls.assignments?.length || 0), 0);

  // Filter students based on search query
  const filteredStudents = allStudents.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      (student.name && student.name.toLowerCase().includes(query)) ||
      (student.email && student.email.toLowerCase().includes(query)) ||
      (student.selectedProgram && student.selectedProgram.toLowerCase().includes(query))
    );
  });

  const isReadOnly = classes.some((c) => c.batch?.status === "completed");

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
            <h4 className="font-heading font-bold text-sm">Mode Read-Only Aktif (Rule 21 & 23)</h4>
            <p className="text-xs mt-0.5">
              Batch akademik ini telah selesai. Seluruh data kelas, materi, tugas, dan nilai siswa dikunci menjadi arsip historis. Modifikasi data ditiadakan.
            </p>
          </div>
        </div>
      )}

      {/* ── Main Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-secondary/60 p-1 rounded-xl border border-border/60 grid grid-cols-2 max-w-md">
          <TabsTrigger value="classes" className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Kelas & Silabus</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Siswa Binaan ({allStudents.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: KELAS & SILABUS ── */}
        <TabsContent value="classes" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Class List */}
            <div className="md:col-span-1 space-y-4">
              <h2 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-brand-purple" />
                Daftar Kelas Ajar
              </h2>
              <div className="space-y-3">
                {classes.map((cls) => {
                  const isSelected = cls.id === selectedClassId;
                  return (
                    <div
                      key={cls.id}
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        isSelected
                          ? "bg-brand-purple/10 border-brand-purple shadow-sm"
                          : "bg-card border-border hover:border-border/80 hover:bg-secondary/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                          {cls.batch?.name || "Batch 7"}
                        </span>
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-200">
                          Aktif
                        </Badge>
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
                const selectedCls = classes.find((c) => c.id === selectedClassId) || classes[0];
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
                        <h4 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                          <FileText className="w-4 h-4 text-brand-purple" />
                          Materi Pembelajaran Terdaftar ({selectedCls.materials?.length || 0})
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
                                <span className="text-xs font-medium text-brand-purple flex items-center gap-1 bg-card px-2.5 py-1 rounded border border-border shadow-2xs">
                                  Lihat Modul
                                </span>
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
                        <h4 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                          <Award className="w-4 h-4 text-emerald-600" />
                          Tugas & Praktik ({selectedCls.assignments?.length || 0})
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
                  {!isReadOnly && (
                    <Button
                      onClick={openEnrollModal}
                      className="bg-brand-purple hover:bg-brand-purple-hover text-white text-xs h-9 px-3 shrink-0 flex items-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" />
                      Daftarkan Murid
                    </Button>
                  )}
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
      </Tabs>
      {/* ──────── MODAL STUDENT ENROLLMENT (CASE 1 & CASE 2) ──────── */}
      <AnimatePresence>
        {isEnrollModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEnrollModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-heading font-bold text-base text-foreground">
                  Student Enrollment (Bimbingan Mentor)
                </h3>
                <button onClick={() => setIsEnrollModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex border-b border-border">
                <button
                  type="button"
                  onClick={() => setEnrollCase("case2")}
                  className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors ${enrollCase === "case2" ? "border-brand-purple text-brand-purple" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  Case 2: Ke Program Ini
                </button>
                <button
                  type="button"
                  onClick={() => setEnrollCase("case1")}
                  className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors ${enrollCase === "case1" ? "border-brand-purple text-brand-purple" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  Case 1: Murid Baru
                </button>
              </div>

              <p className="text-2xs text-muted-foreground">
                {enrollCase === "case2"
                  ? "Daftarkan murid tanpa program ke dalam program studi yang Anda ampu saat ini."
                  : "Daftarkan murid baru yang belum memilih program studi."}
              </p>

              <form onSubmit={handleMentorEnroll} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Pilih Siswa Tanpa Program</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden"
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {availableStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button type="button" onClick={() => setIsEnrollModalOpen(false)} className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold">Batal</button>
                  <button type="submit" disabled={isSubmittingEnroll} className="px-4 py-1.5 rounded-lg bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    {isSubmittingEnroll && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Daftarkan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
