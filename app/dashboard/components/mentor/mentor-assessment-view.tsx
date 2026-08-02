"use client";

import { API_BASE_URL } from "@/lib/config";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { FileSpreadsheet, Loader2, Pencil, Plus, Settings, Trash2, Upload, Award, Calendar, FileText, AlertTriangle, ShieldAlert, X, CheckCircle2, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompetencyItem } from "./types";

interface MentorAssessmentViewProps {
  programCompetencies?: any[];
  fetchProgramCompetencies?: () => void;
  competencies: CompetencyItem[];
  rubrikAssessments?: any[];
  allStudents: any[];
  onOpenAddProgramCompetency?: () => void;
  onOpenAddCompetency: () => void;
  onOpenAddRubrikAssessment?: () => void;
  setEditingProgramCompetency?: (comp: any) => void;
  setEditingCompetency: (comp: any) => void;
  handleDeleteProgramCompetency?: (id: string) => void;
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
  isReadOnly?: boolean;
  isTranscriptReleased?: boolean;
  isCertificateReleased?: boolean;
  onToggleReleaseCertificate?: (newStatus: boolean) => void;
  attendanceScores?: Record<string, any>;
  competencyScores?: any[];
  handleSaveDirectCompetencyScore?: (studentId: string, competencyId: string, score: number) => void;
  phaseDates?: any;
  setIsPhaseDatesModalOpen?: (v: boolean) => void;
}

export function MentorAssessmentView({
  programCompetencies = [],
  fetchProgramCompetencies,
  competencies,
  rubrikAssessments = [],
  allStudents,
  onOpenAddProgramCompetency,
  onOpenAddCompetency,
  onOpenAddRubrikAssessment,
  setEditingProgramCompetency,
  setEditingCompetency,
  handleDeleteProgramCompetency,
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
  isReadOnly = false,
  isTranscriptReleased: initialIsTranscriptReleased = false,
  isCertificateReleased: initialIsCertificateReleased = false,
  onToggleReleaseCertificate,
  attendanceScores = {},
  competencyScores = [],
  handleSaveDirectCompetencyScore,
  phaseDates,
  setIsPhaseDatesModalOpen,
}: MentorAssessmentViewProps) {
  const [assessmentTab, setAssessmentTab] = useState<"Micro" | "Massive">("Micro");
  const [isTranscriptReleased, setIsTranscriptReleased] = useState<boolean>(Boolean(initialIsTranscriptReleased));
  const [isCertificateReleased, setIsCertificateReleased] = useState<boolean>(Boolean(initialIsCertificateReleased));

  useEffect(() => {
    setIsTranscriptReleased(Boolean(initialIsTranscriptReleased));
  }, [initialIsTranscriptReleased]);

  useEffect(() => {
    setIsCertificateReleased(Boolean(initialIsCertificateReleased));
  }, [initialIsCertificateReleased]);
  const [internalActiveRubrikTab, setInternalActiveRubrikTab] = useState("kompetensi");
  const activeRubrikTab = externalActiveRubrikTab || internalActiveRubrikTab;
  const setActiveRubrikTab = externalSetActiveRubrikTab || setInternalActiveRubrikTab;

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showSyllabusColumns, setShowSyllabusColumns] = useState(true);

  const filteredAndSortedStudents = useMemo(() => {
    let result = [...allStudents];
    if (searchQuery) {
      result = result.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    result.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
    return result;
  }, [allStudents, searchQuery, sortOrder]);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOrder, selectedProgramId, assessmentTab]);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedStudents, currentPage]);

  const [directScoreModal, setDirectScoreModal] = useState({
    isOpen: false,
    studentId: "",
    studentName: "",
    compId: "",
    compName: "",
    scoreInput: "",
  });

  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [releaseCountdown, setReleaseCountdown] = useState(5);
  const [isSubmittingRelease, setIsSubmittingRelease] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isReleaseModalOpen && releaseCountdown > 0) {
      timer = setInterval(() => {
        setReleaseCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isReleaseModalOpen, releaseCountdown]);

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
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeRubrikTab === "program_competensi"
                ? "bg-card text-brand-purple shadow-sm border border-border/50 font-bold"
                : "text-muted-foreground hover:text-foreground"
                }`}
              onClick={() => setActiveRubrikTab("program_competensi")}
            >
              Manajemen Kompetensi
            </button>
            <button
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeRubrikTab === "kompetensi"
                ? "bg-card text-brand-purple shadow-sm border border-border/50 font-bold"
                : "text-muted-foreground hover:text-foreground"
                }`}
              onClick={() => setActiveRubrikTab("kompetensi")}
            >
              Daftar Syllabus
            </button>
            <button
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeRubrikTab === "assessment"
                ? "bg-card text-brand-purple shadow-sm border border-border/50 font-bold"
                : "text-muted-foreground hover:text-foreground"
                }`}
              onClick={() => setActiveRubrikTab("assessment")}
            >
              Kolom Penilaian (Gradebook)
            </button>
            <button
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeRubrikTab === "professional"
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
                <option value="all">Semua Program (Global)</option>
                {uniquePrograms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Program Competencies (Manajemen Kompetensi) Table */}
        {(activeRubrikTab === "program_competensi" || activeRubrikTab === "professional") && (
          <Card className="border-border bg-card shadow-sm mb-6">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-heading font-bold text-foreground">
                  {activeRubrikTab === "program_competensi"
                    ? "Manajemen Kompetensi"
                    : "Manajemen Kompetensi Professional (Global)"}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Atur daftar kompetensi utama yang menaungi berbagai syllabus.
                </CardDescription>
              </div>
              {onOpenAddProgramCompetency && (
                <Button
                  onClick={onOpenAddProgramCompetency}
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs flex items-center gap-1.5 border-brand-purple/20 hover:bg-brand-purple/5 text-brand-purple cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Kompetensi
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="py-3 px-4">Nama Kompetensi Induk</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {programCompetencies?.filter((c: any) =>
                      activeRubrikTab === "professional" ? (c.isGlobal || !c.programId) : (!c.isGlobal && !!c.programId)
                    ).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-muted-foreground">
                          Belum ada kompetensi induk.
                        </td>
                      </tr>
                    ) : (
                      programCompetencies
                        ?.filter((c: any) =>
                          activeRubrikTab === "professional" ? (c.isGlobal || !c.programId) : (!c.isGlobal && !!c.programId)
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
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {setEditingProgramCompetency && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-7 p-0 cursor-pointer"
                                    onClick={() => setEditingProgramCompetency(comp)}
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                                  </Button>
                                )}
                                {handleDeleteProgramCompetency && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-7 p-0 border-red-500/20 hover:bg-red-50 cursor-pointer"
                                    onClick={() => handleDeleteProgramCompetency(comp.id)}
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

        {/* Competencies (Syllabus) Table */}
        {(activeRubrikTab === "kompetensi" || activeRubrikTab === "professional") && (
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-heading font-bold text-foreground">
                  {activeRubrikTab === "kompetensi"
                    ? "Daftar Syllabus"
                    : "Daftar Syllabus Professional (Global)"}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Kelola syllabus spesifik dan atur kriteria rubrik penilainnya.
                </CardDescription>
              </div>
              <Button
                onClick={onOpenAddCompetency}
                size="sm"
                variant="outline"
                className="h-8 text-xs flex items-center gap-1.5 border-brand-purple/20 hover:bg-brand-purple/5 text-brand-purple cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Syllabus
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="py-3 px-4">Syllabus</th>
                      <th className="py-3 px-4">Kompetensi Induk</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {competencies.filter((c: any) =>
                      activeRubrikTab === "professional" ? (c.isGlobal || !c.programId) : (!c.isGlobal && !!c.programId)
                    ).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          Belum ada syllabus {activeRubrikTab === "professional" ? "professional" : ""}.
                        </td>
                      </tr>
                    ) : (
                      competencies
                        .filter((c: any) =>
                          activeRubrikTab === "professional" ? (c.isGlobal || !c.programId) : (!c.isGlobal && !!c.programId)
                        )
                        .map((comp: any) => (
                          <tr key={comp.id} className="hover:bg-secondary/20 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-foreground">
                              {comp.name}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="text-muted-foreground text-[11px]">
                                {comp.programCompetency?.name || "-"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
                                {comp.category}
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
                    ? "Manajemen Kolom Penilaian"
                    : "Manajemen Kolom Penilaian Professional (Global)"}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Daftar kolom penilaian berdasarkan fase, yang akan tampil di Gradebook.
                </CardDescription>
              </div>

            </CardHeader>
            <CardContent className="p-4">
              <Tabs defaultValue="Micro" className="w-full">
                <TabsList className="bg-secondary/60 p-1.5 rounded-xl border border-border/60 flex max-w-xs min-h-12 gap-1.5 mb-6">
                  <TabsTrigger
                    value="Micro"
                    className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all py-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    Initial Assessment
                  </TabsTrigger>
                  <TabsTrigger
                    value="Massive"
                    className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all py-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    Final Assessment
                  </TabsTrigger>
                </TabsList>

                {["Micro", "Massive"].map((phase) => (
                  <TabsContent key={phase} value={phase}>
                    <div className="overflow-x-auto border border-border rounded-xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border bg-secondary/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            <th className="py-3 px-4">Nama Kolom Penilaian</th>
                            <th className="py-3 px-4">Fase</th>
                            <th className="py-3 px-4 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 text-xs">
                          {rubrikAssessments.filter((r: any) =>
                            (activeRubrikTab === "professional" ? (r.isGlobal || !r.programId) : (!r.isGlobal && !!r.programId)) &&
                            (r.phase === phase || (!r.phase && phase === "Micro"))
                          ).length === 0 ? (
                            <tr>
                              <td colSpan={3} className="py-8 text-center text-muted-foreground">
                                Belum ada Kolom Penilaian untuk phase ini.
                              </td>
                            </tr>
                          ) : (
                            rubrikAssessments
                              .filter((r: any) =>
                                (activeRubrikTab === "professional" ? (r.isGlobal || !r.programId) : (!r.isGlobal && !!r.programId)) &&
                                (r.phase === phase || (!r.phase && phase === "Micro"))
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
                                          <Settings className="w-3.5 h-3.5" /> Atur Bobot Syllabus
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
                  </TabsContent>
                ))}
              </Tabs>
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
    <>
      <Card className="border-border shadow-xs bg-card overflow-hidden font-sans">
        <CardHeader className="border-b border-border bg-secondary/20 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-brand-purple/10 text-brand-purple border-brand-purple/30 text-[11px] font-bold">
                  Transkrip & Penilaian Mentee
                </Badge>
              </div>
              <CardTitle className="font-heading font-extrabold text-xl text-foreground">
                Tabel Gradebook Akademik
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Kelola hasil penilaian seluruh mentee per fase pembelajaran dan rilis dokumen resmi akademik.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search & Sort UI */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari nama mentee..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-48 bg-card border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-brand-purple"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                  className="h-8 px-2 text-xs border-border flex items-center gap-1 cursor-pointer"
                  title="Urutkan berdasarkan nama"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  {sortOrder === "asc" ? "A-Z" : "Z-A"}
                </Button>
              </div>

              {uniquePrograms.length > 1 && setSelectedProgramId && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground font-medium text-xs">Program:</span>
                  <select
                    value={selectedProgramId || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedProgramId(val === "all" ? "" : val);
                    }}
                    className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-brand-purple max-w-[180px] truncate cursor-pointer"
                  >
                    <option value="all">Semua Program (Global)</option>
                    {uniquePrograms.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {!isReadOnly && (
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={csvInputRef}
                  onChange={handleImportCSV}
                  accept=".csv"
                  className="hidden"
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

                {(() => {
                  const isCurrentReleased = assessmentTab === "Micro" ? isTranscriptReleased : isCertificateReleased;
                  return (
                    <Button
                      variant={isCurrentReleased ? "outline" : "default"}
                      size="sm"
                      onClick={() => {
                        if (!selectedProgramId) {
                          toast.error("Silakan pilih program terlebih dahulu.");
                          return;
                        }

                        // 🛑 Sequential Dependency Constraint:
                        // Require Transkrip (Phase Micro) to be released first before Sertifikat (Phase Massive) can be released!
                        if (assessmentTab === "Massive" && !isCurrentReleased && !isTranscriptReleased) {
                          toast.error("Gagal! Transkrip Nilai (Fase Micro) harus dirilis terlebih dahulu sebelum Sertifikat (Fase Massive) dapat dirilis.");
                          return;
                        }

                        setReleaseCountdown(5);
                        setIsReleaseModalOpen(true);
                      }}
                      className={
                        isCurrentReleased
                          ? "h-8 text-xs flex items-center gap-1.5 border-brand-purple text-brand-purple bg-brand-purple/5 hover:bg-brand-purple/10 cursor-pointer font-bold shadow-xs transition-all"
                          : "h-8 text-xs flex items-center gap-1.5 bg-brand-purple hover:bg-brand-purple/90 text-white cursor-pointer shadow-xs font-semibold transition-all"
                      }
                    >
                      {isCurrentReleased ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-purple" />
                          {assessmentTab === "Micro" ? "Transkrip Sudah Rilis" : "Sertifikat Sudah Rilis"}
                        </>
                      ) : (
                        <>
                          {assessmentTab === "Micro" ? (
                            <>
                              <FileText className="w-3.5 h-3.5" />
                              Rilis Transkrip Nilai (Micro)
                            </>
                          ) : (
                            <>
                              <Award className="w-3.5 h-3.5" />
                              Rilis Sertifikat (Kelulusan & Magang)
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  );
                })()}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {/* Phase Dates Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-secondary/30 border border-border/80 text-xs font-sans">
            <div className="flex flex-wrap items-center gap-4 text-foreground">
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-brand-purple" />
                <span className="text-muted-foreground">Phase Micro:</span>
                <span className="font-semibold">
                  {phaseDates?.microStartDate ? new Date(phaseDates.microStartDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Awal Batch'} s/d {phaseDates?.microEndDate ? new Date(phaseDates.microEndDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pertengahan Batch'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-brand-purple" />
                <span className="text-muted-foreground">Phase Massive:</span>
                <span className="font-semibold">
                  {phaseDates?.massiveStartDate ? new Date(phaseDates.massiveStartDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pertengahan Batch'} s/d {phaseDates?.massiveEndDate ? new Date(phaseDates.massiveEndDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Akhir Batch'}
                </span>
              </div>
            </div>
            {setIsPhaseDatesModalOpen && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPhaseDatesModalOpen(true)}
                className="h-7 text-xs flex items-center gap-1.5 border-brand-purple/30 text-brand-purple hover:bg-brand-purple/10 cursor-pointer font-semibold"
              >
                <Pencil className="w-3 h-3" /> Atur Tanggal Phase
              </Button>
            )}
          </div>

          <Tabs value={assessmentTab} onValueChange={(v) => setAssessmentTab(v as "Micro" | "Massive")} className="w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <TabsList className="bg-secondary/60 p-1.5 rounded-xl border border-border/60 flex max-w-xs min-h-12 gap-1.5">
                <TabsTrigger
                  value="Micro"
                  className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all py-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  Initial Assessment
                </TabsTrigger>
                <TabsTrigger
                  value="Massive"
                  className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all py-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  Final Assessment
                </TabsTrigger>
              </TabsList>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSyllabusColumns(!showSyllabusColumns)}
                className="h-10 px-4 text-xs flex items-center gap-2 border-brand-purple/30 text-brand-purple hover:bg-brand-purple/10 cursor-pointer font-semibold rounded-xl bg-card transition-all"
              >
                {showSyllabusColumns ? (
                  <>Sembunyikan Kolom Syllabus</>
                ) : (
                  <>Tampilkan Kolom Syllabus</>
                )}
              </Button>
            </div>

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



                          {/* Syllabus Attendance Column (Extracted) */}
                          {(() => {
                            const attComp = displayComps.find(c => c.name?.toLowerCase().includes("attendance") && !c.name?.toLowerCase().includes("on"));
                            if (attComp) {
                              return (
                                <th
                                  key={attComp.id}
                                  className="px-4 py-3 cursor-pointer hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors text-center border-r border-border bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                  onClick={() => setEditingWeightCompetency(attComp)}
                                  title="Klik untuk mengatur bobot tugas di kompetensi/syllabus ini"
                                >
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span className="text-[9px] text-emerald-700/80 dark:text-emerald-300/80 font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20">
                                      {attComp.category || "Syllabus"}
                                    </span>
                                    <span className="font-semibold flex items-center gap-1">
                                      {attComp.name}
                                      <Pencil className="w-2.5 h-2.5 inline-block opacity-40" />
                                    </span>
                                  </div>
                                </th>
                              );
                            }
                            return null;
                          })()}

                          {/* Syllabus Attendance On-Cam Column (Extracted) */}
                          {(() => {
                            const oncamComp = displayComps.find(c => c.name?.toLowerCase().includes("attendance") && (c.name?.toLowerCase().includes("on cam") || c.name?.toLowerCase().includes("oncam") || c.name?.toLowerCase().includes("on-cam")));
                            if (oncamComp) {
                              return (
                                <th
                                  key={oncamComp.id}
                                  className="px-4 py-3 cursor-pointer hover:text-blue-800 dark:hover:text-blue-200 transition-colors text-center border-r border-border bg-blue-500/10 text-blue-700 dark:text-blue-300"
                                  onClick={() => setEditingWeightCompetency(oncamComp)}
                                  title="Klik untuk mengatur bobot tugas di kompetensi/syllabus ini"
                                >
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span className="text-[9px] text-blue-700/80 dark:text-blue-300/80 font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/20">
                                      {oncamComp.category || "Syllabus"}
                                    </span>
                                    <span className="font-semibold flex items-center gap-1">
                                      {oncamComp.name}
                                      <Pencil className="w-2.5 h-2.5 inline-block opacity-40" />
                                    </span>
                                  </div>
                                </th>
                              );
                            }
                            return null;
                          })()}

                          {/* Rubrik Assessment Columns */}
                          {displayRAs.map((ra) => (
                            <th
                              key={ra.id}
                              className="px-4 py-3 cursor-pointer hover:text-brand-purple hover:underline transition-colors text-center border-l border-border bg-brand-purple/5"
                              onClick={() => setEditingWeightRubrikAssessment && setEditingWeightRubrikAssessment(ra)}
                              title="Klik untuk mengatur bobot kompetensi di Rubrik Assessment ini"
                            >
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-[9px] text-muted-foreground font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-secondary">
                                  Rubrik {phase === "Micro" ? "Initial" : "Final"}
                                </span>
                                <span className="font-semibold flex items-center gap-1 text-brand-purple">
                                  {ra.name}
                                  <Pencil className="w-2.5 h-2.5 inline-block opacity-40" />
                                </span>
                              </div>
                            </th>
                          ))}

                          {/* Syllabus & Competency Columns */}
                          {showSyllabusColumns && displayComps.filter(c => !c.name?.toLowerCase().includes("attendance")).map((comp) => (
                            <th
                              key={comp.id}
                              className="px-4 py-3 cursor-pointer hover:text-brand-purple hover:underline transition-colors text-center border-l border-border"
                              onClick={() => setEditingWeightCompetency(comp)}
                              title="Klik untuk mengatur bobot tugas di kompetensi/syllabus ini"
                            >
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-[9px] text-brand-purple font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-brand-purple/10">
                                  {comp.category || "Syllabus"}
                                </span>
                                <span className="font-semibold flex items-center gap-1">
                                  {comp.name}
                                  <Pencil className="w-2.5 h-2.5 inline-block opacity-40" />
                                </span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredAndSortedStudents.length === 0 ? (
                          <tr>
                            <td
                              colSpan={(showSyllabusColumns ? displayComps.length : 0) + displayRAs.length + 2}
                              className="px-4 py-8 text-center text-muted-foreground"
                            >
                              Belum ada mentee yang terdaftar atau cocok dengan pencarian.
                            </td>
                          </tr>
                        ) : (
                          paginatedStudents.map((student) => {
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



                                {/* Extracted Syllabus Attendance Cell */}
                                {(() => {
                                  const attComp = displayComps.find(c => c.name?.toLowerCase().includes("attendance") && !c.name?.toLowerCase().includes("on"));
                                  if (attComp) {
                                    const att = attendanceScores?.[student.id];
                                    const phaseScore = phase === "Micro" ? att?.microScore : att?.massiveScore;
                                    const finalScore = phaseScore !== undefined ? phaseScore : 65.0;
                                    
                                    const details = phase === "Micro" ? att?.microDetails : att?.massiveDetails;
                                    let tooltipTitle = "Nilai otomatis (Default: 65.0)";
                                    if (details && details.totalSyncDays > 0) {
                                      tooltipTitle = `Nilai otomatis. Kehadiran: ${details.cleanAttendance}/${details.totalSyncDays} Hari (Alpha: ${details.alphaDays})`;
                                    }
                                    
                                    return (
                                      <td
                                        key={attComp.id}
                                        className="px-4 py-3 text-center border-r border-border text-xs font-bold bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 cursor-help"
                                        onClick={() => toast.info("Nilai kehadiran terisi otomatis dari rekap absensi.")}
                                        title={tooltipTitle}
                                      >
                                        {ensureMinScore(finalScore).toFixed(1)}
                                      </td>
                                    );
                                  }
                                  return null;
                                })()}

                                {/* Extracted Syllabus Oncam Cell */}
                                {(() => {
                                  const oncamComp = displayComps.find(c => c.name?.toLowerCase().includes("attendance") && (c.name?.toLowerCase().includes("on cam") || c.name?.toLowerCase().includes("oncam") || c.name?.toLowerCase().includes("on-cam")));
                                  if (oncamComp) {
                                    const att = attendanceScores?.[student.id];
                                    const details = phase === "Micro" ? att?.microDetails : att?.massiveDetails;
                                    const oncamScoreVal = details?.oncamScore !== undefined ? details.oncamScore : 65.0;
                                    
                                    let tooltipTitle = "Nilai otomatis (Default: 65.0)";
                                    if (details && details.totalSyncDays > 0) {
                                      tooltipTitle = `Nilai otomatis. Kehadiran On-Cam: ${details.oncamDays}/${details.totalSyncDays} Hari`;
                                    }
                                    
                                    return (
                                      <td
                                        key={oncamComp.id}
                                        className="px-4 py-3 text-center border-r border-border text-xs font-bold bg-blue-500/5 text-blue-700 dark:text-blue-400 cursor-help"
                                        onClick={() => toast.info("Nilai kehadiran terisi otomatis dari rekap absensi.")}
                                        title={tooltipTitle}
                                      >
                                        {ensureMinScore(oncamScoreVal).toFixed(1)}
                                      </td>
                                    );
                                  }
                                  return null;
                                })()}

                                {/* Rubrik Assessment Cells */}
                                {displayRAs.map((ra) => {
                                  const score = calculateRAScore(student.id, ra);
                                  return (
                                    <td
                                      key={ra.id}
                                      className="px-4 py-3 text-center border-l border-border text-xs font-medium bg-brand-purple/5"
                                    >
                                      {ensureMinScore(score).toFixed(1)}
                                    </td>
                                  );
                                })}

                                {/* Syllabus / Competency Cells */}
                                {showSyllabusColumns && displayComps.filter(c => !c.name?.toLowerCase().includes("attendance")).map((comp) => {
                                  const directMatch = competencyScores.find(
                                    (s: any) => s.studentId === student.id && s.competencyId === comp.id
                                  );
                                  const finalScore = directMatch !== undefined ? directMatch.score : calculateCompetencyScore(student.id, comp.id);

                                  return (
                                    <td
                                      key={comp.id}
                                      className="px-4 py-3 text-center border-l border-border text-xs font-medium cursor-pointer hover:bg-brand-purple/10 transition-colors"
                                      onClick={() => {
                                        setDirectScoreModal({
                                          isOpen: true,
                                          studentId: student.id,
                                          studentName: student.name || "",
                                          compId: comp.id,
                                          compName: comp.name || "",
                                          scoreInput: finalScore.toString()
                                        });
                                      }}
                                      title="Klik untuk menginput/mengubah nilai secara langsung"
                                    >
                                      {ensureMinScore(finalScore).toFixed(1)}
                                      <Pencil className="w-2.5 h-2.5 inline-block ml-1 opacity-40" />
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

                  {/* Pagination Controls */}
                  {filteredAndSortedStudents.length > ITEMS_PER_PAGE && (
                    <div className="flex items-center justify-between px-4 py-3 mt-4 border border-border rounded-xl bg-muted/20">
                      <span className="text-xs text-muted-foreground font-medium">
                        Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedStudents.length)} dari {filteredAndSortedStudents.length} mentee (Halaman {currentPage} dari {Math.ceil(filteredAndSortedStudents.length / ITEMS_PER_PAGE)})
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className="h-8 text-xs cursor-pointer"
                        >
                          Sebelumnya
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage * ITEMS_PER_PAGE >= filteredAndSortedStudents.length}
                          onClick={() => setCurrentPage((p) => p + 1)}
                          className="h-8 text-xs cursor-pointer"
                        >
                          Selanjutnya
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* ── WARNING MODAL: RILIS SERTIFIKAT & TRANSKRIP ── */}
      {isReleaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20 shrink-0">
                  <ShieldAlert className="w-6 h-6 text-amber-600 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-base text-foreground">
                    Konfirmasi Penerbitan {assessmentTab === "Micro" ? "Transkrip Nilai" : "Sertifikat Kelulusan"}
                  </h4>
                  <p className="text-2xs text-muted-foreground mt-0.5 font-sans">
                    Tindakan ini memiliki dampak penting terhadap status akademik mentee.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReleaseModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const isCurrentReleased = assessmentTab === "Micro" ? isTranscriptReleased : isCertificateReleased;
              return (
                <div className="space-y-3 text-xs text-foreground/90 font-sans">
                  <div className={`p-3.5 rounded-xl border space-y-2 ${isCurrentReleased ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300" : "bg-brand-purple/10 border-brand-purple/20 text-brand-purple"}`}>
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {isCurrentReleased ? "KONFIRMASI PENARIKAN RILIS:" : "KONFIRMASI RILIS DOKUMEN:"}
                    </div>
                    <p className="text-2xs leading-relaxed">
                      {isCurrentReleased
                        ? `Dokumen saat ini BERSTATUS SUDAH DIRILIS. Apakah Anda yakin ingin MENARIK KEMBALI rilis ${assessmentTab === "Micro" ? "Transkrip Nilai (Micro)" : "Sertifikat Kelulusan & Magang"} untuk program ini?`
                        : `Menerbitkan ${assessmentTab === "Micro" ? "Transkrip Nilai (Micro)" : "Sertifikat Kelulusan & Magang"} akan mengizinkan seluruh mentee pada program ini untuk mengunduh dan mencetak dokumen resmi akademik mereka.`}
                    </p>
                  </div>

                  <ul className="list-disc pl-4 space-y-1 text-2xs text-muted-foreground">
                    <li>Pastikan rekap penilaian absensi, tugas, dan kompetensi sudah diperiksa.</li>
                    <li>Mentee dapat mengakses transkrip / sertifikat secara real-time setelah rilis aktif.</li>
                  </ul>
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                disabled={isSubmittingRelease}
                onClick={() => setIsReleaseModalOpen(false)}
                className="text-xs cursor-pointer font-semibold"
              >
                Batal
              </Button>

              <Button
                variant="default"
                size="sm"
                disabled={releaseCountdown > 0 || isSubmittingRelease}
                onClick={async () => {
                  if (!selectedProgramId) return;
                  setIsSubmittingRelease(true);
                  const endpoint = assessmentTab === "Micro"
                    ? `${API_BASE_URL}/classes/programs/${selectedProgramId}/release-transcript`
                    : `${API_BASE_URL}/classes/programs/${selectedProgramId}/release-certificate`;

                  try {
                    const res = await fetch(endpoint, {
                      method: "POST",
                      credentials: "include"
                    });
                    if (res.ok) {
                      const d = await res.json();
                      setIsTranscriptReleased(Boolean(d.isTranscriptReleased));
                      setIsCertificateReleased(Boolean(d.isCertificateReleased));
                      if (onToggleReleaseCertificate) {
                        onToggleReleaseCertificate(Boolean(d.isCertificateReleased));
                      }
                      setIsReleaseModalOpen(false);
                      if (assessmentTab === "Micro") {
                        toast.success(d.isTranscriptReleased ? "Transkrip Nilai (Micro) berhasil dirilis untuk mentee!" : "Rilis Transkrip Nilai ditarik kembali.");
                      } else {
                        toast.success(d.isCertificateReleased ? "Sertifikat Kelulusan & Sertifikat Magang berhasil dirilis untuk mentee!" : "Rilis Sertifikat ditarik kembali.");
                      }
                    } else {
                      const errData = await res.json().catch(() => ({}));
                      toast.error(errData.message || "Gagal memperbarui status rilis.");
                    }
                  } catch (err) {
                    toast.error("Terjadi kesalahan sistem.");
                  } finally {
                    setIsSubmittingRelease(false);
                  }
                }}
                className={
                  (assessmentTab === "Micro" ? isTranscriptReleased : isCertificateReleased)
                    ? "text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs flex items-center gap-1.5"
                    : "text-xs bg-brand-purple hover:bg-brand-purple/90 text-white font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs flex items-center gap-1.5"
                }
              >
                {isSubmittingRelease ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Memproses...
                  </>
                ) : releaseCountdown > 0 ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Tunggu ({releaseCountdown}s)...
                  </>
                ) : (assessmentTab === "Micro" ? isTranscriptReleased : isCertificateReleased) ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Tarik Kembali Rilis
                  </>
                ) : (
                  <>
                    <Award className="w-3.5 h-3.5" />
                    Ya, Konfirmasi Rilis
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── DIRECT SCORE MODAL ── */}
      {directScoreModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h4 className="font-heading font-extrabold text-base text-foreground">
                  Input Nilai Direct
                </h4>
                <p className="text-2xs text-muted-foreground mt-0.5 font-sans">
                  {directScoreModal.compName} ({directScoreModal.studentName})
                </p>
              </div>
              <button
                onClick={() => setDirectScoreModal({ ...directScoreModal, isOpen: false })}
                className="p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold">Nilai (0 - 100)</label>
              <input 
                type="number"
                min="0"
                max="100"
                step="0.1"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-purple"
                value={directScoreModal.scoreInput}
                onChange={(e) => setDirectScoreModal({ ...directScoreModal, scoreInput: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = parseFloat(directScoreModal.scoreInput);
                    if (!isNaN(val)) {
                      handleSaveDirectCompetencyScore?.(directScoreModal.studentId, directScoreModal.compId, val);
                      setDirectScoreModal({ ...directScoreModal, isOpen: false });
                    }
                  }
                }}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDirectScoreModal({ ...directScoreModal, isOpen: false })}
                className="text-xs h-9 cursor-pointer"
              >
                Batal
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  const val = parseFloat(directScoreModal.scoreInput);
                  if (!isNaN(val)) {
                    handleSaveDirectCompetencyScore?.(directScoreModal.studentId, directScoreModal.compId, val);
                    setDirectScoreModal({ ...directScoreModal, isOpen: false });
                  }
                }}
                className="text-xs h-9 bg-brand-purple hover:bg-brand-purple/90 text-white cursor-pointer"
              >
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
