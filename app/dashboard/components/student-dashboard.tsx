import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, Loader2, Info } from "lucide-react";
import {
  Card,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

interface StudentDashboardProps {
  profile: {
    name: string;
    selectedProgram?: string | null;
  };
}

export function StudentDashboard({ profile }: StudentDashboardProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real integration, we'd fetch from http://localhost:7000/classes/my-classes
    // Mocking the API response to demonstrate the Class Architecture:
    setTimeout(() => {
      const mockClass = profile.selectedProgram
        ? [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              program: { name: profile.selectedProgram },
              batch: { name: "Batch 7 - 2026" },
              mentor: { name: "Riyanda Azis Febrian" },
            },
          ]
        : [];
      setClasses(mockClass);
      setIsLoading(false);
    }, 600);
  }, [profile.selectedProgram]);

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

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        {classes.length === 0 ? (
          <Alert className="border-border bg-card">
            <Info className="w-5 h-5 text-brand-purple shrink-0 mt-0.5" />
            <div>
              <AlertTitle className="font-heading font-semibold text-base">
                Belum Ada Program Aktif
              </AlertTitle>
              <AlertDescription className="text-sm text-muted-foreground mt-1">
                Anda belum dijadwalkan atau belum memilih Program Studi / Kelas (misal: AI Development).
                Silakan hubungi administrator atau tunggu pembaharuan otomatis.
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
              {classes.map((cls) => (
                <Link key={cls.id} href={`/dashboard/class/${cls.id}`} className="block transition-transform hover:-translate-y-1">
                  <Card className="border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-gradient-to-r from-brand-purple to-brand-gradient-end px-6 py-5 text-white">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-yellow">
                        Sedang Berjalan • {cls.batch?.name}
                      </p>
                      <CardTitle className="text-white text-xl mt-1.5">{cls.program?.name}</CardTitle>
                      <p className="text-xs text-white/80 mt-1">Mentor: {cls.mentor?.name || "Belum ditentukan"}</p>
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
            <div className="text-center py-6 space-y-2">
              <div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-semibold text-foreground">Semua Selesai!</p>
              <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                Belum ada tugas baru dari mentor untuk kelas {classes[0].program?.name}.
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-4 text-center">
              Belum ada tugas karena Anda belum terdaftar di kelas apapun.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
