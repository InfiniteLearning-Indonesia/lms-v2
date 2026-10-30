"use client";

import { API_BASE_URL } from "@/lib/config";

import Link from "next/link";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { FileSpreadsheet, Loader2, Pencil, Plus, Settings, Trash2, Upload, Award, Calendar, FileText, AlertTriangle, ShieldAlert, X, CheckCircle2, ArrowUpDown, TriangleAlert, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompetencyItem } from "./types";

type GradebookCell = { row: number; col: number };
type DirectScoreCell = { studentId: string; competencyId: string; score: number };
type GradebookStudent = { id: string; name?: string; email?: string };
type GradebookColumn = {
  key: string;
  label: string;
  studentIndexable: true;
} & (
  | { source: "mentee"; kind: "computed" }
  | { source: "attendance" | "oncam"; kind: "computed"; competency: CompetencyItem }
  | { source: "rubric"; kind: "computed"; rubric: { id: string; name: string } }
  | { source: "competency"; kind: "editable"; competency: CompetencyItem }
);

const cellKey = (row: number, col: number) => `${row}:${col}`;

export interface ProgramRecap {
  program: { id: string; name: string };
  canRelease: boolean;
  transcriptReleased: {
    value: boolean;
    at: string | null;
    by: string | { id?: string; name?: string | null } | null;
  };
  certificateReleased: ProgramRecap["transcriptReleased"];
  completeness: {
    totalStudents: number;
    studentsWithMassiveComplete: number;
    studentsWithMassiveIncomplete: number;
  };
  students: Array<{
    id: string;
    name: string;
    className: string;
    totalMicroScore: number;
    totalMassiveScore: number;
    finalScore: number;
    predicate: string;
    missingMassiveCount: number;
  }>;
}

interface MentorAssessmentViewProps {
  recap?: ProgramRecap | null;
  onRefetchRecap?: () => void;
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
  onSaveDirectScoresBulk?: (cells: DirectScoreCell[]) => Promise<void>;
  phaseDates?: any;
  setIsPhaseDatesModalOpen?: (v: boolean) => void;
}

export function MentorAssessmentView({
  recap = null,
  onRefetchRecap,
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
  onSaveDirectScoresBulk,
  phaseDates,
  setIsPhaseDatesModalOpen,
}: MentorAssessmentViewProps) {
  const [assessmentTab, setAssessmentTab] = useState<"Micro" | "Massive">("Micro");
  const transcriptReleasedValue = recap?.transcriptReleased.value ?? initialIsTranscriptReleased;
  const certificateReleasedValue = recap?.certificateReleased.value ?? initialIsCertificateReleased;
  const [isTranscriptReleased, setIsTranscriptReleased] = useState<boolean>(Boolean(transcriptReleasedValue));
  const [isCertificateReleased, setIsCertificateReleased] = useState<boolean>(Boolean(certificateReleasedValue));
  const [isRecapOpen, setIsRecapOpen] = useState(false);

  useEffect(() => {
    setIsTranscriptReleased(Boolean(transcriptReleasedValue));
  }, [transcriptReleasedValue, selectedProgramId]);

  useEffect(() => {
    setIsCertificateReleased(Boolean(certificateReleasedValue));
  }, [certificateReleasedValue, selectedProgramId]);
  const [internalActiveRubrikTab, setInternalActiveRubrikTab] = useState("kompetensi");
  const activeRubrikTab = externalActiveRubrikTab || internalActiveRubrikTab;
  const setActiveRubrikTab = externalSetActiveRubrikTab || setInternalActiveRubrikTab;

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showSyllabusColumns, setShowSyllabusColumns] = useState(true);
  const [anchor, setAnchor] = useState<GradebookCell | null>(null);
  const [focus, setFocus] = useState<GradebookCell | null>(null);
  const [selectionContext, setSelectionContext] = useState("");
  const [isPasting, setIsPasting] = useState(false);
  const [pendingScores, setPendingScores] = useState<Record<string, number>>({});
  const [isSavingPending, setIsSavingPending] = useState(false);
  const pendingCount = Object.keys(pendingScores).length;
  const isDragging = useRef(false);
  const dragStart = useRef<{ x: number; y: number; row: number; col: number } | null>(null);
  const didDrag = useRef(false);
  const dragTable = useRef<HTMLTableElement | null>(null);
  const pasteInProgress = useRef(false);
  const pasteOperation = useRef(0);

  useEffect(() => {
    if (activeSubTab !== "assessment") return;
    const stopDragging = () => {
      isDragging.current = false;
      dragStart.current = null;
      dragTable.current?.classList.remove("select-none");
      dragTable.current = null;
    };
    window.addEventListener("mouseup", stopDragging);
    window.addEventListener("blur", stopDragging);
    return () => {
      stopDragging();
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("blur", stopDragging);
    };
  }, [activeSubTab]);

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
  const [hasConfirmedIncompleteMassive, setHasConfirmedIncompleteMassive] = useState(false);
  const incompleteMassiveCount = recap?.completeness.studentsWithMassiveIncomplete ?? 0;
  const needsMassiveConfirmation = assessmentTab === "Massive" && incompleteMassiveCount > 0;
  const incompleteMassiveStudents = recap?.students.filter(student => student.missingMassiveCount > 0) ?? [];
  const activeRelease = assessmentTab === "Micro" ? recap?.transcriptReleased : recap?.certificateReleased;
  const releasedBy = typeof activeRelease?.by === "string"
    ? activeRelease.by
    : activeRelease?.by?.name || activeRelease?.by?.id || "—";

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
        const directMatch = competencyScores.find((cs: any) => cs.studentId === studentId && cs.competencyId === item.competencyId);
        const compScore = directMatch !== undefined ? directMatch.score : calculateCompetencyScore(studentId, item.competencyId);
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
                    {(() => {
                      const filteredProgramComps = programCompetencies?.filter((c: any) =>
                        activeRubrikTab === "professional" ? (c.isGlobal || !c.programId) : (!c.isGlobal && !!c.programId)
                      ) || [];

                      if (filteredProgramComps.length === 0) {
                        return (
                          <tr>
                            <td colSpan={3} className="py-8 text-center text-muted-foreground">
                              Belum ada kompetensi induk.
                            </td>
                          </tr>
                        );
                      }

                      const programCompsByCategory = filteredProgramComps.reduce((acc, comp) => {
                        const cat = comp.category || "Tanpa Kategori";
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push(comp);
                        return acc;
                      }, {} as Record<string, any[]>);

                      return (
                        <>
                          {(Object.entries(programCompsByCategory) as [string, any[]][]).map(([category, comps]) => (
                            <React.Fragment key={category}>
                              <tr className="bg-muted/30 border-y border-border">
                                <td colSpan={3} className="px-4 py-2 text-[11px] font-extrabold text-foreground uppercase tracking-wider bg-brand-purple/5 border-l-2 border-brand-purple">
                                  Kategori: {category}
                                </td>
                              </tr>
                              {comps.map((comp: any) => (
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
                              ))}
                            </React.Fragment>
                          ))}
                        </>
                      );
                    })()}
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
                    {(() => {
                      const filteredSyllabus = competencies.filter((c: any) =>
                        activeRubrikTab === "professional" ? (c.isGlobal || !c.programId) : (!c.isGlobal && !!c.programId)
                      ) || [];

                      if (filteredSyllabus.length === 0) {
                        return (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-muted-foreground">
                              Belum ada syllabus {activeRubrikTab === "professional" ? "professional" : ""}.
                            </td>
                          </tr>
                        );
                      }

                      const syllabusByParent = filteredSyllabus.reduce((acc, comp) => {
                        const parentName = comp.programCompetency?.name || "Tanpa Kompetensi Induk";
                        if (!acc[parentName]) acc[parentName] = [];
                        acc[parentName].push(comp);
                        return acc;
                      }, {} as Record<string, any[]>);

                      return (
                        <>
                          {(Object.entries(syllabusByParent) as [string, any[]][]).map(([parentName, comps]) => (
                            <React.Fragment key={parentName}>
                              <tr className="bg-muted/30 border-y border-border">
                                <td colSpan={4} className="px-4 py-2 text-[11px] font-extrabold text-foreground tracking-wider bg-brand-purple/5 border-l-2 border-brand-purple">
                                  Kompetensi Induk: <span className="text-brand-purple ml-1 uppercase">{parentName}</span>
                                </td>
                              </tr>
                              {comps.map((comp: any) => (
                                <tr key={comp.id} className="hover:bg-secondary/20 transition-colors">
                                  <td className="py-3.5 px-4 font-semibold text-foreground pl-6">
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
                              ))}
                            </React.Fragment>
                          ))}
                        </>
                      );
                    })()}
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

  const getColumns = (phase: string): GradebookColumn[] => {
    const displayRAs = phase === "Micro" ? microRAs : massiveRAs;
    const displayComps = competencies.filter(c => phase === "Micro" ? c.phase === "Micro" || !c.phase : c.phase === "Massive");
    const attComp = competencies.find(c => c.name?.toLowerCase().includes("attendance") && !c.name?.toLowerCase().includes("on"));
    const oncamComp = competencies.find(c => c.name?.toLowerCase().includes("attendance") && (c.name?.toLowerCase().includes("on cam") || c.name?.toLowerCase().includes("oncam") || c.name?.toLowerCase().includes("on-cam")));
    const columns: GradebookColumn[] = [
      { key: "mentee", label: "Mentee", source: "mentee", kind: "computed", studentIndexable: true },
    ];
    if (attComp) columns.push({ key: `attendance:${attComp.id}`, label: attComp.name, source: "attendance", kind: "computed", competency: attComp, studentIndexable: true });
    if (oncamComp) columns.push({ key: `oncam:${oncamComp.id}`, label: oncamComp.name, source: "oncam", kind: "computed", competency: oncamComp, studentIndexable: true });
    displayRAs.forEach(rubric => columns.push({ key: `rubric:${rubric.id}`, label: rubric.name, source: "rubric", kind: "computed", rubric, studentIndexable: true }));
    if (showSyllabusColumns) {
      displayComps.filter(c => !c.name?.toLowerCase().includes("attendance")).forEach(competency => {
        columns.push({ key: `competency:${competency.id}`, label: competency.name, source: "competency", kind: "editable", competency, studentIndexable: true });
      });
    }
    return columns;
  };

  // Both rendering and clipboard reads use the existing displayed score and rounding.
  const getCellData = (student: GradebookStudent, column: GradebookColumn, phase: string) => {
    if (column.source === "mentee") return { value: student.name || "", title: "" };
    if (column.source === "attendance" || column.source === "oncam") {
      const att = attendanceScores?.[student.id];
      const details = phase === "Micro" ? att?.microDetails : att?.massiveDetails;
      const phaseScore = phase === "Micro" ? att?.microScore : att?.massiveScore;
      const finalScore = column.source === "attendance"
        ? (phaseScore !== undefined ? phaseScore : 65.0)
        : (details?.oncamScore !== undefined ? details.oncamScore : 65.0);
      let title = "Nilai otomatis (Default: 65.0)";
      if (details && details.totalSyncDays > 0) {
        title = column.source === "attendance"
          ? `Nilai otomatis. Kehadiran: ${details.cleanAttendance}/${details.totalSyncDays} Hari (Alpha: ${details.alphaDays})`
          : `Nilai otomatis. Kehadiran On-Cam: ${details.oncamDays}/${details.totalSyncDays} Hari`;
      }
      return { value: ensureMinScore(finalScore).toFixed(1), title };
    }
    if (column.source === "rubric") {
      const score = calculateRAScore(student.id, column.rubric);
      return { value: ensureMinScore(score).toFixed(1), title: "" };
    }
    const directMatch = competencyScores.find(s => s.studentId === student.id && s.competencyId === column.competency.id);
    const finalScore: number = directMatch !== undefined ? directMatch.score : calculateCompetencyScore(student.id, column.competency.id);
    const pendingScore = pendingScores[`${student.id}:${column.competency.id}`];
    return { value: pendingScore !== undefined ? pendingScore.toFixed(1) : ensureMinScore(finalScore).toFixed(1), score: finalScore, title: "Dobel klik untuk menginput/mengubah nilai secara langsung" };
  };

  const activeColumns = getColumns(assessmentTab);
  // Coordinates belong to the visible students and columns, including their current order.
  const viewContext = JSON.stringify([assessmentTab, selectedProgramId, paginatedStudents.map(s => s.id), activeColumns.map(c => c.key)]);
  const hasSelection = selectionContext === viewContext && anchor !== null && focus !== null;
  const rectangle = hasSelection ? {
    top: Math.min(anchor.row, focus.row), bottom: Math.max(anchor.row, focus.row),
    left: Math.min(anchor.col, focus.col), right: Math.max(anchor.col, focus.col),
  } : null;

  const cancelSelection = () => {
    isDragging.current = false;
    dragStart.current = null;
    dragTable.current?.classList.remove("select-none");
    dragTable.current = null;
    setAnchor(null);
    setFocus(null);
  };

  const cancelPendingScores = () => {
    setPendingScores({});
    cancelSelection();
    // Ignore clipboard reads that finish after Batal has been pressed.
    pasteOperation.current++;
    pasteInProgress.current = false;
    setIsPasting(false);
  };

  const savePendingScores = async () => {
    if (!pendingCount || isSavingPending || isReadOnly || !onSaveDirectScoresBulk) return;
    setIsSavingPending(true);
    const cells = Object.entries(pendingScores).map(([key, score]) => {
      const [studentId, competencyId] = key.split(":");
      return { studentId, competencyId, score };
    });
    try {
      await onSaveDirectScoresBulk(cells);
      setPendingScores({});
      toast.success(`${cells.length} nilai berhasil disimpan.`, { id: "mentor-assessment-bulk" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan nilai. Silakan coba lagi.", { id: "mentor-assessment-bulk" });
    } finally {
      setIsSavingPending(false);
    }
  };

  const copySelection = async () => {
    if (!rectangle) return;
    const rows: string[] = [];
    for (let row = rectangle.top; row <= rectangle.bottom; row++) {
      const student = paginatedStudents[row];
      if (!student) continue;
      rows.push(activeColumns.slice(rectangle.left, rectangle.right + 1).map(column => getCellData(student, column, assessmentTab).value).join("\t"));
    }
    try {
      await navigator.clipboard.writeText(rows.join("\n"));
      toast.success("Pilihan disalin.");
    } catch {
      toast.error("Tidak dapat menyalin ke clipboard. Periksa izin clipboard browser.");
    }
  };

  const pasteSelection = async () => {
    if (isReadOnly || !onSaveDirectScoresBulk || isSavingPending || pasteInProgress.current) return;
    pasteInProgress.current = true;
    const operation = ++pasteOperation.current;
    setIsPasting(true);
    try {
      let clipboardText: string;
      try {
        clipboardText = await navigator.clipboard.readText();
      } catch {
        toast.error("Tidak dapat membaca clipboard. Periksa izin clipboard browser.");
        return;
      }
      if (!clipboardText || operation !== pasteOperation.current) return;
      const start = hasSelection ? anchor : { row: 0, col: activeColumns.findIndex(c => c.kind === "editable") };
      if (start.col < 0) {
        toast.error("Kolom ini tidak bisa diisi (nilai otomatis)");
        return;
      }
      const rows = clipboardText.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n");
      const cells: DirectScoreCell[] = [];
      let skipped = 0;
      let editableTargets = 0;
      rows.forEach((row, rowOffset) => {
        row.split("\t").forEach((rawValue, colOffset) => {
          const student = paginatedStudents[start.row + rowOffset];
          const column = activeColumns[start.col + colOffset];
          if (!student || !column || column.kind !== "editable") {
            skipped++;
            return;
          }
          editableTargets++;
          const normalized = rawValue.trim().replace(/%/g, "").replace(/,/g, ".").trim();
          const value = Number(normalized);
          if (!normalized || !Number.isFinite(value)) {
            skipped++;
            return;
          }
          cells.push({ studentId: student.id, competencyId: column.competency.id, score: Math.max(0, Math.min(100, value)) });
        });
      });
      if (!editableTargets) {
        toast.error("Kolom ini tidak bisa diisi (nilai otomatis)");
        return;
      }
      setPendingScores(previous => ({
        ...previous,
        ...Object.fromEntries(cells.map(({ studentId, competencyId, score }) => [`${studentId}:${competencyId}`, score])),
      }));
      toast(`${cells.length} nilai siap disimpan. Tekan Simpan untuk menyimpan.${skipped ? ` ${skipped} sel dilewati.` : ""}`);
    } finally {
      if (operation === pasteOperation.current) {
        pasteInProgress.current = false;
        setIsPasting(false);
      }
    }
  };

  const handleSelectionKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true'], [role='dialog']")) return;
    if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.repeat && event.key === "Enter" && pendingCount) {
      event.preventDefault();
      void savePendingScores();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      cancelSelection();
      return;
    }
    if (!(event.ctrlKey || event.metaKey) || event.altKey || event.repeat) return;
    if (event.key.toLowerCase() === "c" && rectangle) {
      event.preventDefault();
      void copySelection();
    } else if (event.key.toLowerCase() === "v" && !isReadOnly && onSaveDirectScoresBulk) {
      event.preventDefault();
      void pasteSelection();
    }
  };

  const getEventCell = (event: React.MouseEvent<HTMLTableCellElement>): GradebookCell | null => {
    const key = event.currentTarget.dataset.cellKey;
    if (!key) return null;
    const [row, col] = key.split(":").map(Number);
    return { row, col };
  };

  const handleCellMouseDown = (event: React.MouseEvent<HTMLTableCellElement>) => {
    if (event.button !== 0) return;
    const cell = getEventCell(event);
    if (!cell) return;
    event.preventDefault();
    event.currentTarget.closest("table")?.focus({ preventScroll: true });
    dragStart.current = { x: event.clientX, y: event.clientY, ...cell };
    didDrag.current = false;
    isDragging.current = false;
    setSelectionContext(viewContext);
    if (!event.shiftKey || !hasSelection) setAnchor(cell);
    setFocus(cell);
  };

  const handleCellMouseMove = (event: React.MouseEvent<HTMLTableCellElement>) => {
    const start = dragStart.current;
    if (!start || event.buttons !== 1) return;
    if (!didDrag.current && Math.hypot(event.clientX - start.x, event.clientY - start.y) <= 4) return;
    const cell = getEventCell(event);
    if (!cell) return;
    didDrag.current = true;
    isDragging.current = true;
    dragTable.current = event.currentTarget.closest("table");
    dragTable.current?.classList.add("select-none");
    setFocus(cell);
  };

  const handleCellDoubleClick = (event: React.MouseEvent<HTMLTableCellElement>) => {
    if (event.button !== 0 || didDrag.current || event.shiftKey) return;
    const selectedCell = getEventCell(event);
    if (!selectedCell) return;
    const student = paginatedStudents[selectedCell.row];
    const column = activeColumns[selectedCell.col];
    if (student && column?.source === "competency") {
      const cell = getCellData(student, column, assessmentTab);
      setDirectScoreModal({
        isOpen: true,
        studentId: student.id,
        studentName: student.name || "",
        compId: column.competency.id,
        compName: column.competency.name || "",
        scoreInput: cell.score?.toString() || "",
      });
    }
  };

  return (
    <>
      <Card className="border-border shadow-xs bg-card overflow-hidden font-sans" onKeyDown={handleSelectionKeyDown}>
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
              <div className="flex flex-col gap-2">
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
                {!isReadOnly && (
                  <p className="text-[11px] text-muted-foreground">Drag atau Shift+klik untuk pilih sel, Ctrl/Cmd+C salin, Ctrl/Cmd+V tempel, dobel klik untuk input nilai</p>
                )}
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
              <div className="flex flex-col items-start gap-2" title={recap?.canRelease === false ? "Hanya Head Program yang dapat merilis dokumen ini" : undefined}>
                {(() => {
                  const isCurrentReleased = assessmentTab === "Micro" ? isTranscriptReleased : isCertificateReleased;
                  return (
                    <Button
                      variant={isCurrentReleased ? "outline" : "default"}
                      size="sm"
                      disabled={recap?.canRelease === false}
                      title={recap?.canRelease === false ? "Hanya Head Program yang dapat merilis dokumen ini" : undefined}
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

                        setHasConfirmedIncompleteMassive(false);
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
                {activeRelease?.value && (
                  <p className="text-xs text-muted-foreground">
                    Dirilis oleh {releasedBy} pada {activeRelease.at
                      ? `${new Date(activeRelease.at).toLocaleString("id-ID", {
                          timeZone: "Asia/Jakarta",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })} WIB`
                      : "—"}
                  </p>
                )}
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

              <div className="flex flex-wrap items-center gap-2">
                {!isReadOnly && (
                  <>
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
                  </>
                )}
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
            </div>

            {["Micro", "Massive"].map((phase) => {
              const columns = phase === assessmentTab ? activeColumns : getColumns(phase);

              return (
                <TabsContent key={phase} value={phase} className={`space-y-6 ${pendingCount > 0 ? "pb-28" : ""}`}>
                  <div className="overflow-x-auto border border-border rounded-xl">
                    <table
                      className="w-full text-sm text-left whitespace-nowrap focus-visible:outline-2 focus-visible:outline-brand-purple"
                      tabIndex={0}
                      aria-label={`Gradebook ${phase === "Micro" ? "Initial" : "Final"}`}
                      aria-busy={isPasting}
                    >
                      <thead className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <tr className="border-b border-brand-purple/20 bg-brand-purple/5 normal-case tracking-normal">
                          {columns.map((column, col) => (
                            <th key={column.key} className={`px-2 py-1 ${column.source === "mentee" ? "sticky left-0 z-10 bg-muted" : ""}`}>
                              <button
                                type="button"
                                disabled={!paginatedStudents.length}
                                title={`Pilih seluruh kolom ${column.label} pada halaman ini`}
                                aria-label={`Pilih kolom ${column.label}`}
                                className="block w-full max-w-36 truncate rounded px-2 py-1 text-xs text-brand-purple cursor-pointer hover:bg-brand-purple/10 focus-visible:outline-2 focus-visible:outline-brand-purple disabled:opacity-50 disabled:cursor-default"
                                onClick={() => {
                                  isDragging.current = false;
                                  setSelectionContext(viewContext);
                                  setAnchor({ row: 0, col });
                                  setFocus({ row: paginatedStudents.length - 1, col });
                                }}
                              >
                                {column.label}
                              </button>
                            </th>
                          ))}
                        </tr>
                        <tr>
                          {columns.map(column => {
                            if (column.source === "mentee") {
                              return <th key={column.key} className="px-4 py-3 sticky left-0 z-10 bg-muted/95 backdrop-blur shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#262626]">Mentee</th>;
                            }
                            const headerClassName = column.source === "attendance"
                              ? "hover:text-emerald-800 dark:hover:text-emerald-200 border-r border-border bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : column.source === "oncam"
                                ? "hover:text-blue-800 dark:hover:text-blue-200 border-r border-border bg-blue-500/10 text-blue-700 dark:text-blue-300"
                                : `hover:text-brand-purple hover:underline border-l border-border ${column.source === "rubric" ? "bg-brand-purple/5" : ""}`;
                            const badgeClassName = column.source === "attendance"
                              ? "text-emerald-700/80 dark:text-emerald-300/80 bg-emerald-500/20"
                              : column.source === "oncam"
                                ? "text-blue-700/80 dark:text-blue-300/80 bg-blue-500/20"
                                : column.source === "rubric" ? "text-muted-foreground bg-secondary" : "text-brand-purple bg-brand-purple/10";
                            return (
                              <th
                                key={column.key}
                                className={`px-4 py-3 cursor-pointer transition-colors text-center ${headerClassName}`}
                                onClick={() => {
                                  if (column.source === "rubric") setEditingWeightRubrikAssessment?.(column.rubric);
                                  else setEditingWeightCompetency(column.competency);
                                }}
                                title={column.source === "rubric" ? "Klik untuk mengatur bobot kompetensi di Rubrik Assessment ini" : "Klik untuk mengatur bobot tugas di kompetensi/syllabus ini"}
                              >
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${badgeClassName}`}>
                                    {column.source === "rubric" ? `Rubrik ${phase === "Micro" ? "Initial" : "Final"}` : column.competency.category || "Syllabus"}
                                  </span>
                                  <span className={`font-semibold flex items-center gap-1 ${column.source === "rubric" ? "text-brand-purple" : ""}`}>
                                    {column.label}
                                    <Pencil className="w-2.5 h-2.5 inline-block opacity-40" />
                                  </span>
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredAndSortedStudents.length === 0 ? (
                          <tr>
                            <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                              Belum ada mentee yang terdaftar atau cocok dengan pencarian.
                            </td>
                          </tr>
                        ) : (
                          paginatedStudents.map((student, row) => (
                            <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                              {columns.map((column, col) => {
                                const cell = getCellData(student, column, phase);
                                const hasPendingScore = column.kind === "editable" && pendingScores[`${student.id}:${column.competency.id}`] !== undefined;
                                const selected = phase === assessmentTab && rectangle !== null && row >= rectangle.top && row <= rectangle.bottom && col >= rectangle.left && col <= rectangle.right;
                                const cellClassName = column.source === "mentee"
                                  ? "sticky left-0 z-10 shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#262626]"
                                  : column.source === "attendance"
                                    ? "text-center border-r border-border text-xs font-bold text-emerald-700 dark:text-emerald-400"
                                    : column.source === "oncam"
                                      ? "text-center border-r border-border text-xs font-bold text-blue-700 dark:text-blue-400"
                                      : `text-center border-l border-border text-xs ${hasPendingScore ? "text-amber-600 dark:text-amber-400 font-bold" : "font-medium"}`;
                                const backgroundClassName = hasPendingScore
                                  ? `bg-amber-500/10 ring-1 ring-amber-500/40 ${selected ? "outline-2 -outline-offset-2 outline-brand-purple/60" : ""}`
                                  : selected
                                  ? "ring-2 ring-inset ring-brand-purple/60 bg-brand-purple/10"
                                  : column.source === "mentee" ? "bg-card"
                                    : column.source === "attendance" ? "bg-emerald-500/5"
                                      : column.source === "oncam" ? "bg-blue-500/5"
                                        : column.source === "rubric" ? "bg-brand-purple/5" : "hover:bg-brand-purple/10";
                                return (
                                  <td
                                    key={column.key}
                                    data-cell-key={cellKey(row, col)}
                                    data-selected={selected || undefined}
                                    className={`px-4 py-3 transition-colors ${cellClassName} ${backgroundClassName} ${column.kind === "editable" ? "cursor-pointer" : "cursor-cell"}`}
                                    title={hasPendingScore ? "Belum disimpan, tekan Simpan" : cell.title}
                                    onMouseDown={handleCellMouseDown}
                                    onMouseMove={handleCellMouseMove}
                                    onDoubleClick={column.kind === "editable" ? handleCellDoubleClick : undefined}
                                  >
                                    {column.source === "mentee" ? (
                                      <>
                                        <div className="font-semibold text-foreground text-xs">{cell.value}</div>
                                        <div className="text-[10px] text-muted-foreground">{student.email}</div>
                                      </>
                                    ) : (
                                      <>
                                        {cell.value}
                                        {hasPendingScore && <span className="ml-1" aria-label="Belum disimpan, tekan Simpan">•</span>}
                                      </>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))
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
          {activeSubTab === "assessment" && recap && (
            <section className="rounded-xl border border-border bg-card" aria-label={`Rekap Program ${recap.program.name}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-foreground">Rekap Program {recap.program.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Total siswa: {recap.completeness.totalStudents}</Badge>
                    <Badge variant="outline">Massive lengkap: {recap.completeness.studentsWithMassiveComplete}</Badge>
                    <Badge variant="outline">Belum lengkap: {recap.completeness.studentsWithMassiveIncomplete}</Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  aria-expanded={isRecapOpen}
                  aria-controls="program-recap-table"
                  onClick={() => setIsRecapOpen(open => !open)}
                >
                  {isRecapOpen ? "Sembunyikan rekap" : "Lihat rekap"}
                </Button>
              </div>
              {isRecapOpen && (
                <div id="program-recap-table" className="overflow-x-auto border-t border-border">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/30 text-muted-foreground">
                      <tr>
                        {["Nama", "Kelas", "Micro", "Massive", "Nilai Akhir", "Predikat", "Item Kurang"].map(label => (
                          <th key={label} scope="col" className="px-4 py-3 whitespace-nowrap font-semibold">{label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recap.students.map(student => (
                        <tr key={student.id}>
                          <td className="px-4 py-3 font-medium">{student.name}</td>
                          <td className="px-4 py-3">{student.className}</td>
                          <td className="px-4 py-3 tabular-nums">{Number(student.totalMicroScore).toFixed(1)}</td>
                          <td className="px-4 py-3 tabular-nums">{Number(student.totalMassiveScore).toFixed(1)}</td>
                          <td className="px-4 py-3 tabular-nums">{Number(student.finalScore).toFixed(1)}</td>
                          <td className="px-4 py-3">{student.predicate}</td>
                          <td className={`px-4 py-3 tabular-nums ${student.missingMassiveCount > 0 ? "font-semibold text-amber-700 dark:text-amber-400" : "text-muted-foreground"}`}>
                            {student.missingMassiveCount}
                          </td>
                        </tr>
                      ))}
                      {recap.students.length === 0 && (
                        <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">Belum ada siswa pada program ini.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </CardContent>
        {pendingCount > 0 && (
          <div
            className="fixed bottom-5 left-1/2 z-50 w-[min(92vw,640px)] -translate-x-1/2 rounded-xl border border-amber-500/50 bg-card/95 px-4 py-3 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-card/80"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Kamu memiliki {pendingCount} perubahan nilai yang belum disimpan
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tekan Simpan untuk menerapkan, atau Batal untuk mengembalikan nilai asli.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:shrink-0">
                <Button size="sm" onClick={() => void savePendingScores()} disabled={isSavingPending || isReadOnly || !onSaveDirectScoresBulk}>
                  {isSavingPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Simpan
                </Button>
                <Button size="sm" variant="outline" onClick={cancelPendingScores}>Batal</Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ── WARNING MODAL: RILIS SERTIFIKAT & TRANSKRIP ── */}
      {isReleaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full max-h-[90dvh] overflow-y-auto p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
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

            {needsMassiveConfirmation && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3 text-xs text-amber-800 dark:text-amber-300">
                <p className="font-semibold">{incompleteMassiveCount} mentee belum memiliki nilai Massive lengkap</p>
                <ul className="list-disc pl-4 space-y-1">
                  {incompleteMassiveStudents.slice(0, 10).map(student => <li key={student.id}>{student.name}</li>)}
                </ul>
                {incompleteMassiveCount > 10 && <p>+ {incompleteMassiveCount - 10} lainnya</p>}
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasConfirmedIncompleteMassive}
                    onChange={event => setHasConfirmedIncompleteMassive(event.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-brand-purple"
                  />
                  <span>Saya mengerti dan tetap ingin merilis sertifikat</span>
                </label>
              </div>
            )}

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
                disabled={releaseCountdown > 0 || isSubmittingRelease || recap?.canRelease === false || (needsMassiveConfirmation && !hasConfirmedIncompleteMassive)}
                onClick={async () => {
                  if (!selectedProgramId || recap?.canRelease === false || (needsMassiveConfirmation && !hasConfirmedIncompleteMassive)) return;
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
                      onRefetchRecap?.();
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
