"use client";

import { API_BASE_URL } from "@/lib/config";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  FileText,
  Folder,
  Loader2,
  Lock,
  Users,
  Video,
  ExternalLink,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function ClassDetailPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [classData, setClassData] = useState<any>(null);
  const [expandedCompetencies, setExpandedCompetencies] = useState<string[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Unauthorized");
      })
      .then((data) => setProfile(data))
      .catch((err) => {
        console.error("Gagal memuat profil:", err);
        router.push("/login");
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        router.push("/login");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/classes/${classId}`, {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          throw new Error("Unauthorized");
        }
        if (!res.ok) throw new Error("Gagal mengambil data kelas");
        return res.json();
      })
      .then((data) => {
        setClassData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [classId, router]);
  const groupedData = classData
    ? (() => {
        const groups: Record<string, any[]> = {};
        const items = [
          ...(classData.materials || []).map((m: any) => ({
            ...m,
            itemType: "material",
          })),
          ...(classData.assignments || []).map((a: any) => ({
            ...a,
            itemType: "assignment",
          })),
        ];
        items.forEach((item) => {
          const comp = item.competency || "Modul & Materi Pembelajaran";
          if (!groups[comp]) groups[comp] = [];
          groups[comp].push(item);
        });
        Object.keys(groups).forEach((key) => {
          groups[key].sort(
            (a, b) =>
              new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          );
        });
        return groups;
      })()
    : {};

  // Auto-expand all competencies on first load
  useEffect(() => {
    if (classData) {
      const keys = Object.keys(groupedData);
      if (keys.length > 0 && expandedCompetencies.length === 0) {
        setExpandedCompetencies(keys);
      }
    }
  }, [classData]);

  if (isLoading || !classData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-brand-purple animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground animate-pulse font-heading">
          Memuat ruang kelas…
        </p>
      </div>
    );
  }

  const toggleCompetency = (comp: string) => {
    setExpandedCompetencies((prev) =>
      prev.includes(comp) ? prev.filter((c) => c !== comp) : [...prev, comp]
    );
  };

  const totalMaterialsCount = classData?.materials?.length || 0;
  const totalAssignmentsCount = classData?.assignments?.length || 0;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-brand-purple/20 selection:text-brand-purple">
      <Navbar
        profile={profile}
        onLogout={handleLogout}
        title="Ruang Kelas"
        showBackButton={true}
      />

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {classData.batch?.status === "completed" && (
          <Alert className="bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400 p-4 rounded-2xl">
            <Lock className="w-5 h-5 shrink-0 text-amber-600" />
            <div>
              <AlertTitle className="font-heading font-bold text-sm">
                Mode Read-Only (Kelas Diarsipkan)
              </AlertTitle>
              <AlertDescription className="text-xs mt-0.5">
                Batch akademik ini telah berakhir. Seluruh materi dan tugas dikunci menjadi arsip historis.
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Class Hero Banner */}
        <div className="bg-gradient-to-r from-[#1a103c] via-[#2d1b69] to-[#1e144a] border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-brand-purple/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-brand-yellow/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-brand-yellow text-black hover:bg-brand-yellow border-none font-bold uppercase tracking-wider text-[10px] px-3 py-1">
                {classData.batch?.name || "Batch Aktif"}
              </Badge>
              <span className="text-xs text-white/60 font-medium">
                ID Kelas: {classData.id}
              </span>
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-white tracking-tight">
              {classData.program?.name || "Program Kelas"}
            </h1>

            <p className="text-white/80 font-sans text-xs sm:text-sm max-w-2xl leading-relaxed">
              Selamat datang di ruang kelas digital. Pelajari modul pembelajaran, akses link referensi, serta selesaikan tugas praktik Anda.
            </p>

            {/* Quick Stat Chips */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/15 text-xs font-medium">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                <Users className="w-3.5 h-3.5 text-brand-yellow" />
                <span>Mentor: {classData.mentor?.name || "Belum Ditugaskan"}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                <BookOpen className="w-3.5 h-3.5 text-brand-yellow" />
                <span>{totalMaterialsCount} Modul Materi</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                <FileText className="w-3.5 h-3.5 text-brand-yellow" />
                <span>{totalAssignmentsCount} Tugas Praktik</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🔗 Quick Links Widget inside Class */}
        {(() => {
          const links =
            classData?.importantLinks ||
            classData?.program?.importantLinks ||
            [];
          const activeLinks = (links || []).filter(
            (l: any) => l.url && l.url.trim() !== ""
          );
          if (activeLinks.length === 0) return null;

          const getLinkStyle = (title: string) => {
            const t = title.toLowerCase();
            if (t.includes("zoom")) return { bg: "bg-sky-500/10 text-sky-600 border-sky-500/20 hover:border-sky-500/50", iconBg: "bg-sky-500/20 text-sky-600" };
            if (t.includes("figma")) return { bg: "bg-pink-500/10 text-pink-600 border-pink-500/20 hover:border-pink-500/50", iconBg: "bg-pink-500/20 text-pink-600" };
            if (t.includes("discord")) return { bg: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 hover:border-indigo-500/50", iconBg: "bg-indigo-500/20 text-indigo-600" };
            if (t.includes("drive")) return { bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:border-emerald-500/50", iconBg: "bg-emerald-500/20 text-emerald-600" };
            if (t.includes("whatsapp")) return { bg: "bg-green-500/10 text-green-600 border-green-500/20 hover:border-green-500/50", iconBg: "bg-green-500/20 text-green-600" };
            return { bg: "bg-brand-purple/10 text-brand-purple border-brand-purple/20 hover:border-brand-purple/50", iconBg: "bg-brand-purple/20 text-brand-purple" };
          };

          return (
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <span className="text-xs font-bold text-foreground flex items-center gap-2 font-heading tracking-wide">
                  <span className="p-1 rounded-md bg-brand-purple/10 text-brand-purple">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                  Akses Cepat & Link Penting Kelas
                </span>
                <span className="text-[10px] text-muted-foreground font-medium bg-secondary px-2.5 py-1 rounded-full border border-border/60">
                  {activeLinks.length} Tautan Tersedia
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {activeLinks.map((item: any) => {
                  const style = getLinkStyle(item.title);
                  return (
                    <a
                      key={item.id || item.title}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex items-center justify-between p-3 rounded-xl border ${style.bg} transition-all cursor-pointer shadow-2xs hover:-translate-y-0.5`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-2 rounded-lg ${style.iconBg} group-hover:scale-110 transition-transform shrink-0`}>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold truncate">
                          {item.title}
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Tabs for Class Content */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm min-h-[400px]">
          <Tabs defaultValue="materi" className="w-full">
            <TabsList className="bg-secondary/60 p-1.5 rounded-xl border border-border/60 flex overflow-x-auto whitespace-nowrap min-h-14 w-full gap-1.5 justify-start scrollbar-none">
              <TabsTrigger
                value="materi"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 px-4 py-2 cursor-pointer shrink-0"
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>Materi & Modul Silabus ({totalMaterialsCount})</span>
              </TabsTrigger>
              <TabsTrigger
                value="tugas"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 px-4 py-2 cursor-pointer shrink-0"
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>Tugas Praktik ({totalAssignmentsCount})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="materi" className="space-y-6 pt-4">
              {Object.keys(groupedData).length > 0 ? (
                Object.entries(groupedData).map(([competency, items]) => {
                  const isExpanded = expandedCompetencies.includes(competency);
                  const materialsInGroup = items.filter((i) => i.itemType === "material").length;
                  const assignmentsInGroup = items.filter((i) => i.itemType === "assignment").length;

                  return (
                    <div
                      key={competency}
                      className="border border-border/80 rounded-2xl bg-card overflow-hidden shadow-xs hover:border-brand-purple/40 transition-all duration-200"
                    >
                      <button
                        onClick={() => toggleCompetency(competency)}
                        className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-secondary/40 via-secondary/20 to-card hover:from-brand-purple/10 hover:to-card transition-all text-left cursor-pointer border-b border-border/40"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-purple to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-purple/20">
                            <Folder className="w-5 h-5 fill-white/20 text-white" />
                          </div>
                          <div>
                            <h3 className="font-heading font-bold text-sm sm:text-base text-foreground tracking-tight flex items-center gap-2">
                              {competency}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-muted-foreground font-medium">
                                {items.length} Total Silabus
                              </span>
                              <span className="text-[10px] text-brand-purple font-semibold bg-brand-purple/10 px-2 py-0.5 rounded-md border border-brand-purple/20">
                                {materialsInGroup} Modul
                              </span>
                              {assignmentsInGroup > 0 && (
                                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                  {assignmentsInGroup} Tugas
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-medium hidden sm:inline-block">
                            {isExpanded ? "Tutup Folder" : "Buka Folder"}
                          </span>
                          <div className="p-1.5 rounded-lg bg-secondary text-muted-foreground">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-4 space-y-3 bg-secondary/10">
                          {items.map((item: any) => {
                            if (item.itemType === "material") {
                              const isExternalLink =
                                item.content &&
                                (item.content.startsWith("http://") ||
                                  item.content.startsWith("https://"));
                              const materialHref = isExternalLink
                                ? item.content
                                : `/dashboard/class/${classId}/material/${item.id}`;
                              const linkTarget = isExternalLink
                                ? "_blank"
                                : undefined;
                              const linkRel = isExternalLink
                                ? "noopener noreferrer"
                                : undefined;

                              return (
                                <Link
                                  href={materialHref}
                                  target={linkTarget}
                                  rel={linkRel}
                                  key={`mat-${item.id}`}
                                  className="block"
                                >
                                  <div className="p-4 border border-border/80 rounded-xl flex items-center justify-between hover:border-brand-purple hover:bg-brand-purple/5 transition-all cursor-pointer bg-card shadow-2xs group">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                      <div className="w-10 h-10 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-brand-purple group-hover:text-white transition-all shadow-2xs">
                                        {item.type === "video" ? (
                                          <Video className="w-4 h-4" />
                                        ) : isExternalLink ? (
                                          <ExternalLink className="w-4 h-4" />
                                        ) : (
                                          <BookOpen className="w-4 h-4" />
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <h4 className="font-heading font-bold text-xs sm:text-sm text-foreground truncate group-hover:text-brand-purple transition-colors">
                                          {item.title}
                                        </h4>
                                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate flex items-center gap-2">
                                          <span className="font-medium text-brand-purple/90">
                                            {item.type === "video"
                                              ? "Video Pembelajaran"
                                              : isExternalLink
                                              ? "Tautan Eksternal"
                                              : "Modul Dokumen / Teks"}
                                          </span>
                                          {item.createdAt && (
                                            <span>
                                              • Diunggah {new Date(item.createdAt).toLocaleDateString("id-ID")}
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="text-2xs bg-brand-purple/10 text-brand-purple border-brand-purple/30 group-hover:bg-brand-purple group-hover:text-white transition-all shrink-0 ml-3 font-semibold px-3 py-1">
                                      Lihat Modul →
                                    </Badge>
                                  </div>
                                </Link>
                              );
                            } else {
                              return (
                                <Link
                                  href={`/dashboard/class/${classId}/assignment/${item.id}`}
                                  key={`ass-${item.id}`}
                                  className="block"
                                >
                                  <div className="p-4 border border-amber-500/20 rounded-xl flex items-center justify-between hover:border-amber-500/60 hover:bg-amber-500/5 transition-all cursor-pointer bg-card shadow-2xs group">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-black transition-all shadow-2xs">
                                        <ClipboardList className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <h4 className="font-heading font-bold text-xs sm:text-sm text-foreground truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                          {item.title}
                                        </h4>
                                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                          {item.description ? item.description.replace(/<[^>]*>?/gm, "").trim() : "Tugas Praktik Spesialisasi"}
                                        </p>
                                      </div>
                                    </div>
                                    {item.dueDate && (
                                      <Badge
                                        variant="outline"
                                        className="text-2xs shrink-0 ml-3 font-mono font-medium border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1"
                                      >
                                        Tenggat:{" "}
                                        {new Date(
                                          item.dueDate
                                        ).toLocaleDateString("id-ID")}
                                      </Badge>
                                    )}
                                  </div>
                                </Link>
                              );
                            }
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-10 text-center border border-border border-dashed rounded-2xl bg-secondary/10 space-y-2">
                  <BookOpen className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <h4 className="font-heading font-bold text-sm text-foreground">
                    Belum Ada Modul Materi
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Mentor belum menambahkan kompetensi atau materi untuk kelas ini.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tugas" className="space-y-4 pt-4">
              {classData.assignments?.length > 0 ? (
                classData.assignments.map((a: any) => (
                  <Link
                    href={`/dashboard/class/${classId}/assignment/${a.id}`}
                    key={a.id}
                    className="block"
                  >
                    <div className="p-4 border border-amber-500/20 rounded-xl flex items-center justify-between hover:border-amber-500/60 hover:bg-amber-500/5 transition-all cursor-pointer bg-card shadow-2xs group">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-black transition-all shadow-2xs">
                          <ClipboardList className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-heading font-bold text-xs sm:text-sm text-foreground truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {a.title}
                          </h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                            {a.description ? a.description.replace(/<[^>]*>?/gm, "").trim() : "Tugas Praktik Spesialisasi"}
                          </p>
                        </div>
                      </div>
                      {a.dueDate && (
                        <Badge
                          variant="outline"
                          className="text-2xs shrink-0 ml-3 font-mono font-medium border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1"
                        >
                          Tenggat:{" "}
                          {new Date(a.dueDate).toLocaleDateString("id-ID")}
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-10 text-center border border-border border-dashed rounded-2xl bg-secondary/10 space-y-2">
                  <ClipboardList className="w-8 h-8 text-amber-500/40 mx-auto" />
                  <h4 className="font-heading font-bold text-sm text-foreground">
                    Belum Ada Tugas Praktik
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Tidak ada tugas praktik yang sedang aktif.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
