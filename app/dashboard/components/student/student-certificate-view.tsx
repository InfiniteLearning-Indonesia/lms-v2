"use client";

import { useEffect, useState, useRef } from "react";
import { Award, Download, FileText, GraduationCap, Loader2, Printer, CheckCircle2, Sparkles, Building2, User, Calendar, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GradeData {
  student: {
    id: string;
    name: string;
    email: string;
    institution: string;
    studyProgram: string;
  };
  program: {
    id: string;
    name: string;
    batchName: string;
  };
  mentor: {
    name: string;
    email: string;
  } | null;
  microItems: Array<{
    id: string;
    name: string;
    category: string;
    phase: string;
    score: number;
  }>;
  totalMicroScore: number;
  massiveItems: Array<{
    id: string;
    name: string;
    category: string;
    phase: string;
    score: number;
  }>;
  totalMassiveScore: number;
  finalScore: number;
  predicate: string;
  isCertificateReleased?: boolean;
}

export function StudentCertificateView({ profile }: { profile: any }) {
  const [gradesData, setGradesData] = useState<GradeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProgramIndex, setSelectedProgramIndex] = useState(0);
  const [subTab, setSubTab] = useState<"transcript" | "certificate">("transcript");

  useEffect(() => {
    fetch("http://localhost:7000/classes/my-grades", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setGradesData(data);
        }
      })
      .catch((err) => console.error("Error fetching grades:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
        <p className="text-sm text-muted-foreground font-medium">Memuat data nilai & sertifikat...</p>
      </div>
    );
  }

  if (gradesData.length === 0) {
    return (
      <Card className="border border-border/60 shadow-xs">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-purple/10 flex items-center justify-center mb-4">
            <Award className="w-8 h-8 text-brand-purple" />
          </div>
          <h3 className="font-heading font-bold text-lg text-foreground mb-1">
            Belum Ada Transkrip & Sertifikat
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Anda belum terdaftar pada program aktif atau penilaian dari mentor belum selesai diinput.
          </p>
        </CardContent>
      </Card>
    );
  }

  const activeGrade = gradesData[selectedProgramIndex] || gradesData[0];

  return (
    <div className="space-y-6 font-sans">
      {/* Printable CSS Rules */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Control Bar (Program Selector, Subtab Switcher, Print Button) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border/60 shadow-xs no-print">
        <div className="flex items-center gap-3">
          {gradesData.length > 1 && (
            <select
              value={selectedProgramIndex}
              onChange={(e) => setSelectedProgramIndex(Number(e.target.value))}
              className="h-10 px-3 rounded-lg border border-input bg-background text-sm font-semibold text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand-purple/50"
            >
              {gradesData.map((g, idx) => (
                <option key={idx} value={idx}>
                  {g.program.name} ({g.program.batchName})
                </option>
              ))}
            </select>
          )}

          <div className="flex bg-secondary/60 p-1 rounded-lg border border-border/60">
            <button
              onClick={() => setSubTab("transcript")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                subTab === "transcript"
                  ? "bg-card text-brand-purple shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-4 h-4" />
              Transkrip Nilai (Micro)
            </button>

            <button
              onClick={() => setSubTab("certificate")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                subTab === "certificate"
                  ? "bg-card text-brand-purple shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Award className="w-4 h-4" />
              Sertifikat Kelulusan (Massive)
            </button>
          </div>
        </div>

        <Button
          onClick={handlePrint}
          className="bg-brand-purple hover:bg-brand-purple/90 text-white font-semibold text-xs gap-2 cursor-pointer shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Cetak / Unduh PDF
        </Button>
      </div>

      {/* Print Target Wrapper */}
      <div id="printable-area" className="space-y-6">
        {subTab === "transcript" ? (
          /* ── VIEW TRANSKRIP NILAI (MICRO PHASE) ── */
          <Card className="border border-border/60 shadow-md bg-card overflow-hidden">
            <CardHeader className="border-b border-border/60 bg-secondary/20 pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2 bg-brand-purple/10 text-brand-purple border-brand-purple/30 text-[11px] font-bold">
                    Official Transcript
                  </Badge>
                  <CardTitle className="font-heading font-extrabold text-2xl text-foreground">
                    Transkrip Nilai Hasil Belajar
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1">
                    Fase Micro Learning — Program {activeGrade.program.name}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <span className="font-heading font-black text-xl text-brand-purple tracking-wide">
                    INFINITE LEARNING
                  </span>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    ID: TR-{activeGrade.student.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Mentee Metadata Header Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-secondary/30 border border-border/40 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4 text-brand-purple" />
                    <span className="font-semibold text-foreground">Nama Mentee:</span>
                    <span className="font-bold text-foreground">{activeGrade.student.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="w-4 h-4 text-brand-purple" />
                    <span className="font-semibold text-foreground">Instansi / Kampus:</span>
                    <span>{activeGrade.student.institution}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GraduationCap className="w-4 h-4 text-brand-purple" />
                    <span className="font-semibold text-foreground">Program & Batch:</span>
                    <span>{activeGrade.program.name} ({activeGrade.program.batchName})</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-brand-purple" />
                    <span className="font-semibold text-foreground">Tanggal Terbit:</span>
                    <span>{new Date().toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Grades Table */}
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-secondary/60 text-muted-foreground font-semibold border-b border-border uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 w-12 text-center">No</th>
                      <th className="px-4 py-3">Mata Kuliah / Rubrik Assessment</th>
                      <th className="px-4 py-3">Tipe Rubrik</th>
                      <th className="px-4 py-3 text-center">Fase</th>
                      <th className="px-4 py-3 text-center">Nilai Akhir</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {activeGrade.microItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.category}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className="text-[10px] bg-secondary text-foreground">
                            Micro
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-brand-purple text-sm">
                          {item.score.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Lulus
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-brand-purple/5 border-t border-brand-purple/20 font-bold">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right text-brand-purple font-heading text-sm">
                        TOTAL RATA-RATA FASE MICRO:
                      </td>
                      <td className="px-4 py-3 text-center text-brand-purple font-black text-base">
                        {activeGrade.totalMicroScore.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-center text-emerald-600 font-bold">
                        Lulus Micro
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signature Block */}
              <div className="pt-8 flex justify-between items-end text-xs">
                <div>
                  <p className="text-muted-foreground mb-1">Mentor Pembimbing:</p>
                  <p className="font-bold text-foreground text-sm">{activeGrade.mentor?.name || "Tim Academic Infinite Learning"}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground mb-1">Nongsa Digital Park, Batam</p>
                  <p className="font-extrabold text-foreground text-sm">PT Infinite Learning Indonesia</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : !activeGrade.isCertificateReleased ? (
          <Card className="border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 p-12 text-center space-y-4 font-sans">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="font-heading font-bold text-xl text-foreground">
              Sertifikat Belum Dirilis oleh Mentor
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Sertifikat Kelulusan Fase Massive untuk program <strong className="text-foreground">{activeGrade.program.name}</strong> belum dikonfirmasi atau dirilis secara resmi oleh mentor pembimbing Anda. Transkrip nilai Fase Micro tetap dapat diakses pada tab Transkrip.
            </p>
            <div className="pt-2">
              <Badge variant="outline" className="border-amber-500/40 text-amber-600 bg-amber-500/10 px-3 py-1 font-semibold text-xs">
                Status: Menunggu Konfirmasi Kelulusan Mentor
              </Badge>
            </div>
          </Card>
        ) : (
          /* ── VIEW SERTIFIKAT KELULUSAN (MASSIVE PHASE) ── */
          <Card className="border-4 border-brand-purple/40 shadow-xl bg-card relative overflow-hidden p-8">
            <div className="absolute inset-0 bg-radial from-brand-purple/5 to-transparent pointer-events-none" />
            
            {/* Certificate Decorative Border Container */}
            <div className="border-2 border-dashed border-brand-purple/30 p-8 rounded-2xl relative space-y-8 text-center">
              
              {/* Header Certificate */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  CERTIFICATE OF COMPLETION
                </div>
                <h1 className="font-heading font-black text-3xl md:text-4xl text-foreground tracking-tight uppercase">
                  SERTIFIKAT KELULUSAN
                </h1>
                <p className="text-xs text-muted-foreground tracking-widest uppercase">
                  No. Sertifikat: IL/CERT/{new Date().getFullYear()}/{activeGrade.student.id.slice(0, 6).toUpperCase()}
                </p>
              </div>

              {/* Mentee Name Section */}
              <div className="space-y-2 py-4">
                <p className="text-xs text-muted-foreground italic">Diberikan secara resmi kepada:</p>
                <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-brand-purple underline decoration-brand-purple/30 decoration-2 underline-offset-8">
                  {activeGrade.student.name}
                </h2>
                <p className="text-xs font-medium text-muted-foreground pt-2">
                  {activeGrade.student.institution}
                </p>
              </div>

              {/* Statement Section */}
              <div className="max-w-2xl mx-auto space-y-2 text-xs leading-relaxed text-foreground">
                <p>
                  Telah secara sukses menyelesaikan seluruh rangkaian program kompetensi pembelajaran mandiri & proyek akhir pada:
                </p>
                <p className="font-heading font-bold text-base text-foreground">
                  "{activeGrade.program.name}" ({activeGrade.program.batchName})
                </p>
                <p className="text-muted-foreground">
                  dengan akumulasi hasil penilaian Fase Massive dan akumulasi penilaian keseluruhan sebagai berikut:
                </p>
              </div>

              {/* Grade Badges & Predicate */}
              <div className="flex flex-wrap justify-center items-center gap-6 py-4">
                <div className="p-4 rounded-xl bg-card border border-border shadow-xs text-center min-w-[140px]">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">Total Massive Score</p>
                  <p className="font-heading font-black text-2xl text-brand-purple">{activeGrade.totalMassiveScore.toFixed(1)}</p>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border shadow-xs text-center min-w-[140px]">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">Nilai Akumulasi Akhir</p>
                  <p className="font-heading font-black text-2xl text-brand-purple">{activeGrade.finalScore.toFixed(1)}</p>
                </div>

                <div className="p-4 rounded-xl bg-brand-purple/10 border border-brand-purple/30 text-center min-w-[160px]">
                  <p className="text-[10px] text-brand-purple font-semibold uppercase">Predikat Kelulusan</p>
                  <p className="font-heading font-black text-lg text-brand-purple">{activeGrade.predicate}</p>
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-8 flex justify-between items-end max-w-3xl mx-auto text-xs">
                <div className="text-center">
                  <p className="font-bold text-foreground">{activeGrade.mentor?.name || "Mentor Program"}</p>
                  <div className="w-32 h-0.5 bg-border mx-auto my-2" />
                  <p className="text-[10px] text-muted-foreground">Program Mentor</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-brand-purple/20 border-2 border-brand-purple flex items-center justify-center mb-1">
                    <Award className="w-8 h-8 text-brand-purple" />
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground">VERIFIED CERTIFICATE</span>
                </div>

                <div className="text-center">
                  <p className="font-bold text-foreground">Director Infinite Learning</p>
                  <div className="w-32 h-0.5 bg-border mx-auto my-2" />
                  <p className="text-[10px] text-muted-foreground">PT Infinite Learning Indonesia</p>
                </div>
              </div>

            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
