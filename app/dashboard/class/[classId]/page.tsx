"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Loader2,
  Users,
  Video,
  ChevronDown,
  ChevronUp,
  Folder,
  Lock,
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
    fetch("http://localhost:7000/auth/me", {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Unauthorized");
      })
      .then((data) => setProfile(data))
      .catch((err) => console.error("Gagal memuat profil:", err));
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:7000/auth/logout", {
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
    fetch(`http://localhost:7000/classes/${classId}`, {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then((res) => {
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
  }, [classId]);

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

  // Groups materials and assignments by competency
  const groupedData = classData ? (() => {
    const groups: Record<string, any[]> = {};
    const items = [
      ...(classData.materials || []).map((m: any) => ({ ...m, itemType: 'material' })),
      ...(classData.assignments || []).map((a: any) => ({ ...a, itemType: 'assignment' }))
    ];
    items.forEach(item => {
      const comp = item.competency || "Materi Lainnya";
      if (!groups[comp]) groups[comp] = [];
      groups[comp].push(item);
    });
    // Sort items inside groups based on createdAt if available
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });
    return groups;
  })() : {};

  const toggleCompetency = (comp: string) => {
    setExpandedCompetencies(prev => 
      prev.includes(comp) ? prev.filter(c => c !== comp) : [...prev, comp]
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-brand-purple/20 selection:text-brand-purple">
      <Navbar profile={profile} onLogout={handleLogout} title="Ruang Kelas" showBackButton={true} />

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-8">
        {classData.batch?.status === "completed" && (
          <Alert className="bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400 p-4">
            <Lock className="w-5 h-5 shrink-0" />
            <div>
              <AlertTitle className="font-heading font-semibold text-sm">Kelas Diarsipkan (Read-Only Mode)</AlertTitle>
              <AlertDescription className="text-2xs mt-0.5">
                Batch/Cohort ini telah berakhir. Seluruh materi dapat dibaca kembali, namun pengerjaan dan pengumpulan tugas telah ditutup.
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Class Hero Banner */}
        <div className="bg-gradient-to-r from-brand-purple to-brand-gradient-end rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none translate-x-1/4 -translate-y-1/4">
            <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFFFFF" d="M42.7,-73.4C55.9,-67.2,67.6,-57,75.9,-44.4C84.3,-31.8,89.4,-16.9,89.9,-1.9C90.4,13.1,86.2,28.2,77.7,40.9C69.2,53.6,56.3,64,41.9,71.2C27.5,78.4,11.6,82.4,-3.6,84.1C-18.8,85.8,-33.3,85.1,-46.4,79.1C-59.5,73.2,-71.2,61.9,-78.9,48.2C-86.6,34.5,-90.3,18.4,-88.4,2.9C-86.5,-12.6,-79,-27.6,-70.2,-41.2C-61.4,-54.8,-51.3,-67,-38.7,-73.6C-26,-80.3,-10.8,-81.4,2.6,-84.9C15.9,-88.4,32.7,-94.4,42.7,-73.4Z" transform="translate(100 100)" />
            </svg>
          </div>

          <div className="relative z-10 space-y-3">
            <Badge className="bg-brand-yellow text-black hover:bg-brand-yellow border-none font-semibold uppercase tracking-wider text-[10px]">
              {classData.batch?.name || "Batch Aktif"}
            </Badge>
            <h1 className="font-heading font-black text-3xl md:text-4xl">{classData.program?.name || "Program Kelas"}</h1>
            <p className="text-white/80 font-sans text-sm md:text-base max-w-2xl">
              Selamat datang di kelas ini. Mari pelajari materi dan kerjakan tugas yang telah disiapkan oleh mentor Anda.
            </p>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Users className="w-4 h-4 text-white/70" />
                <span>Mentor: {classData.mentor?.name || "Belum ditentukan"}</span>
              </div>
              <div className="text-xs text-white/60">•</div>
              <div className="text-xs font-medium text-white/80">ID Kelas: {classData.id}</div>
            </div>
          </div>
        </div>

        {/* Tabs for Class Content */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[400px]">
          <Tabs defaultValue="materi" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="materi" className="font-heading font-semibold">Materi & Modul</TabsTrigger>
              <TabsTrigger value="tugas" className="font-heading font-semibold">Tugas</TabsTrigger>
            </TabsList>

            <TabsContent value="materi" className="space-y-6">
              {Object.keys(groupedData).length > 0 ? (
                Object.entries(groupedData).map(([competency, items]) => {
                  const isExpanded = expandedCompetencies.includes(competency);
                  return (
                    <div key={competency} className="border border-border rounded-xl bg-card overflow-hidden shadow-sm transition-all duration-200">
                      <button
                        onClick={() => toggleCompetency(competency)}
                        className="w-full flex items-center justify-between p-5 bg-secondary/5 hover:bg-secondary/10 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-brand-purple/10 text-brand-purple flex items-center justify-center shrink-0">
                            <Folder className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-heading font-bold text-base text-foreground">{competency}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{items.length} Modul Pembelajaran</p>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="p-4 pt-0 space-y-3 bg-secondary/5">
                          <div className="border-t border-border/50 pt-3" />
                          {items.map((item: any) => {
                            if (item.itemType === 'material') {
                              return (
                                <Link href={`/dashboard/class/${classId}/material/${item.id}`} key={`mat-${item.id}`} className="block">
                                  <div className="p-4 border border-border rounded-xl flex items-center gap-4 hover:border-brand-purple/50 hover:bg-background transition-colors cursor-pointer bg-background">
                                    <div className="w-10 h-10 rounded-lg bg-brand-purple/10 text-brand-purple flex items-center justify-center shrink-0">
                                      {item.type === "video" ? <Video className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                                    </div>
                                    <div>
                                      <h4 className="font-heading font-semibold text-sm text-foreground">{item.title}</h4>
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {item.type === "video" ? "Video Pembelajaran" : "Materi Teks / PDF"}
                                        {item.createdAt ? ` • Diunggah pada ${new Date(item.createdAt).toLocaleDateString("id-ID")}` : ""}
                                      </p>
                                    </div>
                                  </div>
                                </Link>
                              );
                            } else {
                              return (
                                <Link href={`/dashboard/class/${classId}/assignment/${item.id}`} key={`ass-${item.id}`} className="block">
                                  <div className="p-4 border border-brand-yellow/30 rounded-xl flex items-center justify-between hover:border-brand-yellow/60 hover:bg-background transition-colors cursor-pointer bg-background">
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-lg bg-brand-yellow/20 text-amber-600 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <h4 className="font-heading font-semibold text-sm text-foreground">{item.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          Tugas Praktik
                                        </p>
                                      </div>
                                    </div>
                                    {item.dueDate && (
                                      <Badge variant="outline" className="text-xs shrink-0 ml-4 font-mono font-medium border-brand-yellow text-amber-600 bg-brand-yellow/5">
                                        Tenggat: {new Date(item.dueDate).toLocaleDateString("id-ID")}
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
                <div className="p-6 text-center border border-border border-dashed rounded-xl space-y-2">
                  <h4 className="font-heading font-semibold text-foreground">Belum ada modul</h4>
                  <p className="text-xs text-muted-foreground">Mentor belum menambahkan kompetensi dan materi untuk kelas ini.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tugas" className="space-y-4">
              {classData.assignments?.length > 0 ? (
                classData.assignments.map((a: any) => (
                  <Link href={`/dashboard/class/${classId}/assignment/${a.id}`} key={a.id} className="block">
                    <div className="p-4 border border-border rounded-xl flex items-center justify-between hover:border-brand-purple/50 hover:bg-secondary/20 transition-colors cursor-pointer bg-secondary/10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-brand-yellow/20 text-amber-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-heading font-semibold text-sm text-foreground">{a.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {a.description}
                          </p>
                        </div>
                      </div>
                      {a.dueDate && (
                        <Badge variant="outline" className="text-xs shrink-0 ml-4 font-mono font-medium">
                          Tenggat: {new Date(a.dueDate).toLocaleDateString("id-ID")}
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-6 text-center border border-border border-dashed rounded-xl space-y-2">
                  <h4 className="font-heading font-semibold text-foreground">Belum ada tugas</h4>
                  <p className="text-xs text-muted-foreground">Tidak ada tugas yang sedang berlangsung.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
