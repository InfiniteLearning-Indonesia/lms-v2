"use client";

import { API_BASE_URL } from "@/lib/config";

import { useEffect, useState } from "react";
import { Notebook, Calendar, Loader2, AlertCircle, CheckCircle2, FileEdit, Send, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function StudentLogbook({ batchId }: { batchId: string }) {
  const [data, setData] = useState<{ totalMonths: number, startDate?: string, logbooks: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [q4, setQ4] = useState("");

  const fetchLogbooks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/classes/batches/${batchId}/logbooks/student`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.logbooks?.length > 0) {
          // auto select the latest unfilled or last month
          const maxMonth = Math.max(...json.logbooks.map((l: any) => l.monthIndex), 1);
          setSelectedMonth(maxMonth);
        }
      } else {
        setError("Gagal memuat data logbook.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan saat memuat logbook.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) {
      fetchLogbooks();
    }
  }, [batchId]);

  useEffect(() => {
    if (data?.logbooks) {
      const log = data.logbooks.find(l => l.monthIndex === selectedMonth);
      if (log) {
        setQ1(log.q1_experience || "");
        setQ2(log.q2_progress || "");
        setQ3(log.q3_challenges || "");
        setQ4(log.q4_competencies || "");
      } else {
        setQ1("");
        setQ2("");
        setQ3("");
        setQ4("");
      }
      setSubmitError(null);
    }
  }, [selectedMonth, data]);

  const totalWords = (q1 + " " + q2 + " " + q3 + " " + q4).trim().split(/\s+/).filter(w => w.length > 0).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalWords < 200) {
      setSubmitError(`Jumlah kata saat ini ${totalWords}. Minimal diperlukan 200 kata.`);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const res = await fetch(`${API_BASE_URL}/classes/batches/${batchId}/logbooks/student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthIndex: selectedMonth,
          q1_experience: q1,
          q2_progress: q2,
          q3_challenges: q3,
          q4_competencies: q4
        }),
        credentials: "include",
      });

      if (res.ok) {
        await fetchLogbooks(); // Refresh data
      } else {
        const err = await res.json();
        setSubmitError(err.message || "Gagal menyimpan logbook.");
      }
    } catch (err) {
      setSubmitError("Kesalahan jaringan saat menyimpan logbook.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Alert className="border-red-500/50 bg-red-500/10 text-red-600">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error || "Data tidak ditemukan."}</AlertDescription>
      </Alert>
    );
  }

  const months = Array.from({ length: data.totalMonths }, (_, i) => i + 1);
  const currentLog = data.logbooks.find(l => l.monthIndex === selectedMonth);
  const isAccepted = currentLog?.status === "accepted";
  const isRevision = currentLog?.status === "revision";
  const isPending = currentLog?.status === "pending";
  
  const isMonthLocked = (m: number) => {
    if (!data.startDate) return false;
    const start = new Date(data.startDate);
    const target = new Date(start.setMonth(start.getMonth() + (m - 1)));
    return new Date() < target;
  };

  const isCurrentMonthLocked = isMonthLocked(selectedMonth);
  const isReadOnly = isAccepted || isPending || isCurrentMonthLocked;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Sidebar Months */}
        <div className="w-full sm:w-64 shrink-0 space-y-2">
          <h3 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-purple" />
            Bulan Logbook
          </h3>
          <div className="flex flex-col gap-2">
            {months.map(m => {
              const log = data.logbooks.find(l => l.monthIndex === m);
              const isSelected = selectedMonth === m;
              const locked = isMonthLocked(m);
              
              let statusIcon = <div className="w-2 h-2 rounded-full bg-border" />;
              if (locked) statusIcon = <Lock className="w-3.5 h-3.5 text-muted-foreground" />;
              else if (log?.status === 'accepted') statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
              else if (log?.status === 'revision') statusIcon = <AlertCircle className="w-3.5 h-3.5 text-amber-500" />;
              else if (log?.status === 'pending') statusIcon = <ClockIcon className="w-3.5 h-3.5 text-blue-500" />;

              return (
                <button
                  key={m}
                  onClick={() => !locked && setSelectedMonth(m)}
                  className={`flex items-center justify-between p-3 rounded-lg text-sm font-semibold transition-all border ${
                    isSelected 
                      ? "bg-brand-purple/10 border-brand-purple text-brand-purple shadow-sm" 
                      : "bg-card border-border text-muted-foreground hover:bg-secondary"
                  } ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="flex items-center gap-2">
                    Bulan ke-{m}
                  </span>
                  {statusIcon}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-secondary/20 pb-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-xl font-heading font-bold flex items-center gap-2">
                    <Notebook className="w-5 h-5 text-brand-purple" />
                    Logbook Bulan ke-{selectedMonth}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1">
                    Isi kegiatan dan progress Anda selama sebulan terakhir. Minimal 200 kata total. 50 kata per pertanyaan.
                  </CardDescription>
                </div>
                {currentLog && (
                  <div className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    isAccepted ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                    isRevision ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                    "bg-blue-500/10 text-blue-600 border-blue-500/20"
                  }`}>
                    {currentLog.status}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {currentLog?.mentorFeedback && (
                <Alert className="border-amber-500/50 bg-amber-500/5 text-amber-600">
                  <FileEdit className="w-4 h-4 text-amber-600" />
                  <AlertTitle className="font-bold">Feedback / Catatan Mentor</AlertTitle>
                  <AlertDescription className="mt-1 text-xs">{currentLog.mentorFeedback}</AlertDescription>
                </Alert>
              )}

              {isCurrentMonthLocked && (
                <Alert className="border-border bg-secondary/50 text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  <AlertTitle className="font-bold">Bulan Terkunci</AlertTitle>
                  <AlertDescription className="mt-1 text-xs">Anda belum bisa mengakses logbook untuk bulan ini karena masa waktu angkatan belum mencapainya.</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">
                    1. How has your mentoring experience with your mentor been this past month?
                  </label>
                  <textarea
                    value={q1}
                    onChange={e => setQ1(e.target.value)}
                    disabled={isReadOnly}
                    className="w-full min-h-[80px] p-3 text-xs bg-background border border-input rounded-lg focus:ring-2 focus:ring-brand-purple outline-hidden resize-y"
                    placeholder="Ceritakan pengalaman mentoring Anda..."
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">
                    2. What have you worked on and what is the progress?
                  </label>
                  <textarea
                    value={q2}
                    onChange={e => setQ2(e.target.value)}
                    disabled={isReadOnly}
                    className="w-full min-h-[80px] p-3 text-xs bg-background border border-input rounded-lg focus:ring-2 focus:ring-brand-purple outline-hidden resize-y"
                    placeholder="Ceritakan apa saja yang sudah dikerjakan..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">
                    3. What challenges have you faced and what alternative solutions can you suggest to overcome them?
                  </label>
                  <textarea
                    value={q3}
                    onChange={e => setQ3(e.target.value)}
                    disabled={isReadOnly}
                    className="w-full min-h-[80px] p-3 text-xs bg-background border border-input rounded-lg focus:ring-2 focus:ring-brand-purple outline-hidden resize-y"
                    placeholder="Ceritakan tantangan dan solusi Anda..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">
                    4. What competencies have you developed and what you want to grow next month?
                  </label>
                  <textarea
                    value={q4}
                    onChange={e => setQ4(e.target.value)}
                    disabled={isReadOnly}
                    className="w-full min-h-[80px] p-3 text-xs bg-background border border-input rounded-lg focus:ring-2 focus:ring-brand-purple outline-hidden resize-y"
                    placeholder="Ceritakan kompetensi yang berkembang..."
                    required
                  />
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className={`text-xs font-bold flex items-center gap-1.5 ${totalWords >= 200 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                    Total Kata: {totalWords} / 200
                    {totalWords >= 200 && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  
                  {!isReadOnly && (
                    <button
                      type="submit"
                      disabled={isSubmitting || totalWords < 200}
                      className="px-4 py-2 bg-brand-purple text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-brand-purple-hover disabled:opacity-50 transition-all"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Kirim Logbook
                    </button>
                  )}
                  {isReadOnly && (
                    <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Lock className="w-4 h-4" /> Logbook dikunci
                    </div>
                  )}
                </div>
                
                {submitError && (
                  <p className="text-xs text-red-500 font-medium text-right mt-2">{submitError}</p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ClockIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
