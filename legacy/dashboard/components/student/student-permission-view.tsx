"use client";

import { API_BASE_URL } from "@/lib/config";

import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Send,
  Upload,
  User,
  X,
  Eye,
  AlertCircle,
  Clock,
  GraduationCap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StudentPermissionViewProps {
  profile: any;
  activeClasses: any[];
}

export function StudentPermissionView({ profile, activeClasses }: StudentPermissionViewProps) {
  const activeClass = activeClasses.length > 0 ? activeClasses[0] : null;
  const batchId = activeClass?.batchId || "";
  const programName = activeClass?.program?.name || profile?.selectedProgram || "Program LMS";
  const mentorName = activeClass?.mentor?.name || "Mentor Akademik";

  // Form State
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - tzOffset).toISOString().split("T")[0];
  });
  const [category, setCategory] = useState<string>("Izin");
  const [reason, setReason] = useState<string>("");

  // Proof files state (Base64 strings)
  const [proofFiles, setProofFiles] = useState<{ name: string; type: string; data: string }[]>([]);
  const [chatFiles, setChatFiles] = useState<{ name: string; type: string; data: string }[]>([]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // History State
  const [permissionRequests, setPermissionRequests] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Detail Modal State
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  const fetchHistory = async () => {
    if (!profile?.id) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE_URL}/attendance/permission-requests?studentId=${profile.id}`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setPermissionRequests(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching permission history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [profile?.id]);

  // Helper: Compress Image to max 1280px to prevent 413 Payload Too Large / Network Error
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type === "application/pdf" || !file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
        return;
      }

      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle Multi Proof Files (Images and PDF)
  const handleProofFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const base64Data = await compressImage(file);
      if (base64Data) {
        setProofFiles((prev) => [
          ...prev,
          { name: file.name, type: file.type, data: base64Data },
        ]);
      }
    }
  };

  const removeProofFile = (index: number) => {
    setProofFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Chat Screenshot Files (Images Only)
  const handleChatFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error("Bukti chat mentor hanya menerima format gambar (PNG, JPG, WEBP).");
        continue;
      }
      const base64Data = await compressImage(file);
      if (base64Data) {
        setChatFiles((prev) => [
          ...prev,
          { name: file.name, type: file.type, data: base64Data },
        ]);
      }
    }
  };

  const removeChatFile = (index: number) => {
    setChatFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId) {
      setSubmitMessage({
        type: "error",
        text: "Anda belum terdaftar di kelas batch aktif.",
      });
      return;
    }

    if (!reason.trim()) {
      setSubmitMessage({ type: "error", text: "Mohon isi alasan izin Anda." });
      return;
    }

    if (proofFiles.length === 0) {
      setSubmitMessage({
        type: "error",
        text: "Mohon lampirkan minimal 1 file Bukti Dokumen / Surat Dokter.",
      });
      return;
    }

    if (chatFiles.length === 0) {
      setSubmitMessage({
        type: "error",
        text: "Mohon lampirkan minimal 1 file Tangkapan Layar Chat Mentor.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    const payload = {
      studentId: profile.id,
      batchId,
      date,
      category,
      reason,
      proofFiles: proofFiles.map((f) => f.data),
      mentorChatFiles: chatFiles.map((f) => f.data),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/attendance/permission-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (res.ok) {
        setSubmitMessage({
          type: "success",
          text: "Form Izin berhasil dikirim dan otomatis tercatat di sistem kehadiran!",
        });
        // Reset form
        setReason("");
        setProofFiles([]);
        setChatFiles([]);
        fetchHistory();
      } else {
        const errData = await res.json();
        setSubmitMessage({
          type: "error",
          text: errData.message || "Gagal mengirimkan Form Izin.",
        });
      }
    } catch (err) {
      console.error(err);
      setSubmitMessage({ type: "error", text: "Terjadi kesalahan jaringan." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Badge variant="outline" className="bg-brand-purple/20 text-brand-purple-light border-brand-purple/30 text-xs">
              Sistem Mandiri Ketidakhadiran
            </Badge>
            <h2 className="font-heading font-bold text-2xl mt-2 text-white flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-brand-purple" />
              Form Pengajuan Izin / Sakit
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Ajukan ketidakhadiran yang direncanakan untuk hari ini atau esok hari. Setelah diajukan, status kehadiran Anda otomatis berubah menjadi <strong>Izin/Sakit</strong> sehingga mentor tidak perlu mengisi manual.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Form Input Section */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-heading font-bold flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-brand-purple" />
                Isi Formulir Ketidakhadiran
              </CardTitle>
              <CardDescription className="text-xs">
                Pastikan seluruh informasi terisi dengan benar dan lampirkan bukti pendukung.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {submitMessage && (
                <Alert
                  className={
                    submitMessage.type === "success"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                      : "bg-red-500/10 text-red-600 border-red-500/30"
                  }
                >
                  {submitMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <AlertTitle className="text-xs font-bold">
                    {submitMessage.type === "success" ? "Berhasil" : "Gagal"}
                  </AlertTitle>
                  <AlertDescription className="text-xs">{submitMessage.text}</AlertDescription>
                </Alert>
              )}

              {/* Auto-filled Student Info Summary */}
              <div className="bg-secondary/30 border border-border/80 rounded-xl p-4 space-y-2 text-xs">
                <p className="font-semibold text-foreground flex items-center gap-1.5 border-b border-border/50 pb-2">
                  <User className="w-4 h-4 text-brand-purple" /> Data Pemohon
                </p>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1">
                  <div>
                    <span className="text-[11px] block text-muted-foreground/70">Nama Siswa:</span>
                    <strong className="text-foreground">{profile?.name || "Siswa LMS"}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] block text-muted-foreground/70">Email Registered:</span>
                    <span className="font-mono text-foreground">{profile?.email || "-"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] block text-muted-foreground/70">Program Studi:</span>
                    <span className="text-brand-purple font-medium">{programName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] block text-muted-foreground/70">Mentor Akademik:</span>
                    <span className="text-foreground font-medium">{mentorName}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                {/* 1. Tanggal Izin */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-brand-purple" /> Tanggal Izin / Sakit
                  </label>
                  <Input
                    type="date"
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-10 text-xs bg-background"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Anda dapat mengajukan izin untuk hari ini atau untuk tanggal di masa mendatang (H+1/esok hari).
                  </p>
                </div>

                {/* 2. Kategori Izin */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Kategori Izin</label>
                  <Select value={category} onValueChange={(val) => setCategory(val || "Izin")}>
                    <SelectTrigger className="w-full h-10 text-xs bg-background font-medium">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent className="min-w-[360px] max-w-lg">
                      <SelectItem value="Izin">Izin (Acara/Keperluan Akademik atau Pribadi)</SelectItem>
                      <SelectItem value="Sakit">Sakit (Kondisi Fisik Sedang Kurang Sehat)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Pilih kategori ketidakhadiran sesuai dengan kondisi Anda.
                  </p>
                </div>

                {/* 3. Alasan Izin */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Alasan Izin</label>
                  <Textarea
                    rows={3}
                    placeholder="Tuliskan alasan lengkap ketidakhadiran Anda..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="bg-background text-xs"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Jelaskan alasan izin secara ringkas namun jelas untuk keperluan validasi mentor.
                  </p>
                </div>

                {/* 4. Bukti Izin (Multi-file Images/PDF) */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-brand-purple" /> Bukti Izin (Surat Dokter / Dokumen Pendukung)
                  </label>
                  <div className="border border-dashed border-border rounded-xl p-4 bg-secondary/15 text-center space-y-2">
                    <input
                      type="file"
                      id="proof-upload"
                      multiple
                      accept="image/*,.pdf"
                      onChange={handleProofFilesChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="proof-upload"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-foreground hover:bg-secondary text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-brand-purple" /> Upload Berkas Bukti (Gambar / PDF)
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Bisa mengunggah banyak berkas sekaligus. Format yang diterima: PNG, JPG, JPEG, PDF.
                    </p>

                    {proofFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 justify-center">
                        {proofFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 bg-card border border-border px-2.5 py-1 rounded-md text-[11px] shadow-2xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-brand-purple" />
                            <span className="max-w-[120px] truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeProofFile(idx)}
                              className="text-muted-foreground hover:text-red-500 transition-colors ml-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Bukti Chat Mentor (Images Only) */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" /> Bukti Chat Mentor (Screenshot Persetujuan)
                  </label>
                  <div className="border border-dashed border-border rounded-xl p-4 bg-emerald-500/5 text-center space-y-2">
                    <input
                      type="file"
                      id="chat-upload"
                      multiple
                      accept="image/*"
                      onChange={handleChatFilesChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="chat-upload"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-foreground hover:bg-emerald-50 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-600" /> Upload Tangkapan Layar Chat (Gambar)
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Unggah foto screenshot konfirmasi persetujuan chat Anda kepada Mentor Akademik untuk tanggal tersebut. Hanya format gambar.
                    </p>

                    {chatFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 justify-center">
                        {chatFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 bg-card border border-emerald-500/30 px-2.5 py-1 rounded-md text-[11px] shadow-2xs"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="max-w-[120px] truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeChatFile(idx)}
                              className="text-muted-foreground hover:text-red-500 transition-colors ml-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white font-bold h-11 text-xs gap-2 shadow-sm"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    KIRIM FORMULIR IZIN
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* History Section */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border shadow-sm bg-card">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-heading font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-purple" />
                Riwayat Pengajuan Izin Anda
              </CardTitle>
              <CardDescription className="text-xs">
                Daftar pengajuan izin dan sakit yang pernah Anda kirimkan.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 p-0">
              {loadingHistory ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-purple" />
                </div>
              ) : permissionRequests.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs border-b border-border/50">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-brand-purple" />
                  Belum ada pengajuan izin yang dikirimkan.
                </div>
              ) : (
                <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                  {permissionRequests.map((req) => (
                    <div key={req.id} className="p-4 hover:bg-secondary/20 transition-colors space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={
                            req.category === "Sakit"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                              : "bg-brand-purple/10 text-brand-purple border-brand-purple/30"
                          }
                        >
                          {req.category}
                        </Badge>
                        <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3 text-brand-purple" />
                          {new Date(req.date).toLocaleDateString("id-ID", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-foreground font-medium line-clamp-2">{req.reason}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-muted-foreground">
                          {req.proofFiles?.length || 0} Bukti Dokumen • {req.mentorChatFiles?.length || 0} Bukti Chat
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRequest(req)}
                          className="h-7 text-xs text-brand-purple hover:text-brand-purple-hover hover:bg-brand-purple/10 gap-1 px-2"
                        >
                          <Eye className="w-3.5 h-3.5" /> Detail Berkas
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        {selectedRequest && (
          <DialogContent className="w-[95vw] max-w-3xl sm:max-w-3xl max-h-[90vh] overflow-y-auto font-sans p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-purple" />
                Detail Form Izin - {selectedRequest.category}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Pengajuan untuk tanggal{" "}
                <strong>
                  {new Date(selectedRequest.date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2">
                <span className="font-bold text-foreground block text-xs">Alasan Ketidakhadiran:</span>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-xs">{selectedRequest.reason}</p>
              </div>

              {/* Bukti Dokumen Preview */}
              <div className="space-y-2">
                <h4 className="font-bold text-foreground flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-brand-purple" /> Bukti Dokumen / Surat Dokter ({selectedRequest.proofFiles?.length || 0})
                </h4>
                {selectedRequest.proofFiles && selectedRequest.proofFiles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedRequest.proofFiles.map((fileData: string, idx: number) => {
                      const isPdf =
                        fileData.startsWith("data:application/pdf") ||
                        fileData.toLowerCase().endsWith(".pdf") ||
                        fileData.toLowerCase().includes(".pdf");
                      return (
                        <div key={idx} className="border border-border rounded-xl p-3 bg-card space-y-2">
                          {isPdf ? (
                            <a
                              href={fileData}
                              download={`bukti-izin-${idx + 1}.pdf`}
                              className="text-brand-purple font-semibold flex items-center gap-2 underline p-3 text-xs bg-brand-purple/10 rounded-lg hover:bg-brand-purple/20 transition-colors"
                            >
                              <FileText className="w-4 h-4" /> Download PDF #{idx + 1}
                            </a>
                          ) : (
                            <img
                              src={fileData}
                              alt={`Bukti #${idx + 1}`}
                              className="w-full max-h-72 object-contain rounded-lg border border-border/50 bg-black/20"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic text-[11px]">Tidak ada dokumen lampiran.</p>
                )}
              </div>

              {/* Bukti Chat Mentor Preview */}
              <div className="space-y-2">
                <h4 className="font-bold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600" /> Tangkapan Layar Chat Mentor ({selectedRequest.mentorChatFiles?.length || 0})
                </h4>
                {selectedRequest.mentorChatFiles && selectedRequest.mentorChatFiles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedRequest.mentorChatFiles.map((fileData: string, idx: number) => (
                      <div key={idx} className="border border-border rounded-xl p-3 bg-card">
                        <img
                          src={fileData}
                          alt={`Chat #${idx + 1}`}
                          className="w-full max-h-72 object-contain rounded-lg border border-border/50 bg-black/20"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic text-[11px]">Tidak ada bukti chat mentor.</p>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
