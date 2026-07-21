"use client";

import { useEffect, useState } from "react";
import { AdminAttendance } from "./admin-attendance";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Trash2,
  RefreshCw,
  Edit2,
  UserCheck,
  UserX,
  X,
  AlertCircle,
  CheckCircle2,
  Mail,
  ShieldAlert,
  Award,
  BookOpen,
  Settings,
  Shield,
  Layers,
  Loader2,
  Lock,
  Plus,
  ChevronRight,
  GraduationCap,
  Calendar,
  FileSpreadsheet,
  Upload,
  Copy,
  Check,
  User,
  Phone,
  School,
  Save,
  Search,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: "admin" | "mentor" | "student";
  roles?: ("admin" | "mentor" | "student")[];
  status: "invited" | "active" | "suspended";
  createdAt: string;
  lastLoginAt: string | null;
  whatsapp?: string | null;
  institution?: string | null;
  studyProgram?: string | null;
  selectedProgram?: string | null;
  specialization?: string | null;
  batches?: { id: string; name: string }[];
}

interface AdminDashboardProps {
  profile?: {
    id: string;
    name: string;
    email: string;
    role: string;
    roles?: string[];
    whatsapp?: string | null;
    institution?: string | null;
    studyProgram?: string | null;
    avatarUrl?: string | null;
  };
  onProfileUpdate?: () => void;
}

export function AdminDashboard({ profile, onProfileUpdate }: AdminDashboardProps) {
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Profile Form States
  const [profileName, setProfileName] = useState(profile?.name || "");
  const [profileWhatsapp, setProfileWhatsapp] = useState(profile?.whatsapp || "");
  const [profileInstitution, setProfileInstitution] = useState(profile?.institution || "");
  const [profileStudyProgram, setProfileStudyProgram] = useState(profile?.studyProgram || "");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(profile?.avatarUrl || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState<string | null>(null);

  const defaultAvatars = [
    "/avatars/avatar_1.png",
    "/avatars/avatar_2.png",
    "/avatars/avatar_3.png",
    "/avatars/avatar_4.png",
    "/avatars/avatar_5.png",
  ];

  const getEffectiveAvatar = () => {
    if (profileAvatarUrl) return profileAvatarUrl;
    const code = profile?.id ? profile.id.charCodeAt(0) + profile.id.charCodeAt(profile.id.length - 1) : 1;
    const index = (code % 5) + 1;
    return `/avatars/avatar_${index}.png`;
  };

  // Sync state if profile changes
  useEffect(() => {
    if (profile) {
      setProfileName(profile.name || "");
      setProfileWhatsapp(profile.whatsapp || "");
      setProfileInstitution(profile.institution || "");
      setProfileStudyProgram(profile.studyProgram || "");
      setProfileAvatarUrl(profile.avatarUrl || "");
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
        setProfileAvatarUrl(event.target.result as string);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profileName,
          whatsapp: profileWhatsapp,
          institution: profileInstitution,
          studyProgram: profileStudyProgram,
          avatarUrl: profileAvatarUrl || null,
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

  // Main admin dashboard tabs state
  const [activeTab, setActiveTab] = useState("users");

  const searchParams = useSearchParams();

  // Listen to tab query parameter dynamically
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "settings") {
      setActiveTab("settings");
    } else if (!tab && activeTab === "settings") {
      setActiveTab("users");
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

  // Sub-tabs under User Management Sub-section
  const [adminSubTab, setAdminSubTab] = useState<"users" | "invite">("users");

  // Admin Tab - Users List State
  const [usersList, setUsersList] = useState<UserListItem[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSendingEmailMap, setIsSendingEmailMap] = useState<Record<string, boolean>>({});
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userBatchFilter, setUserBatchFilter] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("");

  // Admin Tab - Single Invite Form State
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "mentor" | "student">("student");

  // Single Invite optional metadata fields
  const [inviteWhatsapp, setInviteWhatsapp] = useState("");
  const [inviteInstitution, setInviteInstitution] = useState("");
  const [inviteStudyProgram, setInviteStudyProgram] = useState("");
  const [inviteSelectedProgram, setInviteSelectedProgram] = useState("");
  const [inviteSpecialization, setInviteSpecialization] = useState("");
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

  // Admin Tab - Bulk Invite Form State
  const [rawEmails, setRawEmails] = useState("");
  const [bulkRole, setBulkRole] = useState<"admin" | "mentor" | "student">("student");
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ invited: any[]; failed: any[] } | null>(null);

  // Admin Tab - Edit User Modal State (Popup Dialog)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState("");
  const [editingEmailValue, setEditingEmailValue] = useState("");
  const [editingWhatsappValue, setEditingWhatsappValue] = useState("");
  const [editingInstitutionValue, setEditingInstitutionValue] = useState("");
  const [editingStudyProgramValue, setEditingStudyProgramValue] = useState("");
  const [editingSelectedProgramValue, setEditingSelectedProgramValue] = useState("");
  const [editingUserBatches, setEditingUserBatches] = useState<string[]>([]);

  // Reusable Confirmation Dialog State (Shadcn-like)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDescription, setConfirmDescription] = useState("");
  const [confirmButtonText, setConfirmButtonText] = useState("Konfirmasi");
  const [confirmIsDestructive, setConfirmIsDestructive] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmCountdown, setConfirmCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isConfirmOpen && confirmCountdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isConfirmOpen, confirmCountdown]);

  // Helper alias to update countdown state without type issues
  const setCountdown = (val: number | ((prev: number) => number)) => {
    setConfirmCountdown(val);
  };

  const triggerConfirm = (
    title: string,
    description: string,
    buttonText: string,
    isDestructive: boolean,
    action: () => void
  ) => {
    setConfirmTitle(title);
    setConfirmDescription(description);
    setConfirmButtonText(buttonText);
    setConfirmIsDestructive(isDestructive);
    setConfirmAction(() => action);
    setConfirmCountdown(0);
    setIsConfirmOpen(true);
  };

  // Program Management State
  const [programsData, setProgramsData] = useState<any>(null);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const [selectedProgramDetail, setSelectedProgramDetail] = useState<any | null>(null);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);

  // Student Enrollment State (Case 1, 2, 3)
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [enrollCase, setEnrollCase] = useState<"case1" | "case2" | "case3">("case2");
  const [selectedStudentToEnroll, setSelectedStudentToEnroll] = useState<string>("");
  const [selectedMentorForEnroll, setSelectedMentorForEnroll] = useState<string>("");
  const [isSubmittingEnroll, setIsSubmittingEnroll] = useState(false);

  // Mentor Assignment State
  const [isAddMentorModalOpen, setIsAddMentorModalOpen] = useState(false);
  const [selectedMentorToAssign, setSelectedMentorToAssign] = useState<string>("");
  const [isSubmittingAssignMentor, setIsSubmittingAssignMentor] = useState(false);
  // Batch Creation & Management State (Global Cohort)
  const [batchesList, setBatchesList] = useState<any[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [isCreateBatchModalOpen, setIsCreateBatchModalOpen] = useState(false);
  const [newBatchName, setNewBatchName] = useState("");
  const [newBatchStatus, setNewBatchStatus] = useState<"draft" | "active">("draft");
  const [newBatchStartDate, setNewBatchStartDate] = useState("");
  const [newBatchEndDate, setNewBatchEndDate] = useState("");
  const [selectedProgramIdsForBatch, setSelectedProgramIdsForBatch] = useState<string[]>([]);
  const [customProgramInput, setCustomProgramInput] = useState("");
  const [isSubmittingCreateBatch, setIsSubmittingCreateBatch] = useState(false);

  // Program tab historical batch selection
  const [selectedOldBatchId, setSelectedOldBatchId] = useState<string>("none");

  // Batch Editing State
  const [isEditBatchModalOpen, setIsEditBatchModalOpen] = useState(false);
  const [selectedBatchForEdit, setSelectedBatchForEdit] = useState<any | null>(null);
  const [editBatchName, setEditBatchName] = useState("");
  const [editBatchIncludedProgramIds, setEditBatchIncludedProgramIds] = useState<string[]>([]);
  const [editBatchStartDate, setEditBatchStartDate] = useState("");
  const [editBatchEndDate, setEditBatchEndDate] = useState("");
  const [isSubmittingEditBatch, setIsSubmittingEditBatch] = useState(false);

  // Batch Detail statistics State
  const [isBatchDetailModalOpen, setIsBatchDetailModalOpen] = useState(false);
  const [selectedBatchForDetail, setSelectedBatchForDetail] = useState<any | null>(null);
  // CSV Importer State
  const [csvText, setCsvText] = useState("");
  const [selectedBatchForImport, setSelectedBatchForImport] = useState("");
  const [autoDistributeImport, setAutoDistributeImport] = useState(false);
  const [isSubmittingImport, setIsSubmittingImport] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [copiedHeader, setCopiedHeader] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [parsedStudents, setParsedStudents] = useState<any[]>([]);
  const [useFileUpload, setUseFileUpload] = useState(false);

  // Mentor Assignment Matrix State
  const [isMentorMatrixModalOpen, setIsMentorMatrixModalOpen] = useState(false);
  const [selectedBatchForMatrix, setSelectedBatchForMatrix] = useState<any>(null);
  const [matrixProgramMentors, setMatrixProgramMentors] = useState<Record<string, string[]>>({});
  const [isSubmittingMatrix, setIsSubmittingMatrix] = useState(false);

  useEffect(() => {
    fetchUsersList();
    fetchProgramsList();
    fetchBatchesList();
  }, []);

  const fetchBatchesList = async () => {
    setIsLoadingBatches(true);
    try {
      const res = await fetch("http://localhost:7000/classes/batches", {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setBatchesList(data);
        const active = data.find((b: any) => b.status === "active");
        if (active) {
          setSelectedBatchForImport(active.id);
        }
      }
    } catch (err) {
      console.error("Gagal memuat data batch:", err);
    } finally {
      setIsLoadingBatches(false);
    }
  };

  const fetchProgramsList = async () => {
    setIsLoadingPrograms(true);
    try {
      const res = await fetch("http://localhost:7000/classes/programs-list", {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setProgramsData(data);
      }
    } catch (err) {
      console.error("Gagal memuat data program:", err);
    } finally {
      setIsLoadingPrograms(false);
    }
  };

  const executeEnrollment = async (isCase3Transfer = false) => {
    setIsSubmittingEnroll(true);
    try {
      const res = await fetch("http://localhost:7000/classes/program-enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentToEnroll,
          programName: selectedProgramDetail?.name || "",
          mentorId: selectedMentorForEnroll || undefined,
          isCase3Transfer,
        }),
        credentials: "include",
      });
      if (res.ok) {
        setIsAddStudentModalOpen(false);
        fetchProgramsList();
        fetchUsersList();
        const updated = await fetch("http://localhost:7000/classes/programs-list", {
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        if (updated.ok) {
          const d = await updated.json();
          setProgramsData(d);
          const p = d.programs.find((x: any) => x.id === selectedProgramDetail?.id);
          if (p) setSelectedProgramDetail(p);
        }
      }
    } catch (err) {
      console.error("Gagal mendaftarkan siswa:", err);
    } finally {
      setIsSubmittingEnroll(false);
    }
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentToEnroll) return;
    if (enrollCase === "case3") {
      triggerConfirm(
        "Konfirmasi Clean Transfer (Reset Progres)",
        "Peringatan: Memindahkan murid antar program (Case 3) akan menghapus SELURUH nilai, absen, tugas, dan progres di program lamanya. Murid harus mengerti dan mengulang dari awal di program baru. Lanjutkan pemindahan?",
        "Ya, Pindahkan & Reset Progres",
        true,
        () => executeEnrollment(true)
      );
    } else {
      executeEnrollment(false);
    }
  };

  const handleAssignMentorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentorToAssign || !selectedProgramDetail) return;
    setIsSubmittingAssignMentor(true);
    try {
      const res = await fetch("http://localhost:7000/classes/program-assign-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId: selectedMentorToAssign,
          programName: selectedProgramDetail.name,
        }),
        credentials: "include",
      });
      if (res.ok) {
        setIsAddMentorModalOpen(false);
        fetchProgramsList();
        fetchUsersList();
        const updated = await fetch("http://localhost:7000/classes/programs-list", {
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        if (updated.ok) {
          const d = await updated.json();
          setProgramsData(d);
          const p = d.programs.find((x: any) => x.id === selectedProgramDetail.id);
          if (p) setSelectedProgramDetail(p);
        }
      }
    } catch (err) {
      console.error("Gagal menugaskan mentor:", err);
    } finally {
      setIsSubmittingAssignMentor(false);
    }
  };

  const handleCreateBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim()) return;

    const newProgramsList = customProgramInput
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const executeCreate = async () => {
      setIsSubmittingCreateBatch(true);
      try {
        const res = await fetch("http://localhost:7000/classes/batches", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            name: newBatchName.trim(),
            status: newBatchStatus,
            includedProgramIds: selectedProgramIdsForBatch,
            newProgramNames: newProgramsList,
            startDate: newBatchStartDate || null,
            endDate: newBatchEndDate || null,
          }),
          credentials: "include",
        });
        if (res.ok) {
          setIsCreateBatchModalOpen(false);
          setNewBatchName("");
          setNewBatchStatus("draft");
          setNewBatchStartDate("");
          setNewBatchEndDate("");
          setCustomProgramInput("");
          fetchBatchesList();
          fetchProgramsList();
        } else {
          const err = await res.json();
          alert(err.message || "Gagal membuat batch baru.");
        }
      } catch (err) {
        console.error("Gagal membuat batch baru:", err);
      } finally {
        setIsSubmittingCreateBatch(false);
      }
    };

    if (newBatchStatus === "active") {
      triggerConfirm(
        "Konfirmasi Pembuatan & Aktivasi Batch",
        `Membuat "${newBatchName}" dengan status ACTIVE akan otomatis mengunci batch aktif saat ini ke dalam Mode Read-Only (Selesai). Lanjutkan?`,
        "Ya, Buat & Aktifkan",
        false,
        executeCreate
      );
    } else {
      executeCreate();
    }
  };

  const handleEditBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForEdit) return;
    if (!editBatchName.trim()) return;

    setIsSubmittingEditBatch(true);
    try {
      const res = await fetch(`http://localhost:7000/classes/batches/${selectedBatchForEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: editBatchName.trim(),
          includedProgramIds: editBatchIncludedProgramIds,
          startDate: editBatchStartDate || null,
          endDate: editBatchEndDate || null,
        }),
        credentials: "include",
      });

      if (res.ok) {
        setIsEditBatchModalOpen(false);
        setSelectedBatchForEdit(null);
        setEditBatchName("");
        setEditBatchIncludedProgramIds([]);
        setEditBatchStartDate("");
        setEditBatchEndDate("");
        fetchBatchesList();
        fetchProgramsList();
      } else {
        const err = await res.json();
        alert(err.message || "Gagal memperbarui batch.");
      }
    } catch (err) {
      console.error("Gagal memperbarui batch:", err);
      alert("Terjadi kesalahan saat menghubungi server.");
    } finally {
      setIsSubmittingEditBatch(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text || "");
    };
    reader.readAsText(file);
  };

  const handleCsvReview = (e: React.FormEvent) => {
    e.preventDefault();
    const activeBatch = batchesList.find((b: any) => b.status === "active");
    if (!activeBatch) {
      alert("Gagal memproses CSV: Tidak ada Cohort/Batch yang berstatus ACTIVE saat ini. Murid hanya bisa didaftarkan ke batch aktif.");
      return;
    }
    if (!selectedBatchForImport) {
      alert("Pilih Batch tujuan terlebih dahulu!");
      return;
    }
    if (!csvText.trim()) {
      alert("Teks CSV / data tidak boleh kosong!");
      return;
    }

    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) {
      alert("Data CSV harus memiliki minimal 1 baris header dan 1 baris data murid!");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIdx = headers.indexOf("name");
    const emailIdx = headers.indexOf("email");
    const whatsappIdx = headers.indexOf("whatsapp");
    const instIdx = headers.indexOf("institution");
    const studyIdx = headers.indexOf("studyprogram");
    const progIdx = headers.indexOf("selectedprogram");

    if (nameIdx === -1 || emailIdx === -1 || progIdx === -1) {
      alert("Header CSV wajib mengandung kolom: name, email, selectedProgram");
      return;
    }

    const usersToImport = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      if (!cols[nameIdx] || !cols[emailIdx]) continue;
      usersToImport.push({
        name: cols[nameIdx],
        email: cols[emailIdx],
        whatsapp: whatsappIdx !== -1 ? cols[whatsappIdx] : "",
        institution: instIdx !== -1 ? cols[instIdx] : "",
        studyProgram: studyIdx !== -1 ? cols[studyIdx] : "",
        selectedProgram: cols[progIdx] || "",
      });
    }

    if (usersToImport.length === 0) {
      alert("Tidak ada data murid valid yang ditemukan!");
      return;
    }

    setParsedStudents(usersToImport);
    setIsReviewModalOpen(true);
  };

  const executeCsvImport = async () => {
    setIsReviewModalOpen(false);
    setIsSubmittingImport(true);
    setImportResult(null);
    try {
      const res = await fetch(`http://localhost:7000/classes/batches/${selectedBatchForImport}/import-enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({
          users: parsedStudents,
          autoDistribute: false, // strictly false as requested ("belum ke mentor")
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setImportResult(data);
        setCsvText("");
        fetchBatchesList();
        fetchProgramsList();
        fetchUsersList();
      } else {
        const err = await res.json();
        alert(`Gagal impor: ${err.message || "Terjadi kesalahan"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi saat mengimpor data.");
    } finally {
      setIsSubmittingImport(false);
    }
  };

  const handleSaveMentorMatrix = async () => {
    if (!selectedBatchForMatrix) return;
    setIsSubmittingMatrix(true);
    try {
      for (const prog of selectedBatchForMatrix.includedPrograms || []) {
        const selectedMentorIds = matrixProgramMentors[prog.id] || [];
        await fetch(`http://localhost:7000/classes/batches/${selectedBatchForMatrix.id}/assign-mentors`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          credentials: "include",
          body: JSON.stringify({
            programId: prog.id,
            mentorIds: selectedMentorIds,
          }),
        });
      }
      setIsMentorMatrixModalOpen(false);
      fetchBatchesList();
      fetchProgramsList();
      fetchUsersList();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan penugasan mentor.");
    } finally {
      setIsSubmittingMatrix(false);
    }
  };

  const fetchUsersList = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch("http://localhost:7000/users", {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
        setSelectedUserIds([]);
      }
    } catch (err) {
      console.error("Gagal memuat daftar user:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSingleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (inviteRole === "student") {
      const activeBatch = batchesList.find((b: any) => b.status === "active");
      if (!activeBatch) {
        setError("Gagal mendaftarkan student: Tidak ada Cohort/Batch yang berstatus ACTIVE saat ini. Murid hanya bisa didaftarkan ke batch aktif.");
        return;
      }
    }

    const name = inviteName.trim();
    const email = inviteEmail.trim().toLowerCase();
    const whatsapp = inviteWhatsapp.trim();

    if (!name) {
      setError("Nama Lengkap wajib diisi.");
      return;
    }
    if (!email) {
      setError("Alamat Email wajib diisi.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format alamat email tidak valid (harus mengandung '@' dan domain yang benar).");
      return;
    }

    if (whatsapp) {
      const waRegex = /^\+?[0-9]{5,15}$/;
      if (!waRegex.test(whatsapp)) {
        setError("Format No WhatsApp tidak valid (harus berupa nomor telepon 5-15 digit).");
        return;
      }
    }

    if (inviteRole === "student" || inviteRole === "mentor") {
      if (!inviteSelectedProgram) {
        setError("Program IL yang dipilih wajib diisi untuk siswa dan mentor.");
        return;
      }
    }

    if (inviteRole === "mentor") {
      if (!inviteSpecialization) {
        setError("Spesialisasi Mentor wajib dipilih.");
        return;
      }
    }

    setIsSubmittingInvite(true);
    try {
      const res = await fetch("http://localhost:7000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          role: inviteRole,
          whatsapp: whatsapp || undefined,
          institution: inviteInstitution.trim() || undefined,
          studyProgram: inviteStudyProgram.trim() || undefined,
          selectedProgram: inviteSelectedProgram || undefined,
          specialization: inviteRole === "mentor" ? inviteSpecialization : undefined,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengirim undangan.");
      }

      let enrollmentMessage = "";
      if (inviteSelectedProgram && (inviteRole === "student" || inviteRole === "mentor")) {
        if (inviteRole === "student") {
          const enrollRes = await fetch("http://localhost:7000/classes/program-enroll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId: data.id,
              programName: inviteSelectedProgram,
            }),
            credentials: "include",
          });
          if (enrollRes.ok) {
            enrollmentMessage = " & ter-enroll otomatis.";
          } else {
            const enrollData = await enrollRes.json();
            throw new Error(`Pengguna berhasil dibuat, tetapi gagal enroll otomatis: ${enrollData.message || 'Error tidak dikenal'}`);
          }
        } else if (inviteRole === "mentor") {
          const enrollRes = await fetch("http://localhost:7000/classes/program-assign-mentor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mentorId: data.id,
              programName: inviteSelectedProgram,
            }),
            credentials: "include",
          });
          if (enrollRes.ok) {
            enrollmentMessage = " & ter-assign ke program.";
          } else {
            const enrollData = await enrollRes.json();
            throw new Error(`Pengguna berhasil dibuat, tetapi gagal assign program: ${enrollData.message || 'Error tidak dikenal'}`);
          }
        }
      }

      setSuccessMsg(`Berhasil menambahkan ${data.email} ke dalam database${enrollmentMessage}`);
      setInviteName("");
      setInviteEmail("");
      setInviteWhatsapp("");
      setInviteInstitution("");
      setInviteStudyProgram("");
      setInviteSelectedProgram("");
      setInviteSpecialization("");
      fetchUsersList();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleBulkInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setBulkResult(null);

    if (!rawEmails.trim()) {
      setError("Data CSV tidak boleh kosong.");
      return;
    }

    setIsSubmittingBulk(true);
    try {
      const res = await fetch("http://localhost:7000/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawEmails,
          defaultRole: bulkRole,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal memproses bulk invite.");
      }

      setBulkResult(data);
      setSuccessMsg(`Pendaftaran massal berhasil disimpan. ${data.invited.length} pengguna berhasil didaftarkan.`);
      setRawEmails("");
      fetchUsersList();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  const handleSendWarningEmail = async (userId: string, email: string) => {
    setError("");
    setSuccessMsg("");
    setIsConfirmOpen(false); // Close dialog overlay immediately
    setIsSendingEmailMap((prev) => ({ ...prev, [userId]: true }));

    try {
      const res = await fetch(`http://localhost:7000/users/${userId}/send-warning-email`, {
        method: "POST",
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        setSuccessMsg(`Email peringatan ganti email berhasil dikirim ke ${email}.`);
      } else {
        const data = await res.json();
        setError(data.message || "Gagal mengirim email peringatan.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSendingEmailMap((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const proceedSuspend = async (userId: string) => {
    setError("");
    setSuccessMsg("");
    setIsConfirmOpen(false);
    try {
      const res = await fetch(`http://localhost:7000/users/${userId}/suspend`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        setSuccessMsg("User berhasil dinonaktifkan (suspended).");
        fetchUsersList();
      } else {
        const data = await res.json();
        setError(data.message || "Gagal menonaktifkan user.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    }
  };

  const proceedUnsuspend = async (userId: string) => {
    setError("");
    setSuccessMsg("");
    setIsConfirmOpen(false);
    try {
      const res = await fetch(`http://localhost:7000/users/${userId}/unsuspend`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        setSuccessMsg("User berhasil diaktifkan kembali.");
        fetchUsersList();
      } else {
        const data = await res.json();
        setError(data.message || "Gagal mengaktifkan kembali.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    }
  };

  const proceedDelete = async (userId: string) => {
    setError("");
    setSuccessMsg("");
    setIsConfirmOpen(false);
    try {
      const res = await fetch(`http://localhost:7000/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setSuccessMsg("User berhasil dihapus secara permanen.");
        fetchUsersList();
      } else {
        const data = await res.json();
        setError(data.message || "Gagal menghapus user.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    }
  };

  const proceedBulkDelete = async () => {
    setError("");
    setSuccessMsg("");
    setIsConfirmOpen(false);
    setIsLoadingUsers(true);
    try {
      const res = await fetch("http://localhost:7000/users/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedUserIds }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Berhasil menghapus ${data.deletedCount} pengguna.`);
        setSelectedUserIds([]);
        fetchUsersList();
      } else {
        setError(data.message || "Gagal menghapus pengguna.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const triggerSuspendConfirm = (userId: string) => {
    setConfirmTitle("Konfirmasi Penonaktifan");
    setConfirmDescription("Apakah Anda yakin ingin menonaktifkan/suspend akun pengguna ini?");
    setConfirmButtonText("Ya, Suspend");
    setConfirmIsDestructive(true);
    setConfirmAction(() => () => proceedSuspend(userId));
    setConfirmCountdown(5);
    setIsConfirmOpen(true);
  };

  const triggerUnsuspendConfirm = (userId: string) => {
    setConfirmTitle("Aktifkan Kembali Pengguna");
    setConfirmDescription("Apakah Anda yakin ingin mengaktifkan kembali akun pengguna ini?");
    setConfirmButtonText("Ya, Aktifkan");
    setConfirmIsDestructive(false);
    setConfirmAction(() => () => proceedUnsuspend(userId));
    setConfirmCountdown(5);
    setIsConfirmOpen(true);
  };

  const triggerDeleteConfirm = (userId: string) => {
    setConfirmTitle("Hapus Pengguna Permanen");
    setConfirmDescription("Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus pengguna ini secara permanen dari sistem?");
    setConfirmButtonText("Ya, Hapus");
    setConfirmIsDestructive(true);
    setConfirmAction(() => () => proceedDelete(userId));
    setConfirmCountdown(0);
    setIsConfirmOpen(true);
  };

  const triggerBulkDeleteConfirm = () => {
    setConfirmTitle("Hapus Pengguna Terpilih (Bulk)");
    setConfirmDescription(
      `Apakah Anda yakin ingin menghapus ${selectedUserIds.length} pengguna terpilih secara permanen? Tindakan ini tidak dapat dibatalkan.`
    );
    setConfirmButtonText("Ya, Hapus Semua");
    setConfirmIsDestructive(true);
    setConfirmAction(() => () => proceedBulkDelete());
    setConfirmCountdown(0);
    setIsConfirmOpen(true);
  };

  const triggerSendWarningConfirm = (userId: string, email: string) => {
    setConfirmTitle("Kirim Email Peringatan");
    setConfirmDescription(`Kirim email ke ${email}? Pastikan Anda tahu hal ini.`);
    setConfirmButtonText("Ya, Kirim");
    setConfirmIsDestructive(false);
    setConfirmAction(() => () => handleSendWarningEmail(userId, email));
    setIsConfirmOpen(true);
  };

  const handleEditClick = (user: UserListItem) => {
    setEditingUserId(user.id);
    setEditingNameValue(user.name);
    setEditingEmailValue(user.email);
    setEditingWhatsappValue(user.whatsapp || "");
    setEditingInstitutionValue(user.institution || "");
    setEditingStudyProgramValue(user.studyProgram || "");
    setEditingSelectedProgramValue(user.selectedProgram || "");
    setEditingUserBatches(user.batches ? user.batches.map((b: any) => b.id) : []);
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUserId) return;
    setError("");
    setSuccessMsg("");
    setIsEditModalOpen(false);
    setIsLoadingUsers(true);

    const user = usersList.find((u) => u.id === editingUserId);
    if (!user) return;

    const originalName = user.name;
    const originalEmail = user.email;
    const originalWhatsapp = user.whatsapp || "";
    const originalInstitution = user.institution || "";
    const originalStudyProgram = user.studyProgram || "";
    const originalSelectedProgram = user.selectedProgram || "";

    try {
      // 1. Save metadata / name changes
      const patchData: any = {};
      if (editingNameValue.trim() !== originalName) {
        patchData.name = editingNameValue;
      }
      if (editingWhatsappValue.trim() !== originalWhatsapp) {
        patchData.whatsapp = editingWhatsappValue.trim() || null;
      }
      if (editingInstitutionValue.trim() !== originalInstitution) {
        patchData.institution = editingInstitutionValue.trim() || null;
      }
      if (editingStudyProgramValue.trim() !== originalStudyProgram) {
        patchData.studyProgram = editingStudyProgramValue.trim() || null;
      }
      if (editingSelectedProgramValue !== originalSelectedProgram) {
        patchData.selectedProgram = editingSelectedProgramValue || null;
      }

      if (Object.keys(patchData).length > 0) {
        const patchRes = await fetch(`http://localhost:7000/users/${editingUserId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchData),
          credentials: "include",
        });
        if (!patchRes.ok) {
          const data = await patchRes.json();
          throw new Error(data.message || "Gagal memperbarui profil.");
        }
      }

      // 2. Save email changes (resets Google OAuth bindings)
      if (editingEmailValue.trim() !== originalEmail) {
        const emailRes = await fetch(`http://localhost:7000/users/${editingUserId}/email`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: editingEmailValue }),
          credentials: "include",
        });
        if (!emailRes.ok) {
          const data = await emailRes.json();
          throw new Error(data.message || "Gagal memperbarui email.");
        }
      }

      // 3. Save batch assignments (only for student/mentor — admin aktif di semua batch)
      const isAdmin = user.role === "admin" || user.roles?.includes("admin");
      const isStudentOrMentor = !isAdmin && (
        user.role === "student" || user.role === "mentor" ||
        user.roles?.includes("student") || user.roles?.includes("mentor")
      );
      if (isStudentOrMentor) {
        const batchRes = await fetch("http://localhost:7000/classes/user-batches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: editingUserId,
            batchIds: editingUserBatches,
          }),
          credentials: "include",
        });
        if (!batchRes.ok) {
          const data = await batchRes.json();
          throw new Error(data.message || "Gagal memperbarui Cohort/Batch pengguna.");
        }
      }

      setSuccessMsg("Detail data user berhasil diperbarui.");
      setEditingUserId(null);
      fetchUsersList();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Filtered Users List calculation
  const filteredUsersList = usersList.filter((user) => {
    const name = user.name?.toLowerCase() || "";
    const email = user.email?.toLowerCase() || "";
    const whatsapp = user.whatsapp || "";
    const institution = user.institution?.toLowerCase() || "";
    const query = userSearchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      name.includes(query) ||
      email.includes(query) ||
      whatsapp.includes(query) ||
      institution.includes(query);

    // Batch filter only applies to non-admin users
    const matchesBatch =
      !userBatchFilter ||
      user.role === "admin" ||
      (user.batches && user.batches.some((b: any) => b.id === userBatchFilter));

    // Role filter
    const matchesRole =
      !userRoleFilter ||
      user.role === userRoleFilter ||
      (user.roles && user.roles.includes(userRoleFilter as any));

    // Status filter
    const matchesStatus =
      !userStatusFilter ||
      user.status === userStatusFilter;

    return matchesQuery && matchesBatch && matchesRole && matchesStatus;
  });

  const nonAdminUsers = filteredUsersList.filter((u) => u.role !== "admin");
  const isAllSelected = nonAdminUsers.length > 0 && selectedUserIds.length === nonAdminUsers.length;

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(nonAdminUsers.map((u) => u.id));
    }
  };

  const handleUserSelectToggle = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8 min-h-14 p-1.5 bg-secondary border border-border rounded-lg">
          <TabsTrigger value="users" className="text-sm font-semibold font-heading flex items-center justify-center gap-2.5 py-2.5 rounded-md">
            <Users className="w-5 h-5 text-brand-purple shrink-0" />
            <span>Pengguna</span>
          </TabsTrigger>
          <TabsTrigger value="programs" className="text-sm font-semibold font-heading flex items-center justify-center gap-2.5 py-2.5 rounded-md">
            <BookOpen className="w-5 h-5 text-brand-purple shrink-0" />
            <span>Program</span>
          </TabsTrigger>
          <TabsTrigger value="batches" className="text-sm font-semibold font-heading flex items-center justify-center gap-2.5 py-2.5 rounded-md">
            <Calendar className="w-5 h-5 text-brand-purple shrink-0" />
            <span>Angkatan / Batch</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="text-sm font-semibold font-heading flex items-center justify-center gap-2.5 py-2.5 rounded-md">
            <Calendar className="w-5 h-5 text-brand-purple shrink-0" />
            <span>Absensi</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-sm font-semibold font-heading flex items-center justify-center gap-2.5 py-2.5 rounded-md">
            <Settings className="w-5 h-5 text-brand-purple shrink-0" />
            <span>Pengaturan</span>
          </TabsTrigger>
        </TabsList>

        {/* ──────── TAB 1: MANAJEMEN PENGGUNA (ACTUAL IMPLEMENTATION) ──────── */}
        <TabsContent value="users" className="space-y-6 outline-hidden">

          {/* Sub-tabs under User Management */}
          <div className="flex border-b border-border gap-6">
            <button
              onClick={() => setAdminSubTab("users")}
              className={`pb-3 text-xs sm:text-sm font-semibold font-heading transition-all border-b-2 -mb-px flex items-center gap-2 ${adminSubTab === "users"
                  ? "border-brand-purple text-brand-purple"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              <UserCheck className="w-5 h-5 shrink-0" />
              <span>Manajemen Pengguna Terdaftar ({usersList.length})</span>
            </button>
            <button
              onClick={() => setAdminSubTab("invite")}
              className={`pb-3 text-xs sm:text-sm font-semibold font-heading transition-all border-b-2 -mb-px flex items-center gap-2 ${adminSubTab === "invite"
                  ? "border-brand-purple text-brand-purple"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              <UserPlus className="w-5 h-5 shrink-0" />
              <span>Tambah Pengguna / Import CSV</span>
            </button>
          </div>

          {/* SUB-TAB 1.1: MANAGE USERS TABLE */}
          {adminSubTab === "users" && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div className="space-y-1">
                  <h2 className="font-heading font-bold text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-brand-purple" />
                    Daftar Pengguna Aktif
                  </h2>
                  <p className="text-3xs text-muted-foreground">
                    Kelola data, edit info, suspend, atau hapus massal akun pengguna. Akun ber-domain non-Gmail ditandai dengan bendera kuning.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {selectedUserIds.length > 0 && (
                    <button
                      onClick={triggerBulkDeleteConfirm}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold font-heading transition-colors shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Terpilih ({selectedUserIds.length})</span>
                    </button>
                  )}

                  <button
                    onClick={fetchUsersList}
                    className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shadow-sm"
                    title="Refresh Data"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-1 text-xs">
                {/* Search */}
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama, email, whatsapp, atau kampus..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple"
                  />
                </div>
                {/* Role Filter */}
                <div>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-medium focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple cursor-pointer"
                  >
                    <option value="">Semua Peran</option>
                    <option value="admin">Admin</option>
                    <option value="mentor">Mentor</option>
                    <option value="student">Student / Murid</option>
                  </select>
                </div>
                {/* Status Filter */}
                <div>
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-medium focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple cursor-pointer"
                  >
                    <option value="">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="invited">Invited</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              {/* Batch/Cohort Filter (only for student/mentor) */}
              <div className="text-xs -mt-1">
                <select
                  value={userBatchFilter}
                  onChange={(e) => setUserBatchFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-medium focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple cursor-pointer"
                >
                  <option value="">Semua Batch / Cohort (Filter tidak berlaku untuk Admin)</option>
                  {batchesList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="overflow-x-auto border border-border rounded-lg bg-background">
                {isLoadingUsers ? (
                  <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
                    Memuat daftar data pengguna…
                  </div>
                ) : filteredUsersList.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    Tidak ada pengguna terdaftar yang cocok dengan pencarian / filter.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-border bg-secondary/35 text-muted-foreground font-semibold">
                        <th className="py-3 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={handleSelectAllToggle}
                            className="rounded border-border text-brand-purple focus:ring-brand-purple h-3.5 w-3.5 cursor-pointer accent-brand-purple"
                          />
                        </th>
                        <th className="py-3 px-3">Nama Lengkap</th>
                        <th className="py-3 px-3">Email</th>
                        <th className="py-3 px-3">WhatsApp</th>
                        <th className="py-3 px-3">Institusi</th>
                        <th className="py-3 px-3">Program Studi</th>
                        <th className="py-3 px-3">Program IL</th>
                        <th className="py-3 px-3">Batch/Cohort</th>
                        <th className="py-3 px-3">Peran</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsersList.map((user) => {
                        const isGmail = user.email.toLowerCase().endsWith("@gmail.com");
                        const isSending = !!isSendingEmailMap[user.id];

                        return (
                          <tr key={user.id} className="hover:bg-secondary/15 transition-colors">
                            {/* Checkbox */}
                            <td className="py-3 px-3 text-center">
                              {user.role !== "admin" ? (
                                <input
                                  type="checkbox"
                                  checked={selectedUserIds.includes(user.id)}
                                  onChange={() => handleUserSelectToggle(user.id)}
                                  className="rounded border-border text-brand-purple focus:ring-brand-purple h-3.5 w-3.5 cursor-pointer accent-brand-purple"
                                />
                              ) : (
                                <span className="text-3xs text-muted-foreground italic">-</span>
                              )}
                            </td>

                            <td className="py-3 px-3 font-medium text-foreground max-w-[150px] truncate">
                              {user.name}
                            </td>

                            {/* Email with alert flag if not gmail */}
                            <td className="py-3 px-3 max-w-[170px] truncate">
                              <div className="font-mono text-2xs text-muted-foreground">{user.email}</div>
                              {!isGmail && (
                                <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-1 py-0.5 rounded border border-yellow-500/20 leading-none">
                                  <AlertCircle className="w-2.5 h-2.5" />
                                  Bukan Gmail (Perlu Ganti)
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3 text-2xs">
                              {user.whatsapp || <span className="text-muted-foreground/50">-</span>}
                            </td>

                            <td className="py-3 px-3 text-2xs truncate max-w-[140px]">
                              {user.institution || <span className="text-muted-foreground/50">-</span>}
                            </td>

                            <td className="py-3 px-3 text-2xs truncate max-w-[120px]">
                              {user.studyProgram || <span className="text-muted-foreground/50">-</span>}
                            </td>

                            <td className="py-3 px-3 text-2xs font-medium text-brand-purple max-w-[140px] truncate">
                              {user.selectedProgram || <span className="text-muted-foreground/50">-</span>}
                            </td>

                            <td className="py-3 px-3 text-2xs max-w-[160px]">
                              {user.batches && user.batches.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {user.batches.map((b: any) => (
                                    <span key={b.id} className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-3xs border border-border truncate max-w-[140px] inline-block" title={b.name}>
                                      {b.name}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground/50">-</span>
                              )}
                            </td>

                            <td className="py-3 px-3 text-2xs space-y-1">
                              {user.roles && user.roles.length > 0 ? (
                                user.roles.map((r) => (
                                  <span
                                    key={r}
                                    className={`inline-block px-1.5 py-0.5 rounded text-3xs font-semibold uppercase mr-1 ${r === "admin"
                                        ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                        : r === "mentor"
                                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                          : "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                                      }`}
                                  >
                                    {r}
                                  </span>
                                ))
                              ) : (
                                <span className="capitalize">{user.role}</span>
                              )}
                            </td>

                            <td className="py-3 px-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-3xs font-semibold ${user.status === "active" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                                  user.status === "suspended" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                    "bg-secondary text-muted-foreground border border-border"
                                }`}>
                                {user.status}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-3 text-right space-x-1">
                              <div className="inline-flex gap-1.5 justify-end">
                                {/* Send warning email to non-Gmail users */}
                                {!isGmail && (
                                  <button
                                    onClick={() => triggerSendWarningConfirm(user.id, user.email)}
                                    disabled={isSending}
                                    className="p-1 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-500/10 rounded-md border border-yellow-500/20 shadow-2xs transition-all disabled:opacity-50"
                                    title="Kirim Email Peringatan Ganti Email"
                                  >
                                    {isSending ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Mail className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}

                                {/* Edit button */}
                                <button
                                  onClick={() => handleEditClick(user)}
                                  className="p-1 text-muted-foreground hover:text-brand-purple hover:bg-muted/50 rounded-md border border-border shadow-2xs transition-colors"
                                  title="Edit Profil"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Suspend / Unsuspend button (Admin cannot suspend themselves) */}
                                {user.role !== "admin" && (
                                  user.status === "suspended" ? (
                                    <button
                                      onClick={() => triggerUnsuspendConfirm(user.id)}
                                      className="p-1 text-emerald-600 hover:bg-emerald-500/10 rounded-md border border-border shadow-2xs transition-colors"
                                      title="Aktifkan Kembali"
                                    >
                                      <UserCheck className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => triggerSuspendConfirm(user.id)}
                                      className="p-1 text-red-500 hover:bg-red-500/10 rounded-md border border-border shadow-2xs transition-colors"
                                      title="Suspend"
                                    >
                                      <UserX className="w-3.5 h-3.5" />
                                    </button>
                                  )
                                )}

                                {/* Delete button (Admin cannot delete themselves) */}
                                {user.role !== "admin" && (
                                  <button
                                    onClick={() => triggerDeleteConfirm(user.id)}
                                    className="p-1 text-red-500 hover:bg-red-500/10 rounded-md border border-border shadow-2xs transition-colors"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 1.2: TAMBAH PENGGUNA / IMPORT CSV */}
          {adminSubTab === "invite" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Single Invite Panel */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                  <h2 className="font-heading font-bold text-lg flex items-center gap-2 border-b border-border pb-3">
                    <UserPlus className="w-5 h-5 text-brand-purple" />
                    Tambah Pengguna Baru
                  </h2>
                  <form onSubmit={handleSingleInvite} className="space-y-4">
                    {/* 1. Role selection at the very top */}
                    <div className="space-y-1.5 bg-secondary/35 p-3 rounded-lg border border-border">
                      <label className="text-xs font-bold text-foreground">1. Pilih Peran Akses LMS Terlebih Dahulu</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => {
                          setInviteRole(e.target.value as any);
                          setInviteSelectedProgram("");
                          setInviteSpecialization("");
                          setInviteInstitution("");
                          setInviteStudyProgram("");
                        }}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background font-semibold focus:outline-none focus:ring-1 focus:ring-brand-purple"
                      >
                        <option value="student">Siswa LMS</option>
                        <option value="mentor">Mentor Kelas</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>

                    {/* 2. Common Fields */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Nama Lengkap <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          placeholder="Contoh: Budi Santoso"
                          value={inviteName}
                          onChange={(e) => setInviteName(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Alamat Email (Google) <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          placeholder="contoh@gmail.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">No WhatsApp (Opsional)</label>
                      <input
                        type="text"
                        placeholder="Contoh: 08123456789"
                        value={inviteWhatsapp}
                        onChange={(e) => setInviteWhatsapp(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                      />
                    </div>

                    {/* 3. Conditional Fields based on Role Selection */}
                    {inviteRole === "student" && (
                      <>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Institusi / Kampus (Opsional)</label>
                            <input
                              type="text"
                              placeholder="Contoh: Universitas Indonesia"
                              value={inviteInstitution}
                              onChange={(e) => setInviteInstitution(e.target.value)}
                              className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Program Studi / Jurusan (Opsional)</label>
                            <input
                              type="text"
                              placeholder="Contoh: Teknik Informatika"
                              value={inviteStudyProgram}
                              onChange={(e) => setInviteStudyProgram(e.target.value)}
                              className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">Program IL yang dipilih <span className="text-red-500">*</span></label>
                          <select
                            value={inviteSelectedProgram}
                            onChange={(e) => setInviteSelectedProgram(e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                            required
                          >
                            <option value="">-- Pilih Program --</option>
                            <option value="AI Development">AI Development</option>
                            <option value="Web Development and UI/UX Design">Web Development & UI/UX Design</option>
                            <option value="Mobile Development and UI/UX Design">Mobile Development & UI/UX Design</option>
                            <option value="Game Development">Game Development</option>
                          </select>
                        </div>
                      </>
                    )}

                    {inviteRole === "mentor" && (
                      <>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Program IL yang dipilih <span className="text-red-500">*</span></label>
                            <select
                              value={inviteSelectedProgram}
                              onChange={(e) => setInviteSelectedProgram(e.target.value)}
                              className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                              required
                            >
                              <option value="">-- Pilih Program --</option>
                              <option value="AI Development">AI Development</option>
                              <option value="Web Development and UI/UX Design">Web Development & UI/UX Design</option>
                              <option value="Mobile Development and UI/UX Design">Mobile Development & UI/UX Design</option>
                              <option value="Game Development">Game Development</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Spesialisasi Mentor <span className="text-red-500">*</span></label>
                            <select
                              value={inviteSpecialization}
                              onChange={(e) => setInviteSpecialization(e.target.value)}
                              className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                              required
                            >
                              <option value="">-- Pilih Spesialisasi --</option>
                              <option value="AI">AI</option>
                              <option value="Web">Web</option>
                              <option value="Mobile">Mobile</option>
                              <option value="Game">Game</option>
                              <option value="UI/UX">UI/UX</option>
                              <option value="Professional">Professional</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {/* 4. Submission Button */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isSubmittingInvite}
                        className="px-4 py-2 rounded-lg bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold font-heading transition-colors shadow-sm disabled:opacity-50 w-full sm:w-auto"
                      >
                        {isSubmittingInvite ? "Mendaftarkan…" : "Tambah Pengguna"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Standardized CSV Importer */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col gap-3 border-b border-border pb-3">
                    <div>
                      <h2 className="font-heading font-bold text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-brand-purple" />
                        Daftar Student Massal
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Masukkan data murid dari spreadsheet/Airtable sesuai standar spesifikasi kolom.
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2 bg-secondary/60 border border-border px-3 py-1.5 rounded-lg w-full">
                      <span className="text-2xs font-mono text-muted-foreground font-semibold overflow-x-auto whitespace-nowrap scrollbar-none">
                        name,email,whatsapp,institution,studyProgram,selectedProgram
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("name,email,whatsapp,institution,studyProgram,selectedProgram");
                          setCopiedHeader(true);
                          setTimeout(() => setCopiedHeader(false), 2000);
                        }}
                        className="p-1 hover:bg-muted rounded text-foreground transition-colors shrink-0 cursor-pointer"
                        title="Salin Template Header"
                      >
                        {copiedHeader ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleCsvReview} className="space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">Pilih Angkatan / Batch Tujuan:</label>
                        <select
                          value={selectedBatchForImport}
                          onChange={(e) => setSelectedBatchForImport(e.target.value)}
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-medium focus:outline-none focus:border-brand-purple"
                          required
                        >
                          <option value="">-- Pilih Batch (Hanya Batch Aktif) --</option>
                          {batchesList.filter(b => b.status === "active").map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} (ACTIVE) - {b.includedPrograms?.length || 0} Program
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Method Dropdown selection */}
                    <div className="space-y-1.5 font-sans">
                      <label className="text-xs font-semibold text-foreground">Metode Impor CSV:</label>
                      <select
                        value={useFileUpload ? "file" : "paste"}
                        onChange={(e) => setUseFileUpload(e.target.value === "file")}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-medium focus:outline-none focus:border-brand-purple cursor-pointer"
                      >
                        <option value="file">📁 Unggah File CSV (.csv)</option>
                        <option value="paste">📋 Copy-Paste Teks / Baris Spreadsheet</option>
                      </select>
                    </div>

                    {useFileUpload ? (
                      <div className="border-2 border-dashed border-border hover:border-brand-purple/50 rounded-xl p-6 flex flex-col items-center justify-center bg-secondary/5 hover:bg-secondary/10 transition-colors relative group min-h-32 text-center">
                        <Upload className="w-8 h-8 text-brand-purple mb-2 group-hover:scale-110 transition-transform duration-200" />
                        {csvText.trim() ? (
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-emerald-600">File CSV Berhasil Dimuat!</span>
                            <p className="text-3xs text-muted-foreground font-mono truncate max-w-[280px]">
                              Header: {csvText.split('\n')[0]}
                            </p>
                            <button
                              type="button"
                              onClick={() => setCsvText("")}
                              className="text-3xs text-red-500 hover:underline font-semibold mt-1"
                            >
                              Hapus File
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs font-semibold text-foreground">Pilih file CSV (.csv) atau seret ke sini</span>
                            <span className="text-[10px] text-muted-foreground mt-1">Gunakan header name, email, dll.</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-foreground">Paste Isi Data CSV / Spreadsheet:</label>
                          <span className="text-3xs text-muted-foreground font-medium">Tip: Gunakan koma (,) sebagai pemisah kolom</span>
                        </div>
                        <textarea
                          value={csvText}
                          onChange={(e) => setCsvText(e.target.value)}
                          placeholder={`name,email,whatsapp,institution,studyProgram,selectedProgram\nBudi Santoso,budi@student.umrah.ac.id,081234567890,Universitas Maritim Raja Ali Haji,Teknik Informatika,AI Development\nSiti Aminah,siti@gmail.com,089876543210,Institut Teknologi Bandung,Sistem Informasi,Web Development and UI/UX Design`}
                          rows={6}
                          className="w-full bg-background border border-border rounded-lg p-3 text-xs font-mono text-foreground focus:outline-none focus:border-brand-purple leading-relaxed"
                        />
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="text-2xs text-muted-foreground flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Tanpa email otomatis. Akun di-set sebagai Invited.</span>
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmittingImport || !selectedBatchForImport || !csvText.trim()}
                        className="px-5 py-2.5 bg-brand-purple hover:bg-brand-purple-hover disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Tinjau Data & Lanjutkan
                      </button>
                    </div>
                  </form>

                  {/* Import Result Report Card inside Tab Pengguna */}
                  {importResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 space-y-3 mt-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                          <CheckCircle2 className="w-5 h-5" />
                          {importResult.message}
                        </div>
                        <button onClick={() => setImportResult(null)} className="text-muted-foreground hover:text-foreground text-xs font-semibold cursor-pointer">
                          Tutup
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-emerald-500/20">
                        <div className="bg-background/80 p-3 rounded-lg border border-border">
                          <div className="text-2xs text-muted-foreground">Total Diimpor</div>
                          <div className="text-lg font-bold text-foreground">{importResult.totalImported} Murid</div>
                        </div>
                        <div className="bg-background/80 p-3 rounded-lg border border-border">
                          <div className="text-2xs text-muted-foreground">Total Terdaftar</div>
                          <div className="text-lg font-bold text-emerald-500">{importResult.totalEnrolled} Murid</div>
                        </div>
                        <div className="bg-background/80 p-3 rounded-lg border border-border col-span-2">
                          <div className="text-2xs text-muted-foreground mb-1">Distribusi per Program Studi</div>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(importResult.distributionSummary || {}).map(([progName, count]) => (
                              <span key={progName} className="px-2 py-0.5 bg-secondary text-foreground text-3xs font-semibold rounded border border-border">
                                {progName}: {count as number} murid
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Bulk Results Spec */}
              {bulkResult && (
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
                  <h3 className="font-heading font-bold text-xs">Hasil Pemrosesan Pendaftaran Massal</h3>
                  <div className="grid sm:grid-cols-2 gap-4 text-2xs">
                    <div className="space-y-1.5">
                      <p className="font-semibold text-emerald-600">Berhasil Ditambahkan ({bulkResult.invited.length})</p>
                      <div className="bg-secondary/40 rounded-lg p-3 max-h-32 overflow-y-auto space-y-1">
                        {bulkResult.invited.length === 0 ? <p className="text-muted-foreground">-</p> :
                          bulkResult.invited.map((u: any, idx) => (
                            <p key={idx} className="font-medium">{u.name} ({u.email})</p>
                          ))
                        }
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="font-semibold text-red-500">Gagal / Bentrok / Sudah Terdaftar ({bulkResult.failed.length})</p>
                      <div className="bg-secondary/40 rounded-lg p-3 max-h-32 overflow-y-auto space-y-1">
                        {bulkResult.failed.length === 0 ? <p className="text-muted-foreground">-</p> :
                          bulkResult.failed.map((u: any, idx) => (
                            <p key={idx} className="text-red-500/80">{u.email}: {u.reason}</p>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* ──────── TAB 2: MANAJEMEN PROGRAM & ENROLLMENT ──────── */}
        <TabsContent value="programs" className="space-y-6 outline-hidden">
          {isLoadingPrograms ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-brand-purple" />
              <span className="text-sm">Memuat data program dan batch akademik...</span>
            </div>
          ) : (() => {
            const activeBatch = batchesList.find((b: any) => b.status === "active");
            const activePrograms = programsData?.programs?.filter((prog: any) => prog.activeBatch) || [];

            return (
              <>
                {/* Active Batch Header Banner */}
                {activeBatch ? (
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white shadow-md border border-white/10">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-purple/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex items-center justify-between gap-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/10 text-brand-purple rounded-lg shrink-0 border border-white/10">
                          <Calendar className="w-5 h-5 text-brand-purple" />
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-sm text-white">Batch Aktif Saat Ini</h3>
                          <p className="text-xs text-indigo-200/85 mt-0.5 font-sans">Seluruh kegiatan belajar mengajar berjalan di batch ini.</p>
                        </div>
                      </div>
                      <div className="px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 font-sans">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {activeBatch.name}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between border border-amber-500/20 bg-amber-500/5 rounded-xl p-5 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500/20 text-amber-600 rounded-lg shrink-0">
                        <AlertCircle className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-sm text-foreground">Tidak Ada Batch Aktif</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Silakan buat atau aktifkan angkatan/batch baru di tab Batch.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Programs Grid (Filtered to Active Batch) */}
                {activePrograms.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl bg-secondary/15">
                    <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50 animate-pulse" />
                    <p className="text-xs text-muted-foreground font-semibold">Tidak ada program studi yang diikutsertakan pada Batch Aktif saat ini.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {activePrograms.map((prog: any) => {
                      return (
                        <div key={prog.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-brand-purple/40 transition-all flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-heading font-bold text-base text-foreground">
                                  {prog.name}
                                </h3>
                              </div>
                              <span className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded-full text-2xs font-semibold ${prog.studentsCount > 0 ? 'bg-brand-purple/10 text-brand-purple border border-brand-purple/20' : 'bg-secondary text-muted-foreground'}`}>
                                {prog.studentsCount} Murid
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {prog.description}
                            </p>
                          </div>

                          <div className="border-t border-border/60 pt-4 flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1.5 font-medium text-foreground">
                                <GraduationCap className="w-4 h-4 text-brand-purple" />
                                {prog.mentorsCount} Mentor Assigned
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedProgramDetail(prog);
                                setIsProgramModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-brand-purple/10 hover:bg-brand-purple text-brand-purple hover:text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              Kelola & Enrollment
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Historical Batches Archive Section */}
                <div className="border-t border-border pt-6 mt-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                        <Layers className="w-4 h-4 text-brand-purple" />
                        Arsip & Riwayat Batch Lama
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Pilih angkatan lama yang sudah selesai untuk melihat kembali data murid dan mentor.</p>
                    </div>
                    <select
                      value={selectedOldBatchId}
                      onChange={(e) => setSelectedOldBatchId(e.target.value)}
                      className="w-full sm:w-64 px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden font-medium cursor-pointer"
                    >
                      <option value="none">-- Pilih Batch Lama --</option>
                      {batchesList.filter((b: any) => b.status === "completed").map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedOldBatchId !== "none" && (() => {
                    const selectedBatch = batchesList.find((b: any) => b.id === selectedOldBatchId);
                    if (!selectedBatch) return null;
                    if (!selectedBatch.includedPrograms || selectedBatch.includedPrograms.length === 0) {
                      return (
                        <p className="text-xs text-muted-foreground py-4 text-center border border-dashed border-border rounded-xl bg-secondary/15">Tidak ada program studi yang terdaftar di batch ini.</p>
                      );
                    }
                    return (
                      <div className="grid md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                        {selectedBatch.includedPrograms.map((prog: any) => {
                          return (
                            <div key={prog.id} className="bg-card/70 border border-border/80 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 opacity-90">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h3 className="font-heading font-bold text-base text-foreground/80">
                                      {prog.name}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                      <span className="px-2 py-0.5 rounded text-3xs font-semibold bg-secondary/60 text-muted-foreground border border-border/20">
                                        Selesai (Read-Only)
                                      </span>
                                    </div>
                                  </div>
                                  <span className="whitespace-nowrap shrink-0 px-2.5 py-1 rounded-full text-2xs font-semibold bg-secondary text-muted-foreground">
                                    {prog.studentsCount || 0} Murid
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground/80 line-clamp-2">
                                  {prog.description}
                                </p>
                              </div>

                              <div className="border-t border-border/40 pt-4 flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5 font-medium text-foreground/75">
                                  <GraduationCap className="w-4 h-4 text-brand-purple/75" />
                                  {prog.mentorsCount || 0} Mentor
                                </span>
                                <button
                                  onClick={() => {
                                    setSelectedProgramDetail(prog);
                                    setIsProgramModalOpen(true);
                                  }}
                                  className="px-3.5 py-1.5 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  Lihat Detail & Murid
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </>
            );
          })()}
        </TabsContent>

        {/* ──────── TAB 3: MANAJEMEN ANGKATAN / BATCH (GLOBAL COHORT) ──────── */}
        <TabsContent value="batches" className="space-y-6 outline-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card border border-border rounded-xl p-6 shadow-sm">
            <div>
              <h2 className="font-heading font-bold text-lg flex items-center gap-2 text-foreground">
                <Layers className="w-5 h-5 text-brand-purple" />
                Manajemen Angkatan / Batch (Global Cohort)
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Aturan Mutlak: Hanya boleh ada 1 (satu) Batch berstatus ACTIVE pada satu waktu. Tiap batch berjalan berbarengan untuk program studi yang diikutsertakan.
              </p>
            </div>
            <button
              onClick={() => {
                setNewBatchName("");
                setNewBatchStatus("draft");
                setSelectedProgramIdsForBatch(programsData?.programs?.map((p: any) => p.id) || []);
                setCustomProgramInput("");
                setIsCreateBatchModalOpen(true);
              }}
              className="px-4 py-2 bg-brand-purple text-white hover:bg-brand-purple/90 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Buat Batch Baru
            </button>
          </div>

          {/* Guide Banner removed per request */}

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-heading font-semibold text-sm text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-purple" />
              Daftar Cohort
            </h3>

            {isLoadingBatches ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-brand-purple" />
              </div>
            ) : batchesList.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-xl bg-secondary/20">
                <Layers className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-xs text-muted-foreground font-medium">Belum ada data angkatan / batch yang dibuat.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {batchesList.map((batch) => {
                  const isActive = batch.status === "active";
                  const isDraft = batch.status === "draft";
                  const isCompleted = batch.status === "completed";
                  const isEmpty = batch.classCount === 0 && batch.studentCount === 0;

                  return (
                    <div
                      key={batch.id}
                      className={`relative overflow-hidden rounded-xl p-5 border transition-all hover:shadow-xs w-full flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${isActive
                          ? "bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-500/50 shadow-md shadow-indigo-950/20"
                          : isDraft
                            ? "bg-card text-foreground border-amber-500/30 hover:border-amber-500/50"
                            : "bg-card/60 text-foreground/90 border-border hover:border-muted-foreground/35 opacity-90"
                        }`}
                    >
                      {/* Column 1: Name, Status & Creation Date */}
                      <div className="space-y-1.5 w-full lg:w-[240px] shrink-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className={`font-heading font-black text-lg ${isActive ? 'text-white' : 'text-foreground'}`}>
                            {batch.name}
                          </h4>

                          {isActive && (
                            <span className="bg-emerald-600/90 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm font-sans">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Aktif
                            </span>
                          )}
                          {isDraft && (
                            <span className="bg-amber-500/90 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm font-sans">
                              <AlertCircle className="w-2.5 h-2.5" />
                              Draft
                            </span>
                          )}
                          {isCompleted && (
                            <span className="bg-slate-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 border border-white/10 font-sans">
                              <Lock className="w-2.5 h-2.5" />
                              Selesai
                            </span>
                          )}
                        </div>
                        <p className={`text-3xs font-sans ${isActive ? 'text-indigo-200/60' : 'text-muted-foreground'}`}>
                          Dibuat pada {new Date(batch.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        {batch.startDate && batch.endDate ? (
                          <p className={`text-3xs font-sans font-medium flex items-center gap-1 mt-1 ${isActive ? 'text-indigo-200' : 'text-brand-purple'}`}>
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            {new Date(batch.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} - {new Date(batch.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        ) : (
                          <p className={`text-3xs font-sans font-medium flex items-center gap-1 mt-1 text-muted-foreground italic`}>
                            <Calendar className="w-3.5 h-3.5 shrink-0 opacity-50" />
                            Durasi belum ditentukan
                          </p>
                        )}
                      </div>

                      {/* Column 2: Included Programs */}
                      <div className="flex-1 min-w-[200px] space-y-1 font-sans">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-indigo-200/70' : 'text-muted-foreground'}`}>
                          Program Studi ({batch.includedPrograms?.length || 0})
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          {batch.includedPrograms?.map((prog: any) => (
                            <span
                              key={prog.id}
                              className={`px-2 py-0.5 text-3xs font-medium rounded-md border ${isActive
                                  ? "bg-white/10 text-white border-white/10"
                                  : "bg-secondary text-foreground border-border/60"
                                }`}
                            >
                              {prog.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Column 3: Stats */}
                      <div className="w-full lg:w-[150px] shrink-0 space-y-1 font-sans">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-indigo-200/70' : 'text-muted-foreground'}`}>
                          Statistik
                        </span>
                        <div className="flex flex-col gap-0.5 text-2xs mt-0.5">
                          <div className="flex items-center gap-1.5">
                            <Layers className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-300' : 'text-brand-purple'}`} />
                            <span><strong>{batch.classCount || 0}</strong> Kelas</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-300' : 'text-brand-purple'}`} />
                            <span><strong>{batch.studentCount || 0}</strong> Murid</span>
                          </div>
                        </div>
                      </div>

                      {/* Column 4: Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 lg:self-center">
                        <button
                          onClick={() => {
                            setSelectedBatchForDetail(batch);
                            setIsBatchDetailModalOpen(true);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-all cursor-pointer flex items-center gap-1 ${isActive
                              ? "bg-brand-purple/20 hover:bg-brand-purple/40 text-brand-purple dark:text-purple-300 border border-brand-purple/30"
                              : "bg-brand-purple/10 hover:bg-brand-purple/20 text-brand-purple border border-brand-purple/20"
                            }`}
                        >
                          Detail
                        </button>

                        <button
                          onClick={() => {
                            setSelectedBatchForEdit(batch);
                            setEditBatchName(batch.name);
                            setEditBatchIncludedProgramIds(batch.includedProgramIds || batch.includedPrograms?.map((p: any) => p.id) || []);
                            setEditBatchStartDate(batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : "");
                            setEditBatchEndDate(batch.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : "");
                            setIsEditBatchModalOpen(true);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-all cursor-pointer flex items-center gap-1 ${isActive
                              ? "bg-white/10 hover:bg-white/20 text-white border border-white/15"
                              : "bg-secondary hover:bg-secondary/80 text-foreground border border-border"
                            }`}
                        >
                          <Settings className="w-3 h-3" />
                          Edit
                        </button>

                        {!isActive && !isCompleted && (
                          <button
                            onClick={() => {
                              triggerConfirm(
                                "Aktifkan Batch Ini?",
                                `Mengaktifkan "${batch.name}" akan otomatis mengubah Batch Aktif lainnya menjadi Read-Only Mode (Selesai). Lanjutkan?`,
                                "Ya, Aktifkan",
                                false,
                                async () => {
                                  try {
                                    const res = await fetch(`http://localhost:7000/classes/batches/${batch.id}`, {
                                      method: "PATCH",
                                      headers: { "Content-Type": "application/json", Accept: "application/json" },
                                      credentials: "include",
                                      body: JSON.stringify({ status: "active" }),
                                    });
                                    if (res.ok) {
                                      fetchBatchesList();
                                      fetchProgramsList();
                                    }
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }
                              );
                            }}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-2xs font-bold transition-all shadow-xs cursor-pointer font-sans"
                          >
                            Aktifkan
                          </button>
                        )}
                        {isActive && (
                          <button
                            onClick={() => {
                              triggerConfirm(
                                "Akhiri Batch Cohort?",
                                `Mengakhiri "${batch.name}" akan memindahkan statusnya menjadi selesai dan tidak bisa diaktifkan kembali. Seluruh kelas di dalamnya akan terkunci menjadi arsip Read-Only. Lanjutkan?`,
                                "Ya, Akhiri Batch",
                                true,
                                async () => {
                                  try {
                                    const res = await fetch(`http://localhost:7000/classes/batches/${batch.id}`, {
                                      method: "PATCH",
                                      headers: { "Content-Type": "application/json", Accept: "application/json" },
                                      credentials: "include",
                                      body: JSON.stringify({ status: "completed" }),
                                    });
                                    if (res.ok) {
                                      fetchBatchesList();
                                      fetchProgramsList();
                                    }
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }
                              );
                            }}
                            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-2xs font-bold transition-all cursor-pointer font-sans"
                          >
                            Akhiri
                          </button>
                        )}

                        {isEmpty && (
                          <button
                            onClick={() => {
                              triggerConfirm(
                                "Hapus Batch Kosong?",
                                `Batch "${batch.name}" masih kosong (belum ada kelas/murid). Apakah Anda yakin ingin menghapusnya permanen?`,
                                "Hapus Permanen",
                                true,
                                async () => {
                                  try {
                                    const res = await fetch(`http://localhost:7000/classes/batches/${batch.id}`, {
                                      method: "DELETE",
                                      headers: { Accept: "application/json" },
                                      credentials: "include",
                                    });
                                    if (res.ok) {
                                      fetchBatchesList();
                                      fetchProgramsList();
                                    } else {
                                      const err = await res.json();
                                      alert(err.message || "Gagal menghapus batch.");
                                    }
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }
                              );
                            }}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0"
                            title="Hapus Batch Kosong"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </TabsContent>

        {/* ──────── TAB ABSENSI ──────── */}
        <TabsContent value="attendance" className="space-y-6 outline-hidden">
          <AdminAttendance batches={batchesList} />
        </TabsContent>

        {/* ──────── TAB 4: PENGATURAN ──────── */}
        <TabsContent value="settings" className="space-y-6 outline-hidden">
          <div className="bg-card border border-border rounded-xl shadow-sm w-full">
            <div className="p-6 border-b border-border">
              <h3 className="font-heading font-bold text-lg flex items-center gap-2 text-foreground">
                <User className="w-5 h-5 text-brand-purple" />
                Profil Admin
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Perbarui data pribadi Anda yang terdaftar sebagai Administrator.
              </p>
            </div>
            <div className="p-6">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {profileSaveSuccess && (
                  <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{profileSaveSuccess}</span>
                  </div>
                )}
                {profileSaveError && (
                  <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{profileSaveError}</span>
                  </div>
                )}

                {/* Avatar Selection */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-border/50">
                  <div className="relative group shrink-0">
                    <img
                      src={getEffectiveAvatar()}
                      alt="Foto Profil"
                      className="w-20 h-20 rounded-full object-cover border-2 border-brand-purple/20 shadow-md transition-all group-hover:brightness-90"
                    />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="space-y-3 w-full">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">Unggah Foto Profil Baru</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileFileChange}
                        className="block w-full text-xs text-muted-foreground file:mr-4 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-purple/10 file:text-brand-purple hover:file:bg-brand-purple/20 cursor-pointer"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">Mendukung format PNG, JPG, JPEG, WEBP, dll. Maksimal 5MB.</p>
                    </div>

                    {/* Choose from Default Avatars */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pilih dari Avatar Default:</label>
                      <div className="flex gap-2">
                        {defaultAvatars.map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setProfileAvatarUrl(url)}
                            className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all hover:scale-105 hover:shadow-xs ${profileAvatarUrl === url ? "border-brand-purple scale-105 shadow-sm" : "border-transparent"
                              }`}
                          >
                            <img src={url} alt={`Avatar default ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-brand-purple" />
                      Nama Lengkap
                    </label>
                    <input
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Nama Anda"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-brand-purple" />
                      Nomor WhatsApp
                    </label>
                    <input
                      value={profileWhatsapp}
                      onChange={(e) => setProfileWhatsapp(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Contoh: 08123456789"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <School className="w-3.5 h-3.5 text-brand-purple" />
                      Asal Institusi / Kampus
                    </label>
                    <input
                      value={profileInstitution}
                      onChange={(e) => setProfileInstitution(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Contoh: Universitas Indonesia"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-brand-purple" />
                      Program Studi
                    </label>
                    <input
                      value={profileStudyProgram}
                      onChange={(e) => setProfileStudyProgram(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Contoh: Teknik Informatika"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold h-10 px-6 rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Simpan Perubahan</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Edit User Modal Dialog (Shadcn-like) ── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xs"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-brand-purple" />
                  Edit Profil Pengguna
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Nama Lengkap</label>
                  <input
                    type="text"
                    value={editingNameValue}
                    onChange={(e) => setEditingNameValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground flex justify-between">
                    <span>Email Google</span>
                    <span className="text-3xs text-red-500 italic">Mengubah email me-reset binding login</span>
                  </label>
                  <input
                    type="email"
                    value={editingEmailValue}
                    onChange={(e) => setEditingEmailValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple font-mono"
                  />
                </div>

                {/* WhatsApp */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">No WhatsApp</label>
                  <input
                    type="text"
                    value={editingWhatsappValue}
                    onChange={(e) => setEditingWhatsappValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                  />
                </div>

                {/* Institution */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Institusi / Kampus</label>
                  <input
                    type="text"
                    value={editingInstitutionValue}
                    onChange={(e) => setEditingInstitutionValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                  />
                </div>

                {/* Study Program */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Program Studi / Jurusan</label>
                  <input
                    type="text"
                    value={editingStudyProgramValue}
                    onChange={(e) => setEditingStudyProgramValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                  />
                </div>

                {/* Selected Program */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Program IL</label>
                  <select
                    value={editingSelectedProgramValue}
                    onChange={(e) => setEditingSelectedProgramValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                  >
                    <option value="AI Development">AI Development</option>
                    <option value="Web Development and UI/UX Design">Web Development and UI/UX Design</option>
                    <option value="Mobile Development and UI/UX Design">Mobile Development and UI/UX Design</option>
                    <option value="Game Development">Game Development</option>
                  </select>
                </div>

                {/* Batches/Cohorts Selection — hanya untuk Student dan Mentor, BUKAN Admin */}
                {(editingUserId && (() => {
                  const user = usersList.find(u => u.id === editingUserId);
                  const isAdmin = user?.role === "admin" || user?.roles?.includes("admin");
                  const isStudentOrMentor = !isAdmin && (
                    user?.role === "student" || user?.role === "mentor" ||
                    user?.roles?.includes("student") || user?.roles?.includes("mentor")
                  );
                  if (!isStudentOrMentor) return null;

                  return (
                    <div className="col-span-2 space-y-1.5 pt-2 border-t border-border/60">
                      <label className="font-semibold text-muted-foreground block mb-1">Daftar Cohort/Batch Keikutsertaan:</label>
                      <div className="grid grid-cols-2 gap-2 bg-secondary/20 border border-border/50 rounded-lg p-3">
                        {batchesList.map((batch) => {
                          const isChecked = editingUserBatches.includes(batch.id);
                          return (
                            <label key={batch.id} className="flex items-center gap-2 text-2xs text-foreground cursor-pointer font-sans select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setEditingUserBatches(editingUserBatches.filter(id => id !== batch.id));
                                  } else {
                                    setEditingUserBatches([...editingUserBatches, batch.id]);
                                  }
                                }}
                                className="rounded border-border text-brand-purple focus:ring-brand-purple h-3.5 w-3.5 cursor-pointer accent-brand-purple"
                              />
                              <span>
                                {batch.name} <span className="text-3xs text-muted-foreground uppercase">({batch.status})</span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })())}
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted/50 text-foreground text-xs font-semibold font-heading transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveUser}
                  className="px-4 py-2 rounded-lg bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold font-heading transition-colors shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CSV Import Review Modal Dialog ── */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xs"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 bg-card border border-border rounded-xl shadow-xl max-w-4xl w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-brand-purple" />
                    Konfirmasi Pendaftaran Massal
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Silakan tinjau data hasil parsing CSV sebelum dimasukkan ke database.
                  </p>
                </div>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-700 dark:text-amber-400 leading-normal flex items-start gap-2 shrink-0">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  <strong>Informasi Penting:</strong> Pendaftaran massal ini berstatus <strong>Invited (Belum Terverifikasi)</strong>. Akun murid akan dibuat di database tetapi <strong>tidak akan</strong> mengirim email blast otomatis secara massal atau didistribusikan ke mentor. Anda harus mengirimkan undangan email secara manual satu per satu dari tab daftar pengguna.
                </span>
              </div>

              <div className="flex-1 overflow-y-auto border border-border rounded-lg bg-secondary/10">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-secondary border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3">Nama Lengkap</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">WhatsApp</th>
                      <th className="p-3">Institusi</th>
                      <th className="p-3">Program Studi</th>
                      <th className="p-3">Program Pilihan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {parsedStudents.map((student, idx) => (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium text-foreground">{student.name}</td>
                        <td className="p-3 font-mono text-2xs text-muted-foreground">{student.email}</td>
                        <td className="p-3 text-muted-foreground">{student.whatsapp || "-"}</td>
                        <td className="p-3 text-muted-foreground">{student.institution || "-"}</td>
                        <td className="p-3 text-muted-foreground">{student.studyProgram || "-"}</td>
                        <td className="p-3 font-semibold text-brand-purple">{student.selectedProgram}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4 shrink-0">
                <span className="text-xs font-semibold text-foreground bg-secondary px-3 py-1.5 rounded-lg border border-border">
                  Total data terdeteksi: <strong className="text-brand-purple">{parsedStudents.length} Murid</strong>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold font-heading transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={executeCsvImport}
                    className="px-5 py-2.5 bg-brand-purple hover:bg-brand-purple-hover text-white font-semibold text-xs rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    Ya, Daftarkan Murid
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────── MODAL DETAIL PROGRAM & MANAJEMEN ENROLLMENT ──────── */}
      <AnimatePresence>
        {isProgramModalOpen && selectedProgramDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProgramModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 bg-card border border-border rounded-xl shadow-xl max-w-4xl w-full p-6 space-y-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                    <Layers className="w-5 h-5 text-brand-purple" />
                    Manajemen Program: {selectedProgramDetail.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Atur penugasan tim mentor dan pendaftaran siswa binaan.
                  </p>
                </div>
                <button
                  onClick={() => setIsProgramModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs for Mentor List vs Student List */}
              <Tabs defaultValue="mentors" className="w-full space-y-4">
                <TabsList className="grid grid-cols-2 w-full bg-secondary/35 border border-border min-h-14 p-1.5 rounded-lg">
                  <TabsTrigger value="mentors" className="text-sm font-semibold flex items-center justify-center gap-3 py-2 rounded-md">
                    <GraduationCap className="w-5 h-5 text-brand-purple shrink-0" />
                    <span>Tim Mentor ({selectedProgramDetail.mentorsCount})</span>
                  </TabsTrigger>
                  <TabsTrigger value="students" className="text-sm font-semibold flex items-center justify-center gap-3 py-2 rounded-md">
                    <Users className="w-5 h-5 text-brand-purple shrink-0" />
                    <span>Murid Terdaftar ({selectedProgramDetail.studentsCount})</span>
                  </TabsTrigger>
                </TabsList>

                {/* Tab content for Mentors */}
                <TabsContent value="mentors" className="space-y-4 outline-hidden">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Daftar mentor akademik yang ditugaskan ke program ini.</p>
                    <button
                      onClick={() => {
                        setSelectedMentorToAssign("");
                        setIsAddMentorModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-brand-purple text-white hover:bg-brand-purple-hover text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Assign Mentor Baru
                    </button>
                  </div>

                  <div className="border border-border rounded-xl overflow-hidden bg-background max-h-[45vh] overflow-y-auto pr-1">
                    <table className="w-full text-xs text-left border-collapse font-sans">
                      <thead>
                        <tr className="bg-secondary/40 border-b border-border text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                          <th className="p-3">Nama Mentor</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Spesialisasi / Peran</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProgramDetail.mentors.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="text-center py-8 text-muted-foreground">
                              Belum ada mentor yang ditugaskan ke program ini.
                            </td>
                          </tr>
                        ) : (
                          selectedProgramDetail.mentors.map((m: any) => (
                            <tr key={m.id} className="border-b border-border hover:bg-secondary/15 transition-all text-foreground">
                              <td className="p-3 font-semibold">{m.name}</td>
                              <td className="p-3 text-muted-foreground">{m.email}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded text-3xs font-medium bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
                                  {m.specialization || 'Primary Mentor'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                {/* Tab content for Students */}
                <TabsContent value="students" className="space-y-4 outline-hidden">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Daftar seluruh siswa aktif yang terdaftar dalam program ini.</p>
                    <button
                      onClick={() => {
                        setEnrollCase("case2");
                        setSelectedStudentToEnroll("");
                        setSelectedMentorForEnroll("");
                        setIsAddStudentModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-brand-purple text-white hover:bg-brand-purple-hover text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Pendaftaran Murid Baru
                    </button>
                  </div>

                  <div className="border border-border rounded-xl overflow-hidden bg-background max-h-[45vh] overflow-y-auto pr-1">
                    <table className="w-full text-xs text-left border-collapse font-sans">
                      <thead>
                        <tr className="bg-secondary/40 border-b border-border text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                          <th className="p-3">Nama Student</th>
                          <th className="p-3">Mentor Akademik</th>
                          <th className="p-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProgramDetail.students.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="text-center py-8 text-muted-foreground">
                              Belum ada siswa yang terdaftar di program ini.
                            </td>
                          </tr>
                        ) : (
                          selectedProgramDetail.students.map((s: any) => (
                            <tr key={s.id} className="border-b border-border hover:bg-secondary/15 transition-all text-foreground">
                              <td className="p-3 font-semibold">{s.name}</td>
                              <td className="p-3">
                                <span className="font-medium text-brand-purple">{s.mentorName || 'Belum Ditentukan'}</span>
                              </td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-3xs font-medium uppercase tracking-wider ${s.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'}`}>
                                  {s.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsProgramModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-muted text-foreground text-xs font-semibold transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────── MODAL ASSIGN MENTOR KE PROGRAM ──────── */}
      <AnimatePresence>
        {isAddMentorModalOpen && selectedProgramDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddMentorModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-heading font-bold text-base text-foreground">
                  Assign Mentor ke {selectedProgramDetail.name}
                </h3>
                <button onClick={() => setIsAddMentorModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignMentorSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Pilih Mentor Aktif</label>
                  <select
                    value={selectedMentorToAssign}
                    onChange={(e) => setSelectedMentorToAssign(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden"
                  >
                    <option value="">-- Pilih Mentor --</option>
                    {programsData?.availableMentors?.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.specialization || m.selectedProgram || 'Belum Ada Program'})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsAddMentorModalOpen(false)} className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold">Batal</button>
                  <button type="submit" disabled={isSubmittingAssignMentor} className="px-4 py-1.5 rounded-lg bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold flex items-center gap-1.5">
                    {isSubmittingAssignMentor && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Simpan Penugasan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────── MODAL STUDENT ENROLLMENT (CASE 1, 2, 3) ──────── */}
      <AnimatePresence>
        {isAddStudentModalOpen && selectedProgramDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddStudentModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-heading font-bold text-base text-foreground">
                  Student Enrollment: {selectedProgramDetail.name}
                </h3>
                <button onClick={() => setIsAddStudentModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs Alur Enrollment */}
              <div className="flex border-b border-border">
                <button
                  type="button"
                  onClick={() => setEnrollCase("case1")}
                  className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors ${enrollCase === "case1" || enrollCase === "case2" ? "border-brand-purple text-brand-purple" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  Case 1: Distribusi Mentor Personal
                </button>
                <button
                  type="button"
                  onClick={() => setEnrollCase("case3")}
                  className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors ${enrollCase === "case3" ? "border-red-500 text-red-500" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  Case 2: Transfer Program (Clean Transfer)
                </button>
              </div>

              <div className="text-2xs text-muted-foreground bg-secondary/20 p-3 rounded-lg border border-border/50">
                {(enrollCase === "case1" || enrollCase === "case2") && "Pendaftaran ulang siswa (atau distribusi mentor personal) di dalam program ini."}
                {enrollCase === "case3" && (
                  <span className="text-red-600 dark:text-red-400 font-semibold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    PERINGATAN (CLEAN TRANSFER): Memindahkan murid antar program akan menghapus SELURUH riwayat nilai, absen, dan tugas di program lama!
                  </span>
                )}
              </div>

              <form onSubmit={handleEnrollSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {enrollCase === "case3" ? "Pilih Siswa dari Program Lain" : "Pilih Siswa Program Ini"}
                  </label>
                  <select
                    value={selectedStudentToEnroll}
                    onChange={(e) => setSelectedStudentToEnroll(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden"
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {enrollCase === "case3"
                      ? usersList
                        .filter((u) => u.role === "student" && u.selectedProgram && u.selectedProgram !== selectedProgramDetail.name)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} (asal: {s.selectedProgram})
                          </option>
                        ))
                      : selectedProgramDetail.students?.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.email})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Pilih Mentor Program Ini
                  </label>
                  <select
                    value={selectedMentorForEnroll}
                    onChange={(e) => setSelectedMentorForEnroll(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden"
                  >
                    <option value="">-- Tanpa Personal Mentor / Otomatis (Opsional) --</option>
                    {selectedProgramDetail.mentors?.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.specialization || "Primary Mentor"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button type="button" onClick={() => setIsAddStudentModalOpen(false)} className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold">Batal</button>
                  <button
                    type="submit"
                    disabled={isSubmittingEnroll}
                    className={`px-4 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm ${enrollCase === "case3" ? "bg-red-500 hover:bg-red-600" : "bg-brand-purple hover:bg-brand-purple-hover"
                      }`}
                  >
                    {isSubmittingEnroll && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {enrollCase === "case3" ? "Eksekusi Clean Transfer" : "Daftarkan Siswa"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────── MODAL BUAT BATCH BARU (GLOBAL COHORT) ──────── */}
      <AnimatePresence>
        {isCreateBatchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateBatchModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-purple" />
                  Buat Angkatan / Batch Baru (Global Cohort)
                </h3>
                <button onClick={() => setIsCreateBatchModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBatchSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Nama Angkatan / Batch</label>
                  <input
                    type="text"
                    value={newBatchName}
                    onChange={(e) => setNewBatchName(e.target.value)}
                    placeholder="misal: Batch 8 - Q3 2026"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Tanggal Mulai Cohort</label>
                    <input
                      type="date"
                      value={newBatchStartDate}
                      onChange={(e) => setNewBatchStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden font-sans"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Tanggal Selesai Cohort</label>
                    <input
                      type="date"
                      value={newBatchEndDate}
                      onChange={(e) => setNewBatchEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Status Awal</label>
                  <select
                    value={newBatchStatus}
                    onChange={(e: any) => setNewBatchStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden font-medium"
                  >
                    <option value="draft">Persiapan / Draft (Tidak Mengganggu Batch Aktif)</option>
                    <option value="active">Active Cohort (Otomatis Selesaikan Batch Aktif Lainnya)</option>
                  </select>
                  {newBatchStatus === "active" && (
                    <p className="text-3xs text-amber-500 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      Peringatan: Mengaktifkan batch ini akan langsung mengunci batch aktif saat ini menjadi Read-Only.
                    </p>
                  )}
                </div>

                <div className="space-y-2 border-t border-b border-border py-3">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Program Studi yang Diikutsertakan</span>
                    <span className="text-2xs font-normal text-muted-foreground">Pilih program yang akan dibuka</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                    {programsData?.programs?.map((prog: any) => {
                      const isChecked = selectedProgramIdsForBatch.includes(prog.id);
                      return (
                        <label
                          key={prog.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-xs ${isChecked ? "border-brand-purple bg-brand-purple/5 font-medium text-foreground" : "border-border bg-secondary/30 text-muted-foreground"
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProgramIdsForBatch([...selectedProgramIdsForBatch, prog.id]);
                              } else {
                                setSelectedProgramIdsForBatch(selectedProgramIdsForBatch.filter(id => id !== prog.id));
                              }
                            }}
                            className="rounded border-input text-brand-purple focus:ring-brand-purple"
                          />
                          <span className="truncate">{prog.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Tambah Program Baru</span>
                    <span className="text-3xs font-normal text-brand-purple">Ekspansi Kurikulum</span>
                  </label>
                  <input
                    type="text"
                    value={customProgramInput}
                    onChange={(e) => setCustomProgramInput(e.target.value)}
                    placeholder="misal: Cybersecurity Development, Cloud Engineering (pisahkan dengan koma)"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden"
                  />
                  <p className="text-3xs text-muted-foreground">
                    Program baru yang Anda ketik akan otomatis dibuat dan langsung diikutsertakan ke dalam batch ini.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsCreateBatchModalOpen(false)} className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold cursor-pointer">Batal</button>
                  <button type="submit" disabled={isSubmittingCreateBatch} className="px-4 py-1.5 rounded-lg bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                    {isSubmittingCreateBatch && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Simpan Angkatan / Batch
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────── MODAL EDIT BATCH (GLOBAL COHORT) ──────── */}
      <AnimatePresence>
        {isEditBatchModalOpen && selectedBatchForEdit && (() => {
          const isDraft = selectedBatchForEdit.status === "draft";
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditBatchModalOpen(false)}
                className="absolute inset-0 bg-background/80 backdrop-blur-xs"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative z-10 bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                    <Settings className="w-4 h-4 text-brand-purple" />
                    Edit Angkatan / Batch
                  </h3>
                  <button onClick={() => setIsEditBatchModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleEditBatchSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Nama Angkatan / Batch</label>
                    <input
                      type="text"
                      value={editBatchName}
                      onChange={(e) => setEditBatchName(e.target.value)}
                      placeholder="misal: Batch 8 - Q3 2026"
                      required
                      className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Tanggal Mulai Cohort</label>
                      <input
                        type="date"
                        value={editBatchStartDate}
                        onChange={(e) => setEditBatchStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden font-sans"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Tanggal Selesai Cohort</label>
                      <input
                        type="date"
                        value={editBatchEndDate}
                        onChange={(e) => setEditBatchEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden font-sans"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Status Batch saat ini</span>
                    </label>
                    <div className="px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-xs font-semibold capitalize w-fit">
                      {selectedBatchForEdit.status === "completed" ? "selesai (diakhiri)" : selectedBatchForEdit.status}
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-b border-border py-3">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Program Studi yang Diikutsertakan</span>
                      {!isDraft && (
                        <span className="text-3xs text-amber-500 font-semibold font-sans">Terkunci (Batch sudah berjalan/selesai)</span>
                      )}
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                      {programsData?.programs?.map((prog: any) => {
                        const isChecked = editBatchIncludedProgramIds.includes(prog.id);
                        return (
                          <label
                            key={prog.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition-all ${!isDraft
                                ? "opacity-75 border-border bg-secondary/20 text-muted-foreground cursor-not-allowed"
                                : "cursor-pointer"
                              } ${isChecked && isDraft ? "border-brand-purple bg-brand-purple/5 font-medium text-foreground" : ""
                              } ${isChecked && !isDraft ? "border-border bg-secondary/40 font-medium text-foreground" : ""
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={!isDraft}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditBatchIncludedProgramIds([...editBatchIncludedProgramIds, prog.id]);
                                } else {
                                  setEditBatchIncludedProgramIds(editBatchIncludedProgramIds.filter(id => id !== prog.id));
                                }
                              }}
                              className="rounded border-input text-brand-purple focus:ring-brand-purple cursor-pointer disabled:cursor-not-allowed"
                            />
                            <span className="truncate">{prog.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsEditBatchModalOpen(false)} className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold cursor-pointer">Batal</button>
                    <button type="submit" disabled={isSubmittingEditBatch} className="px-4 py-1.5 rounded-lg bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                      {isSubmittingEditBatch && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* ──────── MODAL DETAIL STATISTIK BATCH (COHORT) ──────── */}
      <AnimatePresence>
        {isBatchDetailModalOpen && selectedBatchForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBatchDetailModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 bg-card border border-border rounded-xl shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto font-sans"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-purple" />
                  Statistik & Detail Batch: {selectedBatchForDetail.name}
                </h3>
                <button onClick={() => setIsBatchDetailModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Stats Summary Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-secondary/30 border border-border rounded-xl text-center space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Program</p>
                    <p className="text-lg font-bold text-foreground">{selectedBatchForDetail.includedPrograms?.length || 0}</p>
                  </div>
                  <div className="p-3 bg-secondary/30 border border-border rounded-xl text-center space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-sans">Total Kelas</p>
                    <p className="text-lg font-bold text-foreground">{selectedBatchForDetail.classCount || 0}</p>
                  </div>
                  <div className="p-3 bg-secondary/30 border border-border rounded-xl text-center space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-sans">Total Murid</p>
                    <p className="text-lg font-bold text-brand-purple">{selectedBatchForDetail.studentCount || 0}</p>
                  </div>
                </div>

                {/* Cohort Duration */}
                <div className="flex items-center gap-2.5 p-3.5 bg-brand-purple/5 border border-brand-purple/20 rounded-xl">
                  <Calendar className="w-4 h-4 text-brand-purple shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-brand-purple uppercase tracking-wider font-sans">Durasi Cohort / Angkatan</p>
                    <p className="text-xs font-semibold text-foreground">
                      {selectedBatchForDetail.startDate && selectedBatchForDetail.endDate ? (
                        <>
                          {new Date(selectedBatchForDetail.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          {" s/d "}
                          {new Date(selectedBatchForDetail.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </>
                      ) : (
                        <span className="text-muted-foreground italic font-normal">Tanggal durasi belum dikonfigurasi.</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Programs and Student Counts List */}
                <div className="space-y-2.5">
                  <h4 className="font-heading font-bold text-sm text-foreground">Distribusi Murid per Program Studi</h4>

                  <div className="border border-border rounded-xl overflow-hidden bg-background">
                    <div className="grid grid-cols-3 border-b border-border bg-secondary/35 font-semibold p-2.5 text-foreground text-[10px] uppercase tracking-wider font-sans">
                      <div>Nama Program</div>
                      <div className="text-center">Jumlah Mentor</div>
                      <div className="text-center">Jumlah Murid</div>
                    </div>

                    {selectedBatchForDetail.includedPrograms && selectedBatchForDetail.includedPrograms.length > 0 ? (
                      selectedBatchForDetail.includedPrograms.map((prog: any) => (
                        <div key={prog.id} className="grid grid-cols-3 p-2.5 border-b border-border last:border-b-0 text-foreground items-center font-sans">
                          <div className="font-semibold text-xs truncate">{prog.name}</div>
                          <div className="text-center font-medium text-muted-foreground">{prog.mentorsCount || 0} Mentor</div>
                          <div className="text-center font-bold text-brand-purple">{prog.studentsCount || 0} Murid</div>
                        </div>
                      ))
                    ) : (
                      <p className="p-4 text-center text-muted-foreground text-xs font-sans">Tidak ada program studi terdaftar</p>
                    )}
                  </div>
                </div>

                {/* Batch Lifecycle Info */}
                <div className="p-4 bg-secondary/20 border border-border rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-sans">
                    <span>Status Siklus Hidup</span>
                    <span className={`px-2 py-0.5 rounded font-semibold capitalize font-sans ${selectedBatchForDetail.status === "active" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                        selectedBatchForDetail.status === "draft" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                          "bg-slate-500/10 text-slate-600 border border-slate-500/20"
                      }`}>
                      {selectedBatchForDetail.status === "completed" ? "Selesai (Diakhiri)" : selectedBatchForDetail.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                    {selectedBatchForDetail.status === "active" ? "Siklus saat ini sedang berjalan aktif. Semua pendaftaran murid baru dan tugas diarahkan ke angkatan ini." :
                      selectedBatchForDetail.status === "draft" ? "Batch ini sedang dipersiapkan (Draft) dan belum diumumkan ke sistem pembelajaran aktif." :
                        "Siklus angkatan ini sudah selesai diakhiri. Seluruh data historis bersifat Read-Only untuk integritas sistem."}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsBatchDetailModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-secondary border border-border text-xs font-semibold cursor-pointer hover:bg-secondary/80 text-foreground transition-colors font-sans"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────── MENTOR ASSIGNMENT MATRIX MODAL ──────── */}
      <AnimatePresence>
        {isMentorMatrixModalOpen && selectedBatchForMatrix && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMentorMatrixModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="relative z-10 bg-card border border-border rounded-xl shadow-lg max-w-2xl w-full p-6 space-y-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-brand-purple" />
                    Matrix Penugasan Mentor - {selectedBatchForMatrix.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pilih mentor yang bertugas membimbing murid di masing-masing program studi pada angkatan ini.
                  </p>
                </div>
                <button
                  onClick={() => setIsMentorMatrixModalOpen(false)}
                  className="p-1 hover:bg-muted rounded-lg text-muted-foreground transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {selectedBatchForMatrix.includedPrograms?.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">Belum ada program studi di dalam batch ini.</p>
                ) : (
                  selectedBatchForMatrix.includedPrograms?.map((prog: any) => {
                    const allMentors = usersList.filter(u => u.role === "mentor" && u.status === "active");
                    const selectedForProg = matrixProgramMentors[prog.id] || [];

                    return (
                      <div key={prog.id} className="border border-border rounded-xl p-4 bg-secondary/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-brand-purple" />
                            {prog.name}
                          </h4>
                          <span className="text-2xs font-semibold px-2 py-0.5 bg-brand-purple/10 text-brand-purple rounded-full">
                            {selectedForProg.length} Mentor Ditugaskan
                          </span>
                        </div>

                        {allMentors.length === 0 ? (
                          <p className="text-2xs text-muted-foreground">Belum ada akun Mentor yang berstatus ACTIVE di sistem.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {allMentors.map((m) => {
                              const isChecked = selectedForProg.includes(m.id);
                              return (
                                <label
                                  key={m.id}
                                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${isChecked
                                      ? "bg-brand-purple/10 border-brand-purple/40 text-foreground font-semibold"
                                      : "bg-card border-border text-muted-foreground hover:border-border/80"
                                    }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setMatrixProgramMentors((prev) => {
                                        const current = prev[prog.id] || [];
                                        return {
                                          ...prev,
                                          [prog.id]: checked
                                            ? [...current, m.id]
                                            : current.filter((id) => id !== m.id),
                                        };
                                      });
                                    }}
                                    className="rounded border-border text-brand-purple focus:ring-brand-purple w-4 h-4 cursor-pointer"
                                  />
                                  <div className="overflow-hidden">
                                    <div className="truncate text-foreground font-medium">{m.name}</div>
                                    <div className="text-3xs text-muted-foreground truncate">{m.email} {m.specialization ? `• ${m.specialization}` : ""}</div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
                <button
                  onClick={() => setIsMentorMatrixModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted/50 text-foreground text-xs font-semibold font-heading transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveMentorMatrix}
                  disabled={isSubmittingMatrix}
                  className="px-5 py-2 bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold font-heading rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingMatrix ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan Penugasan...
                    </>
                  ) : (
                    "Simpan Penugasan Mentor"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reusable Confirmation Dialog Modal (Shadcn-like) */}
      <AnimatePresence>
        {isConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirmOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xs"
            />
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 bg-card border border-border rounded-lg shadow-lg max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200"
            >
              <div className="space-y-1.5">
                <h3 className="font-heading font-bold text-lg text-foreground">
                  {confirmTitle}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {confirmDescription}
                </p>
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setIsConfirmOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted/50 text-foreground text-xs font-semibold font-heading transition-colors"
                >
                  Batal
                </button>
                <button
                  disabled={confirmCountdown > 0}
                  onClick={() => {
                    setIsConfirmOpen(false);
                    if (confirmAction) confirmAction();
                  }}
                  className={`px-4 py-2 rounded-lg text-white text-xs font-semibold font-heading transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${confirmIsDestructive
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-brand-purple hover:bg-brand-purple-hover"
                    }`}
                >
                  {confirmButtonText}{confirmCountdown > 0 ? ` (${confirmCountdown}s)` : ""}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
