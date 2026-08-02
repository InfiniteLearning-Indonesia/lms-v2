"use client";

import { API_BASE_URL } from "@/lib/config";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
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

          return (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-2 font-heading">
                  <ExternalLink className="w-4 h-4 text-brand-purple" />
                  Akses Cepat & Link Penting Kelas
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {activeLinks.length} Tautan Tersedia
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {activeLinks.map((item: any) => (
                  <a
                    key={item.id || item.title}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30 hover:bg-brand-purple/5 hover:border-brand-purple/40 transition-all cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-brand-purple/10 text-brand-purple group-hover:scale-105 transition-transform shrink-0">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-medium text-foreground truncate group-hover:text-brand-purple transition-colors">
                        {item.title}
                      </span>
                    </div>
                  </a>
                ))}
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
                  return (
                    <div
                      key={competency}
                      className="border border-border rounded-2xl bg-card overflow-hidden shadow-2xs transition-all duration-200"
                    >
                      <button
                        onClick={() => toggleCompetency(competency)}
                        className="w-full flex items-center justify-between p-5 bg-secondary/15 hover:bg-secondary/30 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center shrink-0">
                            <Folder className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-heading font-bold text-sm sm:text-base text-foreground">
                              {competency}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                              {items.length} Item Silabus (Materi & Tugas)
                            </p>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="p-4 pt-2 space-y-3 bg-secondary/5">
                          <div className="border-t border-border/50 pt-2" />
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
                                  <div className="p-4 border border-border rounded-xl flex items-center justify-between hover:border-brand-purple/50 hover:bg-brand-purple/5 transition-all cursor-pointer bg-card shadow-2xs">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                      <div className="w-9 h-9 rounded-lg bg-brand-purple/10 text-brand-purple flex items-center justify-center shrink-0">
                                        {item.type === "video" ? (
                                          <Video className="w-4 h-4" />
                                        ) : isExternalLink ? (
                                          <ExternalLink className="w-4 h-4" />
                                        ) : (
                                          <BookOpen className="w-4 h-4" />
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <h4 className="font-heading font-semibold text-xs sm:text-sm text-foreground truncate">
                                          {item.title}
                                        </h4>
                                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                          {item.type === "video"
                                            ? "Video Pembelajaran"
                                            : isExternalLink
                                            ? "Tautan Eksternal"
                                            : "Materi Teks / PDF"}
                                          {item.createdAt
                                            ? ` • Diunggah ${new Date(
                                                item.createdAt
                                              ).toLocaleDateString("id-ID")}`
                                            : ""}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="text-2xs bg-brand-purple/5 text-brand-purple border-brand-purple/20 shrink-0 ml-3">
                                      Lihat Modul
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
                                  <div className="p-4 border border-emerald-500/30 rounded-xl flex items-center justify-between hover:border-emerald-500 hover:bg-emerald-500/5 transition-all cursor-pointer bg-card shadow-2xs">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <h4 className="font-heading font-semibold text-xs sm:text-sm text-foreground truncate">
                                          {item.title}
                                        </h4>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                          Tugas Praktik
                                        </p>
                                      </div>
                                    </div>
                                    {item.dueDate && (
                                      <Badge
                                        variant="outline"
                                        className="text-2xs shrink-0 ml-3 font-mono font-medium border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
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
                    <div className="p-4 border border-border rounded-xl flex items-center justify-between hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer bg-card shadow-2xs">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-heading font-semibold text-xs sm:text-sm text-foreground truncate">
                            {a.title}
                          </h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                            {a.description || "Tugas Praktik Spesialisasi"}
                          </p>
                        </div>
                      </div>
                      {a.dueDate && (
                        <Badge
                          variant="outline"
                          className="text-2xs shrink-0 ml-3 font-mono font-medium border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
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
                  <CheckCircle2 className="w-8 h-8 text-muted-foreground/40 mx-auto" />
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
