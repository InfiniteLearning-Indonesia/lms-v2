"use client";

import { useState, useEffect } from "react";
import {
  Download,
  FileSpreadsheet,
  Layers,
  Loader2,
  Users,
  Search,
  CheckCircle2,
  Sparkles,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Program, Batch } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface AdminGradeRecapExportProps {
  programs: Program[];
  batches: Batch[];
}

export function AdminGradeRecapExport({ programs, batches }: AdminGradeRecapExportProps) {
  const [selectedProgramId, setSelectedProgramId] = useState<string>(programs[0]?.id || "");
  const [activePhase, setActivePhase] = useState<"micro" | "massive">("micro");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [competencies, setCompetencies] = useState<any[]>([]);
  const [rubrikAssessments, setRubrikAssessments] = useState<any[]>([]);
  const [competencyScores, setCompetencyScores] = useState<any[]>([]);
  const [rubrikScores, setRubrikScores] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceScores, setAttendanceScores] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!selectedProgramId && programs.length > 0) {
      setSelectedProgramId(programs[0].id);
    }
  }, [programs]);

  useEffect(() => {
    if (selectedProgramId) {
      fetchRecapData(selectedProgramId);
    }
  }, [selectedProgramId]);

  const fetchRecapData = async (programId: string) => {
    setIsLoading(true);
    try {
      // 1. Fetch competencies
      const compRes = await fetch(`${API_BASE_URL}/classes/competencies?programId=${programId}`, {
        credentials: "include",
      });
      if (compRes.ok) {
        const comps = await compRes.json();
        setCompetencies(comps);
      }

      // 2. Fetch rubrik assessments
      const raRes = await fetch(`${API_BASE_URL}/classes/programs/${programId}/rubrik-assessments`, {
        credentials: "include",
      });
      if (raRes.ok) {
        const ras = await raRes.json();
        setRubrikAssessments(ras);
      }

      // 3. Fetch competency scores
      const csRes = await fetch(`${API_BASE_URL}/classes/programs/${programId}/competencies/scores`, {
        credentials: "include",
      });
      if (csRes.ok) {
        const cScores = await csRes.json();
        setCompetencyScores(cScores);
      }

      // 4. Fetch rubrik scores
      const rsRes = await fetch(`${API_BASE_URL}/classes/programs/${programId}/rubrik-assessments/scores`, {
        credentials: "include",
      });
      if (rsRes.ok) {
        const rScores = await rsRes.json();
        setRubrikScores(rScores);
      }

      // 5. Fetch students enrolled in program
      const userRes = await fetch(`${API_BASE_URL}/users`, { credentials: "include" });
      if (userRes.ok) {
        const allUsers = await userRes.json();
        const studentList = allUsers.filter((u: any) => u.roles && u.roles.includes("student"));
        setStudents(studentList);
      }

      // 6. Fetch attendance scores for program's batch
      const currentProg = programs.find((p) => p.id === programId);
      if (currentProg && currentProg.batchId) {
        const attRes = await fetch(`${API_BASE_URL}/attendance/scores?batchId=${currentProg.batchId}`, {
          credentials: "include",
        });
        if (attRes.ok) {
          const attData = await attRes.json();
          setAttendanceScores(attData);
        }
      }
    } catch (err) {
      console.error("Error fetching recap data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const activePhaseUpper = activePhase === "micro" ? "Micro" : "Massive";
  const displayComps = competencies.filter((c) => c.phase === activePhaseUpper);
  const displayRAs = rubrikAssessments.filter((r) => r.phase === activePhaseUpper);
  const hasRAs = displayRAs.length > 0;

  const attComp = displayComps.find((c) => c.name?.toLowerCase().includes("attendance") && !c.name?.toLowerCase().includes("on"));
  const oncamComp = displayComps.find((c) => c.name?.toLowerCase().includes("attendance") && (c.name?.toLowerCase().includes("on cam") || c.name?.toLowerCase().includes("oncam") || c.name?.toLowerCase().includes("on-cam")));
  const regularComps = displayComps.filter(c => !c.name?.toLowerCase().includes("attendance"));

  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStudentCompScore = (studentId: string, compId: string): number => {
    const match = competencyScores.find((cs: any) => cs.studentId === studentId && cs.competencyId === compId);
    return match ? match.score : 65.0;
  };

  const getStudentRAScore = (studentId: string, raId: string): number => {
    const match = rubrikScores.find((rs: any) => rs.studentId === studentId && rs.rubrikAssessmentId === raId);
    return match ? match.score : 65.0;
  };

  const handleExportCSV = () => {
    if (filteredStudents.length === 0) return;

    const headers = [
      "No",
      "Nama Mentee",
      "Email",
      "Institusi",
      ...(attComp ? [`${attComp.name} (Syllabus)`] : []),
      ...(oncamComp ? [`${oncamComp.name} (Syllabus)`] : []),
      ...displayRAs.map((r) => `${r.name} (Rubrik)`),
      ...regularComps.map((c) => `${c.name} (Syllabus)`),
      "Rata-Rata Phase",
    ];

    const rows = filteredStudents.map((s, idx) => {
      const att = attendanceScores[s.id];
      const details = activePhase === "micro" ? att?.microDetails : att?.massiveDetails;

      const attScoreVal = activePhase === "micro" ? att?.microScore ?? 65.0 : att?.massiveScore ?? 65.0;
      const oncamScoreVal = details?.oncamScore ?? 65.0;

      const raScores = displayRAs.map((r) => getStudentRAScore(s.id, r.id));
      const compScores = regularComps.map((c) => getStudentCompScore(s.id, c.id));

      const allScores = [
        ...(attComp ? [attScoreVal] : []),
        ...(oncamComp ? [oncamScoreVal] : []),
        ...raScores,
        ...compScores,
      ];

      const avgScore = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 65.0;

      return [
        idx + 1,
        `"${s.name || ""}"`,
        `"${s.email || ""}"`,
        `"${s.institution || "-"}"`,
        ...(attComp ? [attScoreVal.toFixed(1)] : []),
        ...(oncamComp ? [oncamScoreVal.toFixed(1)] : []),
        ...raScores.map((sc) => sc.toFixed(1)),
        ...compScores.map((sc) => sc.toFixed(1)),
        avgScore.toFixed(1),
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const progName = programs.find((p) => p.id === selectedProgramId)?.name || "Program";
    link.setAttribute("download", `Rekap_Nilai_${progName}_Phase_${activePhaseUpper}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner & Program Selector */}
      <Card className="border-border shadow-xs bg-card overflow-hidden">
        <CardHeader className="border-b border-border bg-secondary/20 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-brand-purple/10 text-brand-purple border-brand-purple/30 text-[11px] font-bold">
                  Rekapitulasi Akademik
                </Badge>
              </div>
              <CardTitle className="font-heading font-extrabold text-xl text-foreground">
                Rekap Nilai Mentee (Export CSV / Excel)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Unduh dan pantau seluruh rekapitulasi penilaian mentee yang telah dirilis per fase program.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                className="h-10 px-3 rounded-lg border border-input bg-background text-xs font-semibold text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand-purple/50 cursor-pointer"
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.batchName || "Batch"})
                  </option>
                ))}
              </select>

              <Button
                onClick={handleExportCSV}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-2 cursor-pointer shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export .CSV / Excel
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-6">
          {/* Controls & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Tabs
              value={activePhase}
              onValueChange={(v) => setActivePhase(v as "micro" | "massive")}
              className="w-fit"
            >
              <TabsList className="bg-secondary p-1 rounded-lg border border-border">
                <TabsTrigger value="micro" className="text-xs font-semibold px-4 py-1.5 cursor-pointer">
                  Initial Assessment
                </TabsTrigger>
                <TabsTrigger value="massive" className="text-xs font-semibold px-4 py-1.5 cursor-pointer">
                  Final Assessment
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari nama mentee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          {/* Table Container */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
              <p className="text-xs font-medium">Memuat rekap nilai mentee...</p>
            </div>
          ) : (
            <div className="border border-border rounded-xl overflow-x-auto shadow-2xs">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-3 text-center w-12">No</th>
                    <th className="px-4 py-3">Nama Mentee</th>
                    {attComp && (
                      <th className="px-4 py-3 text-center border-l border-border bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        {attComp.name}
                      </th>
                    )}
                    {oncamComp && (
                      <th className="px-4 py-3 text-center border-l border-border bg-blue-500/10 text-blue-700 dark:text-blue-300">
                        {oncamComp.name}
                      </th>
                    )}
                    {displayRAs.map((r) => (
                      <th key={r.id} className="px-4 py-3 text-center border-l border-border">
                        {r.name}
                      </th>
                    ))}
                    {regularComps.map((c) => (
                      <th key={c.id} className="px-4 py-3 text-center border-l border-border">
                        {c.name}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center border-l border-border bg-brand-purple/10 text-brand-purple">
                      Rata-Rata
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={(hasRAs ? displayRAs.length : displayComps.length) + 4}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        Tidak ada data mentee ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s, idx) => {
                      const att = attendanceScores[s.id];
                      const details = activePhase === "micro" ? att?.microDetails : att?.massiveDetails;
                      
                      const attScoreVal = activePhase === "micro" ? att?.microScore ?? 65.0 : att?.massiveScore ?? 65.0;
                      const oncamScoreVal = details?.oncamScore ?? 65.0;

                      const raScores = displayRAs.map((r) => getStudentRAScore(s.id, r.id));
                      const compScores = regularComps.map((c) => getStudentCompScore(s.id, c.id));

                      const allScores = [
                        ...(attComp ? [attScoreVal] : []),
                        ...(oncamComp ? [oncamScoreVal] : []),
                        ...raScores,
                        ...compScores,
                      ];

                      const avgScore = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 65.0;

                      return (
                        <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 text-center text-muted-foreground font-semibold">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground">{s.name}</div>
                            <div className="text-[10px] text-muted-foreground">{s.email}</div>
                          </td>
                          {attComp && (
                            <td className="px-4 py-3 text-center border-l border-border font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                              {attScoreVal.toFixed(1)}
                            </td>
                          )}
                          {oncamComp && (
                            <td className="px-4 py-3 text-center border-l border-border font-bold text-blue-600 dark:text-blue-400 bg-blue-500/5">
                              {oncamScoreVal.toFixed(1)}
                            </td>
                          )}
                          {displayRAs.map((r) => {
                            const sc = getStudentRAScore(s.id, r.id);
                            return (
                              <td key={r.id} className="px-4 py-3 text-center border-l border-border font-medium">
                                {sc.toFixed(1)}
                              </td>
                            );
                          })}
                          {regularComps.map((c) => {
                            const sc = getStudentCompScore(s.id, c.id);
                            return (
                              <td key={c.id} className="px-4 py-3 text-center border-l border-border font-medium">
                                {sc.toFixed(1)}
                              </td>
                            );
                          })}
                          <td className="px-4 py-3 text-center border-l border-border font-extrabold text-brand-purple bg-brand-purple/5">
                            {avgScore.toFixed(1)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
