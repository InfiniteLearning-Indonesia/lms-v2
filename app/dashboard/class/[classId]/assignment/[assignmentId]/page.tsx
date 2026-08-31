"use client";

import { API_BASE_URL } from "@/lib/config";
import { logout } from "@/lib/logout";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { RichTextRenderer } from "@/components/rich-text-renderer";
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

export default function AssignmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;
  const assignmentId = params.assignmentId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [assignmentData, setAssignmentData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Form states
  const [submissionLink, setSubmissionLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Mentor Grading States
  const [mentorSubmissions, setMentorSubmissions] = useState<any[]>([]);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [manualScore, setManualScore] = useState<number | "">("");
  const [manualFeedback, setManualFeedback] = useState("");
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Bulk AI state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const handleLogout = () => { logout(); };

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/classes/${classId}/assignment/${assignmentId}`, {
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
      fetch(`${API_BASE_URL}/auth/me`, {
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
      fetch(`${API_BASE_URL}/classes/${classId}/assignment/${assignmentId}/submissions/me`, {
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
      const res = await fetch(`${API_BASE_URL}/classes/${classId}/assignment/${assignmentId}/submissions`, {
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
    if (profile?.roles?.includes('mentor')) {
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
      const res = await fetch(`${API_BASE_URL}/classes/${classId}/assignment/${assignmentId}/submit`, {
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
      setIsEditing(false);
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
      const res = await fetch(`${API_BASE_URL}/classes/${classId}/assignment/${assignmentId}/submissions/${selectedSubmission.id}/grade`, {
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
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-6">
          {/* Top Header Workspace Banner */}
          <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Badge variant="outline" className="border-brand-purple/40 text-brand-purple bg-brand-purple/10 font-bold text-[10px] tracking-wider uppercase px-3 py-1">
                  Tugas Praktik Spesialisasi
                </Badge>
                <Badge variant="outline" className={isSubmitted ? "border-emerald-500/40 text-emerald-600 bg-emerald-500/10 font-semibold text-[10px]" : "border-amber-500/40 text-amber-600 bg-amber-500/10 font-semibold text-[10px]"}>
                  {isSubmitted ? "✓ Terkumpul" : "⏳ Belum Terkumpul"}
                </Badge>
              </div>

              {assignmentData.dueDate && (
                <span className={`text-xs font-mono font-medium px-3 py-1 rounded-full border ${isPastDue ? "bg-red-500/10 text-red-600 border-red-500/30" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"}`}>
                  {isPastDue ? "Tenggat Lewat: " : "Tenggat Waktu: "}
                  {new Date(assignmentData.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              )}
            </div>

            <h1 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl text-foreground tracking-tight">
              {assignmentData.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground pt-2 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-purple" />
                <span>Dibuat: {assignmentData.createdAt ? new Date(assignmentData.createdAt).toLocaleDateString('id-ID') : "Baru saja"}</span>
              </div>
            </div>

            <div className="font-sans text-sm leading-relaxed text-foreground/90 bg-card border border-border p-6 rounded-xl shadow-sm">
              <h3 className="font-heading font-bold text-lg mb-4 text-foreground">Instruksi Tugas</h3>
              {assignmentData.description ? (
                <MarkdownRenderer content={assignmentData.description} />
              ) : (
                "Tidak ada deskripsi instruksi. Silakan tanyakan kepada mentor Anda."
              )}
            </div>
          </div>

          {profile?.roles?.includes('mentor') ? (
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mt-8">
              <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/10">
                <div>
                  <h2 className="font-heading font-bold text-lg text-foreground">Daftar Pengumpulan Mentee</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Evaluasi pengumpulan mentee secara manual atau gunakan AI secara massal.</p>
                </div>
                <Button onClick={() => setIsBulkModalOpen(true)} className="bg-brand-purple hover:bg-brand-purple-hover text-white flex items-center gap-1.5 cursor-pointer shadow-xs">
                  <Bot className="w-4 h-4" /> Evaluasi Massal (AI)
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th className="px-5 py-3">Mentee</th>
                      <th className="px-5 py-3">Link Tugas</th>
                      <th className="px-5 py-3">Status / Nilai</th>
                      <th className="px-5 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mentorSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                          Belum ada pengumpulan dari mentee.
                        </td>
                      </tr>
                    ) : (
                      mentorSubmissions.map((sub: any) => (
                        <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3.5 font-medium">{sub.student?.name}</td>
                          <td className="px-5 py-3.5">
                            <a href={sub.link} target="_blank" rel="noreferrer" className="text-brand-purple hover:underline text-xs font-medium flex items-center gap-1">
                              <LinkIcon className="w-3 h-3" /> Buka Tautan
                            </a>
                          </td>
                          <td className="px-5 py-3.5">
                            {sub.status === 'ai_draft' ? (
                              <Badge variant="outline" className="text-amber-600 border-amber-600/30 bg-amber-500/10">Draft AI: {sub.score}</Badge>
                            ) : sub.status === 'graded' ? (
                              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Dinilai: {sub.score}</Badge>
                            ) : (
                              <Badge variant="secondary">Perlu Dinilai</Badge>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs cursor-pointer gap-1"
                              onClick={() => openManualModal(sub)}
                            >
                              <Pencil className="w-3.5 h-3.5" /> Beri Nilai
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
            /* 🚀 2-Column Student Workspace Grid */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Instructions & Feedback (2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Instructions Box */}
                <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
                  <h3 className="font-heading font-bold text-lg text-foreground border-b border-border/50 pb-3 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-brand-purple" />
                    Instruksi & Panduan Tugas
                  </h3>

                  {assignmentData.description ? (
                    <RichTextRenderer content={assignmentData.description} />
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Tidak ada instruksi khusus. Silakan tanyakan kepada mentor Anda.
                    </p>
                  )}
                </div>

                {/* Mentor Feedback & Grade Box (when graded) */}
                {submissionData?.status === 'graded' && (
                  <div className="bg-card border border-brand-purple/30 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 bg-gradient-to-br from-brand-purple/5 via-card to-card">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <h3 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        Hasil Penilaian & Feedback Mentor
                      </h3>
                      <div className="flex items-center gap-1 bg-brand-purple text-white px-3 py-1 rounded-xl text-sm font-heading font-black shadow-xs">
                        <span>{submissionData.score}</span>
                        <span className="text-xs opacity-80">/ 100</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold text-foreground">Catatan dari Mentor:</span>
                      <div className="p-4 bg-card border border-border/80 rounded-xl text-xs sm:text-sm text-foreground">
                        {submissionData.manualFeedback ? (
                          <MarkdownRenderer content={submissionData.manualFeedback} />
                        ) : (
                          <span className="text-muted-foreground italic">Tugas telah dinilai dengan baik.</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Submission Hub Widget (1 col) */}
              <div className="space-y-6">
                <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-brand-purple" />
                      Pengumpulan Tugas
                    </h3>
                    {isSubmitted && !isPastDue && !isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSubmissionLink(submissionData?.link || "");
                          setIsEditing(true);
                        }}
                        className="h-8 px-2.5 text-xs text-brand-purple hover:bg-brand-purple/10 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                    )}
                  </div>

                  {isSubmitted && !isEditing ? (
                    <div className="space-y-4">
                      <Alert className="bg-emerald-500/10 border-emerald-500/30 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4 stroke-current" />
                        <AlertTitle className="text-xs font-bold font-heading">Tugas Terkirim!</AlertTitle>
                        <AlertDescription className="text-[11px] mt-0.5">
                          Tugas Anda telah diterima dan sedang dalam tahap peninjauan.
                        </AlertDescription>
                      </Alert>

                      <div className="bg-secondary/30 border border-border/60 rounded-xl p-4 space-y-3 text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground text-[11px]">Status</span>
                          <Badge variant="outline" className={submissionData?.status === 'graded' ? 'bg-brand-purple/10 text-brand-purple border-brand-purple/30 w-fit' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 w-fit'}>
                            {submissionData?.status === 'graded' ? 'Telah Dinilai' : 'Menunggu Penilaian'}
                          </Badge>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground text-[11px]">Waktu Pengumpulan</span>
                          <span className="font-medium text-foreground">
                            {submissionData?.createdAt ? new Date(submissionData.createdAt).toLocaleString('id-ID') : "-"}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground text-[11px]">Tautan Tugas</span>
                          <a
                            href={submissionData?.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-brand-purple hover:underline font-semibold truncate flex items-center gap-1"
                          >
                            <LinkIcon className="w-3 h-3 shrink-0" />
                            <span className="truncate">{submissionData?.link}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {isEditing && (
                        <Alert className="bg-amber-500/10 border-amber-500/30 text-amber-600">
                          <AlertCircle className="h-4 w-4 stroke-current" />
                          <AlertTitle className="text-xs font-bold">Mode Perubahan</AlertTitle>
                          <AlertDescription className="text-[11px] mt-0.5">
                            Anda sedang memperbarui tautan tugas.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="link-input" className="text-xs font-semibold">
                          {assignmentData.submissionType === 'github' ? 'Tautan Repository GitHub' :
                            assignmentData.submissionType === 'figma' ? 'Tautan File Figma' :
                              assignmentData.submissionType === 'drive' ? 'Tautan Google Drive' :
                                'Tautan Tugas Eksternal'}
                        </Label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="link-input"
                            type="url"
                            required
                            placeholder={
                              assignmentData.submissionType === 'github' ? 'https://github.com/user/repo' :
                                assignmentData.submissionType === 'figma' ? 'https://figma.com/file/...' :
                                  assignmentData.submissionType === 'drive' ? 'https://drive.google.com/...' :
                                    'https://...'
                            }
                            className="pl-9 h-10 bg-secondary/30 focus:bg-background text-xs rounded-xl"
                            value={submissionLink}
                            onChange={(e) => setSubmissionLink(e.target.value)}
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-1">
                        <Button
                          type="submit"
                          disabled={isSubmitting || !submissionLink}
                          className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white font-heading font-bold text-xs h-10 rounded-xl shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                          <span>{isSubmitting ? "Mengirim..." : (isEditing ? "Simpan Perubahan" : "Kumpulkan Tugas 🚀")}</span>
                        </Button>

                        {isEditing && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            disabled={isSubmitting}
                            className="w-full h-9 text-xs rounded-xl cursor-pointer"
                          >
                            Batal
                          </Button>
                        )}
                      </div>

                      {isPastDue && (
                        <p className="text-[10px] text-amber-600 font-medium text-center flex items-center justify-center gap-1 pt-1">
                          <AlertCircle className="w-3 h-3" />
                          Pengumpulan terlambat dapat memengaruhi nilai akhir.
                        </p>
                      )}
                    </form>
                  )}
                </div>
              </div>
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
