"use client";

import Link from "next/link";
import { useState } from "react";
import { FileSpreadsheet, Loader2, Pencil, Plus, Settings, Trash2, Upload, Award } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompetencyItem } from "./types";

interface MentorAssessmentViewProps {
  competencies: CompetencyItem[];
  rubrikAssessments?: any[];
  allStudents: any[];
  onOpenAddCompetency: () => void;
  onOpenAddRubrikAssessment?: () => void;
  setEditingCompetency: (comp: any) => void;
  handleDeleteCompetency: (id: string) => void;
  setEditingWeightCompetency: (comp: any) => void;
  setEditingRubrikAssessment?: (ra: any) => void;
  handleDeleteRubrikAssessment?: (id: string) => void;
  setEditingWeightRubrikAssessment?: (ra: any) => void;
  calculateCompetencyScore: (studentId: string, compId: string) => number;
  externalScores?: any[];
  activeSubTab?: "rubric" | "assessment";
  activeRubrikTab?: string;
  setActiveRubrikTab?: (tab: string) => void;
  uniquePrograms?: any[];
  selectedProgramId?: string | null;
  setSelectedProgramId?: (id: string) => void;
  csvInputRef?: React.RefObject<HTMLInputElement | null>;
  handleImportCSV?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isImportingCSV?: boolean;
}

export function MentorAssessmentView({
  competencies,
  rubrikAssessments = [],
  allStudents,
  onOpenAddCompetency,
  onOpenAddRubrikAssessment,
  setEditingCompetency,
  handleDeleteCompetency,
  setEditingWeightCompetency,
  setEditingRubrikAssessment,
  handleDeleteRubrikAssessment,
  setEditingWeightRubrikAssessment,
  calculateCompetencyScore,
  externalScores = [],
  activeSubTab = "rubric",
  activeRubrikTab: externalActiveRubrikTab,
  setActiveRubrikTab: externalSetActiveRubrikTab,
  uniquePrograms = [],
  selectedProgramId,
  setSelectedProgramId,
  csvInputRef,
  handleImportCSV,
  isImportingCSV = false,
}: MentorAssessmentViewProps) {
  const [internalActiveRubrikTab, setInternalActiveRubrikTab] = useState("kompetensi");
  const activeRubrikTab = externalActiveRubrikTab || internalActiveRubrikTab;
  const setActiveRubrikTab = externalSetActiveRubrikTab || setInternalActiveRubrikTab;

  const ensureMinScore = (val: number) => {
    if (!val || isNaN(val) || val < 65) return 65;
    return Math.min(100, val);
  };

  // Calculate score for a RubrikAssessment item
  const calculateRAScore = (studentId: string, ra: any): number => {
    if (!ra) return 65;

    // 1. Check imported external score
    if (externalScores && externalScores.length > 0) {
      const ext = externalScores.find(
        (s) => s.studentId === studentId && s.rubrikAssessmentId === ra.id
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
        const compScore = calculateCompetencyScore(studentId, item.competencyId);
        const weight = parseFloat(item.weight) || 0;
        total += compScore * weight;
      }
    }

    // 3. Weighted sub-assessments
    if (ra.subAssessments && Array.isArray(ra.subAssessments) && ra.subAssessments.length > 0) {
      hasComponents = true;
      for (const subItem of ra.subAssessments) {
        const targetRa = rubrikAssessments.find((r) => r.id === subItem.assessmentId);
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

  // ── TAB RUBRIK PENILAIAN ──
  if (activeSubTab === "rubric") {
    return (
      <div className="space-y-6 font-sans">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl w-fit border border-border">
            <button
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeRubrikTab === "kompetensi"
                  ? "bg-card text-brand-purple shadow-sm border border-border/50 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveRubrikTab("kompetensi")}
            >
              Rubrik Kompetensi
            </button>
            <button
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeRubrikTab === "assessment"
                  ? "bg-card text-brand-purple shadow-sm border border-border/50 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveRubrikTab("assessment")}
            >
              Rubrik Assessment
            </button>
            <button
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeRubrikTab === "professional"
                  ? "bg-card text-brand-purple shadow-sm border border-border/50 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveRubrikTab("professional")}
            >
              Rubrik Professional
            </button>
          </div>

          {uniquePrograms.length > 1 && setSelectedProgramId && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground font-medium text-xs">Program:</span>
              <select
                value={selectedProgramId || ""}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-brand-purple max-w-[200px] truncate"
              >
                {uniquePrograms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Competencies Table */}
        {(activeRubrikTab === "kompetensi" || activeRubrikTab === "professional") && (
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-heading font-bold text-foreground">
                  {activeRubrikTab === "kompetensi"
                    ? "Manajemen Rubrik Kompetensi"
                    : "Manajemen Kompetensi Professional (Global)"}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Atur patokan nilai dan kriteria evaluasi (rubrik) untuk masing-masing kompetensi.
                </CardDescription>
              </div>
              <Button
                onClick={onOpenAddCompetency}
                size="sm"
                variant="outline"
                className="h-8 text-xs flex items-center gap-1.5 border-brand-purple/20 hover:bg-brand-purple/5 text-brand-purple cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Kompetensi
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="py-3 px-4">Nama Kompetensi</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Fase</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {competencies.filter((c: any) =>
                      activeRubrikTab === "professional" ? c.isGlobal : !c.isGlobal
                    ).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          Belum ada kompetensi {activeRubrikTab === "professional" ? "professional" : ""}.
                        </td>
                      </tr>
                    ) : (
                      competencies
                        .filter((c: any) =>
                          activeRubrikTab === "professional" ? c.isGlobal : !c.isGlobal
                        )
                        .map((comp: any) => (
                          <tr key={comp.id} className="hover:bg-secondary/20 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-foreground">
                              {comp.name}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
                                {comp.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
                                {comp.phase || "Micro"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/dashboard/competency/${comp.id}/rubric`}>
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-purple hover:bg-brand-purple/90 text-white font-medium text-[11px] transition-colors shadow-sm cursor-pointer">
                                    <FileSpreadsheet className="w-3.5 h-3.5" /> Atur Rubrik
                                  </span>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 p-0 cursor-pointer"
                                  onClick={() => setEditingCompetency(comp)}
                                >
                                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 p-0 border-red-500/20 hover:bg-red-50 cursor-pointer"
                                  onClick={() => handleDeleteCompetency(comp.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rubrik Assessment Table */}
        {(activeRubrikTab === "assessment" || activeRubrikTab === "professional") && (
          <Card className="border-border bg-card shadow-sm mt-6">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-heading font-bold text-foreground">
                  {activeRubrikTab === "assessment"
                    ? "Manajemen Rubrik Assessment"
                    : "Manajemen Rubrik Assessment Professional (Global)"}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Atur Rubrik Assessment yang menaungi beberapa Rubrik Kompetensi / Subassessment beserta bobotnya.
                </CardDescription>
              </div>
              {onOpenAddRubrikAssessment && (
                <Button
                  onClick={onOpenAddRubrikAssessment}
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs flex items-center gap-1.5 border-brand-purple/20 hover:bg-brand-purple/5 text-brand-purple cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Rubrik Assessment
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="py-3 px-4">Nama Rubrik Assessment</th>
                      <th className="py-3 px-4">Fase</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {rubrikAssessments.filter((r: any) =>
                      activeRubrikTab === "professional" ? r.isGlobal : !r.isGlobal
                    ).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-muted-foreground">
                          Belum ada Rubrik Assessment.
                        </td>
                      </tr>
                    ) : (
                      rubrikAssessments
                        .filter((r: any) =>
                          activeRubrikTab === "professional" ? r.isGlobal : !r.isGlobal
                        )
                        .map((ra: any) => (
                          <tr key={ra.id} className="hover:bg-secondary/20 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-foreground">
                              {ra.name}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
                                {ra.phase || "Micro"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {setEditingWeightRubrikAssessment && (
                                  <span
                                    onClick={() => setEditingWeightRubrikAssessment(ra)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-purple hover:bg-brand-purple/90 text-white font-medium text-[11px] transition-colors shadow-sm cursor-pointer"
                                  >
                                    <Settings className="w-3.5 h-3.5" /> Atur Bobot Kompetensi
                                  </span>
                                )}
                                {setEditingRubrikAssessment && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-7 p-0 cursor-pointer"
                                    onClick={() => setEditingRubrikAssessment(ra)}
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                                  </Button>
                                )}
                                {handleDeleteRubrikAssessment && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-7 p-0 border-red-500/20 hover:bg-red-50 cursor-pointer"
                                    onClick={() => handleDeleteRubrikAssessment(ra.id)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── TAB ASSESSMENT (GRADEBOOK) ──
  const microRAs = rubrikAssessments.filter((r) => r.phase === "Micro" || !r.phase);
  const massiveRAs = rubrikAssessments.filter((r) => r.phase === "Massive");

  const hasRAs = rubrikAssessments.length > 0;

  return (
    <Card className="border-border bg-card shadow-sm font-sans">
      <CardHeader className="border-b border-border pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg font-heading font-bold text-foreground">
            Assessment (Gradebook)
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Pantau nilai akhir mentee berdasarkan pencapaian kompetensi dan penilaian rubrik.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          {uniquePrograms.length > 1 && setSelectedProgramId && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground font-medium text-xs">Program:</span>
              <select
                value={selectedProgramId || ""}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-brand-purple max-w-[180px] truncate"
              >
                {uniquePrograms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {csvInputRef && handleImportCSV && (
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={csvInputRef}
                accept=".csv"
                className="hidden"
                onChange={handleImportCSV}
              />
              <Button
                variant="outline"
                size="sm"
                disabled={isImportingCSV}
                onClick={() => csvInputRef?.current?.click()}
                className="h-8 text-xs flex items-center gap-1.5 border-brand-purple/30 hover:bg-brand-purple/5 text-brand-purple cursor-pointer"
              >
                {isImportingCSV ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                Import CSV
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={async () => {
                  if (!selectedProgramId) return;
                  try {
                    const res = await fetch(`http://localhost:7000/classes/programs/${selectedProgramId}/release-certificate`, {
                      method: "POST",
                      credentials: "include"
                    });
                    if (res.ok) {
                      const d = await res.json();
                      toast.success(d.isCertificateReleased ? "Sertifikat Kelulusan berhasil dirilis untuk mentee!" : "Rilis Sertifikat ditarik kembali.");
                    } else {
                      toast.error("Gagal memperbarui rilis sertifikat.");
                    }
                  } catch (err) {
                    toast.error("Terjadi kesalahan sistem.");
                  }
                }}
                className="h-8 text-xs flex items-center gap-1.5 bg-brand-purple hover:bg-brand-purple/90 text-white cursor-pointer shadow-xs font-semibold"
              >
                <Award className="w-3.5 h-3.5" />
                Rilis Sertifikat Mentee
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <Tabs defaultValue="Micro" className="w-full">
          <TabsList className="grid w-full max-w-sm grid-cols-2 mb-6">
            <TabsTrigger value="Micro">Phase Micro</TabsTrigger>
            <TabsTrigger value="Massive">Phase Massive</TabsTrigger>
          </TabsList>

          {["Micro", "Massive"].map((phase) => {
            const displayRAs = phase === "Micro" ? microRAs : massiveRAs;
            const microComps = competencies.filter((c) => c.phase === "Micro" || (!c.phase && "Micro" === "Micro"));
            const massiveComps = competencies.filter((c) => c.phase === "Massive");
            const displayComps = phase === "Micro" ? microComps : massiveComps;

            return (
              <TabsContent key={phase} value={phase} className="space-y-6">
                <div className="overflow-x-auto border border-border rounded-xl">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 sticky left-0 z-10 bg-muted/95 backdrop-blur shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#262626]">
                          Mentee
                        </th>

                        {/* Summary Column */}
                        <th className="px-4 py-3 bg-brand-purple/10 text-brand-purple border-x border-border text-center font-bold">
                          {phase === "Micro" ? "Total Micro" : "Total Massive"}
                        </th>

                        {/* Rubrik Assessment Columns */}
                        {hasRAs ? (
                          displayRAs.map((ra) => (
                            <th
                              key={ra.id}
                              className="px-4 py-3 cursor-pointer hover:text-brand-purple hover:underline transition-colors text-center border-l border-border"
                              onClick={() => setEditingWeightRubrikAssessment && setEditingWeightRubrikAssessment(ra)}
                              title="Klik untuk mengatur bobot kompetensi di Rubrik Assessment ini"
                            >
                              {ra.name}
                              <Pencil className="w-3 h-3 inline-block ml-1 opacity-50" />
                            </th>
                          ))
                        ) : (
                          displayComps.map((comp) => (
                            <th
                              key={comp.id}
                              className="px-4 py-3 cursor-pointer hover:text-brand-purple hover:underline transition-colors text-center border-l border-border"
                              onClick={() => setEditingWeightCompetency(comp)}
                              title="Klik untuk mengatur bobot tugas di kompetensi ini"
                            >
                              {comp.name}
                              <Pencil className="w-3 h-3 inline-block ml-1 opacity-50" />
                            </th>
                          ))
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {allStudents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={(hasRAs ? displayRAs.length : displayComps.length) + 2}
                            className="px-4 py-8 text-center text-muted-foreground"
                          >
                            Belum ada mentee yang terdaftar.
                          </td>
                        </tr>
                      ) : (
                        allStudents.map((student) => {
                          // Calculate Total Micro average
                          const microScores = microRAs.map((ra) => calculateRAScore(student.id, ra));
                          const totalMicroAvg =
                            microScores.length > 0
                              ? microScores.reduce((a, b) => a + b, 0) / microScores.length
                              : microComps.reduce((a, c) => a + calculateCompetencyScore(student.id, c.id), 0);

                          // Calculate Total Massive average
                          const massiveScores = massiveRAs.map((ra) => calculateRAScore(student.id, ra));
                          const totalMassiveAvg =
                            massiveScores.length > 0
                              ? massiveScores.reduce((a, b) => a + b, 0) / massiveScores.length
                              : massiveComps.reduce((a, c) => a + calculateCompetencyScore(student.id, c.id), 0);

                          const summaryScore = phase === "Micro" ? totalMicroAvg : totalMassiveAvg;

                          return (
                            <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3 sticky left-0 z-10 bg-card shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#262626]">
                                <div className="font-semibold text-foreground text-xs">
                                  {student.name}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                  {student.email}
                                </div>
                              </td>

                              {/* Summary Cell */}
                              <td className="px-4 py-3 text-center border-x border-border font-bold text-brand-purple bg-brand-purple/5">
                                {ensureMinScore(summaryScore).toFixed(1)}
                              </td>

                              {/* RA Cells or Competency Cells */}
                              {hasRAs
                                ? displayRAs.map((ra) => {
                                    const score = calculateRAScore(student.id, ra);
                                    return (
                                      <td
                                        key={ra.id}
                                        className="px-4 py-3 text-center border-l border-border text-xs font-medium"
                                      >
                                        {ensureMinScore(score).toFixed(1)}
                                      </td>
                                    );
                                  })
                                : displayComps.map((comp) => {
                                    const score = calculateCompetencyScore(student.id, comp.id);
                                    return (
                                      <td
                                        key={comp.id}
                                        className="px-4 py-3 text-center border-l border-border text-xs font-medium"
                                      >
                                        {ensureMinScore(score).toFixed(1)}
                                      </td>
                                    );
                                  })}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
