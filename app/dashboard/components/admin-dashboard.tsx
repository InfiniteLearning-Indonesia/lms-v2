"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminRules } from "./admin-rules";

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
}

export function AdminDashboard() {
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sub-tabs under User Management Sub-section
  const [adminSubTab, setAdminSubTab] = useState<"users" | "invite">("users");

  // Admin Tab - Users List State
  const [usersList, setUsersList] = useState<UserListItem[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSendingEmailMap, setIsSendingEmailMap] = useState<Record<string, boolean>>({});

  // Admin Tab - Single Invite Form State
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "mentor" | "student">("student");
  
  // Single Invite optional metadata fields
  const [inviteWhatsapp, setInviteWhatsapp] = useState("");
  const [inviteInstitution, setInviteInstitution] = useState("");
  const [inviteStudyProgram, setInviteStudyProgram] = useState("");
  const [inviteSelectedProgram, setInviteSelectedProgram] = useState("");
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

  // Reusable Confirmation Dialog State (Shadcn-like)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDescription, setConfirmDescription] = useState("");
  const [confirmButtonText, setConfirmButtonText] = useState("Konfirmasi");
  const [confirmIsDestructive, setConfirmIsDestructive] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

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
  const [newBatchStatus, setNewBatchStatus] = useState<"draft" | "active" | "completed">("draft");
  const [selectedProgramIdsForBatch, setSelectedProgramIdsForBatch] = useState<string[]>([]);
  const [customProgramInput, setCustomProgramInput] = useState("");
  const [isSubmittingCreateBatch, setIsSubmittingCreateBatch] = useState(false);

  // CSV Importer State
  const [csvText, setCsvText] = useState("");
  const [selectedBatchForImport, setSelectedBatchForImport] = useState("");
  const [autoDistributeImport, setAutoDistributeImport] = useState(true);
  const [isSubmittingImport, setIsSubmittingImport] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [copiedHeader, setCopiedHeader] = useState(false);

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
          }),
          credentials: "include",
        });
        if (res.ok) {
          setIsCreateBatchModalOpen(false);
          setNewBatchName("");
          setNewBatchStatus("draft");
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
        `Membuat "${newBatchName}" dengan status ACTIVE akan otomatis mengunci batch aktif saat ini ke dalam Mode Read-Only (Selesai) sesuai Rule 27. Lanjutkan?`,
        "Ya, Buat & Aktifkan",
        false,
        executeCreate
      );
    } else {
      executeCreate();
    }
  };

  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
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

    setIsSubmittingImport(true);
    setImportResult(null);
    try {
      const res = await fetch(`http://localhost:7000/classes/batches/${selectedBatchForImport}/import-enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({
          users: usersToImport,
          autoDistribute: autoDistributeImport,
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
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setError("Nama dan email wajib diisi.");
      return;
    }
    if ((inviteRole === "student" || inviteRole === "mentor") && !inviteSelectedProgram) {
      setError("Program pilihan wajib diisi untuk Student dan Mentor.");
      return;
    }

    setIsSubmittingInvite(true);
    try {
      const res = await fetch("http://localhost:7000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail,
          role: inviteRole,
          whatsapp: inviteWhatsapp.trim() || undefined,
          institution: inviteInstitution.trim() || undefined,
          studyProgram: inviteStudyProgram.trim() || undefined,
          selectedProgram: inviteSelectedProgram || undefined,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengirim undangan.");
      }

      let enrollmentMessage = "";
      if (inviteSelectedProgram && (inviteRole === "student" || inviteRole === "mentor")) {
        try {
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
            }
          }
        } catch (e) {
          console.error("Gagal auto-enroll:", e);
        }
      }

      setSuccessMsg(`Berhasil menambahkan ${data.email} ke dalam database (Silent Whitelist)${enrollmentMessage}`);
      setInviteName("");
      setInviteEmail("");
      setInviteWhatsapp("");
      setInviteInstitution("");
      setInviteStudyProgram("");
      setInviteSelectedProgram("");
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
      setSuccessMsg(`Pendaftaran massal berhasil disimpan. ${data.invited.length} berhasil di-whitelist.`);
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
    setIsConfirmOpen(true);
  };

  const triggerUnsuspendConfirm = (userId: string) => {
    setConfirmTitle("Aktifkan Kembali Pengguna");
    setConfirmDescription("Apakah Anda yakin ingin mengaktifkan kembali akun pengguna ini?");
    setConfirmButtonText("Ya, Aktifkan");
    setConfirmIsDestructive(false);
    setConfirmAction(() => () => proceedUnsuspend(userId));
    setIsConfirmOpen(true);
  };

  const triggerDeleteConfirm = (userId: string) => {
    setConfirmTitle("Hapus Pengguna Permanen");
    setConfirmDescription("Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus pengguna ini secara permanen dari sistem?");
    setConfirmButtonText("Ya, Hapus");
    setConfirmIsDestructive(true);
    setConfirmAction(() => () => proceedDelete(userId));
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

      setSuccessMsg("Detail data user berhasil diperbarui.");
      setEditingUserId(null);
      fetchUsersList();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Selection Checkbox Helpers
  const nonAdminUsers = usersList.filter((u) => u.role !== "admin");
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

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-6 mb-8 min-h-12 p-1 bg-secondary border border-border rounded-lg">
          <TabsTrigger value="users" className="text-xs font-semibold font-heading">
            Pengguna
          </TabsTrigger>
          <TabsTrigger value="programs" className="text-xs font-semibold font-heading">
            Program
          </TabsTrigger>
          <TabsTrigger value="batches" className="text-xs font-semibold font-heading flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Angkatan / Batch
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="text-xs font-semibold font-heading">
            Kompetensi
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs font-semibold font-heading">
            Pengaturan
          </TabsTrigger>
          <TabsTrigger value="rules" className="text-xs font-semibold font-heading">
            Rules (Domain)
          </TabsTrigger>
        </TabsList>

        {/* ──────── TAB 1: MANAJEMEN PENGGUNA (ACTUAL IMPLEMENTATION) ──────── */}
        <TabsContent value="users" className="space-y-6 outline-hidden">
          
          {/* Sub-tabs under User Management */}
          <div className="flex border-b border-border gap-6">
            <button
              onClick={() => setAdminSubTab("users")}
              className={`pb-3 text-xs sm:text-sm font-semibold font-heading transition-all border-b-2 -mb-px ${
                adminSubTab === "users"
                  ? "border-brand-purple text-brand-purple"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Manajemen Pengguna Terdaftar ({usersList.length})
            </button>
            <button
              onClick={() => setAdminSubTab("invite")}
              className={`pb-3 text-xs sm:text-sm font-semibold font-heading transition-all border-b-2 -mb-px ${
                adminSubTab === "invite"
                  ? "border-brand-purple text-brand-purple"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Import CSV Whitelist / Undang
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

              <div className="overflow-x-auto border border-border rounded-lg bg-background">
                {isLoadingUsers ? (
                  <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
                    Memuat daftar data pengguna…
                  </div>
                ) : usersList.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    Belum ada pengguna terdaftar di database.
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
                        <th className="py-3 px-3">Peran</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {usersList.map((user) => {
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

                            <td className="py-3 px-3 text-2xs space-y-1">
                              {user.roles && user.roles.length > 0 ? (
                                user.roles.map((r) => (
                                  <span
                                    key={r}
                                    className={`inline-block px-1.5 py-0.5 rounded text-3xs font-semibold uppercase mr-1 ${
                                      r === "admin"
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
                              <span className={`inline-block px-2 py-0.5 rounded-full text-3xs font-semibold ${
                                user.status === "active" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
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

          {/* SUB-TAB 1.2: INVITE / WHITELIST USER PANELS */}
          {adminSubTab === "invite" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Single Invite Panel */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                  <h2 className="font-heading font-bold text-lg flex items-center gap-2 border-b border-border pb-3">
                    <UserPlus className="w-5 h-5 text-brand-purple" />
                    Tambah Whitelist Pengguna (Single)
                  </h2>
                  <form onSubmit={handleSingleInvite} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Nama Lengkap</label>
                        <input
                          type="text"
                          placeholder="Contoh: Budi Santoso"
                          value={inviteName}
                          onChange={(e) => setInviteName(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Alamat Email (Google)</label>
                        <input
                          type="email"
                          placeholder="contoh@gmail.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">No WhatsApp</label>
                        <input
                          type="text"
                          placeholder="Contoh: 08123456789"
                          value={inviteWhatsapp}
                          onChange={(e) => setInviteWhatsapp(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Institusi / Kampus</label>
                        <input
                          type="text"
                          placeholder="Contoh: Universitas Indonesia"
                          value={inviteInstitution}
                          onChange={(e) => setInviteInstitution(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Program Studi / Jurusan</label>
                        <input
                          type="text"
                          placeholder="Contoh: Teknik Informatika"
                          value={inviteStudyProgram}
                          onChange={(e) => setInviteStudyProgram(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Program IL yang dipilih</label>
                        <select
                          value={inviteSelectedProgram}
                          onChange={(e) => setInviteSelectedProgram(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                          required={inviteRole === "student" || inviteRole === "mentor"}
                        >
                          <option value="">-- Pilih Program --</option>
                          <option value="AI Development">AI Development</option>
                          <option value="Web Development and UI/UX Design">Web Development & UI/UX Design</option>
                          <option value="Mobile Development and UI/UX Design">Mobile Development & UI/UX Design</option>
                          <option value="Game Development">Game Development</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end justify-between gap-4 pt-2">
                      <div className="space-y-1.5 w-full sm:w-1/2">
                        <label className="text-xs font-semibold text-muted-foreground">Peran Akses LMS</label>
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value as any)}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                        >
                          <option value="student">Siswa LMS</option>
                          <option value="mentor">Mentor Kelas</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmittingInvite}
                        className="px-4 py-2 rounded-lg bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold font-heading transition-colors shadow-sm disabled:opacity-50 w-full sm:w-auto"
                      >
                        {isSubmittingInvite ? "Mendaftarkan…" : "Tambah Whitelist"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Bulk Invite Panel */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                  <h2 className="font-heading font-bold text-lg flex items-center gap-2 border-b border-border pb-3">
                    <Users className="w-5 h-5 text-brand-purple" />
                    Tambah Whitelist Massal (CSV Copy-Paste)
                  </h2>
                  <form onSubmit={handleBulkInvite} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                        <span>Tempelkan Baris CSV / Tab-separated dari Sheets / Excel</span>
                      </label>
                      <textarea
                        rows={6}
                        placeholder='Salin baris Excel lengkap dengan header, contoh:&#10;Nama Lengkap Peserta,Institusi,No WhatsApp,Email,Program IL yang dipilih,Program Studi / Jurusan&#10;BUDI SANTOSO,UNIVERSITAS INDONESIA,081234567,budi@gmail.com,AI Development,Teknik Informatika'
                        value={rawEmails}
                        onChange={(e) => setRawEmails(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple font-mono"
                      />
                      <p className="text-3xs text-muted-foreground leading-normal">
                        * Sistem otomatis mendeteksi header secara dinamis (tidak masalah jika urutan kolom tertukar) dan mengabaikan kolom yang tidak diperlukan serta menormalkan kapital huruf pada Nama & Institusi.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end justify-between gap-4">
                      <div className="space-y-1.5 w-full sm:w-1/2">
                        <label className="text-xs font-semibold text-muted-foreground">Peran Default</label>
                        <select
                          value={bulkRole}
                          onChange={(e) => setBulkRole(e.target.value as any)}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple"
                        >
                          <option value="student">Siswa LMS</option>
                          <option value="mentor">Mentor Kelas</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmittingBulk}
                        className="px-4 py-2 rounded-lg bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold font-heading transition-colors shadow-sm disabled:opacity-50 w-full sm:w-auto"
                      >
                        {isSubmittingBulk ? "Memproses…" : "Proses CSV Whitelist"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Bulk Results Spec */}
              {bulkResult && (
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
                  <h3 className="font-heading font-bold text-xs">Hasil Pemrosesan Whitelist Massal</h3>
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
          ) : (
            <>
              {/* Programs Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {programsData?.programs?.map((prog: any) => {
                  const isCollab = prog.name.toLowerCase().includes('web') || prog.name.toLowerCase().includes('mobile');
                  return (
                    <div key={prog.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-brand-purple/40 transition-all flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-heading font-bold text-base text-foreground">
                              {prog.name}
                            </h3>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-3xs font-medium bg-secondary/30 text-muted-foreground">
                              {isCollab ? 'Kolaboratif Track (Web & Mobile UI/UX)' : 'Eksklusif Track (AI & Game)'}
                            </span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-2xs font-semibold ${prog.studentsCount > 0 ? 'bg-brand-purple/10 text-brand-purple border border-brand-purple/20' : 'bg-secondary text-muted-foreground'}`}>
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
                          className="px-3.5 py-1.5 rounded-lg bg-brand-purple/10 hover:bg-brand-purple text-brand-purple hover:text-white font-semibold text-xs transition-colors flex items-center gap-1"
                        >
                          Kelola & Enrollment
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
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
                Aturan Mutlak (Rule 27): Hanya boleh ada 1 (satu) Batch berstatus ACTIVE pada satu waktu. Tiap batch berjalan berbarengan untuk program studi yang diikutsertakan.
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

          {/* Guide Banner - Cohort Prep Hub */}
          <div className="bg-gradient-to-r from-brand-purple/15 via-brand-purple/5 to-transparent border border-brand-purple/30 rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-start gap-3 relative z-10">
              <div className="p-2.5 bg-brand-purple/20 rounded-lg text-brand-purple shrink-0 mt-0.5">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                  One-Stop Cohort Preparation Hub (Masa Persiapan Angkatan)
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Gunakan hub ini untuk mempersiapkan angkatan baru (misal: selama bulan Juli sebelum masa aktif di Agustus). Dalam status <strong className="text-amber-500 font-semibold">DRAFT</strong>, Anda dapat:
                  <span className="block mt-1 space-y-0.5">
                    • <strong>1-Click Mentor Matrix:</strong> Menugaskan tim mentor ke program studi yang diikutsertakan.<br />
                    • <strong>Standardized CSV Importer:</strong> Mengimpor data murid secara massal dari Airtable/Spreadsheet tanpa email spam (Silent Whitelist), langsung mendaftarkan ke program studi, dan mendistribusikan ke mentor secara Round-Robin/Modulo (Rule 23 & 25).
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-heading font-semibold text-sm text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-purple" />
              Daftar Angkatan & Status Siklus Hidup
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {batchesList.map((batch) => {
                  const isActive = batch.status === "active";
                  const isDraft = batch.status === "draft";
                  const isCompleted = batch.status === "completed";
                  const isEmpty = batch.classCount === 0 && batch.studentCount === 0;

                  return (
                    <div
                      key={batch.id}
                      className={`border rounded-xl p-5 space-y-4 transition-all relative overflow-hidden ${
                        isActive
                          ? "border-emerald-500/50 bg-emerald-500/5 shadow-md shadow-emerald-500/5"
                          : isDraft
                          ? "border-amber-500/40 bg-amber-500/5"
                          : "border-border bg-card opacity-80"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-3xs font-bold px-3 py-1 rounded-bl-lg tracking-wider uppercase flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          Active Cohort
                        </div>
                      )}
                      {isDraft && (
                        <div className="absolute top-0 right-0 bg-amber-500 text-white text-3xs font-bold px-3 py-1 rounded-bl-lg tracking-wider uppercase flex items-center gap-1 shadow-sm">
                          <AlertCircle className="w-3 h-3" />
                          Draft / Persiapan
                        </div>
                      )}
                      {isCompleted && (
                        <div className="absolute top-0 right-0 bg-secondary text-muted-foreground text-3xs font-bold px-3 py-1 rounded-bl-lg tracking-wider uppercase flex items-center gap-1 border-l border-b border-border">
                          <Lock className="w-3 h-3" />
                          Read-Only (Selesai)
                        </div>
                      )}

                      <div>
                        <h4 className="font-heading font-bold text-base text-foreground pr-24">
                          {batch.name}
                        </h4>
                        <p className="text-2xs text-muted-foreground mt-0.5">
                          Dibuat pada {new Date(batch.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>

                      <div className="space-y-2 border-t border-b border-border/60 py-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Program Diikutsertakan:</span>
                          <span className="font-semibold text-foreground">
                            {batch.includedPrograms?.length || 0} Program
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {batch.includedPrograms?.map((prog: any) => (
                            <span
                              key={prog.id}
                              className="px-2 py-0.5 bg-secondary text-foreground text-3xs font-medium rounded-md border border-border"
                            >
                              {prog.name}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-muted-foreground">Total Kelas / Murid:</span>
                          <span className="font-semibold text-foreground">
                            {batch.classCount || 0} Kelas / {batch.studentCount || 0} Murid
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                        {!isCompleted && (
                          <button
                            onClick={() => {
                              setSelectedBatchForMatrix(batch);
                              const initialMatrix: Record<string, string[]> = {};
                              batch.includedPrograms?.forEach((prog: any) => {
                                initialMatrix[prog.id] = prog.mentors?.map((m: any) => m.id) || [];
                              });
                              setMatrixProgramMentors(initialMatrix);
                              setIsMentorMatrixModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-brand-purple/10 hover:bg-brand-purple/20 text-brand-purple border border-brand-purple/20 rounded-lg text-2xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Atur Mentor
                          </button>
                        )}

                        {!isActive && (
                          <button
                            onClick={() => {
                              triggerConfirm(
                                "Aktifkan Batch Ini?",
                                `Mengaktifkan "${batch.name}" akan otomatis mengubah Batch Aktif lainnya menjadi Read-Only Mode (Selesai) sesuai Rule 27. Lanjutkan?`,
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
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-2xs font-semibold transition-all shadow-xs cursor-pointer"
                          >
                            Jadikan Active
                          </button>
                        )}
                        {isActive && (
                          <button
                            onClick={() => {
                              triggerConfirm(
                                "Kunci Batch Menjadi Read-Only?",
                                `Mengubah "${batch.name}" menjadi Selesai akan mengunci seluruh kelas dan nilai di dalamnya menjadi arsip Read-Only (Rule 23 & 26). Lanjutkan?`,
                                "Ya, Kunci Batch",
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
                            className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-lg text-2xs font-semibold transition-all cursor-pointer"
                          >
                            Kunci (Selesai)
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
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg transition-all cursor-pointer"
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

          {/* ──────── STANDARDIZED CSV IMPORTER ──────── */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-brand-purple" />
                  Impor Data Murid & Auto-Enrollment (Standardized CSV Schema)
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Unggah atau paste data dari spreadsheet/Airtable. Sistem mengikuti standar spesifikasi kolom mutlak tanpa risiko salah tebak/fuzzy parsing.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-secondary/60 border border-border px-3 py-1.5 rounded-lg">
                <span className="text-2xs font-mono text-muted-foreground font-semibold">
                  name,email,whatsapp,institution,studyProgram,selectedProgram
                </span>
                <button
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

            <form onSubmit={handleCsvImport} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Pilih Angkatan / Batch Tujuan:</label>
                  <select
                    value={selectedBatchForImport}
                    onChange={(e) => setSelectedBatchForImport(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-medium focus:outline-none focus:border-brand-purple"
                    required
                  >
                    <option value="">-- Pilih Batch (Active / Draft) --</option>
                    {batchesList.filter(b => b.status !== "completed").map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.status.toUpperCase()}) - {b.includedPrograms?.length || 0} Program
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoDistributeImport}
                      onChange={(e) => setAutoDistributeImport(e.target.checked)}
                      className="rounded border-border text-brand-purple focus:ring-brand-purple w-4 h-4 cursor-pointer"
                    />
                    <span>Otomatisi Distribusi Round-Robin ke Mentor Utama (Rule 23 & 25)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Paste Isi Data CSV / Spreadsheet:</label>
                  <span className="text-3xs text-muted-foreground">Tip: Gunakan koma (,) sebagai pemisah kolom</span>
                </div>
                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`name,email,whatsapp,institution,studyProgram,selectedProgram\nBudi Santoso,budi@student.umrah.ac.id,081234567890,Universitas Maritim Raja Ali Haji,Teknik Informatika,AI Development\nSiti Aminah,siti@gmail.com,089876543210,Institut Teknologi Bandung,Sistem Informasi,Web Development and UI/UX Design`}
                  rows={6}
                  className="w-full bg-background border border-border rounded-lg p-3 text-xs font-mono text-foreground focus:outline-none focus:border-brand-purple leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-2xs text-muted-foreground flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>Silent Whitelist: Murid dengan email Gmail/kampus akan didaftarkan tanpa email blast otomatis per aturan Google.</span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingImport || !selectedBatchForImport || !csvText.trim()}
                  className="px-5 py-2.5 bg-brand-purple hover:bg-brand-purple-hover disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSubmittingImport ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses Impor & Distribusi...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Impor, Daftarkan, & Distribusikan
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Import Result Report Card */}
            {importResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 space-y-3"
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
        </TabsContent>

        {/* ──────── TAB 3: KOMPETENSI & KURIKULUM (FUTURE FEATURE SPEC CARD) ──────── */}
        <TabsContent value="curriculum" className="space-y-6 outline-hidden">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-heading font-bold text-lg flex items-center gap-2 border-b border-border pb-3">
              <Award className="w-5 h-5 text-brand-purple" />
              Otoritas Pembuat Kompetensi & Kurikulum
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Memfasilitasi tim mentor untuk merancang, memvalidasi, dan menerbitkan materi kurikulum berbasis kompetensi yang selaras dengan rumpun program masing-masing.
            </p>

            <div className="border border-border rounded-xl overflow-hidden text-2xs bg-background">
              <div className="grid grid-cols-3 border-b border-border bg-secondary/35 font-semibold p-2">
                <div>Nama Program</div>
                <div>Pembuat Kompetensi Resmi</div>
                <div>Status Batasan Sistem</div>
              </div>
              <div className="grid grid-cols-3 p-2 border-b border-border">
                <div className="font-medium">AI Development</div>
                <div>Mentor AI</div>
                <div className="text-emerald-600 font-semibold">Terkunci (Eksklusif)</div>
              </div>
              <div className="grid grid-cols-3 p-2 border-b border-border">
                <div className="font-medium">Game Development</div>
                <div>Mentor Game</div>
                <div className="text-emerald-600 font-semibold">Terkunci (Eksklusif)</div>
              </div>
              <div className="grid grid-cols-3 p-2 border-b border-border">
                <div className="font-medium">Web Development & UI/UX</div>
                <div>Mentor Web + Mentor UI/UX</div>
                <div className="text-amber-600 font-semibold">Kolaborasi Lintas Modul</div>
              </div>
              <div className="grid grid-cols-3 p-2">
                <div className="font-medium">Mobile Development & UI/UX</div>
                <div>Mentor Mobile + Mentor UI/UX</div>
                <div className="text-amber-600 font-semibold">Kolaborasi Lintas Modul</div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ──────── TAB 4: PENGATURAN (FUTURE CONFIGS SPEC CARD) ──────── */}
        <TabsContent value="settings" className="space-y-6 outline-hidden">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-heading font-bold text-lg flex items-center gap-2 border-b border-border pb-3">
              <Settings className="w-5 h-5 text-brand-purple" />
              Konfigurasi Sistem & Workflow Penyetujuan
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mengatur kontrol tingkat keamanan sistem, siklus log sesi audit, serta *Workflow Approval* untuk permohonan eskalasi Mentor yang ingin merangkap posisi fungsional sebagai Admin sistem.
            </p>
            <div className="p-4 border border-yellow-500/20 bg-yellow-500/5 rounded-xl text-2xs text-yellow-800 dark:text-yellow-300 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block mb-0.5">Catatan Keamanan Tingkat Tinggi (RBAC)</strong>
                Seorang Admin aktif memegang keputusan mutlak untuk menolak atau menyetujui permohonan eskalasi Mentor menjadi Admin. Mentor tidak memiliki hak akses bawaan untuk merubah hak akses ini.
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ──────── TAB 5: RULES & SOURCE OF TRUTH ──────── */}
        <TabsContent value="rules" className="space-y-6 outline-hidden">
          <AdminRules />
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
                    Atur penugasan tim mentor dan pendaftaran siswa binaan sesuai Bab 5 & Bab 9 Source of Truth.
                  </p>
                </div>
                <button
                  onClick={() => setIsProgramModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Bagian Siklus & Riwayat Batch */}
              <div className="border border-border rounded-xl p-4 bg-secondary/10 space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <h4 className="font-heading font-bold text-sm flex items-center gap-2 text-foreground">
                      <Calendar className="w-4 h-4 text-brand-purple" />
                      Siklus & Riwayat Batch Program
                    </h4>
                    <p className="text-2xs text-muted-foreground mt-0.5">
                      Setiap program memiliki siklus batch independen (Rule 26). Membuat batch baru akan mengunci batch lama menjadi arsip Read-Only.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setNewBatchName(`Batch ${selectedProgramDetail.batchHistory?.length ? selectedProgramDetail.batchHistory.length + 1 : 1} - ${new Date().getFullYear()}`);
                      setIsCreateBatchModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-brand-purple text-white hover:bg-brand-purple-hover text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Buat Batch Baru
                  </button>
                </div>

                {/* Status Batch Aktif */}
                <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${selectedProgramDetail.activeBatch ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <div>
                      <div className="text-xs font-semibold text-foreground">
                        {selectedProgramDetail.activeBatch ? selectedProgramDetail.activeBatch.name : 'Belum Ada Batch Berjalan (Reset / Selesai)'}
                      </div>
                      <div className="text-3xs text-muted-foreground">
                        {selectedProgramDetail.activeBatch ? 'Status: Aktif (Menerima enrollment & pembelajaran berjalan)' : 'Semua kegiatan akademik di-reset/berhenti sementara hingga batch baru dibuat.'}
                      </div>
                    </div>
                  </div>
                  {selectedProgramDetail.activeBatch && (
                    <button
                      onClick={() => triggerConfirm(
                        "Kunci Batch ke Mode Read-Only?",
                        `Apakah Anda yakin ingin mengakhiri ${selectedProgramDetail.activeBatch.name}? Seluruh kelas dan progres di dalamnya akan dikunci menjadi arsip Read-Only.`,
                        "Ya, Kunci Batch",
                        true,
                        async () => {
                          await fetch("http://localhost:7000/classes/batch-status", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status: "completed", batchId: selectedProgramDetail.activeBatch.id }),
                            credentials: "include",
                          });
                          fetchProgramsList();
                          const updated = await fetch("http://localhost:7000/classes/programs-list", { credentials: "include" });
                          if (updated.ok) {
                            const d = await updated.json();
                            setProgramsData(d);
                            const p = d.programs.find((x: any) => x.id === selectedProgramDetail.id);
                            if (p) setSelectedProgramDetail(p);
                          }
                        }
                      )}
                      className="px-2.5 py-1 rounded border border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 text-3xs font-medium transition-colors"
                    >
                      Selesai / Kunci
                    </button>
                  )}
                </div>

                {/* Tabel Riwayat Batch */}
                {selectedProgramDetail.batchHistory && selectedProgramDetail.batchHistory.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider">Riwayat Batch (Arsip Read-Only):</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-28 overflow-y-auto pr-1">
                      {selectedProgramDetail.batchHistory.map((b: any) => (
                        <div key={b.id} className="p-2 bg-secondary/20 border border-border/80 rounded flex items-center justify-between text-3xs">
                          <span className="font-medium text-foreground">{b.name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">Selesai (Read-Only)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Kolom Mentor */}
                <div className="space-y-4 border border-border rounded-xl p-4 bg-secondary/5">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <h4 className="font-heading font-bold text-sm flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-brand-purple" />
                      Tim Mentor Program ({selectedProgramDetail.mentorsCount})
                    </h4>
                    <button
                      onClick={() => {
                        setSelectedMentorToAssign("");
                        setIsAddMentorModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-md bg-brand-purple text-white hover:bg-brand-purple-hover text-2xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Assign Mentor
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                    {selectedProgramDetail.mentors.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-6">Belum ada mentor yang ditugaskan ke program ini.</p>
                    ) : (
                      selectedProgramDetail.mentors.map((m: any) => (
                        <div key={m.id} className="p-3 bg-card border border-border rounded-lg flex items-center justify-between text-xs shadow-3xs">
                          <div>
                            <div className="font-semibold text-foreground">{m.name}</div>
                            <div className="text-2xs text-muted-foreground">{m.email}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-3xs font-medium bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
                            {m.specialization || 'Primary Mentor'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Kolom Murid */}
                <div className="space-y-4 border border-border rounded-xl p-4 bg-secondary/5">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <h4 className="font-heading font-bold text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-brand-purple" />
                      Murid Terdaftar ({selectedProgramDetail.studentsCount})
                    </h4>
                    <button
                      onClick={() => {
                        setEnrollCase("case2");
                        setSelectedStudentToEnroll("");
                        setSelectedMentorForEnroll("");
                        setIsAddStudentModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-md bg-brand-purple text-white hover:bg-brand-purple-hover text-2xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Student Enrollment
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                    {selectedProgramDetail.students.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-6">Belum ada siswa yang mendaftar di program ini.</p>
                    ) : (
                      selectedProgramDetail.students.map((s: any) => (
                        <div key={s.id} className="p-3 bg-card border border-border rounded-lg flex items-center justify-between text-xs shadow-3xs">
                          <div>
                            <div className="font-semibold text-foreground">{s.name}</div>
                            <div className="text-2xs text-muted-foreground">Mentor: <span className="font-medium text-brand-purple">{s.mentorName}</span></div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-3xs font-medium ${s.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                            {s.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

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
                    PERINGATAN RULE 25 (CLEAN TRANSFER): Memindahkan murid antar program akan menghapus SELURUH riwayat nilai, absen, dan tugas di program lama!
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
                    className={`px-4 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm ${
                      enrollCase === "case3" ? "bg-red-500 hover:bg-red-600" : "bg-brand-purple hover:bg-brand-purple-hover"
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

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Status Awal</label>
                  <select
                    value={newBatchStatus}
                    onChange={(e: any) => setNewBatchStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-brand-purple outline-hidden font-medium"
                  >
                    <option value="draft">Persiapan / Draft (Tidak Mengganggu Batch Aktif)</option>
                    <option value="active">Active Cohort (Otomatis Selesaikan Batch Aktif Lainnya)</option>
                    <option value="completed">Read-Only / Selesai (Arsip Historis)</option>
                  </select>
                  {newBatchStatus === "active" && (
                    <p className="text-3xs text-amber-500 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      Peringatan Rule 27: Mengaktifkan batch ini akan langsung mengunci batch aktif saat ini menjadi Read-Only.
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
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-xs ${
                            isChecked ? "border-brand-purple bg-brand-purple/5 font-medium text-foreground" : "border-border bg-secondary/30 text-muted-foreground"
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
                    <span>Tambah Program Baru (Fleksibel Rule 22)</span>
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
                                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                    isChecked
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
                  onClick={() => {
                    if (confirmAction) confirmAction();
                  }}
                  className={`px-4 py-2 rounded-lg text-white text-xs font-semibold font-heading transition-colors shadow-sm ${
                    confirmIsDestructive
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-brand-purple hover:bg-brand-purple-hover"
                  }`}
                >
                  {confirmButtonText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
