"use strict";
"use client";

import { useEffect, useState } from "react";
import { Notebook, Calendar, Loader2, AlertCircle, CheckCircle2, User, Search, FileEdit, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

export function MentorLogbook({ batchId }: { batchId: string }) {
  const [data, setData] = useState<{ totalMonths: number, students: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(1);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const fetchLogbooks = async () => {
    try {
      const res = await fetch(`http://localhost:7000/classes/batches/${batchId}/logbooks/mentor`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setError("Gagal memuat data logbook student.");
      }
    } catch (err) {
      setError("Kesalahan jaringan saat memuat logbook student.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) {
      fetchLogbooks();
    }
  }, [batchId]);

  const handleReview = async (logbookId: string, status: "accepted" | "revision") => {
    if (status === "revision" && !feedback.trim()) {
      alert("Harap isi feedback/catatan jika meminta revisi.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:7000/classes/batches/logbooks/${logbookId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback: feedback.trim() || undefined }),
        credentials: "include",
      });

      if (res.ok) {
        setFeedback("");
        await fetchLogbooks(); // Refresh data
      } else {
        const err = await res.json();
        alert(err.message || "Gagal memperbarui status logbook.");
      }
    } catch (err) {
      alert("Kesalahan jaringan saat menyimpan review.");
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

  const filteredStudents = data.students.filter(s => 
    s.student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedStudentObj = data.students.find(s => s.student.id === selectedStudentId);
  const months = Array.from({ length: data.totalMonths }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LIST STUDENT (Sidebar) */}
        <div className="w-full lg:w-1/3 shrink-0 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <UsersIcon className="w-5 h-5 text-brand-purple" />
            <h3 className="font-heading font-bold text-base">Student Binaan</h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama student..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredStudents.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-4">Tidak ada student ditemukan.</p>
            ) : (
              filteredStudents.map(obj => {
                const isSelected = selectedStudentId === obj.student.id;
                // Count pending logbooks
                const pendingCount = obj.logbooks.filter((l: any) => l.status === "pending").length;

                return (
                  <button
                    key={obj.student.id}
                    onClick={() => {
                      setSelectedStudentId(obj.student.id);
                      setSelectedMonth(1);
                      setFeedback("");
                    }}
                    className={`flex items-start justify-between p-3 rounded-lg text-left transition-all border ${
                      isSelected 
                        ? "bg-brand-purple/10 border-brand-purple shadow-sm" 
                        : "bg-card border-border hover:bg-secondary/60"
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-bold ${isSelected ? 'text-brand-purple' : 'text-foreground'}`}>
                        {obj.student.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{obj.class?.program?.name}</p>
                    </div>
                    {pendingCount > 0 && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {pendingCount} Pending
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* LOGBOOK DETAIL */}
        <div className="flex-1">
          {!selectedStudentObj ? (
            <div className="h-full min-h-[300px] border border-dashed border-border rounded-xl bg-secondary/20 flex flex-col items-center justify-center text-center p-6">
              <Notebook className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">Pilih student untuk melihat Logbook.</p>
            </div>
          ) : (
            <Card className="border-border bg-card shadow-sm h-full">
              <CardHeader className="border-b border-border bg-secondary/20 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-heading font-bold text-foreground">
                      Logbook {selectedStudentObj.student.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {selectedStudentObj.student.email}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <div className="flex border-b border-border bg-background overflow-x-auto">
                {months.map(m => {
                  const isSelected = selectedMonth === m;
                  const log = selectedStudentObj.logbooks.find((l: any) => l.monthIndex === m);
                  let dotColor = "bg-muted-foreground/30";
                  if (log?.status === 'accepted') dotColor = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
                  if (log?.status === 'revision') dotColor = "bg-amber-500";
                  if (log?.status === 'pending') dotColor = "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]";

                  return (
                    <button
                      key={m}
                      onClick={() => { setSelectedMonth(m); setFeedback(""); }}
                      className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
                        isSelected ? "border-brand-purple text-brand-purple bg-brand-purple/5" : "border-transparent text-muted-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                      Bulan {m}
                    </button>
                  );
                })}
              </div>

              <CardContent className="p-6">
                {(() => {
                  const currentLog = selectedStudentObj.logbooks.find((l: any) => l.monthIndex === selectedMonth);
                  
                  if (!currentLog) {
                    return (
                      <div className="text-center py-10">
                        <p className="text-sm text-muted-foreground italic">Student belum mengisi logbook bulan ini.</p>
                      </div>
                    );
                  }

                  const isPending = currentLog.status === "pending";
                  const isAccepted = currentLog.status === "accepted";
                  const isRevision = currentLog.status === "revision";

                  return (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between bg-secondary/40 p-3 rounded-lg border border-border">
                        <div className="text-xs font-semibold text-foreground">
                          Status: {" "}
                          <span className={`uppercase tracking-wider ${
                            isAccepted ? "text-emerald-500" : isRevision ? "text-amber-500" : "text-blue-500"
                          }`}>
                            {currentLog.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Disubmit pada: {new Date(currentLog.updatedAt).toLocaleString("id-ID")}
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="space-y-2 bg-background p-4 rounded-lg border border-border">
                          <label className="text-xs font-bold text-brand-purple">
                            1. How has your mentoring experience with your mentor been this past month?
                          </label>
                          <p className="text-xs text-foreground whitespace-pre-wrap">{currentLog.q1_experience}</p>
                        </div>
                        
                        <div className="space-y-2 bg-background p-4 rounded-lg border border-border">
                          <label className="text-xs font-bold text-brand-purple">
                            2. What have you worked on and what is the progress?
                          </label>
                          <p className="text-xs text-foreground whitespace-pre-wrap">{currentLog.q2_progress}</p>
                        </div>

                        <div className="space-y-2 bg-background p-4 rounded-lg border border-border">
                          <label className="text-xs font-bold text-brand-purple">
                            3. What challenges have you faced and what alternative solutions can you suggest to overcome them?
                          </label>
                          <p className="text-xs text-foreground whitespace-pre-wrap">{currentLog.q3_challenges}</p>
                        </div>

                        <div className="space-y-2 bg-background p-4 rounded-lg border border-border">
                          <label className="text-xs font-bold text-brand-purple">
                            4. What competencies have you developed and what you want to grow next month?
                          </label>
                          <p className="text-xs text-foreground whitespace-pre-wrap">{currentLog.q4_competencies}</p>
                        </div>
                      </div>

                      {currentLog.mentorFeedback && (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-amber-600" />
                            <h4 className="text-xs font-bold text-amber-600">Catatan/Feedback Terakhir Anda</h4>
                          </div>
                          <p className="text-xs text-amber-700/80">{currentLog.mentorFeedback}</p>
                        </div>
                      )}

                      {isPending && (
                        <div className="pt-6 border-t border-border space-y-4">
                          <h4 className="text-sm font-bold flex items-center gap-2">
                            <FileEdit className="w-4 h-4 text-brand-purple" />
                            Review Logbook
                          </h4>
                          <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Berikan feedback atau catatan kepada student jika perlu..."
                            className="w-full min-h-[80px] p-3 text-xs bg-background border border-input rounded-lg focus:ring-2 focus:ring-brand-purple outline-hidden resize-y"
                          />
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleReview(currentLog.id, "accepted")}
                              disabled={isSubmitting}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50 transition-all"
                            >
                              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              Accept Logbook
                            </button>
                            <button
                              onClick={() => handleReview(currentLog.id, "revision")}
                              disabled={isSubmitting || !feedback.trim()}
                              className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-amber-600 disabled:opacity-50 transition-all"
                            >
                              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
                              Minta Revisi
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}

function UsersIcon(props: any) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
