"use client";

import { API_BASE_URL } from "@/lib/config";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Cpu,
  Eye,
  FileText,
  Globe,
  Key,
  Loader2,
  Play,
  RefreshCw,
  Sparkles,
  Terminal,
  Video,
  X,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarkdownRenderer } from "@/components/markdown-renderer";

interface BulkAiEvaluateModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: any;
  submissions: any[];
  classId: string;
  onRefreshSubmissions: () => void;
}

export function BulkAiEvaluateModal({
  isOpen,
  onClose,
  assignment,
  submissions = [],
  classId,
  onRefreshSubmissions,
}: BulkAiEvaluateModalProps) {
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);
  const [aiProvider, setAiProvider] = useState("ollama");
  const [ollamaHost, setOllamaHost] = useState("http://localhost:11434");
  const [groqApiKey, setGroqApiKey] = useState("");
  const [googleAiStudioKey, setGoogleAiStudioKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [batchSize, setBatchSize] = useState<number>(5);

  const [availableModels, setAvailableModels] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [progressCount, setProgressCount] = useState(0);
  const [totalToEvaluate, setTotalToEvaluate] = useState(0);
  const [evalResults, setEvalResults] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeDetailItem, setActiveDetailItem] = useState<any | null>(null);

  const openDetailInspection = (sub: any) => {
    const sessionResult = evalResults.find((r) => r.submissionId === sub.id);
    const promptText = sessionResult?.prompt || `[INFORMASI TUGAS]
Judul Tugas: ${assignment.title}
Instruksi Tugas dari Mentor: ${assignment.description || 'Kerjakan sesuai instruksi dan rubrik.'}

[TAUTAN PENGUMPULAN MENTEE]
${sub.link}

[HASIL INSPEKSI KONTEN TAUTAN / KODE]
${sessionResult?.analysis || sub.aiAnalysis || 'Berhasil membaca file/repositori mentee.'}`;

    setActiveDetailItem({
      studentName: sub.student?.name || "Mentee",
      link: sub.link,
      score: sessionResult?.score ?? sub.score,
      feedback: sessionResult?.feedback || sub.manualFeedback || sub.aiFeedback || "",
      analysis: sessionResult?.analysis || sub.aiAnalysis || "",
      prompt: promptText,
    });
  };

  // Pre-detect video links
  const isVideoLink = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    const exts = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv"];
    if (exts.some((ext) => lower.includes(ext))) return true;
    if (lower.includes("youtube.com") || lower.includes("youtu.be") || lower.includes("vimeo.com")) return true;
    return false;
  };

  const [savedOllamaModel, setSavedOllamaModel] = useState("gemma3:1b");
  const [savedGroqModel, setSavedGroqModel] = useState("llama-3.3-70b-versatile");
  const [savedGeminiModel, setSavedGeminiModel] = useState("gemini-2.5-flash");

  // Fetch Mentor AI config on open
  useEffect(() => {
    if (!isOpen) return;

    fetch(`${API_BASE_URL}/classes/mentor/ai-config`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          const provider = data.aiProvider || "ollama";
          setAiProvider(provider);
          setOllamaHost(data.ollamaHost || "http://localhost:11434");
          setGroqApiKey(data.groqApiKey || "");
          setGoogleAiStudioKey(data.googleAiStudioKey || "");
          
          const ollamaMod = data.selectedOllamaModel || "gemma3:1b";
          const groqMod = data.selectedGroqModel || "llama-3.3-70b-versatile";
          const geminiMod = data.selectedGeminiModel || "gemini-2.5-flash";

          setSavedOllamaModel(ollamaMod);
          setSavedGroqModel(groqMod);
          setSavedGeminiModel(geminiMod);

          const activeMod = data.selectedModel || (provider === "groq" ? groqMod : provider === "gemini" ? geminiMod : ollamaMod);
          setSelectedModel(activeMod);
        }
      })
      .catch(() => {});

    // Select non-video submissions by default
    const validIds = submissions
      .filter((s) => s.link && !isVideoLink(s.link))
      .map((s) => s.id);
    setSelectedSubmissionIds(validIds);
  }, [isOpen, submissions]);

  const autoFetchModels = async (
    provider: string,
    host: string,
    groqKey: string,
    geminiKey: string,
    savedModel: string
  ) => {
    setIsLoadingModels(true);
    try {
      let hostOrApiKey = "";
      if (provider === "ollama") hostOrApiKey = host;
      else if (provider === "groq") hostOrApiKey = groqKey;
      else if (provider === "gemini") hostOrApiKey = geminiKey;

      const res = await fetch(`${API_BASE_URL}/classes/mentor/ai-models`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ provider, hostOrApiKey }),
      });

      if (res.ok) {
        const models = await res.json();
        if (Array.isArray(models) && models.length > 0) {
          setAvailableModels(models);
          if (!savedModel) {
            setSelectedModel(models[0].id);
          }
        }
      }
    } catch (e) {
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Fetch Models
  const fetchModels = async () => {
    setIsLoadingModels(true);
    setErrorMsg(null);
    try {
      let hostOrApiKey = "";
      if (aiProvider === "ollama") hostOrApiKey = ollamaHost;
      else if (aiProvider === "groq") hostOrApiKey = groqApiKey;
      else if (aiProvider === "gemini") hostOrApiKey = googleAiStudioKey;

      const res = await fetch(`${API_BASE_URL}/classes/mentor/ai-models`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ provider: aiProvider, hostOrApiKey }),
      });

      if (!res.ok) throw new Error("Gagal mengambil model AI.");
      const models = await res.json();
      setAvailableModels(models);
      if (models.length > 0 && (!selectedModel || !models.some((m: any) => m.id === selectedModel))) {
        setSelectedModel(models[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memuat daftar model.");
    } finally {
      setIsLoadingModels(false);
    }
  };

  if (!isOpen || !assignment) return null;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      let validIds = submissions.filter((s) => s.link && !isVideoLink(s.link)).map((s) => s.id);
      if (aiProvider !== "ollama" && validIds.length > 10) {
        validIds = validIds.slice(0, 10);
        setErrorMsg("Maksimal 10 tugas sekaligus untuk AI Cloud API (Groq/Gemini). Gunakan Ollama untuk jumlah tak terbatas.");
      } else {
        setErrorMsg(null);
      }
      setSelectedSubmissionIds(validIds);
    } else {
      setSelectedSubmissionIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedSubmissionIds.includes(id)) {
      setSelectedSubmissionIds(selectedSubmissionIds.filter((item) => item !== id));
      setErrorMsg(null);
    } else {
      if (aiProvider !== "ollama" && selectedSubmissionIds.length >= 10) {
        setErrorMsg("Maksimal 10 tugas sekaligus untuk AI Cloud API (Groq/Gemini). Gunakan Ollama untuk jumlah tak terbatas.");
        return;
      }
      setErrorMsg(null);
      setSelectedSubmissionIds([...selectedSubmissionIds, id]);
    }
  };

  // Run Bulk AI Evaluation
  const handleStartBulkEvaluation = async () => {
    if (selectedSubmissionIds.length === 0) {
      setErrorMsg("Pilih minimal 1 tugas mentee yang valid.");
      return;
    }

    if (aiProvider !== "ollama" && selectedSubmissionIds.length > 10) {
      setErrorMsg("Maksimal 10 tugas sekaligus untuk AI Cloud API (Groq/Gemini).");
      return;
    }

    setIsEvaluating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setProgressCount(0);
    setTotalToEvaluate(selectedSubmissionIds.length);
    setEvalResults([]);

    try {
      const res = await fetch(`${API_BASE_URL}/classes/${classId}/assignment/${assignment.id}/bulk-ai-evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          submissionIds: selectedSubmissionIds,
          batchSize: 5,
          provider: aiProvider,
          model: selectedModel,
          ollamaHost,
          groqApiKey,
          googleAiStudioKey,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Evaluasi massal AI gagal.");
      }

      const data = await res.json();
      setEvalResults(data.results || []);
      setProgressCount(data.evaluatedCount || selectedSubmissionIds.length);

      if (data.rateLimitError) {
        setErrorMsg(data.rateLimitError);
        if (data.evaluatedCount > 0) {
          setSuccessMsg(
            `Sebanyak ${data.evaluatedCount} tugas berhasil dinilai sebelum batas kuota/rate limit terlampaui.`
          );
        }
      } else {
        setSuccessMsg(
          `Berhasil mengevaluasi ${data.evaluatedCount} tugas! ${
            data.skippedVideoCount > 0 ? `(${data.skippedVideoCount} video dilewati)` : ""
          }`
        );
      }
      onRefreshSubmissions();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat evaluasi massal AI.");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs font-sans p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand-purple/10 text-brand-purple">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-foreground">
                Evaluasi Massal (AI) — {assignment.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                Penilaian otomatis menggunakan AI LLM.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isEvaluating}
            className="h-8 w-8 p-0 rounded-full cursor-pointer"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

          {successMsg && (
            <Alert className="border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <AlertDescription className="text-xs font-medium">{successMsg}</AlertDescription>
            </Alert>
          )}

          {/* Provider & Model Bar */}
          <div className="grid sm:grid-cols-2 gap-4 bg-secondary/30 p-4 rounded-xl border border-border">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                AI Provider:
              </label>
              <select
                value={aiProvider}
                onChange={(e) => {
                  const newProv = e.target.value;
                  setAiProvider(newProv);
                  const targetMod = newProv === "groq" ? savedGroqModel : newProv === "gemini" ? savedGeminiModel : savedOllamaModel;
                  setSelectedModel(targetMod);
                  setAvailableModels([]);
                  if (newProv !== "ollama" && selectedSubmissionIds.length > 10) {
                    setSelectedSubmissionIds(selectedSubmissionIds.slice(0, 10));
                    setErrorMsg("Maksimal 10 tugas sekaligus untuk AI Cloud API (Groq/Gemini).");
                  }
                }}
                disabled={isEvaluating}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs font-medium text-foreground cursor-pointer"
              >
                <option value="ollama">Ollama (Lokal / Cloud)</option>
                <option value="groq">Groq Cloud AI</option>
                <option value="gemini">Google AI Studio (Gemini)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-foreground">
                  Model AI:
                </label>
                <button
                  type="button"
                  onClick={fetchModels}
                  disabled={isLoadingModels || isEvaluating}
                  className="text-[10px] text-brand-purple hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isLoadingModels ? "animate-spin" : ""}`} />
                  {isLoadingModels ? "Memuat..." : "Muat Model Dynamic"}
                </button>
              </div>

              {(() => {
                let options: Array<{ id: string; name: string }> = [];

                if (availableModels.length > 0) {
                  options = availableModels;
                } else {
                  const currSaved = selectedModel || (aiProvider === "groq" ? savedGroqModel : aiProvider === "gemini" ? savedGeminiModel : savedOllamaModel);
                  if (currSaved) {
                    options = [{ id: currSaved, name: `${currSaved} (Model Tersimpan)` }];
                  } else if (aiProvider === "groq" && !groqApiKey) {
                    options = [{ id: "", name: "⚠️ Masukkan Groq API Key terlebih dahulu" }];
                  } else if (aiProvider === "gemini" && !googleAiStudioKey) {
                    options = [{ id: "", name: "⚠️ Masukkan Google AI Studio API Key terlebih dahulu" }];
                  } else {
                    options = [{ id: "", name: "⚠️ Klik 'Muat Model Dynamic' untuk daftar lengkap" }];
                  }
                }

                return (
                  <select
                    value={selectedModel || (options.length > 0 ? options[0].id : "")}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={isEvaluating}
                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs font-medium text-foreground"
                  >
                    {options.map((m) => (
                      <option key={m.id || m.name} value={m.id} disabled={!m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                );
              })()}
            </div>
          </div>

          {/* Progress Bar when Evaluating */}
          {isEvaluating && (
            <div className="bg-brand-purple/5 p-4 rounded-xl border border-brand-purple/20 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-brand-purple">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Mengevaluasi {totalToEvaluate} tugas dengan AI ({aiProvider})...
                </span>
                <span>{progressCount} / {totalToEvaluate} Selesai</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-purple transition-all duration-300"
                  style={{
                    width: totalToEvaluate > 0 ? `${(progressCount / totalToEvaluate) * 100}%` : "0%",
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Submissions Checklist Table */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="bg-muted/40 p-3 border-b border-border flex justify-between items-center">
              <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    selectedSubmissionIds.length > 0 &&
                    selectedSubmissionIds.length ===
                      submissions.filter((s) => s.link && !isVideoLink(s.link)).length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  disabled={isEvaluating}
                />
                Pilih Semua ({selectedSubmissionIds.length} terpilih)
              </label>
              <span className="text-[10px] text-muted-foreground">
                Format video (.mp4/YouTube) dilewati otomatis.
              </span>
            </div>

            <div className="max-h-[300px] overflow-y-auto divide-y divide-border">
              {submissions.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  Belum ada pengumpulan dari mentee.
                </div>
              ) : (
                submissions.map((sub) => {
                  const isVideo = isVideoLink(sub.link);
                  const isSelected = selectedSubmissionIds.includes(sub.id);

                  return (
                    <div
                      key={sub.id}
                      className={`p-3.5 flex items-center justify-between text-xs transition-colors ${
                        isVideo
                          ? "bg-amber-500/5 text-muted-foreground"
                          : isSelected
                          ? "bg-brand-purple/5"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isVideo || isEvaluating}
                          onChange={() => handleToggleSelect(sub.id)}
                          className="cursor-pointer"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-foreground block truncate">
                            {sub.student?.name || "Mentee"}
                          </span>
                          <a
                            href={sub.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-brand-purple hover:underline truncate block max-w-md"
                          >
                            {sub.link}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isVideo ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Video className="w-3 h-3" />
                            Video (Tidak Didukung AI)
                          </span>
                        ) : sub.status === "graded" || sub.status === "ai_draft" || sub.score !== null ? (
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openDetailInspection(sub)}
                              className="h-6 px-2 text-[10px] text-brand-purple border-brand-purple/30 hover:bg-brand-purple/10 flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              Lihat Prompt & Log
                            </Button>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              {sub.score} Pts
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary text-muted-foreground">
                            Belum Diperiksa
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isEvaluating}
            className="text-xs font-semibold cursor-pointer"
          >
            Batal
          </Button>
          <Button
            onClick={handleStartBulkEvaluation}
            disabled={isEvaluating || selectedSubmissionIds.length === 0}
            className="bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengevaluasi ({selectedSubmissionIds.length} Tugas)...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Mulai Evaluasi Massal AI ({selectedSubmissionIds.length})
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Prompt & AI Log Inspection Modal Overlay ── */}
      {activeDetailItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto font-sans">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/30">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-brand-purple" />
                <div>
                  <h4 className="font-heading font-bold text-sm text-foreground">
                    Inspeksi Log & Prompt AI — {activeDetailItem.studentName}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    Nilai Akhir: <span className="font-bold text-brand-purple">{activeDetailItem.score} / 100</span>
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveDetailItem(null)}
                className="h-7 w-7 p-0 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Umpan Balik AI */}
              <div className="space-y-1.5">
                <label className="font-bold text-foreground flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-brand-purple" />
                  Umpan Balik AI (Rendered Markdown):
                </label>
                <div className="p-3 bg-secondary/30 border border-border rounded-lg">
                  {activeDetailItem.feedback ? (
                    <MarkdownRenderer content={activeDetailItem.feedback} />
                  ) : (
                    <p className="text-muted-foreground italic">Belum ada umpan balik.</p>
                  )}
                </div>
              </div>

              {/* Formulasi Prompt Yang Dikirim ke AI */}
              <div className="space-y-1.5">
                <label className="font-bold text-foreground flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-amber-500" />
                  Formulasi Prompt & Instruksi Yang Dikirim ke AI:
                </label>
                <pre className="p-3 bg-zinc-950 text-zinc-200 font-mono text-[11px] leading-relaxed rounded-lg overflow-x-auto border border-zinc-800 whitespace-pre-wrap max-h-56">
                  {activeDetailItem.prompt}
                </pre>
              </div>

              {/* Hasil Inspeksi Kode / File Mentee */}
              {activeDetailItem.analysis && (
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    Hasil Inspeksi Konten / File Mentee (GitHub/Figma/Docs):
                  </label>
                  <pre className="p-3 bg-secondary/40 font-mono text-[11px] leading-relaxed rounded-lg overflow-x-auto border border-border whitespace-pre-wrap max-h-48">
                    {activeDetailItem.analysis}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border bg-muted/20 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveDetailItem(null)}
                className="text-xs font-semibold cursor-pointer"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
