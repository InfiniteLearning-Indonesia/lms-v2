"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, Loader2, CheckCircle2, Clock, UploadCloud, Link as LinkIcon, AlertCircle, FileSpreadsheet, Bot, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/navbar";
import { BulkAiEvaluateModal } from "@/app/dashboard/components/mentor/modals/bulk-ai-evaluate-modal";
import { MarkdownRenderer } from "@/components/markdown-renderer";

export default function AssignmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;
  const assignmentId = params.assignmentId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [assignmentData, setAssignmentData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Mock form state
  const [submissionLink, setSubmissionLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState<any>(null);

  // Mentor Grading States
  const [mentorSubmissions, setMentorSubmissions] = useState<any[]>([]);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [manualScore, setManualScore] = useState<number | "">("");
  const [manualFeedback, setManualFeedback] = useState("");
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Bulk AI state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

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
    // Fetch both assignment, profile, and my submission concurrently
    Promise.all([
      fetch(`http://localhost:7000/classes/${classId}/assignment/${assignmentId}`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      }).then((res) => {
        if (res.status === 401) {
          router.push("/login");
          throw new Error("Unauthorized");
        }
        if (!res.ok) throw new Error("Gagal mengambil data tugas");
        return res.json();
      }),
      fetch("http://localhost:7000/auth/me", {
        headers: { Accept: "application/json" },
        credentials: "include",
      }).then((res) => {
        if (res.status === 401) {
          router.push("/login");
          throw new Error("Unauthorized");
        }
        if (!res.ok) throw new Error("Gagal mengambil data profil");
        return res.json();
      }),
      fetch(`http://localhost:7000/classes/${classId}/assignment/${assignmentId}/submissions/me`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      }).then(async (res) => {
        if (res.status === 401) {
          router.push("/login");
          throw new Error("Unauthorized");
        }
        if (!res.ok) return null;
        const text = await res.text();
        return text ? JSON.parse(text) : null;
      })
    ])
      .then(([assignment, userProfile, mySubmission]) => {
        setAssignmentData(assignment);
        setProfile(userProfile);
        if (mySubmission) {
          setSubmissionData(mySubmission);
          setIsSubmitted(true);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [classId, assignmentId, router]);

  const fetchMentorSubmissions = async () => {
    try {
      const res = await fetch(`http://localhost:7000/classes/${classId}/assignment/${assignmentId}/submissions`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setMentorSubmissions(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (profile?.role === 'mentor') {
      fetchMentorSubmissions();
    }
  }, [profile, classId, assignmentId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:7000/classes/${classId}/assignment/${assignmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ link: submissionLink })
      });
      if (!res.ok) throw new Error("Gagal mengirim tugas");

      const data = await res.json();
      if (data.submission) {
        setSubmissionData(data.submission);
      }
      setIsSubmitted(true);
      toast.success("Tugas berhasil dikirim!");
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat mengirim tugas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    setIsSubmittingManual(true);
    try {
      const res = await fetch(`http://localhost:7000/classes/${classId}/assignment/${assignmentId}/submissions/${selectedSubmission.id}/grade`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ score: Number(manualScore), manualFeedback })
      });
      if (res.ok) {
        toast.success("Nilai berhasil disimpan!");
        setIsManualModalOpen(false);
        fetchMentorSubmissions();
      } else {
        toast.error("Gagal menyimpan nilai.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const openManualModal = (sub: any) => {
    setSelectedSubmission(sub);
    setManualScore(sub.score || "");
    setManualFeedback(sub.manualFeedback || sub.aiFeedback || "");
    setIsManualModalOpen(true);
  };



  const isPastDue = assignmentData.dueDate ? new Date(assignmentData.dueDate) < new Date() : false;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-brand-purple/20 selection:text-brand-purple">
      <Navbar profile={profile} onLogout={handleLogout} title="Detail Tugas" showBackButton={true} backUrl={`/dashboard/class/${classId}`} />

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        <div className="space-y-8">
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

          {profile?.role === 'mentor' ? (
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mt-8">
              <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/10">
                <div>
                  <h2 className="font-heading font-bold text-xl">Daftar Pengumpulan Mentee</h2>
                  <p className="text-xs text-muted-foreground mt-1">Evaluasi pengumpulan mentee secara manual atau gunakan AI secara massal.</p>
                </div>
                <Button onClick={() => setIsBulkModalOpen(true)} className="bg-brand-purple hover:bg-brand-purple-hover text-white flex items-center gap-1.5 cursor-pointer">
                  <Bot className="w-4 h-4" /> Evaluasi Massal (AI)
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th className="px-4 py-3">Mentee</th>
                      <th className="px-4 py-3">Link Tugas</th>
                      <th className="px-4 py-3">Status / Nilai</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mentorSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                          Belum ada pengumpulan dari mentee.
                        </td>
                      </tr>
                    ) : (
                      mentorSubmissions.map((sub: any) => (
                        <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{sub.student?.name}</td>
                          <td className="px-4 py-3">
                            <a href={sub.link} target="_blank" rel="noreferrer" className="text-brand-purple hover:underline text-xs flex items-center gap-1">
                              <LinkIcon className="w-3 h-3" /> Buka Tautan
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            {sub.status === 'ai_draft' ? (
                              <Badge variant="outline" className="text-amber-600 border-amber-600/30 bg-amber-500/10">Draft AI: {sub.score}</Badge>
                            ) : sub.status === 'graded' ? (
                              <Badge className="bg-emerald-500 hover:bg-emerald-600">Dinilai: {sub.score}</Badge>
                            ) : (
                              <Badge variant="secondary">Perlu Dinilai</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[10px]"
                              onClick={() => openManualModal(sub)}
                            >
                              <Pencil className="w-3 h-3 mr-1" /> Beri Nilai
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col mt-8">
              <h3 className="font-heading font-bold text-lg mb-1">Pengumpulan Tugas</h3>
              <p className="text-xs text-muted-foreground mb-6">Status: {isSubmitted ? <span className="text-emerald-600 font-semibold">Terkumpul</span> : <span className="text-amber-600 font-semibold">Belum Terkumpul</span>}</p>

              {isSubmitted ? (
                <div className="space-y-4">
                  <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-4">
                    <CheckCircle2 className="h-4 w-4 stroke-current" />
                    <AlertTitle className="text-sm font-semibold">Tugas Berhasil Dikirim!</AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                      Mentor Anda akan meninjau hasil tugas Anda. Berikut adalah riwayat pengumpulan Anda.
                    </AlertDescription>
                  </Alert>

                  {submissionData && (
                    <div className="bg-background border border-border rounded-lg overflow-hidden">
                      <div className="px-4 py-3 bg-secondary/30 border-b border-border flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Log Pengumpulan</h4>
                        <Badge variant="outline" className={submissionData.status === 'graded' ? 'bg-brand-purple/10 text-brand-purple' : 'bg-emerald-500/10 text-emerald-600'}>
                          {submissionData.status === 'graded' ? 'Telah Dinilai' : 'Menunggu Penilaian'}
                        </Badge>
                      </div>
                      <div className="p-4 space-y-4 text-xs">
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-muted-foreground">Waktu Kumpul</span>
                          <span className="col-span-2 font-medium">{new Date(submissionData.createdAt).toLocaleString('id-ID')}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-muted-foreground">Tautan Tugas</span>
                          <a href={submissionData.link} target="_blank" rel="noreferrer" className="col-span-2 text-brand-purple hover:underline font-medium break-all">
                            {submissionData.link}
                          </a>
                        </div>

                        {submissionData.status === 'graded' && (
                          <>
                            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
                              <span className="text-muted-foreground">Nilai Akhir</span>
                              <span className="col-span-2 font-bold text-lg text-brand-purple">{submissionData.score} / 100</span>
                            </div>
                            <div className="pt-2">
                              <span className="text-muted-foreground block mb-1 font-semibold">Umpan Balik Mentor:</span>
                              <div className="p-4 bg-secondary/30 border border-border rounded-lg text-foreground">
                                {submissionData.manualFeedback ? (
                                  <MarkdownRenderer content={submissionData.manualFeedback} />
                                ) : (
                                  "-"
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
                  <div className="space-y-2">
                    <Label htmlFor="link-input" className="text-xs">
                      {assignmentData.submissionType === 'github' ? 'Tautan Repository GitHub' :
                        assignmentData.submissionType === 'figma' ? 'Tautan File Figma' :
                          assignmentData.submissionType === 'drive' ? 'Tautan Google Drive' :
                            'Tautan Tugas (Bebas)'}
                    </Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="link-input"
                        type="url"
                        required
                        placeholder={
                          assignmentData.submissionType === 'github' ? 'https://github.com/username/repo' :
                            assignmentData.submissionType === 'figma' ? 'https://figma.com/file/...' :
                              assignmentData.submissionType === 'drive' ? 'https://drive.google.com/...' :
                                'https://...'
                        }
                        pattern={
                          assignmentData.submissionType === 'github' ? '.*github\\.com.*' :
                            assignmentData.submissionType === 'figma' ? '.*figma\\.com.*' :
                              assignmentData.submissionType === 'drive' ? '.*drive\\.google\\.com.*' :
                                undefined
                        }
                        className="pl-9 h-10 bg-secondary/50 focus:bg-background transition-colors text-sm"
                        value={submissionLink}
                        onChange={(e) => setSubmissionLink(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    {assignmentData.submissionType === 'github' && (
                      <p className="text-[10px] text-muted-foreground">
                        Pastikan repository Anda disetel ke <span className="font-semibold text-foreground">Public</span>.
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white transition-all shadow-sm h-10 text-sm font-semibold"
                    disabled={isSubmitting}
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
                    <p className="text-[10px] text-amber-600 font-medium text-center mt-2 flex items-center justify-center gap-1.5">
                      <AlertCircle className="w-3 h-3" />
                      Terlambat: Poin maksimal akan dikurangi 2 dari nilai akhir.
                    </p>
                  )}
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      <Dialog open={isManualModalOpen} onOpenChange={setIsManualModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Beri Nilai: {selectedSubmission?.student?.name}</DialogTitle>
            <DialogDescription>
              Anda dapat menyimpan penilaian ini secara final. Jika sebelumnya AI telah mengevaluasi, ini akan mengganti nilai draft tersebut.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleManualGradeSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nilai Akhir (0-100)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                required
                value={manualScore}
                onChange={(e) => setManualScore(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Feedback untuk Mentee</Label>
              <Textarea
                className="h-24"
                placeholder="Berikan umpan balik yang membangun..."
                value={manualFeedback}
                onChange={(e) => setManualFeedback(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white" disabled={isSubmittingManual}>
              {isSubmittingManual ? "Menyimpan..." : "Simpan Penilaian"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <BulkAiEvaluateModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        assignment={assignmentData}
        submissions={mentorSubmissions}
        classId={classId}
        onRefreshSubmissions={fetchMentorSubmissions}
      />
    </div>
  );
}
