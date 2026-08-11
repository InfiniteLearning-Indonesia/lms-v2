"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Download,
  FileSpreadsheet,
  Loader2,
  Users,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Program, Batch } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";

interface AdminGradeRecapExportProps {
  programs: Program[];
  batches: Batch[];
}

export function AdminGradeRecapExport({ programs, batches }: AdminGradeRecapExportProps) {
  const displayPrograms = useMemo(() => {
    const active = programs.filter(
      (p: any) => p.activeBatch != null || p.batch?.status === "active"
    );
    return active.length > 0 ? active : programs;
  }, [programs]);

  const [selectedProgramId, setSelectedProgramId] = useState<string>(programs[0]?.id || "");
  const [activePhase, setActivePhase] = useState<"micro" | "massive">("micro");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [competencies, setCompetencies] = useState<any[]>([]);
  const [rubrikAssessments, setRubrikAssessments] = useState<any[]>([]);
  const [competencyScores, setCompetencyScores] = useState<any[]>([]);
  const [rubrikScores, setRubrikScores] = useState<any[]>([]);
  const [externalScores, setExternalScores] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceScores, setAttendanceScores] = useState<Record<string, any>>({});

  // Release status
  const [showSyllabusColumns, setShowSyllabusColumns] = useState(true);

  useEffect(() => {
    if (displayPrograms.length > 0) {
      if (!selectedProgramId || !displayPrograms.find((p) => p.id === selectedProgramId)) {
        setSelectedProgramId(displayPrograms[0].id);
      }
    }
  }, [displayPrograms, selectedProgramId]);

  const handleProgramChange = (val: string) => {
    setSelectedProgramId(val);
    setHasFetchedData(false);
  };

  const fetchRecapData = async (programId: string) => {
    if (!programId) return;
    setIsLoading(true);
    try {
      // 1. Get fresh program data for students and release status
      const progListRes = await fetch(`${API_BASE_URL}/classes/programs-list`, {
        credentials: "include",
      });
      if (progListRes.ok) {
        const progList = await progListRes.json();
        const matchedProg = (progList.programs || progList || []).find((p: any) => p.id === programId);
        setStudents(matchedProg?.students || []);
      } else {
        const selectedProg = programs.find((p) => p.id === programId);
        setStudents(selectedProg?.students || []);
      }

      // 2. Fetch competencies
      const compRes = await fetch(`${API_BASE_URL}/classes/competencies?programId=${programId}`, {
        credentials: "include",
      });
      if (compRes.ok) {
        const comps = await compRes.json();
        setCompetencies(comps);
      }

      // 3. Fetch rubrik assessments
      const raRes = await fetch(`${API_BASE_URL}/classes/programs/${programId}/rubrik-assessments`, {
        credentials: "include",
      });
      if (raRes.ok) {
        const ras = await raRes.json();
        setRubrikAssessments(ras);
      }

      // 4. Fetch competency scores
      const csRes = await fetch(`${API_BASE_URL}/classes/programs/${programId}/competencies/scores`, {
        credentials: "include",
      });
      if (csRes.ok) {
        const cScores = await csRes.json();
        setCompetencyScores(cScores);
      }

      // 5. Fetch rubrik scores (external/imported)
      const rsRes = await fetch(`${API_BASE_URL}/classes/programs/${programId}/rubrik-assessments/scores`, {
        credentials: "include",
      });
      if (rsRes.ok) {
        const rScores = await rsRes.json();
        setRubrikScores(rScores);
        setExternalScores(rScores);
      }

      // 6. Fetch attendance scores for program's batch
      const currentProg = programs.find((p) => p.id === programId);
      const targetBatchId = currentProg?.batch?.id || currentProg?.activeBatch?.id || currentProg?.batchId;
      if (targetBatchId) {
        const attRes = await fetch(`${API_BASE_URL}/attendance/scores?batchId=${targetBatchId}`, {
          credentials: "include",
        });
        if (attRes.ok) {
          const attData = await attRes.json();
          setAttendanceScores(attData.scores || attData);
        }
      }

      setHasFetchedData(true);
    } catch (err) {
      console.error("Error fetching recap data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const activePhaseUpper = activePhase === "micro" ? "Micro" : "Massive";
  const displayComps = competencies.filter((c) => c.phase === activePhaseUpper);
  const displayRAs = rubrikAssessments.filter((r) => r.phase === activePhaseUpper);

  const attComp = competencies.find((c) => c.name?.toLowerCase().includes("attendance") && !c.name?.toLowerCase().includes("on"));
  const oncamComp = competencies.find((c) => c.name?.toLowerCase().includes("attendance") && (c.name?.toLowerCase().includes("on cam") || c.name?.toLowerCase().includes("oncam") || c.name?.toLowerCase().includes("on-cam")));
  const regularComps = displayComps.filter(c => !c.name?.toLowerCase().includes("attendance"));

  // Sort and filter students
  const filteredAndSortedStudents = useMemo(() => {
    let result = [...students];
    if (searchQuery) {
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    result.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
    return result;
  }, [students, searchQuery, sortOrder]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOrder, selectedProgramId, activePhase]);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedStudents, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedStudents.length / ITEMS_PER_PAGE);

  // Release lock logic
  const ensureMinScore = (val: number) => {
    if (!val || isNaN(val) || val < 65) return 65;
    return Math.min(100, val);
  };

  const getStudentCompScore = (studentId: string, compId: string): number => {
    const match = competencyScores.find((cs: any) => cs.studentId === studentId && cs.competencyId === compId);
    return match ? ensureMinScore(match.score) : 65.0;
  };

  // Calculate RA score (matching mentor logic)
  const calculateRAScore = (studentId: string, ra: any): number => {
    if (!ra) return 65;

    // 1. Check imported external score
    if (externalScores && externalScores.length > 0) {
      const ext = externalScores.find(
        (s: any) => s.studentId === studentId && s.rubrikAssessmentId === ra.id
      );
      if (ext && ext.score !== undefined && ext.score !== null) {
        return ensureMinScore(parseFloat(ext.score) || 65);
      }
    }

    let total = 0;
    let hasComponents = false;

    // 2. Weighted competencies
    if (ra.competencies && Array.isArray(ra.competencies) && ra.competencies.length > 0) {
      hasComponents = true;
      for (const item of ra.competencies) {
        const compScore = getStudentCompScore(studentId, item.competencyId);
        const weight = parseFloat(item.weight) || 0;
        total += compScore * weight;
      }
    }

    // 3. Weighted sub-assessments
    if (ra.subAssessments && Array.isArray(ra.subAssessments) && ra.subAssessments.length > 0) {
      hasComponents = true;
      for (const subItem of ra.subAssessments) {
        const targetRa = rubrikAssessments.find((r: any) => r.id === subItem.assessmentId);
        if (targetRa) {
          const subScore = calculateRAScore(studentId, targetRa);
          const weight = parseFloat(subItem.weight) || 0;
          total += subScore * weight;
        }
      }
    }

    if (!hasComponents) return 65;
    return ensureMinScore(total);
  };

  const handleExportCSV = () => {
    if (filteredAndSortedStudents.length === 0 || !hasFetchedData) return;

    const headers = [
      "No",
      "Nama Mentee",
      "Email",
      ...(attComp ? [attComp.name] : []),
      ...(oncamComp ? [oncamComp.name] : []),
      ...displayRAs.map((r) => `${r.name} (Rubrik)`),
      ...(showSyllabusColumns ? regularComps.map((c) => `${c.name} (Syllabus)`) : []),
      "Rata-Rata",
    ];

    const rows = filteredAndSortedStudents.map((s, idx) => {
      const att = attendanceScores[s.id];
      const details = activePhase === "micro" ? att?.microDetails : att?.massiveDetails;

      const attScoreVal = activePhase === "micro" ? att?.microScore ?? 65.0 : att?.massiveScore ?? 65.0;
      const oncamScoreVal = details?.oncamScore ?? 65.0;

      const raScores = displayRAs.map((r) => calculateRAScore(s.id, r));
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
        ...(attComp ? [attScoreVal.toFixed(1)] : []),
        ...(oncamComp ? [oncamScoreVal.toFixed(1)] : []),
        ...raScores.map((sc) => sc.toFixed(1)),
        ...(showSyllabusColumns ? compScores.map((sc) => sc.toFixed(1)) : []),
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
                Pilih program lalu tarik data untuk memantau dan mengunduh rekapitulasi penilaian mentee.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedProgramId}
                onChange={(e) => handleProgramChange(e.target.value)}
                className="h-10 px-3 rounded-lg border border-input bg-background text-xs font-semibold text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand-purple/50 cursor-pointer"
              >
                {displayPrograms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.batchName || "Batch"})
                  </option>
                ))}
              </select>

              <Button
                onClick={() => fetchRecapData(selectedProgramId)}
                disabled={isLoading}
                className="bg-brand-purple hover:bg-brand-purple/90 text-white font-semibold text-xs gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Tarik Nilai
              </Button>

              <Button
                onClick={handleExportCSV}
                disabled={!hasFetchedData || filteredAndSortedStudents.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="flex items-center gap-3">
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
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="h-8 text-xs gap-1.5 cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {sortOrder === "asc" ? "A → Z" : "Z → A"}
              </Button>

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
          </div>

          {/* Table Container */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
              <p className="text-xs font-medium">Memuat rekap nilai mentee...</p>
            </div>
          ) : !hasFetchedData ? (
            /* NOT FETCHED STATE */
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="flex flex-col items-center justify-center py-16 gap-4 bg-muted/20">
                <div className="p-4 rounded-full bg-brand-purple/10 border border-brand-purple/20">
                  <Download className="w-8 h-8 text-brand-purple" />
                </div>
                <div className="text-center space-y-1.5">
                  <h4 className="font-heading font-bold text-foreground">
                    Data Belum Ditarik
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Silakan tekan tombol "Tarik Nilai" di pojok kanan atas untuk memuat data rekapitulasi nilai untuk program yang dipilih.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* UNLOCKED — Show Table */
            <>
              <div className="border border-border rounded-xl overflow-x-auto shadow-2xs">
                <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
                  <thead className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-center w-12">No</th>
                      <th className="px-4 py-3 sticky left-0 z-10 bg-muted/95 backdrop-blur shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#262626]">
                        Mentee
                      </th>

                      {/* Attendance Column */}
                      {attComp && (
                        <th className="px-4 py-3 text-center border-l border-border bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[9px] text-emerald-700/80 dark:text-emerald-300/80 font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20">
                              Soft Skills (CCA)
                            </span>
                            <span className="font-semibold">{attComp.name}</span>
                          </div>
                        </th>
                      )}

                      {/* Attendance On-Cam Column */}
                      {oncamComp && (
                        <th className="px-4 py-3 text-center border-l border-border bg-blue-500/10 text-blue-700 dark:text-blue-300">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[9px] text-blue-700/80 dark:text-blue-300/80 font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/20">
                              Soft Skills (CCA)
                            </span>
                            <span className="font-semibold">{oncamComp.name}</span>
                          </div>
                        </th>
                      )}

                      {/* Rubrik Assessment Columns */}
                      {displayRAs.map((ra) => (
                        <th key={ra.id} className="px-4 py-3 text-center border-l border-border bg-brand-purple/5">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[9px] text-muted-foreground font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-secondary">
                              Rubrik {activePhase === "micro" ? "Initial" : "Final"}
                            </span>
                            <span className="font-semibold text-brand-purple">{ra.name}</span>
                          </div>
                        </th>
                      ))}

                      {/* Syllabus Competency Columns */}
                      {showSyllabusColumns && regularComps.map((comp) => (
                        <th key={comp.id} className="px-4 py-3 text-center border-l border-border">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[9px] text-brand-purple font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-brand-purple/10">
                              {comp.category || "Syllabus"}
                            </span>
                            <span className="font-semibold">{comp.name}</span>
                          </div>
                        </th>
                      ))}

                      {/* Average */}
                      <th className="px-4 py-3 text-center border-l border-border bg-brand-purple/10 text-brand-purple">
                        Rata-Rata
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {paginatedStudents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3 + (attComp ? 1 : 0) + (oncamComp ? 1 : 0) + displayRAs.length + (showSyllabusColumns ? regularComps.length : 0) + 1}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          Tidak ada data mentee ditemukan.
                        </td>
                      </tr>
                    ) : (
                      paginatedStudents.map((s, idx) => {
                        const att = attendanceScores[s.id];
                        const details = activePhase === "micro" ? att?.microDetails : att?.massiveDetails;

                        const attScoreVal = activePhase === "micro" ? att?.microScore ?? 65.0 : att?.massiveScore ?? 65.0;
                        const oncamScoreVal = details?.oncamScore ?? 65.0;

                        const raScores = displayRAs.map((r) => calculateRAScore(s.id, r));
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
                              {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                            </td>
                            <td className="px-4 py-3 sticky left-0 z-10 bg-card backdrop-blur shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#262626]">
                              <div className="font-semibold text-foreground">{s.name}</div>
                              <div className="text-[10px] text-muted-foreground">{s.email}</div>
                            </td>

                            {/* Attendance Score */}
                            {attComp && (
                              <td className="px-4 py-3 text-center border-l border-border font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                                {attScoreVal.toFixed(1)}
                              </td>
                            )}

                            {/* On-Cam Score */}
                            {oncamComp && (
                              <td className="px-4 py-3 text-center border-l border-border font-bold text-blue-600 dark:text-blue-400 bg-blue-500/5">
                                {oncamScoreVal.toFixed(1)}
                              </td>
                            )}

                            {/* RA Scores */}
                            {displayRAs.map((r) => {
                              const sc = calculateRAScore(s.id, r);
                              return (
                                <td key={r.id} className="px-4 py-3 text-center border-l border-border font-medium">
                                  {sc.toFixed(1)}
                                </td>
                              );
                            })}

                            {/* Syllabus Competency Scores */}
                            {showSyllabusColumns && regularComps.map((c) => {
                              const sc = getStudentCompScore(s.id, c.id);
                              return (
                                <td key={c.id} className="px-4 py-3 text-center border-l border-border font-medium">
                                  {sc.toFixed(1)}
                                </td>
                              );
                            })}

                            {/* Average */}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedStudents.length)} dari {filteredAndSortedStudents.length} mentee
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="h-7 text-xs px-3 cursor-pointer"
                    >
                      ←
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`h-7 text-xs px-3 cursor-pointer ${currentPage === page ? "bg-brand-purple hover:bg-brand-purple/90 text-white" : ""}`}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="h-7 text-xs px-3 cursor-pointer"
                    >
                      →
                    </Button>
                  </div>
                </div>
              )}

              {/* Student Count */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span>Total: <strong className="text-foreground">{filteredAndSortedStudents.length}</strong> mentee terdaftar di program ini</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
