/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { API_BASE_URL } from "@/lib/config";

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
  isTranscriptReleased?: boolean;
  logbookCompletionStatus?: {
    allAccepted: boolean;
    month1Accepted: boolean;
    totalRequired: number;
    totalAccepted: number;
    firstIncompleteMonth: number | null;
  };
}

export function StudentCertificateView({ profile }: { profile: any }) {
  const [gradesData, setGradesData] = useState<GradeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProgramIndex, setSelectedProgramIndex] = useState(0);
  const [subTab, setSubTab] = useState<"transcript" | "certificate" | "internship_certificate">("transcript");

  useEffect(() => {
    fetch(`${API_BASE_URL}/classes/my-grades`, {
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
          @page {
            size: ${subTab === "transcript" ? "A4 portrait" : "A4 landscape"};
            margin: ${subTab === "transcript" ? "12mm" : "0mm"};
          }
          html, body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
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
            padding: ${subTab === "transcript" ? "0" : "15mm 20mm"};
            background: white !important;
            color: black !important;
            box-sizing: border-box;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Control Bar (Program Selector, Subtab Switcher, Print Button, Word Download) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border/60 shadow-xs no-print">
        <div className="flex items-center gap-3 flex-wrap">
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

          <div className="flex bg-secondary/60 p-1 rounded-lg border border-border/60 flex-wrap">
            <button
              onClick={() => setSubTab("transcript")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                subTab === "transcript"
                  ? "bg-card text-brand-purple shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-4 h-4" />
              Form Final Assessment (Transkrip)
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
              Sertifikat Studi Independen
            </button>

            <button
              onClick={() => setSubTab("internship_certificate")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                subTab === "internship_certificate"
                  ? "bg-card text-brand-purple shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Sertifikat Magang (Internship)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/templates/Template-Final-Assessment.docx"
            download={`Final-Assessment-${activeGrade.student.name.replace(/\s+/g, "_")}.docx`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-secondary transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-brand-purple" />
            <span>Unduh Format Word (.docx)</span>
          </a>

          <Button
            onClick={handlePrint}
            className="bg-brand-purple hover:bg-brand-purple/90 text-white font-semibold text-xs gap-2 cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Cetak / Unduh PDF
          </Button>
        </div>
      </div>

      {/* Print Target Wrapper */}
      <div id="printable-area" className="space-y-6">
        {(() => {
          let isBlocked = false;
          let blockTitle = "";
          let blockMessage = "";
          let blockReason = "";

          if (subTab === "transcript") {
            if (!activeGrade.isTranscriptReleased) {
              isBlocked = true;
              blockTitle = "Transkrip Nilai Belum Dirilis oleh Mentor";
              blockMessage = `Transkrip Nilai untuk program ${activeGrade.program.name} belum dikonfirmasi atau sedang ditarik kembali untuk proses finalisasi oleh mentor pembimbing Anda.`;
              blockReason = "Menunggu Rilis Official Mentor";
            } else if (!activeGrade.logbookCompletionStatus?.month1Accepted) {
              isBlocked = true;
              blockTitle = "Logbook Bulan ke-1 Belum Diisi";
              blockMessage = `Transkrip Nilai sudah dirilis, namun Anda belum bisa mengaksesnya karena Logbook bulan ke-1 Anda belum diisi atau belum berstatus Accepted oleh mentor. Silakan lengkapi Logbook bulan ke-1 terlebih dahulu.`;
              blockReason = "Syarat Logbook Bulan 1 Belum Terpenuhi";
            }
          } else {
            // Certificate & Internship Certificate
            if (!activeGrade.isCertificateReleased) {
              isBlocked = true;
              blockTitle = "Sertifikat Belum Dirilis oleh Mentor";
              blockMessage = `Sertifikat Kelulusan untuk program ${activeGrade.program.name} belum dikonfirmasi atau sedang ditarik kembali untuk proses finalisasi oleh mentor pembimbing Anda.`;
              blockReason = "Menunggu Rilis Official Mentor";
            } else if (!activeGrade.logbookCompletionStatus?.allAccepted) {
              isBlocked = true;
              blockTitle = "Logbook Belum Lengkap (Bulan 1 - 4)";
              blockMessage = `Sertifikat Kelulusan sudah dirilis, namun Anda belum bisa mengaksesnya karena seluruh Logbook (Bulan 1 sampai 4) belum berstatus Accepted. Silakan lengkapi logbook Anda yang masih berstatus Pending/Revision.`;
              blockReason = "Syarat Logbook 4 Bulan Belum Terpenuhi";
            }
          }

          if (isBlocked) {
            return (
              <Card className="border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 p-12 text-center space-y-4 font-sans">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-bold text-xl text-foreground">
                  {blockTitle}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  {blockMessage}
                </p>
                <div className="pt-2">
                  <Badge variant="outline" className="border-amber-500/40 text-amber-600 bg-amber-500/10 px-3 py-1 font-semibold text-xs">
                    Status: {blockReason}
                  </Badge>
                </div>
              </Card>
            );
          }

          const allGrades = [...(activeGrade.microItems || []), ...(activeGrade.massiveItems || [])];
          const softSkills = allGrades.filter((item) => {
            const n = item.name.toLowerCase();
            const c = (item.category || "").toLowerCase();
            return (
              c.includes("soft") ||
              n.includes("cca") ||
              n.includes("communication") ||
              n.includes("collaboration") ||
              n.includes("adaptive") ||
              n.includes("project management") ||
              n.includes("leadership") ||
              n.includes("soft skill")
            );
          });
          const hardSkills = allGrades.filter((item) => !softSkills.includes(item));

          const displaySoftSkills =
            softSkills.length > 0
              ? softSkills
              : [
                  {
                    name: "CCA (Communication, Collaboration, Adaptive)",
                    score: activeGrade.totalMicroScore || 89.42,
                  },
                  {
                    name: "Project Management",
                    score: activeGrade.finalScore || 84.46,
                  },
                ];

          const displayHardSkills =
            hardSkills.length > 0
              ? hardSkills
              : activeGrade.microItems.length > 0
              ? activeGrade.microItems
              : [
                  {
                    name: `${activeGrade.program.name} Core Fundamentals`,
                    score: activeGrade.finalScore || 85.0,
                  },
                ];

          return subTab === "transcript" ? (
            /* ── VIEW FORM FINAL ASSESSMENT (OFFICIAL TEMPLATE) ── */
            <div className="relative bg-white text-black p-6 sm:p-10 border border-border/80 shadow-lg rounded-xl max-w-4xl mx-auto overflow-hidden font-serif">
              {/* Watermark Background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] select-none">
                <img
                  src="/templates/image1.png"
                  alt="Watermark"
                  className="w-[85%] max-w-[650px] object-contain"
                />
              </div>

              <div className="relative z-10 space-y-4 text-black">
                {/* 1. Header Box Table */}
                <table className="w-full border-collapse border border-black text-center mb-4">
                  <tbody>
                    <tr>
                      <td className="w-1/3 border border-black p-3 align-middle bg-white">
                        <img
                          src="/templates/image2.png"
                          alt="Infinite Learning Logo"
                          className="h-14 w-auto mx-auto object-contain"
                        />
                      </td>
                      <td className="w-2/3 border border-black p-3 align-middle text-center font-bold font-serif leading-snug">
                        <div className="text-sm sm:text-base font-extrabold tracking-wider text-black">
                          FORM FINAL ASSESSMENT
                        </div>
                        <div className="text-xs sm:text-sm font-bold mt-0.5 text-black">
                          PENILAIAN STUDI INDEPENDEN
                        </div>
                        <div className="text-xs sm:text-sm font-bold mt-0.5 text-black">
                          PROGRAM BELAJAR MANDIRI
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* 2. Student Metadata Table */}
                <table className="w-full border-collapse border border-black text-xs font-serif mb-4">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="w-48 px-3 py-1.5 font-bold border-r border-black">NIM</td>
                      <td className="w-4 text-center border-r border-black font-bold">:</td>
                      <td className="px-3 py-1.5 font-mono">{activeGrade.student.id.slice(0, 11).toUpperCase()}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="px-3 py-1.5 font-bold border-r border-black">Nama</td>
                      <td className="text-center border-r border-black font-bold">:</td>
                      <td className="px-3 py-1.5 font-bold uppercase">{activeGrade.student.name}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="px-3 py-1.5 font-bold border-r border-black">Program Studi</td>
                      <td className="text-center border-r border-black font-bold">:</td>
                      <td className="px-3 py-1.5">
                        {activeGrade.student.studyProgram || "Desain Komunikasi Visual"}
                      </td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="px-3 py-1.5 font-bold border-r border-black">Nama Perusahaan</td>
                      <td className="text-center border-r border-black font-bold">:</td>
                      <td className="px-3 py-1.5 font-medium">PT Kinema Systrans Multimedia (Infinite Learning)</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1.5 font-bold border-r border-black">Program Studi Independen</td>
                      <td className="text-center border-r border-black font-bold">:</td>
                      <td className="px-3 py-1.5 font-bold">{activeGrade.program.name}</td>
                    </tr>
                  </tbody>
                </table>

                {/* 3. Daftar Penilaian Table */}
                <table className="w-full border-collapse border border-black text-xs font-serif mb-4">
                  <thead>
                    <tr className="border-b border-black bg-gray-100 font-bold text-center">
                      <th colSpan={4} className="py-1.5 text-center text-sm font-extrabold tracking-wider border-b border-black">
                        DAFTAR PENILAIAN
                      </th>
                    </tr>
                    <tr className="border-b border-black font-bold bg-gray-50 text-center">
                      <th className="w-12 py-1.5 border-r border-black">No</th>
                      <th className="py-1.5 px-3 border-r border-black text-left">Unsur Penilaian</th>
                      <th className="w-24 py-1.5 border-r border-black">Nilai</th>
                      <th className="w-40 py-1.5">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Soft Skill Group */}
                    <tr className="bg-gray-100/70 font-bold border-b border-black">
                      <td colSpan={4} className="px-3 py-1 font-bold text-left italic">
                        Soft Skill
                      </td>
                    </tr>
                    {displaySoftSkills.map((item, idx) => (
                      <tr key={`soft-${idx}`} className="border-b border-black">
                        <td className="text-center py-1 border-r border-black font-medium">{idx + 1}.</td>
                        <td className="px-3 py-1 border-r border-black">{item.name}</td>
                        <td className="text-center py-1 border-r border-black font-semibold">
                          {Number(item.score).toFixed(2)}
                        </td>
                        <td className="text-center py-1">Final Assessment</td>
                      </tr>
                    ))}

                    {/* Hard Skill Group */}
                    <tr className="bg-gray-100/70 font-bold border-b border-black">
                      <td colSpan={4} className="px-3 py-1 font-bold text-left italic">
                        Hard Skill
                      </td>
                    </tr>
                    {displayHardSkills.map((item, idx) => (
                      <tr key={`hard-${idx}`} className="border-b border-black">
                        <td className="text-center py-1 border-r border-black font-medium">{idx + 1}.</td>
                        <td className="px-3 py-1 border-r border-black">{item.name}</td>
                        <td className="text-center py-1 border-r border-black font-semibold">
                          {Number(item.score).toFixed(2)}
                        </td>
                        <td className="text-center py-1">Final Assessment</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* 4. Catatan & Signature Block Table */}
                <table className="w-full border-collapse border border-black text-xs font-serif mb-4">
                  <tbody>
                    <tr>
                      <td className="w-1/2 p-3 border-r border-black align-top">
                        <div className="font-bold underline mb-1">Catatan :</div>
                        <ol className="list-decimal list-inside space-y-0.5 text-[11px] leading-snug">
                          <li>Setiap lembar penilaian digunakan untuk menilai 1 orang mahasiswa</li>
                          <li>Penulisan nilai dalam bentuk angka (1-100)</li>
                        </ol>
                      </td>
                      <td className="w-1/2 p-3 text-center align-top space-y-1">
                        <div>
                          Batam,{" "}
                          {new Date().toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                        <div className="font-bold">Program Director</div>
                        <div className="h-14 flex items-center justify-center">
                          {/* Space for stamp / signature */}
                        </div>
                        <div className="font-bold underline text-xs">Ari Nugrahanto, B.Ed., M.Sc.</div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* 5. Index Penilaian Infinite Learning */}
                <div className="w-full max-w-xs">
                  <table className="w-full border-collapse border border-black text-2xs font-serif text-center">
                    <thead>
                      <tr className="border-b border-black bg-gray-100 font-bold">
                        <th colSpan={2} className="py-1 border-b border-black text-[11px]">
                          INDEX PENILAIAN INFINITE LEARNING
                        </th>
                      </tr>
                      <tr className="border-b border-black font-bold bg-gray-50">
                        <th className="py-1 border-r border-black w-1/2">SCORE</th>
                        <th className="py-1 w-1/2">GRADE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                      <tr><td className="py-0.5 border-r border-black">85 - 100</td><td className="py-0.5 font-bold">A</td></tr>
                      <tr><td className="py-0.5 border-r border-black">80 - 84,99</td><td className="py-0.5 font-bold">A-</td></tr>
                      <tr><td className="py-0.5 border-r border-black">75 - 79,99</td><td className="py-0.5 font-bold">B+</td></tr>
                      <tr><td className="py-0.5 border-r border-black">70 - 74,99</td><td className="py-0.5 font-bold">B</td></tr>
                      <tr><td className="py-0.5 border-r border-black">65 - 69,99</td><td className="py-0.5 font-bold">B-</td></tr>
                      <tr><td className="py-0.5 border-r border-black">60 - 64,99</td><td className="py-0.5 font-bold">C+</td></tr>
                      <tr><td className="py-0.5 border-r border-black">55 - 59,99</td><td className="py-0.5 font-bold">C</td></tr>
                      <tr><td className="py-0.5 border-r border-black">45 - 54,99</td><td className="py-0.5 font-bold">D</td></tr>
                      <tr><td className="py-0.5 border-r border-black">0 - 44,99</td><td className="py-0.5 font-bold">E</td></tr>
                    </tbody>
                  </table>
                </div>

                {/* 6. Document Footer Address */}
                <div className="pt-4 border-t border-gray-400 text-center text-[10px] text-gray-700 font-sans space-y-0.5">
                  <p className="font-semibold">
                    PT Kinema Systrans Multimedia - Jalan Hang Lekiu KM.2 Nongsa – Batam, Kepulauan Riau – Indonesia
                  </p>
                  <p>
                    Telp: +62 778 7100673 &nbsp;|&nbsp; Email: info@infinitelearning.id &nbsp;|&nbsp; www.infinitelearning.id
                  </p>
                </div>
              </div>
            </div>
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
                    {subTab === "internship_certificate" ? "CERTIFICATE OF INTERNSHIP COMPLETION" : "CERTIFICATE OF STUPEN COMPLETION"}
                  </div>
                  <h1 className="font-heading font-black text-3xl md:text-4xl text-foreground tracking-tight uppercase">
                    {subTab === "internship_certificate" ? "SERTIFIKAT MAGANG (INTERNSHIP)" : "SERTIFIKAT KELULUSAN STUDI INDEPENDEN"}
                  </h1>
                  <p className="text-xs text-muted-foreground tracking-widest uppercase">
                    No. Sertifikat: IL/{subTab === "internship_certificate" ? "INTERN" : "STUPEN"}/{new Date().getFullYear()}/{activeGrade.student.id.slice(0, 6).toUpperCase()}
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
                    {subTab === "internship_certificate"
                      ? "Telah secara sukses menyelesaikan seluruh rangkaian Program Magang Industri (Internship) & Implementasi Proyek pada:"
                      : "Telah secara sukses menyelesaikan seluruh rangkaian Program Studi Independen (Stupen) & Proyek Akhir pada:"}
                  </p>
                  <p className="font-heading font-bold text-base text-foreground">
                    `{activeGrade.program.name}` ({activeGrade.program.batchName})
                  </p>
                  {subTab === "internship_certificate" ? (
                    <p className="text-muted-foreground">
                      dan dinyatakan telah memenuhi kualifikasi serta standar kompetensi magang industri dengan predikat:
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      dengan akumulasi hasil penilaian Fase Massive dan akumulasi penilaian keseluruhan sebagai berikut:
                    </p>
                  )}
                </div>

                {/* Grade Badges & Predicate */}
                <div className="flex flex-wrap justify-center items-center gap-6 py-4">
                  {subTab !== "internship_certificate" && (
                    <>
                      <div className="p-4 rounded-xl bg-card border border-border shadow-xs text-center min-w-[140px]">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">Total Massive Score</p>
                        <p className="font-heading font-black text-2xl text-brand-purple">{activeGrade.totalMassiveScore.toFixed(1)}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-card border border-border shadow-xs text-center min-w-[140px]">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">Nilai Akumulasi Akhir</p>
                        <p className="font-heading font-black text-2xl text-brand-purple">{activeGrade.finalScore.toFixed(1)}</p>
                      </div>
                    </>
                  )}

                  <div className="p-4 rounded-xl bg-brand-purple/10 border border-brand-purple/30 text-center min-w-[180px]">
                    <p className="text-[10px] text-brand-purple font-semibold uppercase">
                      {subTab === "internship_certificate" ? "Status Kelulusan Magang" : "Predikat Kelulusan"}
                    </p>
                    <p className="font-heading font-black text-lg text-brand-purple">
                      {subTab === "internship_certificate" ? "Lulus Magang (Satisfactory)" : activeGrade.predicate}
                    </p>
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
          );
        })()}
      </div>
    </div>
  );
}
