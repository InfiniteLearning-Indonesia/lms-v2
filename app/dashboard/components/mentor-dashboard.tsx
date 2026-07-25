"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import { MentorLogbook } from "./mentor-logbook";
import {
  Award,
  BookOpen,
  Building2,
  CalendarDays,
  FileSpreadsheet,
  GraduationCap,
  Layers,
  Loader2,
  Lock,
  Notebook,
  Pencil,
  Phone,
  Settings,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";

import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { MentorAttendance } from "./mentor-attendance";

// Modular Sub-components & Types
import { CompetencyItem, MentorClass, MentorDashboardProps } from "./mentor/types";
import { MentorClassesView } from "./mentor/mentor-classes-view";
import { MentorStudentsView } from "./mentor/mentor-students-view";
import { MentorAssessmentView } from "./mentor/mentor-assessment-view";
import { MentorProfileSettings } from "./mentor/mentor-profile-settings";
import { MentorPastBatches } from "./mentor/mentor-past-batches";
import { MentorModals } from "./mentor/modals/mentor-modals";

export function MentorDashboard({ profile, onProfileUpdate }: MentorDashboardProps) {
  const [classes, setClasses] = useState<MentorClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("classes");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  const uniquePrograms = Array.from(new Map(
    classes.filter(c => c.program).map(c => [c.program!.id, c.program!])
  ).values());

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

  // Listen to tab query parameter dynamically
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "settings") {
      setActiveTab("settings");
    } else if (!tab && activeTab === "settings") {
      setActiveTab("classes");
    }
  }, [searchParams]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (val === "settings") {
        url.searchParams.set("tab", "settings");
      } else {
        url.searchParams.delete("tab");
      }
      window.history.pushState({}, "", url.toString());
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
      const res = await fetch(`http://localhost:7000/users/${profile.id}`, {
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
  const [rubrikAssessments, setRubrikAssessments] = useState<any[]>([]);
  const [externalScores, setExternalScores] = useState<any[]>([]);
  const [isImportingCSV, setIsImportingCSV] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [isAddCompetencyModalOpen, setIsAddCompetencyModalOpen] = useState(false);
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
      const res = await fetch("http://localhost:7000/classes/assignments/weights", {
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
      const res = await fetch("http://localhost:7000/classes/rubrik-assessments", {
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
      const res = await fetch(`http://localhost:7000/classes/rubrik-assessments/${editingRubrikAssessment.id}`, {
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
      const res = await fetch(`http://localhost:7000/classes/rubrik-assessments/${id}`, {
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
      const res = await fetch(`http://localhost:7000/classes/rubrik-assessments/${id}`, {
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
      const res = await fetch("http://localhost:7000/classes/program-distribute-modulo", {
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
      fetchRubrikAssessments(selectedProgramId);
      fetchExternalScores(selectedProgramId);
    }
  }, [selectedProgramId]);

  const fetchCompetencies = async (programId: string) => {
    try {
      const res = await fetch(`http://localhost:7000/classes/competencies?programId=${programId}`, {
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

  const fetchRubrikAssessments = async (programId: string) => {
    try {
      const res = await fetch(`http://localhost:7000/classes/programs/${programId}/rubrik-assessments`, {
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
      const res = await fetch(`http://localhost:7000/classes/programs/${programId}/rubrik-assessments/scores`, {
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
          const scoresToImport: any[] = [];

          const headerToRaId: Record<string, string> = {};
          if (results.meta.fields) {
            for (const field of results.meta.fields) {
              const ra = rubrikAssessments.find(r => r.name.toLowerCase() === field.toLowerCase());
              if (ra) {
                headerToRaId[field] = ra.id;
              }
            }
          }

          if (Object.keys(headerToRaId).length === 0) {
            toast.error("Tidak ada nama kolom CSV yang cocok dengan Rubrik Assessment.");
            setIsImportingCSV(false);
            if (csvInputRef.current) csvInputRef.current.value = "";
            return;
          }

          for (const row of data) {
            const email = row["Email"] || row["email"] || "";
            const name = row["Name"] || row["name"] || row["Nama"] || row["nama"] || "";
            if (!email && !name) continue;

            for (const field of Object.keys(row)) {
              if (headerToRaId[field]) {
                const score = parseFloat(row[field]);
                if (!isNaN(score)) {
                  scoresToImport.push({
                    email,
                    name,
                    rubrikAssessmentId: headerToRaId[field],
                    score
                  });
                }
              }
            }
          }

          if (scoresToImport.length === 0) {
            toast.warning("Tidak ada nilai yang valid untuk di-import.");
            setIsImportingCSV(false);
            if (csvInputRef.current) csvInputRef.current.value = "";
            return;
          }

          const progId = selectedProgramId || classes[0]?.program?.id;
          if (!progId) return;

          const res = await fetch(`http://localhost:7000/classes/programs/${progId}/rubrik-assessments/import-scores`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scores: scoresToImport }),
            credentials: "include"
          });

          if (res.ok) {
            const resData = await res.json();
            toast.success(`Berhasil import ${resData.importedCount} nilai.`);
            fetchExternalScores(progId);
          } else {
            toast.error("Gagal melakukan import data.");
          }
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

  const handleCreateCompetency = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("http://localhost:7000/classes/competencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          category: formData.get("category"),
          phase: formData.get("phase"),
          programId: selectedProgramId,
          isGlobal: activeRubrikTab === "professional"
        }),
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Kompetensi berhasil ditambahkan!");
        setIsAddCompetencyModalOpen(false);
        const progId = selectedProgramId || classes[0]?.program?.id;
        if (progId) fetchCompetencies(progId);
      } else {
        const error = await res.json();
        toast.error(error.message || "Gagal menambahkan kompetensi.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan koneksi.");
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
      const res = await fetch(`http://localhost:7000/classes/competencies/${editingCompetency.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          category: formData.get("category"),
          phase: formData.get("phase"),
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
      const res = await fetch(`http://localhost:7000/classes/competencies/${id}`, {
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

  const handleCreateMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch(`http://localhost:7000/classes/${selectedClassId}/material`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          type: formData.get("type"),
          competency: formData.get("competency"),
          url: formData.get("url") || formData.get("caption") || "",
          content: formData.get("content") || "",
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
    try {
      const res = await fetch(`http://localhost:7000/classes/${selectedClassId}/assignment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          competency: formData.get("competency"),
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
      const res = await fetch(`http://localhost:7000/classes/materials/${id}`, {
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
      const res = await fetch(`http://localhost:7000/classes/assignments/${id}`, {
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
      const resClasses = await fetch("http://localhost:7000/classes/mentor-classes", {
        headers: { Accept: "application/json" },
        credentials: "include",
      });

      if (resClasses.ok) {
        const dataClasses = await resClasses.json();
        setClasses(dataClasses);
        const active = dataClasses.find((cls: any) => cls.batch?.status === "active");
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
      const res = await fetch(`http://localhost:7000/users/${selectedStudentForSuspend.id}/${endpoint}`, {
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
    .filter((b) => b?.status === "active")
    .sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());

  const currentBatch = activeBatches[0];
  const activeClasses = classes.filter(
    (cls) => cls.batch?.status === "active" || (currentBatch && cls.batchId === currentBatch.id)
  );
  const pastClasses = classes.filter((cls) => !activeClasses.some((ac) => ac.id === cls.id));
  const hasPastClasses = pastClasses.length > 0;

  // Calculate stats
  const totalClasses = activeClasses.length;
  const totalStudents = activeClasses.reduce((acc, cls) => acc + (cls.enrolledStudentsCount || 0), 0);
  const allStudents = activeClasses
    .filter((cls) => !selectedProgramId || cls.program?.id === selectedProgramId)
    .flatMap((cls) => cls.enrolledStudents || []);
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

  const selectedCls = classes.find((c) => c.id === selectedClassId) || classes[0];
  const currentFacilitators = selectedCls?.facilitators || (classes && classes[0]?.facilitators) || [];
  const isReadOnly = selectedCls?.batch?.status === "completed";

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
      {/* Banner / Welcome Mentor */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a103c] via-[#2d1b69] to-[#1e144a] p-6 md:p-8 text-white shadow-lg border border-white/10"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-brand-purple/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-brand-yellow/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-brand-yellow">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal Akademik Mentor LMS v2</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-white">
              Manajemen Pembelajaran & Siswa Binaan
            </h1>
            <p className="text-sm text-white/80 leading-relaxed">
              Pantau progres kelas, kelola materi kompetensi, serta bimbing siswa sesuai
              dengan filosofi dan aturan kepemilikan program (
              <strong className="text-white">Source of Truth v2.0</strong>).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
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
        <TabsList className="bg-secondary/60 p-1.5 rounded-xl border border-border/60 flex flex-wrap min-h-14 w-full gap-1.5 justify-start md:justify-center">
          <TabsTrigger
            value="classes"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Kelas & Silabus</span>
          </TabsTrigger>

          <TabsTrigger
            value="students"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2 cursor-pointer"
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Siswa ({allStudents.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="facilitator"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>Facilitator ({currentFacilitators.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="logbook"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2 cursor-pointer"
          >
            <Notebook className="w-4 h-4 shrink-0" />
            <span>Logbook Student</span>
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2 cursor-pointer"
          >
            <CalendarDays className="w-4 h-4 shrink-0" />
            <span>Absensi</span>
          </TabsTrigger>
          <TabsTrigger
            value="rubric"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>Rubrik Penilaian</span>
          </TabsTrigger>
          <TabsTrigger
            value="assessment"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2 cursor-pointer"
          >
            <Pencil className="w-4 h-4 shrink-0" />
            <span>Assessment</span>
          </TabsTrigger>
          {hasPastClasses && (
            <TabsTrigger
              value="past-batches"
              className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Batch Lama</span>
            </TabsTrigger>
          )}
          <TabsTrigger
            value="settings"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-brand-purple data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-2 py-2 cursor-pointer"
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Pengaturan Akun</span>
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
            onDeleteMaterial={handleDeleteMaterial}
            onDeleteAssignment={handleDeleteAssignment}
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
          />
        </TabsContent>

        {/* ── TAB RUBRIK ── */}
        <TabsContent value="rubric" className="space-y-6">
          <MentorAssessmentView
            activeSubTab="rubric"
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
          />
        </TabsContent>

        {/* ── TAB ASSESSMENT (GRADEBOOK) ── */}
        <TabsContent value="assessment" className="space-y-6">
          <MentorAssessmentView
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
        isAddCompetencyModalOpen={isAddCompetencyModalOpen}
        setIsAddCompetencyModalOpen={setIsAddCompetencyModalOpen}
        handleCreateCompetency={handleCreateCompetency}
        editingCompetency={editingCompetency}
        setEditingCompetency={setEditingCompetency}
        handleUpdateCompetency={handleUpdateCompetency}
        isAddMaterialModalOpen={isAddMaterialModalOpen}
        setIsAddMaterialModalOpen={setIsAddMaterialModalOpen}
        materialType={materialType}
        setMaterialType={setMaterialType}
        handleCreateMaterial={handleCreateMaterial}
        competencies={competencies}
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
      />
    </div>
  );
}
