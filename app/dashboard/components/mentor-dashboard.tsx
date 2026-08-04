"use client";

import { API_BASE_URL } from "@/lib/config";

import Link from "next/link";
import { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import { MentorLogbook } from "./mentor-logbook";
import {
  Award,
  BookOpen,
  Building2,
  CalendarDays,
  ExternalLink,
  FileSpreadsheet,
  GraduationCap,
  Layers,
  Link2,
  Loader2,
  Lock,
  KeyRound,
  Notebook,
  Pencil,
  Phone,
  Settings,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";

import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { MentorAttendance } from "./mentor-attendance";

// Modular Sub-components & Types
import { CompetencyItem, MentorClass, MentorDashboardProps } from "./mentor/types";
import { MentorClassesView } from "./mentor/mentor-classes-view";
import { MentorStudentsView } from "./mentor/mentor-students-view";
import { MentorAssessmentView } from "./mentor/mentor-assessment-view";
import { ManageClassLinksModal } from "./admin/modals/manage-class-links-modal";
import { MentorProfileSettings } from "./mentor/mentor-profile-settings";
import { MentorPastBatches } from "./mentor/mentor-past-batches";
import { MentorModals } from "./mentor/modals/mentor-modals";
import { CloneClassModal } from "./mentor/modals/clone-class-modal";
import { RemapCompetencyModal, MismatchedItem } from "./mentor/modals/remap-competency-modal";

const MENTOR_QUOTES = [
  "Bimbingan dan dedikasi Anda adalah kunci utama keberhasilan studi siswa hari ini.",
  "Setiap umpan balik berkualitas yang Anda berikan membangun fondasi karir masa depan siswa.",
  "Mendampingi siswa dalam memecahkan masalah adalah bentuk kepemimpinan terbaik.",
  "Terus beri semangat dan arahkan siswa untuk mencapai potensi terbaik mereka.",
  "Keberhasilan siswa adalah refleksi dari komitmen dan ketelitian pendampingan Anda.",
  "Inovasi dan bimbingan konsisten Anda menginspirasi lahirnya talenta digital berbakat.",
  "Fokus pada perkembangan siswa dan pastikan setiap tantangan menjadi pembelajaran berharga.",
  "Pengajaran yang hebat tidak hanya menyampaikan materi, tetapi juga menumbuhkan rasa percaya diri.",
];

export function MentorDashboard({ profile, onProfileUpdate }: MentorDashboardProps) {
  const [randomQuote] = useState(() => MENTOR_QUOTES[Math.floor(Math.random() * MENTOR_QUOTES.length)]);
  const [classes, setClasses] = useState<MentorClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("classes");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isManageClassLinksModalOpen, setIsManageClassLinksModalOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  const uniquePrograms = Array.from(new Map(
    classes.filter(c => c.program).map(c => [c.program!.id, c.program!])
  ).values());

  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  // Suspend Dialog States
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [selectedStudentForSuspend, setSelectedStudentForSuspend] = useState<any | null>(null);
  const [isSuspending, setIsSuspending] = useState(false);
  const [suspendError, setSuspendError] = useState<string | null>(null);
  const [suspendActionType, setSuspendActionType] = useState<"suspend" | "unsuspend">("suspend");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuspendDialogOpen && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSuspendDialogOpen, countdown]);

  const searchParams = useSearchParams();

  // Listen to tab query parameter & localStorage dynamically for persistence on refresh
  useEffect(() => {
    const urlTab = searchParams.get("tab");
    const savedTab = typeof window !== "undefined" ? localStorage.getItem("mentor_dashboard_active_tab") : null;
    const validTabs = ["classes", "students", "facilitators", "logbook", "attendance", "rubrics", "assessment", "settings"];

    if (urlTab && validTabs.includes(urlTab)) {
      setActiveTab(urlTab);
      if (typeof window !== "undefined") localStorage.setItem("mentor_dashboard_active_tab", urlTab);
    } else if (savedTab && validTabs.includes(savedTab)) {
      setActiveTab(savedTab);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", savedTab);
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [searchParams]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("mentor_dashboard_active_tab", val);
      const url = new URL(window.location.href);
      url.searchParams.set("tab", val);
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Automatically switch program context when clicking a class card
  useEffect(() => {
    if (selectedClassId) {
      const cls = classes.find(c => c.id === selectedClassId);
      if (cls && cls.program?.id) {
        setSelectedProgramId(cls.program.id);
      }
    }
  }, [selectedClassId, classes]);

  // Profile Form States
  const [myName, setMyName] = useState(profile?.name || "");
  const [myWhatsapp, setMyWhatsapp] = useState(profile?.whatsapp || "");
  const [myInstitution, setMyInstitution] = useState(profile?.institution || "");
  const [myStudyProgram, setMyStudyProgram] = useState(profile?.studyProgram || "");
  const [myAvatarUrl, setMyAvatarUrl] = useState(profile?.avatarUrl || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState<string | null>(null);

  // Sync state if profile changes
  useEffect(() => {
    if (profile) {
      setMyName(profile.name || "");
      setMyWhatsapp(profile.whatsapp || "");
      setMyInstitution(profile.institution || "");
      setMyStudyProgram(profile.studyProgram || "");
      setMyAvatarUrl(profile.avatarUrl || "");
    }
  }, [profile]);

  // Clone Class States
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [isCloningClass, setIsCloningClass] = useState(false);
  const [isRemapModalOpen, setIsRemapModalOpen] = useState(false);
  const [mismatchedItems, setMismatchedItems] = useState<MismatchedItem[]>([]);
  const [isRemapping, setIsRemapping] = useState(false);

  const handleCloneClass = async (sourceClassId: string) => {
    if (!selectedClassId) return;
    setIsCloningClass(true);
    try {
      const res = await fetch(`${API_BASE_URL}/classes/${selectedClassId}/clone`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceClassId }),
      });
      if (res.ok) {
        toast.success("Berhasil! Semua materi dan tugas telah di-copy ke kelas ini.");
        setIsCloneModalOpen(false);
        
        // Cek ketidaksesuaian kompetensi (mismatch)
        const updatedClassesRes = await fetch(`${API_BASE_URL}/classes/mentor-classes`, {
          headers: { Accept: "application/json" },
          credentials: "include"
        });
        if (updatedClassesRes.ok) {
          const updatedClassesData = await updatedClassesRes.json();
          const targetClass = updatedClassesData.find((c: any) => c.id === selectedClassId);
          if (targetClass) {
            const activeCompetencies = competencies.filter(c => c.isGlobal || c.programCompetency);
            const validCompNames = new Set(activeCompetencies.map(c => c.name));
            validCompNames.add("Kompetensi Umum");
            validCompNames.add(null);
            
            const mismatches: MismatchedItem[] = [];
            
            targetClass.materials?.forEach((mat: any) => {
              if (mat.competency && !validCompNames.has(mat.competency)) {
                mismatches.push({ type: "material", id: mat.id, title: mat.title, oldCompetencyName: mat.competency });
              }
            });
            
            targetClass.assignments?.forEach((ass: any) => {
              if (ass.competency && !validCompNames.has(ass.competency)) {
                mismatches.push({ type: "assignment", id: ass.id, title: ass.title, oldCompetencyName: ass.competency });
              }
            });
            
            if (mismatches.length > 0) {
              setMismatchedItems(mismatches);
              setIsRemapModalOpen(true);
            }
          }
        }
        fetchMentorData(); // Refresh data utama
      } else {
        const err = await res.json();
        toast.error(err.message || "Gagal melakukan duplikasi materi.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem saat mencoba clone kelas.");
    } finally {
      setIsCloningClass(false);
    }
  };

  const handleRemapCompetencies = async (remappingData: { type: "material" | "assignment"; id: string; newCompetencyName: string }[]) => {
    if (!selectedClassId) return;
    setIsRemapping(true);
    try {
      const res = await fetch(`${API_BASE_URL}/classes/${selectedClassId}/remap-competencies`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remappingData }),
      });
      if (res.ok) {
        toast.success("Penyesuaian kompetensi berhasil disimpan.");
        setIsRemapModalOpen(false);
        fetchMentorData();
      } else {
        const err = await res.json();
        toast.error(err.message || "Gagal menyesuaikan kompetensi.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsRemapping(false);
    }
  };

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileSaveError("Format file tidak didukung. Harap pilih gambar (PNG, JPG, JPEG, WEBP, dll).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileSaveError("Ukuran file foto maksimal 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setMyAvatarUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    setIsSavingProfile(true);
    setProfileSaveError(null);
    setProfileSaveSuccess(null);

    try {
      const res = await fetch(`${API_BASE_URL}/users/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: myName,
          whatsapp: myWhatsapp,
          institution: myInstitution,
          studyProgram: myStudyProgram,
          avatarUrl: myAvatarUrl || null,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal memperbarui profil");
      }

      setProfileSaveSuccess("Profil Anda berhasil diperbarui!");
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (err: any) {
      console.error(err);
      setProfileSaveError(err.message || "Terjadi kesalahan saat menyimpan profil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const [distributeMessage, setDistributeMessage] = useState<string | null>(null);
  const [isDistributing, setIsDistributing] = useState(false);

  const [competencies, setCompetencies] = useState<any[]>([]);
  const [programCompetencies, setProgramCompetencies] = useState<any[]>([]);
  const [rubrikAssessments, setRubrikAssessments] = useState<any[]>([]);
  const [externalScores, setExternalScores] = useState<any[]>([]);
  const [competencyScores, setCompetencyScores] = useState<any[]>([]);
  const [attendanceScores, setAttendanceScores] = useState<Record<string, any>>({});
  const [phaseDates, setPhaseDates] = useState<any>(null);
  const [isPhaseDatesModalOpen, setIsPhaseDatesModalOpen] = useState(false);
  const [smartImportData, setSmartImportData] = useState<any>(null);
  const [isImportingCSV, setIsImportingCSV] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [isAddCompetencyModalOpen, setIsAddCompetencyModalOpen] = useState(false);
  const [isAddProgramCompetencyModalOpen, setIsAddProgramCompetencyModalOpen] = useState(false);
  const [editingProgramCompetency, setEditingProgramCompetency] = useState<any>(null);
  const [isAddRubrikAssessmentModalOpen, setIsAddRubrikAssessmentModalOpen] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] = useState(false);
  const [materialType, setMaterialType] = useState("pdf");

  const [weightUpdates, setWeightUpdates] = useState<Record<string, number>>({});
  const [isSavingWeights, setIsSavingWeights] = useState(false);

  const handleWeightChange = (assignmentId: string, val: string) => {
    setWeightUpdates((prev) => ({
      ...prev,
      [assignmentId]: parseFloat(val) || 0,
    }));
  };

  const handleSaveWeights = async () => {
    const updates = Object.keys(weightUpdates).map((id) => ({
      id,
      weight: weightUpdates[id],
    }));
    if (updates.length === 0) return;

    setIsSavingWeights(true);
    try {
      const res = await fetch(`${API_BASE_URL}/classes/assignments/weights`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ updates }),
      });
      if (res.ok) {
        toast.success("Bobot berhasil disimpan!");
        setWeightUpdates({});
        fetchMentorData();
      } else {
        toast.error("Gagal menyimpan bobot.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSavingWeights(false);
    }
  };

  const handleCreateRubrikAssessment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch(`${API_BASE_URL}/classes/rubrik-assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          phase: formData.get("phase"),
          programId: selectedProgramId,
          isGlobal: activeRubrikTab === "professional",
          competencies: [] // Default empty, we will set this in weight modal
        }),
        credentials: "include"
      });
      if (res.ok) {
        toast.success("Rubrik Assessment berhasil ditambahkan!");
        setIsAddRubrikAssessmentModalOpen(false);
        const progId = selectedProgramId || classes[0]?.program?.id;
        if (progId) fetchRubrikAssessments(progId);
      } else {
        toast.error("Gagal menambahkan Rubrik Assessment");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan koneksi.");
    }
  };

  const handleUpdateRubrikAssessment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch(`${API_BASE_URL}/classes/rubrik-assessments/${editingRubrikAssessment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          phase: formData.get("phase"),
        }),
        credentials: "include"
      });
      if (res.ok) {
        toast.success("Rubrik Assessment berhasil diperbarui!");
        setEditingRubrikAssessment(null);
        const progId = selectedProgramId || classes[0]?.program?.id;
        if (progId) fetchRubrikAssessments(progId);
      } else {
        toast.error("Gagal memperbarui Rubrik Assessment");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan koneksi.");
    }
  };

  const handleDeleteRubrikAssessment = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/classes/rubrik-assessments/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        toast.success("Rubrik Assessment berhasil dihapus!");
        const progId = selectedProgramId || classes[0]?.program?.id;
        if (progId) fetchRubrikAssessments(progId);
      } else {
        toast.error("Gagal menghapus Rubrik Assessment.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem.");
    }
  };

  const handleSaveRubrikAssessmentWeights = async (id: string, payload: { competencies: any[]; subAssessments: any[] }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/classes/rubrik-assessments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });
      if (res.ok) {
        toast.success("Bobot Rubrik Assessment berhasil disimpan!");
        setEditingWeightRubrikAssessment(null);
        const progId = selectedProgramId || classes[0]?.program?.id;
        if (progId) fetchRubrikAssessments(progId);
      } else {
        toast.error("Gagal menyimpan bobot.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem.");
    }
  };

  const handleDistributeModulo = async (progName: string) => {
    setIsDistributing(true);
    setDistributeMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/classes/program-distribute-modulo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programName: progName }),
        credentials: "include",
      });
      if (res.ok) {
        const d = await res.json();
        setDistributeMessage(d.message || "Distribusi Modulo berhasil dijalankan.");
        fetchMentorData();
      }
    } catch (err) {
      console.error("Gagal distribusi modulo:", err);
    } finally {
      setIsDistributing(false);
    }
  };

  useEffect(() => {
    fetchMentorData();
  }, []);

  useEffect(() => {
    if (classes.length > 0 && !selectedProgramId) {
      setSelectedProgramId(classes[0]?.program?.id || null);
    }
  }, [classes]);

  useEffect(() => {
    if (selectedProgramId) {
      fetchCompetencies(selectedProgramId);
      fetchProgramCompetencies(selectedProgramId || undefined);
      fetchRubrikAssessments(selectedProgramId);
      fetchExternalScores(selectedProgramId);
      fetchCompetencyScores(selectedProgramId);
      const targetBatchId = classes.find((c) => c.programId === selectedProgramId)?.batchId || classes[0]?.batchId;
      if (targetBatchId) {
        fetchAttendanceScores(targetBatchId);
      }
    }
  }, [selectedProgramId, classes]);

  const fetchCompetencies = async (programId?: string) => {
    try {
      const url = programId
        ? `${API_BASE_URL}/classes/competencies?programId=${programId}`
        : `${API_BASE_URL}/classes/competencies`;
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCompetencies(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProgramCompetencies = async (programId?: string) => {
    try {
      const url = programId 
        ? `${API_BASE_URL}/classes/program-competencies?programId=${programId}`
        : `${API_BASE_URL}/classes/program-competencies`;
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setProgramCompetencies(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRubrikAssessments = async (programId?: string) => {
    try {
      const url = programId 
        ? `${API_BASE_URL}/classes/programs/${programId}/rubrik-assessments`
        : `${API_BASE_URL}/classes/rubrik-assessments`;
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setRubrikAssessments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExternalScores = async (programId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/classes/programs/${programId}/rubrik-assessments/scores`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setExternalScores(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompetencyScores = async (programId?: string) => {
    try {
      const url = programId && programId !== 'all'
        ? `${API_BASE_URL}/classes/programs/${programId}/competencies/scores`
        : `${API_BASE_URL}/classes/competencies/scores`;
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCompetencyScores(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendanceScores = async (batchId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/attendance/scores?batchId=${batchId}`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAttendanceScores(data.scores || data);
        if (data.phaseDates) setPhaseDates(data.phaseDates);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBatchPhaseDates = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const targetBatchId = classes.find((c) => c.programId === selectedProgramId)?.batchId || classes[0]?.batchId;
    if (!targetBatchId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/classes/batches/${targetBatchId}/phase-dates`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          microStartDate: fd.get("microStartDate") || undefined,
          microEndDate: fd.get("microEndDate") || undefined,
          massiveStartDate: fd.get("massiveStartDate") || undefined,
          massiveEndDate: fd.get("massiveEndDate") || undefined,
        }),
      });
      if (res.ok) {
        toast.success("Rentang tanggal phase berhasil disimpan!");
        setIsPhaseDatesModalOpen(false);
        fetchAttendanceScores(targetBatchId);
      } else {
        toast.error("Gagal menyimpan tanggal phase.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan koneksi.");
    }
  };

  const handleSaveDirectCompetencyScore = async (studentId: string, competencyId: string, score: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/classes/competencies/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, competencyId, score }),
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Nilai berhasil disimpan!");
        const progId = selectedProgramId || classes[0]?.program?.id;
        fetchCompetencyScores(progId);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan nilai.");
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportingCSV(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data = results.data as any[];
          const fields = results.meta.fields || [];

          const matchedColumns: any[] = [];
          const missingColumns: string[] = [];

          for (const field of fields) {
            const fieldLower = field.trim().toLowerCase();
            if (["email", "nama", "name"].includes(fieldLower)) continue;

            const ra = rubrikAssessments.find((r) => r.name.trim().toLowerCase() === fieldLower);
            const comp = competencies.find((c) => c.name.trim().toLowerCase() === fieldLower);

            if (ra) {
              matchedColumns.push({ header: field, type: "rubrik", id: ra.id, name: ra.name });
            } else if (comp) {
              matchedColumns.push({ header: field, type: "competency", id: comp.id, name: comp.name });
            } else {
              missingColumns.push(field);
            }
          }

          if (missingColumns.length > 0) {
            setSmartImportData({
              isOpen: true,
              data,
              matchedColumns,
              missingColumns: missingColumns.map((col) => ({ name: col, category: "Technical" })),
            });
            setIsImportingCSV(false);
            return;
          }

          // Direct import if all columns match
          await executeSmartImport(data, matchedColumns, []);
        } catch (err) {
          console.error(err);
          toast.error("Terjadi kesalahan saat memproses CSV.");
        } finally {
          setIsImportingCSV(false);
          if (csvInputRef.current) csvInputRef.current.value = "";
        }
      },
      error: (err) => {
        console.error(err);
        toast.error("Gagal membaca file CSV.");
        setIsImportingCSV(false);
        if (csvInputRef.current) csvInputRef.current.value = "";
      }
    });
  };

  const executeSmartImport = async (data: any[], matchedColumns: any[], newColumns: any[]) => {
    try {
      const scoresToImport: any[] = [];
      for (const row of data) {
        const email = row["Email"] || row["email"] || "";
        const name = row["Name"] || row["name"] || row["Nama"] || row["nama"] || "";
        if (!email && !name) continue;

        for (const field of Object.keys(row)) {
          const score = parseFloat(row[field]);
          if (!isNaN(score)) {
            const matched = matchedColumns.find((m: any) => m.header === field);
            if (matched) {
              scoresToImport.push({
                email,
                name,
                targetType: matched.type,
                targetId: matched.id,
                score,
              });
            } else {
              scoresToImport.push({
                email,
                name,
                columnName: field,
                score,
              });
            }
          }
        }
      }

      const progId = selectedProgramId || classes[0]?.program?.id || "all";
      const res = await fetch(`${API_BASE_URL}/classes/programs/${progId}/smart-import-scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newColumns, scores: scoresToImport }),
        credentials: "include",
      });

      if (res.ok) {
        const resData = await res.json();
        toast.success(`Berhasil mengimpor ${resData.importedCount} nilai.`);
        fetchCompetencies(progId);
        fetchRubrikAssessments(progId);
        fetchExternalScores(progId);
        fetchCompetencyScores(progId);
        setSmartImportData(null);
      } else {
        toast.error("Gagal mengimpor nilai dari CSV.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem saat mengimpor.");
    }
  };

  const handleCreateCompetency = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isFormSubmitting) return;
    setIsFormSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const isGlobal = activeRubrikTab === "professional";
    try {
      const res = await fetch(`${API_BASE_URL}/classes/competencies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          category: formData.get("category"),
          programId: isGlobal ? undefined : selectedProgramId,
          isGlobal: isGlobal,
          programCompetencyId: formData.get("programCompetencyId") || undefined,
        }),
        credentials: "include",
      });
      if (res.ok) {
        toast.success(isGlobal ? "Syllabus Professional berhasil ditambahkan!" : "Syllabus berhasil ditambahkan!");
        setIsAddCompetencyModalOpen(false);
        fetchCompetencies(selectedProgramId || undefined);
      } else {
        const error = await res.json();
        toast.error(error.message || "Gagal menambahkan kompetensi.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const [editingCompetency, setEditingCompetency] = useState<any>(null);
  const [editingRubrikAssessment, setEditingRubrikAssessment] = useState<any>(null);
  const [editingWeightCompetency, setEditingWeightCompetency] = useState<any>(null);
  const [editingWeightRubrikAssessment, setEditingWeightRubrikAssessment] = useState<any>(null);
  const [activeRubrikTab, setActiveRubrikTab] = useState("kompetensi");

  const clampScore = (val: number) => {
    return Math.max(65, Math.min(95, val));
  };

  const calculateCompetencyScore = (studentId: string, compId: string) => {
    let score = 0;
    const compAssignments = classes.flatMap((cls: any) =>
      (cls.assignments || []).filter((a: any) => a.competency === compId)
    );

    for (const assignment of compAssignments) {
      const weight =
        weightUpdates[assignment.id] !== undefined
          ? weightUpdates[assignment.id]
          : assignment.weight || 0.1;
      const submission = (assignment.submissions || []).find(
        (s: any) => s.studentId === studentId
      );
      if (submission && submission.score) {
        score += clampScore(submission.score) * weight;
      }
    }
    return clampScore(score);
  };

  const handleUpdateCompetency = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCompetency) return;
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch(`${API_BASE_URL}/classes/competencies/${editingCompetency.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          category: formData.get("category"),
          programCompetencyId: formData.get("programCompetencyId") || undefined,
        }),
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Kompetensi berhasil diperbarui!");
        setEditingCompetency(null);
        const progId = selectedProgramId || classes[0]?.program?.id;
        if (progId) fetchCompetencies(progId);
      } else {
        const error = await res.json();
        toast.error(error.message || "Gagal memperbarui kompetensi.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan koneksi.");
    }
  };

  const handleDeleteCompetency = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/classes/competencies/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Kompetensi berhasil dihapus!");
        const progId = selectedProgramId || classes[0]?.program?.id;
        if (progId) fetchCompetencies(progId);
      } else {
        const error = await res.json();
        toast.error(error.message || "Gagal menghapus kompetensi.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan koneksi.");
    }
  };

  const handleDeleteProgramCompetency = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/classes/program-competencies/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Kompetensi (Sertifikat) berhasil dihapus!");
        fetchProgramCompetencies(selectedProgramId || undefined);
        if (selectedProgramId) fetchCompetencies(selectedProgramId);
      } else {
        const error = await res.json();
        toast.error(error.message || "Gagal menghapus kompetensi (sertifikat).");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan koneksi.");
    }
  };

  const handleCreateProgramCompetency = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isFormSubmitting) return;
    setIsFormSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      let syllabuses = [];
      try {
        syllabuses = JSON.parse(fd.get("syllabuses") as string || "[]");
      } catch(e) {}

      const formIsGlobal = fd.get("isGlobal");
      const isGlobal = formIsGlobal === "true" || activeRubrikTab === "professional";

      const res = await fetch(`${API_BASE_URL}/classes/program-competencies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: fd.get("name"),
          category: fd.get("category"),
          programId: isGlobal ? undefined : selectedProgramId,
          isGlobal: isGlobal,
          syllabuses,
        }),
      });
      if (res.ok) {
        toast.success(isGlobal ? "Kompetensi Professional berhasil dibuat!" : "Kompetensi Program berhasil dibuat!");
        setIsAddProgramCompetencyModalOpen(false);
        fetchProgramCompetencies(selectedProgramId || undefined);
        fetchRubrikAssessments(selectedProgramId || undefined);
        if (selectedProgramId) {
          fetchCompetencies(selectedProgramId);
        }
      } else {
        const error = await res.json();
        toast.error(error.message || "Gagal membuat kompetensi.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawSelectedRubrics = formData.get("selectedRubrics") as string;
    let selectedRubrics = null;
    if (rawSelectedRubrics) {
      try {
        selectedRubrics = JSON.parse(rawSelectedRubrics);
      } catch (err) { }
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/classes/${selectedClassId}/material`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          type: formData.get("type"),
          competency: formData.get("competency"),
          url: formData.get("url") || formData.get("caption") || "",
          content: formData.get("content") || "",
          selectedRubrics,
        }),
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Materi pembelajaran berhasil ditambahkan!");
        setIsAddMaterialModalOpen(false);
        fetchMentorData();
      } else {
        const error = await res.json();
        toast.error(error.message || "Gagal menambahkan materi.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan koneksi.");
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawSelectedRubrics = formData.get("selectedRubrics") as string;
    let selectedRubrics = null;
    if (rawSelectedRubrics) {
      try {
        selectedRubrics = JSON.parse(rawSelectedRubrics);
      } catch (err) { }
    }

    try {
      const res = await fetch(`${API_BASE_URL}/classes/${selectedClassId}/assignment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          competency: formData.get("competency"),
          selectedRubrics,
          dueDate: formData.get("dueDate"),
          submissionType: formData.get("submissionType"),
        }),
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Tugas praktik berhasil ditambahkan!");
        setIsAddAssignmentModalOpen(false);
        fetchMentorData();
      } else {
        const error = await res.json();
        toast.error(error.message || "Gagal menambahkan tugas.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan koneksi.");
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/classes/materials/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Materi pembelajaran berhasil dihapus!");
        fetchMentorData();
      } else {
        toast.error("Gagal menghapus materi.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan koneksi.");
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/classes/assignments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Tugas praktik berhasil dihapus!");
        fetchMentorData();
      } else {
        toast.error("Gagal menghapus tugas.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan koneksi.");
    }
  };

  const fetchMentorData = async () => {
    setIsLoading(true);
    try {
      const resClasses = await fetch(`${API_BASE_URL}/classes/mentor-classes`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });

      if (resClasses.ok) {
        const dataClasses = await resClasses.json();
        setClasses(dataClasses);
        const active = dataClasses.find((cls: any) => cls.batch?.status?.toLowerCase() === "active");
        if (active) {
          setSelectedClassId(active.id);
        } else if (dataClasses.length > 0) {
          setSelectedClassId(dataClasses[0].id);
        }
      }
    } catch (err) {
      console.error("Gagal memuat data mentor, menggunakan fallback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendStudent = async () => {
    if (!selectedStudentForSuspend) return;
    setIsSuspending(true);
    setSuspendError(null);
    const endpoint = suspendActionType === "suspend" ? "suspend" : "unsuspend";
    try {
      const res = await fetch(`${API_BASE_URL}/users/${selectedStudentForSuspend.id}/${endpoint}`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        setIsSuspendDialogOpen(false);
        setSelectedStudentForSuspend(null);
        fetchMentorData();
      } else {
        const errData = await res.json();
        setSuspendError(
          errData.message ||
          `Gagal ${suspendActionType === "suspend" ? "menangguhkan" : "mengaktifkan"} siswa.`
        );
      }
    } catch (err) {
      console.error(err);
      setSuspendError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSuspending(false);
    }
  };

  // Find the most recent active batch
  const activeBatches = classes
    .map((c) => c.batch)
    .filter((b) => b?.status?.toLowerCase() === "active")
    .sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());

  const currentBatch = activeBatches[0];
  const activeClasses = classes.filter(
    (cls) => cls.batch?.status?.toLowerCase() === "active" || (currentBatch && cls.batchId === currentBatch.id)
  );
  const pastClasses = classes.filter((cls) => !activeClasses.some((ac) => ac.id === cls.id));
  const hasPastClasses = pastClasses.length > 0;

  const selectedCls = classes.find((c) => c.id === selectedClassId) || classes[0];
  const currentFacilitators = selectedCls?.facilitators || (classes && classes[0]?.facilitators) || [];
  const isReadOnly = selectedCls?.batch?.status === "completed";

  // Filter orphaned competencies (where programCompetency is deleted/null)
  const activeCompetencies = useMemo(() => {
    return competencies.filter((c) => c.isGlobal || c.programCompetency);
  }, [competencies]);

  // Calculate stats
  const totalClasses = activeClasses.length;
  const totalStudents = selectedCls?.enrolledStudentsCount ?? selectedCls?.enrolledStudents?.length ?? 0;

  // Personal Student Filtering:
  // Show students enrolled in currently selectedCls (or fallback to active classes if selectedCls is null)
  const rawStudentList = selectedCls
    ? (selectedCls.enrolledStudents || [])
    : activeClasses
        .filter((cls) => !selectedProgramId || cls.program?.id === selectedProgramId)
        .flatMap((cls) => cls.enrolledStudents || []);

  const allStudents = rawStudentList.reduce((acc: any[], current: any) => {
    if (!acc.some((s) => s.id === current.id)) {
      acc.push(current);
    }
    return acc;
  }, []);

  const totalMaterials = activeClasses.reduce((acc, cls) => acc + (cls.materials?.length || 0), 0);
  const totalAssignments = activeClasses.reduce((acc, cls) => acc + (cls.assignments?.length || 0), 0);

  // Filter students based on search query
  const filteredStudents = allStudents.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      (student.name && student.name.toLowerCase().includes(query)) ||
      (student.email && student.email.toLowerCase().includes(query)) ||
      (student.selectedProgram && student.selectedProgram.toLowerCase().includes(query))
    );
  });

  // 🎓 Dual-Scope Mentorship Architecture:
  // Professional & UI/UX mentors can access secondary programs with restricted tab scope
  const specStr = String(profile?.specialization || "").toLowerCase();
  const isProfessionalMentor = specStr.includes("prof");
  const isUiUxMentor = specStr.includes("ui") || specStr.includes("ux");
  const isDualScopeMentor = isProfessionalMentor || isUiUxMentor;
  const mentorPrimaryProgram = profile?.selectedProgram || "";
  const selectedClassProgram = selectedCls?.program?.name || "";

  const isSecondaryProgram = Boolean(
    isDualScopeMentor &&
    selectedClassProgram &&
    mentorPrimaryProgram &&
    !selectedClassProgram.toLowerCase().includes(mentorPrimaryProgram.toLowerCase()) &&
    !mentorPrimaryProgram.toLowerCase().includes(selectedClassProgram.toLowerCase())
  );

  // Auto-switch restricted tabs if user currently on facilitator/logbook/attendance while viewing a Secondary Program
  useEffect(() => {
    if (isSecondaryProgram && ["facilitator", "logbook", "attendance"].includes(activeTab)) {
      setActiveTab("classes");
    }
  }, [isSecondaryProgram, activeTab]);

  // 🚫 Check if mentor account is Suspended
  if (profile?.status === "suspended") {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-lg w-full bg-card border border-red-500/30 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />
          <div className="mx-auto w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600">
            <Lock className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 font-bold text-xs uppercase tracking-wider border border-red-500/20">
              <Lock className="w-4 h-4" /> Akun Ter-Suspend
            </span>
            <h2 className="text-2xl font-heading font-extrabold text-foreground tracking-tight">
              Akses Dasbor Mentor Dibatasi
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed pt-2">
              Akun Mentor Anda saat ini dalam status <strong>suspended</strong> oleh Administrator. Seluruh akses pengajaran, kelas, dan data siswa dinonaktifkan sementara.
            </p>
          </div>
          <div className="bg-secondary/40 p-4 rounded-xl text-left border border-border text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Informasi Bantuan:</p>
            <p>Silakan hubungi Super Administrator atau Tim Operasional LMS untuk klarifikasi dan pemulihan status akun Anda.</p>
          </div>
          <button
            onClick={() => {
              fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include" })
                .then(() => (window.location.href = "/login"))
                .catch(() => (window.location.href = "/login"));
            }}
            className="w-full h-11 border border-red-500/30 text-red-600 hover:bg-red-500/10 text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            Keluar Akun
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-card border border-border rounded-xl shadow-sm">
        <Loader2 className="w-10 h-10 text-brand-purple animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground animate-pulse font-heading font-medium">
          Menyiapkan dasbor mentor akademik...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {profile?.isPasswordChanged === false && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-700 dark:text-amber-300 font-sans shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-heading">Peringatan Keamanan Akun</h4>
              <p className="text-[11px] opacity-90">
                Anda masih menggunakan password default (<code className="font-mono font-bold bg-amber-500/20 px-1 py-0.5 rounded">Student123!</code>). Harap segera ganti password Anda demi keamanan akun.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setActiveTab("settings")}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold h-9 px-4 shrink-0 cursor-pointer"
          >
            Ganti Password Sekarang
          </Button>
        </div>
      )}

      {/* Banner / Welcome Mentor */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a103c] via-[#2d1b69] to-[#1e144a] p-6 md:p-8 text-white shadow-lg border border-white/10"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-brand-purple/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-brand-yellow/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-brand-yellow">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mentor View • {selectedClassProgram || profile?.selectedProgram || "Akademik"}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-white">
                {(() => {
                  const hour = new Date().getHours();
                  let greeting = "Selamat Pagi";
                  if (hour >= 11 && hour < 15) greeting = "Selamat Siang";
                  else if (hour >= 15 && hour < 18) greeting = "Selamat Sore";
                  else if (hour >= 18 || hour < 4) greeting = "Selamat Malam";
                  return `${greeting}, ${profile?.name || "Mentor"}`;
                })()}
              </h1>
              <p className="text-sm text-white/80 leading-relaxed font-sans">
                {randomQuote}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {!isSecondaryProgram && selectedClassId && (
                <Button
                  onClick={() => setIsManageClassLinksModalOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:text-white transition-all text-xs shadow-sm cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5 mr-1.5" />
                  Kelola Link Kelas
                </Button>
              )}
              {isSecondaryProgram && (
                <span className="text-[11px] text-white/70 italic bg-white/10 px-3 py-1.5 rounded-lg border border-white/10" title="Link kelas diatur oleh Mentor Utama program ini">
                  Link diatur Mentor Utama
                </span>
              )}
              <Button
                onClick={fetchMentorData}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:text-white transition-all text-xs shadow-sm cursor-pointer"
              >
                <Loader2 className={`w-3.5 h-3.5 mr-2 ${isLoading ? "animate-spin" : "hidden"}`} />
                Segarkan Data
              </Button>
            </div>
          </div>

          {/* Quick Links Widget inside Banner */}
          {(() => {
            const cls = selectedCls as any;
            const classLinks = cls?.importantLinks && cls.importantLinks.length > 0
              ? cls.importantLinks
              : (cls?.program?.importantLinks || []);
            const activeLinks = (classLinks || []).filter((l: any) => l.url && l.url.trim() !== "");
            if (activeLinks.length === 0) return null;

            return (
              <div className="pt-4 border-t border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 font-heading">
                    <Link2 className="w-3.5 h-3.5 text-brand-yellow" />
                    Tautan Cepat & Link Penting Kelas
                  </span>
                  <span className="text-[10px] text-white/60 font-medium">
                    {activeLinks.length} Tautan Tersedia
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {activeLinks.map((item: any) => (
                    <a
                      key={item.id || item.title}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-brand-yellow/20 text-brand-yellow group-hover:scale-105 transition-transform shrink-0">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-medium text-white truncate group-hover:text-brand-yellow transition-colors">
                          {item.title}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </motion.div>
      {/* Ringkasan Statistik */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Kelas Ajar Aktif
            </CardTitle>
            <div className="p-2 bg-brand-purple/10 rounded-lg text-brand-purple">
              <BookOpen className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">{totalClasses}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-medium">Aktif</span> semester ini
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Siswa Binaan
            </CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">{totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tersebar di {totalClasses} batch kelas
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Modul & Materi
            </CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
              <Layers className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">{totalMaterials}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Materi pembelajaran terdaftar
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tugas & Praktik
            </CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">{totalAssignments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tugas aktif untuk dievaluasi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Read-Only / Status Banner */}
      {isReadOnly && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3 text-amber-700 dark:text-amber-400">
          <Lock className="w-6 h-6 shrink-0 text-amber-600" />
          <div>
            <h4 className="font-heading font-bold text-sm">Mode Read-Only Aktif</h4>
            <p className="text-xs mt-0.5">
              Batch akademik ini telah selesai. Seluruh data kelas, materi, tugas, dan nilai
              siswa dikunci menjadi arsip historis. Modifikasi data ditiadakan.
            </p>
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-secondary/60 p-1.5 rounded-xl border border-border/60 flex overflow-x-auto whitespace-nowrap min-h-14 w-full gap-1.5 justify-start md:justify-center scrollbar-none">
          <TabsTrigger
            value="classes"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2 px-3 shrink-0 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Kelas & Silabus</span>
          </TabsTrigger>

          <TabsTrigger
            value="students"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2 px-3 shrink-0 cursor-pointer"
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Siswa ({allStudents.length})</span>
          </TabsTrigger>

          <TabsTrigger
            value="facilitator"
            disabled={isSecondaryProgram}
            title={isSecondaryProgram ? "Hanya tersedia untuk Program Utama" : undefined}
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-1.5 py-2 px-3 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>Facilitator ({currentFacilitators.length})</span>
            {isSecondaryProgram && (
              <Lock className="w-3 h-3 text-amber-500 shrink-0 ml-0.5" />
            )}
          </TabsTrigger>

          <TabsTrigger
            value="logbook"
            disabled={isSecondaryProgram}
            title={isSecondaryProgram ? "Hanya tersedia untuk Program Utama" : undefined}
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-1.5 py-2 px-3 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Notebook className="w-4 h-4 shrink-0" />
            <span>Logbook Student</span>
            {isSecondaryProgram && (
              <Lock className="w-3 h-3 text-amber-500 shrink-0 ml-0.5" />
            )}
          </TabsTrigger>

          <TabsTrigger
            value="attendance"
            disabled={isSecondaryProgram}
            title={isSecondaryProgram ? "Hanya tersedia untuk Program Utama" : undefined}
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-1.5 py-2 px-3 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CalendarDays className="w-4 h-4 shrink-0" />
            <span>Absensi</span>
            {isSecondaryProgram && (
              <Lock className="w-3 h-3 text-amber-500 shrink-0 ml-0.5" />
            )}
          </TabsTrigger>

          <TabsTrigger
            value="rubric"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2 px-3 shrink-0 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>Rubrik Penilaian</span>
          </TabsTrigger>

          <TabsTrigger
            value="assessment"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2 px-3 shrink-0 cursor-pointer"
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>Rekap Nilai</span>
          </TabsTrigger>

          {hasPastClasses && (
            <TabsTrigger
              value="past-batches"
              className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2 px-3 shrink-0 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Batch Lama</span>
            </TabsTrigger>
          )}

          <TabsTrigger
            value="settings"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2 px-3 shrink-0 cursor-pointer"
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Pengaturan</span>
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: KELAS & SILABUS ── */}
        <TabsContent value="classes" className="space-y-6">
          <MentorClassesView
            profile={profile}
            classes={classes}
            activeClasses={activeClasses}
            selectedClassId={selectedClassId}
            setSelectedClassId={setSelectedClassId}
            selectedCls={selectedCls}
            isReadOnly={isReadOnly}
            isDistributing={isDistributing}
            distributeMessage={distributeMessage}
            handleDistributeModulo={handleDistributeModulo}
            onOpenAddMaterial={() => setIsAddMaterialModalOpen(true)}
            onOpenAddAssignment={() => setIsAddAssignmentModalOpen(true)}
            onOpenAddCompetency={() => setIsAddCompetencyModalOpen(true)}
            onOpenAddProgramCompetency={() => setIsAddProgramCompetencyModalOpen(true)}
            onEditCompetency={(comp) => setEditingCompetency(comp)}
            competencies={activeCompetencies}
            onDeleteMaterial={handleDeleteMaterial}
            onDeleteAssignment={handleDeleteAssignment}
            onDeleteCompetency={handleDeleteCompetency}
            onOpenCloneModal={() => setIsCloneModalOpen(true)}
          />
        </TabsContent>

        {/* ── TAB 2: SISWA BINAAN ── */}
        <TabsContent value="students" className="space-y-6">
          <MentorStudentsView
            allStudents={allStudents}
            filteredStudents={filteredStudents}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isReadOnly={isReadOnly}
            onOpenSuspendDialog={(student, action) => {
              setSelectedStudentForSuspend(student);
              setSuspendError(null);
              setSuspendActionType(action);
              setCountdown(5);
              setIsSuspendDialogOpen(true);
            }}
          />
        </TabsContent>

        {/* ── TAB FACILITATOR PROGRAM ── */}
        <TabsContent value="facilitator" className="space-y-6">
          <Card className="border-border shadow-xs bg-card rounded-2xl overflow-hidden font-sans">
            <CardHeader className="border-b border-border bg-secondary/20 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-brand-purple" />
                    Facilitator Program ({selectedCls?.program?.name || profile?.selectedProgram || "Program"})
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Daftar Facilitator Program yang bertugas mendampingi dan mengoordinasikan kegiatan pembelajaran & absensi.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-brand-purple/10 text-brand-purple border-brand-purple/20 text-xs px-3 py-1 font-bold w-fit">
                  {currentFacilitators.length} Facilitator Terdaftar
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {currentFacilitators.length === 0 ? (
                <div className="py-12 text-center border border-dashed rounded-2xl bg-secondary/10 space-y-2">
                  <UserCheck className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-xs text-muted-foreground font-medium">
                    Belum ada Facilitator yang ditugaskan pada program {selectedCls?.program?.name || profile?.selectedProgram || "ini"}.
                  </p>
                  <p className="text-[11px] text-muted-foreground/70">
                    Administrator dapat memasangkan Facilitator ke program ini melalui manajemen pengguna.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentFacilitators.map((f: any) => (
                    <div
                      key={f.id}
                      className="p-5 rounded-2xl border border-border bg-card hover:border-brand-purple/40 hover:bg-secondary/20 transition-all shadow-2xs space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          {f.avatarUrl ? (
                            <img
                              src={f.avatarUrl}
                              alt={f.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-brand-purple/20 shadow-2xs"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center font-bold font-heading text-lg border border-brand-purple/20">
                              {f.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h5 className="font-bold text-sm text-foreground font-heading">{f.name}</h5>
                            <span className="text-[11px] text-muted-foreground block">{f.email}</span>
                          </div>
                        </div>

                        <Badge
                          className={
                            f.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold"
                              : "bg-secondary text-muted-foreground text-[10px] font-bold"
                          }
                        >
                          {f.status === "active" ? "AKTIF" : f.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="flex items-center gap-1.5 text-2xs font-medium">
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                            Institusi / Kampus
                          </span>
                          <span className="font-semibold text-foreground text-2xs">
                            {f.institution || "-"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="flex items-center gap-1.5 text-2xs font-medium">
                            <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                            Program Studi / Jurusan
                          </span>
                          <span className="font-semibold text-foreground text-2xs">
                            {f.studyProgram || "-"}
                          </span>
                        </div>

                        {f.whatsapp && (
                          <div className="pt-2 flex justify-end">
                            <a
                              href={`https://wa.me/${f.whatsapp.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 text-2xs font-bold transition-all shadow-2xs"
                            >
                              <Phone className="w-3 h-3" />
                              Hubungi via WhatsApp
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB LOGBOOK ── */}
        <TabsContent value="logbook" className="space-y-6 outline-hidden">
          <MentorLogbook
            batchId={(selectedClassId ? classes.find((c) => c.id === selectedClassId)?.batchId : "") || ""}
          />
        </TabsContent>

        {/* ── TAB ABSENSI ── */}
        <TabsContent value="attendance" className="space-y-6 outline-hidden">
          <MentorAttendance
            batchId={(selectedClassId ? classes.find((c) => c.id === selectedClassId)?.batchId : "") || ""}
            mentorId={profile?.id || ""}
            classId={selectedClassId || undefined}
          />
        </TabsContent>

        {/* ── TAB RUBRIK ── */}
        <TabsContent value="rubric" className="space-y-6">
          <MentorAssessmentView
            programCompetencies={programCompetencies}
            fetchProgramCompetencies={() => fetchProgramCompetencies(selectedProgramId || undefined)}
            activeSubTab="rubric"
            competencies={competencies}
            rubrikAssessments={rubrikAssessments}
            allStudents={allStudents}
            onOpenAddCompetency={() => setIsAddCompetencyModalOpen(true)}
            onOpenAddProgramCompetency={() => setIsAddProgramCompetencyModalOpen(true)}
            onOpenAddRubrikAssessment={() => setIsAddRubrikAssessmentModalOpen(true)}
            setEditingCompetency={setEditingCompetency}
            setEditingProgramCompetency={setEditingProgramCompetency}
            handleDeleteCompetency={handleDeleteCompetency}
            handleDeleteProgramCompetency={handleDeleteProgramCompetency}
            setEditingWeightCompetency={setEditingWeightCompetency}
            setEditingRubrikAssessment={setEditingRubrikAssessment}
            handleDeleteRubrikAssessment={handleDeleteRubrikAssessment}
            setEditingWeightRubrikAssessment={setEditingWeightRubrikAssessment}
            calculateCompetencyScore={calculateCompetencyScore}
            externalScores={externalScores}
            activeRubrikTab={activeRubrikTab}
            setActiveRubrikTab={setActiveRubrikTab}
            uniquePrograms={uniquePrograms}
            selectedProgramId={selectedProgramId}
            setSelectedProgramId={setSelectedProgramId}
            csvInputRef={csvInputRef}
            handleImportCSV={handleImportCSV}
            isImportingCSV={isImportingCSV}
          />
        </TabsContent>

        {/* ── TAB ASSESSMENT (GRADEBOOK) ── */}
        <TabsContent value="assessment" className="space-y-6">
          <MentorAssessmentView
            programCompetencies={programCompetencies}
            fetchProgramCompetencies={() => fetchProgramCompetencies(selectedProgramId || undefined)}
            activeSubTab="assessment"
            competencies={competencies}
            rubrikAssessments={rubrikAssessments}
            allStudents={allStudents}
            onOpenAddCompetency={() => setIsAddCompetencyModalOpen(true)}
            onOpenAddRubrikAssessment={() => setIsAddRubrikAssessmentModalOpen(true)}
            setEditingCompetency={setEditingCompetency}
            handleDeleteCompetency={handleDeleteCompetency}
            setEditingWeightCompetency={setEditingWeightCompetency}
            setEditingRubrikAssessment={setEditingRubrikAssessment}
            handleDeleteRubrikAssessment={handleDeleteRubrikAssessment}
            setEditingWeightRubrikAssessment={setEditingWeightRubrikAssessment}
            calculateCompetencyScore={calculateCompetencyScore}
            externalScores={externalScores}
            activeRubrikTab={activeRubrikTab}
            setActiveRubrikTab={setActiveRubrikTab}
            uniquePrograms={uniquePrograms}
            selectedProgramId={selectedProgramId}
            setSelectedProgramId={setSelectedProgramId}
            csvInputRef={csvInputRef}
            handleImportCSV={handleImportCSV}
            isImportingCSV={isImportingCSV}
            isTranscriptReleased={selectedCls?.isTranscriptReleased}
            isCertificateReleased={selectedCls?.isCertificateReleased}
            attendanceScores={attendanceScores}
            competencyScores={competencyScores}
            handleSaveDirectCompetencyScore={handleSaveDirectCompetencyScore}
            phaseDates={phaseDates}
            setIsPhaseDatesModalOpen={setIsPhaseDatesModalOpen}
          />
        </TabsContent>

        {/* ── TAB BATCH LAMA ── */}
        {hasPastClasses && (
          <TabsContent value="past-batches" className="space-y-6 outline-hidden">
            <MentorPastBatches
              pastClasses={pastClasses}
              competencies={competencies}
              calculateCompetencyScore={calculateCompetencyScore}
              mentorId={profile?.id || ""}
            />
          </TabsContent>
        )}

        {/* ── TAB PENGATURAN AKUN ── */}
        <TabsContent value="settings" className="space-y-6 outline-hidden">
          <MentorProfileSettings
            profile={profile}
            myName={myName}
            setMyName={setMyName}
            myWhatsapp={myWhatsapp}
            setMyWhatsapp={setMyWhatsapp}
            myInstitution={myInstitution}
            setMyInstitution={setMyInstitution}
            myStudyProgram={myStudyProgram}
            setMyStudyProgram={setMyStudyProgram}
            myAvatarUrl={myAvatarUrl}
            setMyAvatarUrl={setMyAvatarUrl}
            isSavingProfile={isSavingProfile}
            profileSaveError={profileSaveError}
            profileSaveSuccess={profileSaveSuccess}
            handleProfileFileChange={handleProfileFileChange}
            handleSaveProfile={handleSaveProfile}
          />
        </TabsContent>
      </Tabs>

      {/* Modal Dialogs */}
      <MentorModals
        activeRubrikTab={activeRubrikTab}
        isAddCompetencyModalOpen={isAddCompetencyModalOpen}
        setIsAddCompetencyModalOpen={setIsAddCompetencyModalOpen}
        isAddProgramCompetencyModalOpen={isAddProgramCompetencyModalOpen}
        setIsAddProgramCompetencyModalOpen={setIsAddProgramCompetencyModalOpen}
        editingProgramCompetency={editingProgramCompetency}
        setEditingProgramCompetency={setEditingProgramCompetency}
        handleCreateProgramCompetency={handleCreateProgramCompetency}
        handleCreateCompetency={handleCreateCompetency}
        isFormSubmitting={isFormSubmitting}
        editingCompetency={editingCompetency}
        setEditingCompetency={setEditingCompetency}
        handleUpdateCompetency={handleUpdateCompetency}
        isAddMaterialModalOpen={isAddMaterialModalOpen}
        setIsAddMaterialModalOpen={setIsAddMaterialModalOpen}
        materialType={materialType}
        setMaterialType={setMaterialType}
        handleCreateMaterial={handleCreateMaterial}
        programCompetencies={programCompetencies}
        competencies={activeCompetencies}
        isAddAssignmentModalOpen={isAddAssignmentModalOpen}
        setIsAddAssignmentModalOpen={setIsAddAssignmentModalOpen}
        handleCreateAssignment={handleCreateAssignment}
        editingWeightCompetency={editingWeightCompetency}
        setEditingWeightCompetency={setEditingWeightCompetency}
        classes={classes}
        weightUpdates={weightUpdates}
        handleWeightChange={handleWeightChange}
        handleSaveWeights={handleSaveWeights}
        isSavingWeights={isSavingWeights}
        isSuspendDialogOpen={isSuspendDialogOpen}
        setIsSuspendDialogOpen={setIsSuspendDialogOpen}
        selectedStudentForSuspend={selectedStudentForSuspend}
        suspendActionType={suspendActionType}
        suspendError={suspendError}
        isSuspending={isSuspending}
        countdown={countdown}
        handleSuspendStudent={handleSuspendStudent}
        editingRubrikAssessment={editingRubrikAssessment}
        setEditingRubrikAssessment={setEditingRubrikAssessment}
        handleUpdateRubrikAssessment={handleUpdateRubrikAssessment}
        isAddRubrikAssessmentModalOpen={isAddRubrikAssessmentModalOpen}
        setIsAddRubrikAssessmentModalOpen={setIsAddRubrikAssessmentModalOpen}
        handleCreateRubrikAssessment={handleCreateRubrikAssessment}
        editingWeightRubrikAssessment={editingWeightRubrikAssessment}
        setEditingWeightRubrikAssessment={setEditingWeightRubrikAssessment}
        handleSaveRubrikAssessmentWeights={handleSaveRubrikAssessmentWeights}
        rubrikAssessments={rubrikAssessments}
        isPhaseDatesModalOpen={isPhaseDatesModalOpen}
        setIsPhaseDatesModalOpen={setIsPhaseDatesModalOpen}
        handleUpdateBatchPhaseDates={handleUpdateBatchPhaseDates}
        phaseDates={phaseDates}
        smartImportData={smartImportData}
        setSmartImportData={setSmartImportData}
        executeSmartImport={executeSmartImport}
      />
      <CloneClassModal
        isOpen={isCloneModalOpen}
        onClose={() => setIsCloneModalOpen(false)}
        classes={classes}
        currentClass={selectedCls}
        onClone={handleCloneClass}
        isSubmitting={isCloningClass}
      />
      <RemapCompetencyModal
        isOpen={isRemapModalOpen}
        onClose={() => setIsRemapModalOpen(false)}
        mismatchedItems={mismatchedItems}
        availableCompetencies={activeCompetencies}
        onSaveMapping={handleRemapCompetencies}
        isSubmitting={isRemapping}
      />
      <ManageClassLinksModal
        isOpen={isManageClassLinksModalOpen}
        onClose={() => setIsManageClassLinksModalOpen(false)}
        classId={selectedClassId || undefined}
        programName={selectedCls?.program?.name || "Kelas Saya"}
        initialLinks={
          (selectedCls as any)?.importantLinks && (selectedCls as any).importantLinks.length > 0
            ? (selectedCls as any).importantLinks
            : ((selectedCls as any)?.program?.importantLinks || [])
        }
        onSuccess={fetchMentorData}
      />
    </div>
  );
}
