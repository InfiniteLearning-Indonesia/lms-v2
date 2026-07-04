"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, Loader2, CheckCircle2, Clock, UploadCloud, Link as LinkIcon, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function AssignmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;
  const assignmentId = params.assignmentId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [assignmentData, setAssignmentData] = useState<any>(null);
  
  // Mock form state
  const [submissionLink, setSubmissionLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:7000/classes/${classId}/assignment/${assignmentId}`, {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data tugas");
        return res.json();
      })
      .then((data) => {
        setAssignmentData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [classId, assignmentId]);

  if (isLoading || !assignmentData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-brand-purple animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground animate-pulse font-heading">
          Memuat detail tugas…
        </p>
      </div>
    );
  }

  const handleMockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const isPastDue = assignmentData.dueDate ? new Date(assignmentData.dueDate) < new Date() : false;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-brand-purple/20 selection:text-brand-purple">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center">
            <img src="/logo-black.png" alt="Infinite Learning Logo" className="dark:hidden h-7 w-auto" />
            <img src="/logo-white.png" alt="Infinite Learning Logo" className="hidden dark:block h-7 w-auto" />
          </Link>
          <span className="text-border font-light text-sm">|</span>
          <span className="font-heading font-medium text-sm text-muted-foreground hidden sm:inline-block">
            Detail Tugas
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href={`/dashboard/class/${classId}`}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors border border-border px-3 py-1.5 rounded-lg shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali
          </Link>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-8">
        
        <div className="grid md:grid-cols-[1fr_350px] gap-8">
          
          {/* Left Column: Assignment Details */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-brand-yellow text-amber-600 bg-brand-yellow/10 font-mono text-[10px] tracking-wider uppercase">
                  Tugas Praktik
                </Badge>
              </div>
              
              <h1 className="font-heading font-black text-3xl md:text-4xl text-foreground">
                {assignmentData.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground border-b border-border pb-4">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Dibuat: {assignmentData.createdAt ? new Date(assignmentData.createdAt).toLocaleDateString('id-ID') : "Baru saja"}</span>
                </div>
                <div className="text-border">•</div>
                <div className={`flex items-center gap-1.5 ${isPastDue ? "text-destructive" : ""}`}>
                  <AlertCircle className="w-4 h-4" />
                  <span>Tenggat Waktu: {assignmentData.dueDate ? new Date(assignmentData.dueDate).toLocaleDateString('id-ID', { dateStyle: 'long' }) : "Tidak ada tenggat"}</span>
                </div>
              </div>
            </div>

            <div className="font-sans text-sm leading-relaxed text-foreground/90 whitespace-pre-line bg-card border border-border p-6 rounded-xl shadow-sm">
              <h3 className="font-heading font-bold text-lg mb-4 text-foreground">Instruksi Tugas</h3>
              {assignmentData.description || "Tidak ada deskripsi instruksi. Silakan tanyakan kepada mentor Anda."}
            </div>
          </div>

          {/* Right Column: Submission Form */}
          <div>
            <div className="sticky top-24 bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
              <h3 className="font-heading font-bold text-lg mb-1">Pengumpulan Tugas</h3>
              <p className="text-xs text-muted-foreground mb-6">Status: {isSubmitted ? <span className="text-emerald-600 font-semibold">Terkumpul</span> : <span className="text-amber-600 font-semibold">Belum Terkumpul</span>}</p>
              
              {isSubmitted ? (
                <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 stroke-current" />
                  <AlertTitle className="text-sm font-semibold">Tugas Berhasil Dikirim!</AlertTitle>
                  <AlertDescription className="text-xs mt-1">
                    Mentor Anda akan segera meninjau hasil tugas Anda.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleMockSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="link-input" className="text-xs">Tautan Tugas (Github / Figma / Drive)</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="link-input"
                        type="url"
                        required
                        placeholder="https://..."
                        value={submissionLink}
                        onChange={(e) => setSubmissionLink(e.target.value)}
                        className="pl-9 border-brand-gray/40 focus-visible:border-brand-purple text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Atau Unggah Berkas (Opsional)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-secondary/20 transition-colors">
                      <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-xs font-semibold text-foreground">Klik untuk unggah berkas</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Maks. ukuran berkas: 10MB</p>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white transition-all shadow-sm h-10 text-sm font-semibold"
                    disabled={isSubmitting || isPastDue}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Mengirim...
                      </>
                    ) : (
                      "Kirim Tugas"
                    )}
                  </Button>
                  
                  {isPastDue && (
                    <p className="text-[10px] text-destructive text-center mt-2">
                      Tugas telah melewati batas waktu pengumpulan.
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
