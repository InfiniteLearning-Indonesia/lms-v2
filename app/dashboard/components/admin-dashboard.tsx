"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Settings,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminAttendance } from "./admin-attendance";
import { UserListItem, AdminDashboardProps, Program, Batch } from "./admin/types";

// Domain Sub-components
import { AdminUsersList } from "./admin/admin-users-list";
import { AdminUserInvite } from "./admin/admin-user-invite";
import { AdminProgramsList } from "./admin/admin-programs-list";
import { AdminBatchesList } from "./admin/admin-batches-list";
import { AdminProfileSettings } from "./admin/admin-profile-settings";

// Modal Dialogs
import { ConfirmActionModal } from "./admin/modals/confirm-action-modal";
import { EditUserModal } from "./admin/modals/edit-user-modal";
import { ReviewCsvModal, ParsedCsvStudent } from "./admin/modals/review-csv-modal";
import { ProgramModal } from "./admin/modals/program-modal";
import { AssignMentorModal } from "./admin/modals/assign-mentor-modal";
import { AddStudentModal } from "./admin/modals/add-student-modal";
import { CreateBatchModal } from "./admin/modals/batch-modal";
import { EditBatchModal } from "./admin/modals/edit-batch-modal";
import { BatchDetailModal } from "./admin/modals/batch-detail-modal";
import { MentorMatrixModal } from "./admin/modals/mentor-matrix-modal";

export type { UserListItem };

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
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName,
          whatsapp: profileWhatsapp,
          institution: profileInstitution,
          studyProgram: profileStudyProgram,
          avatarUrl: profileAvatarUrl,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal memperbarui profil.");
      }

      setProfileSaveSuccess("Profil berhasil diperbarui!");
      if (onProfileUpdate) onProfileUpdate();
    } catch (err: any) {
      setProfileSaveError(err.message || "Terjadi kesalahan saat menyimpan profil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Tab & SubTab Navigation
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>("users");
  const [adminSubTab, setAdminSubTab] = useState<"users" | "invite">("users");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "settings") {
      setActiveTab("settings");
    } else if (tab === "attendance") {
      setActiveTab("attendance");
    } else if (tab === "programs") {
      setActiveTab("programs");
    } else if (tab === "batches") {
      setActiveTab("batches");
    } else if (tab === "users") {
      setActiveTab("users");
    }
  }, [searchParams]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", val);
    window.history.pushState({}, "", url.toString());
  };

  // Data States
  const [usersList, setUsersList] = useState<UserListItem[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("");
  const [userBatchFilter, setUserBatchFilter] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSendingEmailMap, setIsSendingEmailMap] = useState<Record<string, boolean>>({});

  // Single Invite States
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"student" | "mentor" | "admin" | "facilitator">("student");
  const [inviteWhatsapp, setInviteWhatsapp] = useState("");
  const [inviteInstitution, setInviteInstitution] = useState("");
  const [inviteStudyProgram, setInviteStudyProgram] = useState("");
  const [inviteSelectedProgram, setInviteSelectedProgram] = useState("");
  const [inviteSpecialization, setInviteSpecialization] = useState("");
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

  // Bulk CSV States
  const [selectedBatchForImport, setSelectedBatchForImport] = useState("");
  const [useFileUpload, setUseFileUpload] = useState(true);
  const [csvText, setCsvText] = useState("");
  const [isSubmittingImport, setIsSubmittingImport] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [parsedStudents, setParsedStudents] = useState<ParsedCsvStudent[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Programs & Batches Data States
  const [programsData, setProgramsData] = useState<any>(null);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const [batchesList, setBatchesList] = useState<Batch[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);

  // Modals States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState("");
  const [editingEmailValue, setEditingEmailValue] = useState("");
  const [editingWhatsappValue, setEditingWhatsappValue] = useState("");
  const [editingInstitutionValue, setEditingInstitutionValue] = useState("");
  const [editingStudyProgramValue, setEditingStudyProgramValue] = useState("");
  const [editingSelectedProgramValue, setEditingSelectedProgramValue] = useState("");
  const [editingUserBatches, setEditingUserBatches] = useState<string[]>([]);

  // Confirm Modal States
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDescription, setConfirmDescription] = useState("");
  const [confirmButtonText, setConfirmButtonText] = useState("Konfirmasi");
  const [confirmIsDestructive, setConfirmIsDestructive] = useState(false);
  const [confirmCountdown, setConfirmCountdown] = useState(0);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  // Program Detail & Enrollment Modal
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [selectedProgramDetail, setSelectedProgramDetail] = useState<any>(null);
  const [isAddMentorModalOpen, setIsAddMentorModalOpen] = useState(false);
  const [selectedMentorToAssign, setSelectedMentorToAssign] = useState("");
  const [isSubmittingAssignMentor, setIsSubmittingAssignMentor] = useState(false);

  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [enrollCase, setEnrollCase] = useState("case1");
  const [selectedStudentToEnroll, setSelectedStudentToEnroll] = useState("");
  const [selectedMentorForEnroll, setSelectedMentorForEnroll] = useState("");
  const [isSubmittingEnroll, setIsSubmittingEnroll] = useState(false);

  // Batch Modals
  const [isCreateBatchModalOpen, setIsCreateBatchModalOpen] = useState(false);
  const [newBatchName, setNewBatchName] = useState("");
  const [newBatchStartDate, setNewBatchStartDate] = useState("");
  const [newBatchEndDate, setNewBatchEndDate] = useState("");
  const [newBatchStatus, setNewBatchStatus] = useState<"draft" | "active">("draft");
  const [selectedProgramIdsForBatch, setSelectedProgramIdsForBatch] = useState<string[]>([]);
  const [customProgramInput, setCustomProgramInput] = useState("");
  const [isSubmittingCreateBatch, setIsSubmittingCreateBatch] = useState(false);

  const [isEditBatchModalOpen, setIsEditBatchModalOpen] = useState(false);
  const [selectedBatchForEdit, setSelectedBatchForEdit] = useState<any>(null);
  const [editBatchName, setEditBatchName] = useState("");
  const [editBatchStartDate, setEditBatchStartDate] = useState("");
  const [editBatchEndDate, setEditBatchEndDate] = useState("");
  const [editBatchIncludedProgramIds, setEditBatchIncludedProgramIds] = useState<string[]>([]);
  const [isSubmittingEditBatch, setIsSubmittingEditBatch] = useState(false);

  const [isBatchDetailModalOpen, setIsBatchDetailModalOpen] = useState(false);
  const [selectedBatchForDetail, setSelectedBatchForDetail] = useState<any>(null);

  const [isMentorMatrixModalOpen, setIsMentorMatrixModalOpen] = useState(false);
  const [selectedBatchForMatrix, setSelectedBatchForMatrix] = useState<any>(null);
  const [matrixProgramMentors, setMatrixProgramMentors] = useState<Record<string, string[]>>({});
  const [isSubmittingMatrix, setIsSubmittingMatrix] = useState(false);

  const [selectedOldBatchId, setSelectedOldBatchId] = useState("none");

  // Countdown timer effect for confirmation modal
  useEffect(() => {
    let timer: any;
    if (isConfirmOpen && confirmCountdown > 0) {
      timer = setInterval(() => {
        setConfirmCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isConfirmOpen, confirmCountdown]);

  // Data Fetching Functions
  const fetchUsersList = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch("http://localhost:7000/users", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error("Gagal mengambil data pengguna", err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchProgramsList = async () => {
    setIsLoadingPrograms(true);
    try {
      const res = await fetch("http://localhost:7000/classes/programs-list", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setProgramsData(data);
      }
    } catch (err) {
      console.error("Gagal mengambil data program", err);
    } finally {
      setIsLoadingPrograms(false);
    }
  };

  const fetchBatchesList = async () => {
    setIsLoadingBatches(true);
    try {
      const res = await fetch("http://localhost:7000/classes/batches", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setBatchesList(data);
      }
    } catch (err) {
      console.error("Gagal mengambil data batch", err);
    } finally {
      setIsLoadingBatches(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
    fetchProgramsList();
    fetchBatchesList();
  }, []);

  // Selection handlers
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

  // User Actions
  const handleEditClick = (user: UserListItem) => {
    setEditingUserId(user.id);
    setEditingNameValue(user.name);
    setEditingEmailValue(user.email);
    setEditingWhatsappValue(user.whatsapp || "");
    setEditingInstitutionValue(user.institution || "");
    setEditingStudyProgramValue(user.studyProgram || "");
    setEditingSelectedProgramValue(user.selectedProgram || "AI Development");
    setEditingUserBatches(user.batches?.map((b) => b.id) || []);
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUserId) return;
    try {
      const res = await fetch(`http://localhost:7000/users/${editingUserId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingNameValue,
          email: editingEmailValue,
          whatsapp: editingWhatsappValue,
          institution: editingInstitutionValue,
          studyProgram: editingStudyProgramValue,
          selectedProgram: editingSelectedProgramValue,
          batchIds: editingUserBatches,
        }),
      });

      if (res.ok) {
        setSuccessMsg("Profil pengguna berhasil diperbarui!");
        setIsEditModalOpen(false);
        fetchUsersList();
      } else {
        const errData = await res.json();
        setError(errData.message || "Gagal memperbarui pengguna.");
      }
    } catch (err: any) {
      setError("Terjadi kesalahan koneksi server.");
    }
  };

  // Confirmation triggers
  const triggerSendWarningConfirm = (id: string, email: string) => {
    setConfirmTitle("Kirim Email Peringatan");
    setConfirmDescription(
      `Apakah Anda yakin ingin mengirim email peringatan penggantian email Gmail ke ${email}?`
    );
    setConfirmButtonText("Kirim Email");
    setConfirmIsDestructive(false);
    setConfirmCountdown(0);
    setConfirmAction(() => () => sendWarningEmail(id));
    setIsConfirmOpen(true);
  };

  const sendWarningEmail = async (id: string) => {
    setIsSendingEmailMap((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`http://localhost:7000/users/${id}/send-warning-email`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setSuccessMsg("Email peringatan berhasil dikirim ke alamat non-Gmail.");
      } else {
        setError("Gagal mengirim email peringatan.");
      }
    } catch (err) {
      setError("Gagal menghubungi server mail.");
    } finally {
      setIsSendingEmailMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  const triggerSuspendConfirm = (id: string) => {
    setConfirmTitle("Suspend Akun Pengguna");
    setConfirmDescription("Pengguna ini tidak akan bisa login ke sistem selama akun di-suspend.");
    setConfirmButtonText("Ya, Suspend");
    setConfirmIsDestructive(true);
    setConfirmCountdown(3);
    setConfirmAction(() => () => updateUserStatus(id, "suspended"));
    setIsConfirmOpen(true);
  };

  const triggerUnsuspendConfirm = (id: string) => {
    setConfirmTitle("Aktifkan Kembali Akun");
    setConfirmDescription("Akun pengguna ini akan dipulihkan dan dapat kembali mengakses LMS.");
    setConfirmButtonText("Aktifkan Akun");
    setConfirmIsDestructive(false);
    setConfirmCountdown(0);
    setConfirmAction(() => () => updateUserStatus(id, "active"));
    setIsConfirmOpen(true);
  };

  const updateUserStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:7000/users/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setSuccessMsg(`Status pengguna berhasil diubah menjadi ${status}.`);
        fetchUsersList();
      } else {
        setError("Gagal memperbarui status pengguna.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    }
  };

  const triggerDeleteConfirm = (id: string) => {
    setConfirmTitle("Hapus Permanent Akun Pengguna");
    setConfirmDescription("Tindakan ini tidak dapat dibatalkan. Data profil pengguna akan dihapus permanen.");
    setConfirmButtonText("Hapus Permanent");
    setConfirmIsDestructive(true);
    setConfirmCountdown(5);
    setConfirmAction(() => () => deleteUser(id));
    setIsConfirmOpen(true);
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:7000/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setSuccessMsg("Akun pengguna berhasil dihapus permanen.");
        fetchUsersList();
      } else {
        setError("Gagal menghapus pengguna.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    }
  };

  const triggerBulkDeleteConfirm = () => {
    setConfirmTitle(`Hapus Permanent ${selectedUserIds.length} Pengguna`);
    setConfirmDescription(
      "Tindakan massal ini akan menghapus permanen seluruh pengguna terpilih. Data tidak dapat dipulihkan."
    );
    setConfirmButtonText("Hapus Semua Terpilih");
    setConfirmIsDestructive(true);
    setConfirmCountdown(5);
    setConfirmAction(() => () => bulkDeleteUsers());
    setIsConfirmOpen(true);
  };

  const bulkDeleteUsers = async () => {
    try {
      const res = await fetch("http://localhost:7000/users/bulk-delete", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedUserIds, userIds: selectedUserIds }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSuccessMsg(`${selectedUserIds.length} akun pengguna berhasil dihapus permanen.`);
        setSelectedUserIds([]);
        fetchUsersList();
      } else {
        setError(data.message || "Gagal menghapus pengguna terpilih.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    }
  };

  // Single Invite Submit
  const handleSingleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingInvite(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("http://localhost:7000/users/invite", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail,
          role: inviteRole,
          whatsapp: inviteWhatsapp,
          institution: inviteInstitution,
          studyProgram: inviteStudyProgram,
          selectedProgram: inviteSelectedProgram,
          specialization: inviteSpecialization,
        }),
      });

      if (res.ok) {
        setSuccessMsg(`Undangan pengguna ${inviteName} (${inviteRole}) berhasil didaftarkan!`);
        setInviteName("");
        setInviteEmail("");
        setInviteWhatsapp("");
        setInviteInstitution("");
        setInviteStudyProgram("");
        setInviteSelectedProgram("");
        setInviteSpecialization("");
        fetchUsersList();
      } else {
        const errData = await res.json();
        setError(errData.message || "Gagal mengundang pengguna.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  // CSV Import handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) setCsvText(text);
    };
    reader.readAsText(file);
  };

  const handleCsvReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForImport || !csvText.trim()) return;

    const lines = csvText.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length <= 1) {
      setError("Format CSV kosong atau tidak memiliki baris data murid.");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim());
    const nameIdx = headers.indexOf("name");
    const emailIdx = headers.indexOf("email");
    const waIdx = headers.indexOf("whatsapp");
    const instIdx = headers.indexOf("institution");
    const studyIdx = headers.indexOf("studyProgram");
    const progIdx = headers.indexOf("selectedProgram");

    if (nameIdx === -1 || emailIdx === -1 || progIdx === -1) {
      setError("CSV wajib memiliki kolom minimal: name, email, selectedProgram.");
      return;
    }

    const students: ParsedCsvStudent[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      if (cols[nameIdx] && cols[emailIdx]) {
        students.push({
          name: cols[nameIdx],
          email: cols[emailIdx],
          whatsapp: waIdx !== -1 ? cols[waIdx] : "",
          institution: instIdx !== -1 ? cols[instIdx] : "",
          studyProgram: studyIdx !== -1 ? cols[studyIdx] : "",
          selectedProgram: cols[progIdx] || "AI Development",
        });
      }
    }

    setParsedStudents(students);
    setIsReviewModalOpen(true);
  };

  const executeCsvImport = async () => {
    setIsReviewModalOpen(false);
    setIsSubmittingImport(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("http://localhost:7000/users/bulk-import-csv", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: selectedBatchForImport,
          students: parsedStudents,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setImportResult(data);
        setSuccessMsg(`Pendaftaran massal berhasil! ${data.successCount} murid telah diimpor.`);
        setCsvText("");
        fetchUsersList();
      } else {
        const errData = await res.json();
        setError(errData.message || "Gagal melakukan impor CSV.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan saat mengimpor CSV.");
    } finally {
      setIsSubmittingImport(false);
    }
  };

  // Assign Mentor & Enroll Student handlers
  const handleAssignMentorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramDetail || !selectedMentorToAssign) return;

    setIsSubmittingAssignMentor(true);
    try {
      const res = await fetch(
        `http://localhost:7000/classes/programs/${selectedProgramDetail.id}/assign-mentor`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mentorId: selectedMentorToAssign }),
        }
      );

      if (res.ok) {
        setSuccessMsg("Mentor berhasil ditugaskan ke program!");
        setIsAddMentorModalOpen(false);
        fetchProgramsList();
      } else {
        const errData = await res.json();
        setError(errData.message || "Gagal mentugaskan mentor.");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmittingAssignMentor(false);
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramDetail || !selectedStudentToEnroll) return;

    setIsSubmittingEnroll(true);
    try {
      const res = await fetch(
        `http://localhost:7000/classes/programs/${selectedProgramDetail.id}/enroll-student`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: selectedStudentToEnroll,
            mentorId: selectedMentorForEnroll || undefined,
            cleanTransfer: enrollCase === "case3",
          }),
        }
      );

      if (res.ok) {
        setSuccessMsg("Pendaftaran siswa ke program berhasil dieksekusi!");
        setIsAddStudentModalOpen(false);
        fetchProgramsList();
        fetchUsersList();
      } else {
        const errData = await res.json();
        setError(errData.message || "Gagal memproses pendaftaran siswa.");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmittingEnroll(false);
    }
  };

  // Batch Handlers
  const handleCreateBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim()) return;

    setIsSubmittingCreateBatch(true);
    try {
      const res = await fetch("http://localhost:7000/classes/batches", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBatchName,
          startDate: newBatchStartDate || undefined,
          endDate: newBatchEndDate || undefined,
          status: newBatchStatus,
          includedProgramIds: selectedProgramIdsForBatch,
          customPrograms: customProgramInput ? customProgramInput.split(",").map((p) => p.trim()) : [],
        }),
      });

      if (res.ok) {
        setSuccessMsg(`Batch Baru "${newBatchName}" berhasil dibuat!`);
        setIsCreateBatchModalOpen(false);
        fetchBatchesList();
        fetchProgramsList();
      } else {
        const errData = await res.json();
        setError(errData.message || "Gagal membuat batch baru.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmittingCreateBatch(false);
    }
  };

  const handleEditBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForEdit || !editBatchName.trim()) return;

    setIsSubmittingEditBatch(true);
    try {
      const res = await fetch(`http://localhost:7000/classes/batches/${selectedBatchForEdit.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editBatchName,
          startDate: editBatchStartDate || undefined,
          endDate: editBatchEndDate || undefined,
          includedProgramIds: editBatchIncludedProgramIds,
        }),
      });

      if (res.ok) {
        setSuccessMsg(`Perubahan Batch "${editBatchName}" berhasil disimpan!`);
        setIsEditBatchModalOpen(false);
        fetchBatchesList();
      } else {
        const errData = await res.json();
        setError(errData.message || "Gagal memperbarui batch.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmittingEditBatch(false);
    }
  };

  const activateBatch = async (batchId: string, name: string) => {
    try {
      const res = await fetch(`http://localhost:7000/classes/batches/${batchId}/activate`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setSuccessMsg(`Batch "${name}" berhasil diaktifkan sebagai Active Cohort!`);
        fetchBatchesList();
        fetchProgramsList();
      } else {
        setError("Gagal mengaktifkan batch.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    }
  };

  const triggerActivateBatchConfirm = (batchId: string, name: string) => {
    setConfirmTitle(`Aktifkan Cohort ${name}`);
    setConfirmDescription("Mengaktifkan cohort ini akan mengunci batch aktif sebelumnya menjadi Read-Only.");
    setConfirmButtonText("Ya, Aktifkan Cohort");
    setConfirmIsDestructive(false);
    setConfirmCountdown(2);
    setConfirmAction(() => () => activateBatch(batchId, name));
    setIsConfirmOpen(true);
  };

  const handleSaveMentorMatrix = async () => {
    if (!selectedBatchForMatrix) return;
    setIsSubmittingMatrix(true);
    try {
      const res = await fetch(
        `http://localhost:7000/classes/batches/${selectedBatchForMatrix.id}/mentor-matrix`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matrix: matrixProgramMentors }),
        }
      );

      if (res.ok) {
        setSuccessMsg("Penugasan Matrix Mentor berhasil diperbarui!");
        setIsMentorMatrixModalOpen(false);
        fetchBatchesList();
        fetchProgramsList();
      } else {
        const errData = await res.json();
        setError(errData.message || "Gagal menyimpan matrix mentor.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmittingMatrix(false);
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

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full font-sans">
        <TabsList className="grid w-full grid-cols-5 mb-8 min-h-14 p-1.5 bg-secondary border border-border rounded-lg">
          <TabsTrigger
            value="users"
            className="text-sm font-semibold font-heading flex items-center justify-center gap-2.5 py-2.5 rounded-md cursor-pointer"
          >
            <Users className="w-5 h-5 text-brand-purple shrink-0" />
            <span>Pengguna</span>
          </TabsTrigger>
          <TabsTrigger
            value="programs"
            className="text-sm font-semibold font-heading flex items-center justify-center gap-2.5 py-2.5 rounded-md cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-brand-purple shrink-0" />
            <span>Program</span>
          </TabsTrigger>
          <TabsTrigger
            value="batches"
            className="text-sm font-semibold font-heading flex items-center justify-center gap-2.5 py-2.5 rounded-md cursor-pointer"
          >
            <Calendar className="w-5 h-5 text-brand-purple shrink-0" />
            <span>Angkatan / Batch</span>
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="text-sm font-semibold font-heading flex items-center justify-center gap-2.5 py-2.5 rounded-md cursor-pointer"
          >
            <Calendar className="w-5 h-5 text-brand-purple shrink-0" />
            <span>Absensi</span>
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="text-sm font-semibold font-heading flex items-center justify-center gap-2.5 py-2.5 rounded-md cursor-pointer"
          >
            <Settings className="w-5 h-5 text-brand-purple shrink-0" />
            <span>Pengaturan</span>
          </TabsTrigger>
        </TabsList>

        {/* ──────── TAB 1: MANAJEMEN PENGGUNA ──────── */}
        <TabsContent value="users" className="space-y-6 outline-hidden">
          {/* Sub-tabs under User Management */}
          <div className="flex border-b border-border gap-6">
            <button
              onClick={() => setAdminSubTab("users")}
              className={`pb-3 text-xs sm:text-sm font-semibold font-heading transition-all border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
                adminSubTab === "users"
                  ? "border-brand-purple text-brand-purple"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCheck className="w-5 h-5 shrink-0" />
              <span>Manajemen Pengguna Terdaftar ({usersList.length})</span>
            </button>
            <button
              onClick={() => setAdminSubTab("invite")}
              className={`pb-3 text-xs sm:text-sm font-semibold font-heading transition-all border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
                adminSubTab === "invite"
                  ? "border-brand-purple text-brand-purple"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="w-5 h-5 shrink-0" />
              <span>Tambah Pengguna / Import CSV</span>
            </button>
          </div>

          {adminSubTab === "users" && (
            <AdminUsersList
              usersList={usersList}
              batchesList={batchesList}
              isLoadingUsers={isLoadingUsers}
              userSearchQuery={userSearchQuery}
              setUserSearchQuery={setUserSearchQuery}
              userRoleFilter={userRoleFilter}
              setUserRoleFilter={setUserRoleFilter}
              userStatusFilter={userStatusFilter}
              setUserStatusFilter={setUserStatusFilter}
              userBatchFilter={userBatchFilter}
              setUserBatchFilter={setUserBatchFilter}
              selectedUserIds={selectedUserIds}
              isAllSelected={isAllSelected}
              handleSelectAllToggle={handleSelectAllToggle}
              handleUserSelectToggle={handleUserSelectToggle}
              isSendingEmailMap={isSendingEmailMap}
              fetchUsersList={fetchUsersList}
              triggerBulkDeleteConfirm={triggerBulkDeleteConfirm}
              triggerSendWarningConfirm={triggerSendWarningConfirm}
              handleEditClick={handleEditClick}
              triggerSuspendConfirm={triggerSuspendConfirm}
              triggerUnsuspendConfirm={triggerUnsuspendConfirm}
              triggerDeleteConfirm={triggerDeleteConfirm}
            />
          )}

          {adminSubTab === "invite" && (
            <AdminUserInvite
              inviteName={inviteName}
              setInviteName={setInviteName}
              inviteEmail={inviteEmail}
              setInviteEmail={setInviteEmail}
              inviteRole={inviteRole}
              setInviteRole={setInviteRole}
              inviteWhatsapp={inviteWhatsapp}
              setInviteWhatsapp={setInviteWhatsapp}
              inviteInstitution={inviteInstitution}
              setInviteInstitution={setInviteInstitution}
              inviteStudyProgram={inviteStudyProgram}
              setInviteStudyProgram={setInviteStudyProgram}
              inviteSelectedProgram={inviteSelectedProgram}
              setInviteSelectedProgram={setInviteSelectedProgram}
              inviteSpecialization={inviteSpecialization}
              setInviteSpecialization={setInviteSpecialization}
              isSubmittingInvite={isSubmittingInvite}
              handleSingleInvite={handleSingleInvite}
              batchesList={batchesList}
              selectedBatchForImport={selectedBatchForImport}
              setSelectedBatchForImport={setSelectedBatchForImport}
              useFileUpload={useFileUpload}
              setUseFileUpload={setUseFileUpload}
              csvText={csvText}
              setCsvText={setCsvText}
              handleFileChange={handleFileChange}
              handleCsvReview={handleCsvReview}
              isSubmittingImport={isSubmittingImport}
              importResult={importResult}
            />
          )}
        </TabsContent>

        {/* ──────── TAB 2: PROGRAM AKADEMIK ──────── */}
        <TabsContent value="programs" className="space-y-6 outline-hidden">
          <AdminProgramsList
            isLoadingPrograms={isLoadingPrograms}
            programsData={programsData}
            batchesList={batchesList}
            selectedOldBatchId={selectedOldBatchId}
            setSelectedOldBatchId={setSelectedOldBatchId}
            onOpenProgramDetail={(prog) => {
              setSelectedProgramDetail(prog);
              setIsProgramModalOpen(true);
            }}
          />
        </TabsContent>

        {/* ──────── TAB 3: ANGKATAN / BATCH ──────── */}
        <TabsContent value="batches" className="space-y-6 outline-hidden">
          <AdminBatchesList
            isLoadingBatches={isLoadingBatches}
            batchesList={batchesList}
            onOpenCreateBatch={() => {
              setNewBatchName("");
              setNewBatchStatus("draft");
              setSelectedProgramIdsForBatch(
                programsData?.programs?.map((p: any) => p.id) || []
              );
              setCustomProgramInput("");
              setIsCreateBatchModalOpen(true);
            }}
            onOpenBatchDetail={(b) => {
              setSelectedBatchForDetail(b);
              setIsBatchDetailModalOpen(true);
            }}
            onOpenEditBatch={(b) => {
              setSelectedBatchForEdit(b);
              setEditBatchName(b.name);
              setEditBatchIncludedProgramIds(
                b.includedProgramIds || b.includedPrograms?.map((p: any) => p.id) || []
              );
              setEditBatchStartDate(
                b.startDate ? new Date(b.startDate).toISOString().split("T")[0] : ""
              );
              setEditBatchEndDate(
                b.endDate ? new Date(b.endDate).toISOString().split("T")[0] : ""
              );
              setIsEditBatchModalOpen(true);
            }}
            onActivateBatch={triggerActivateBatchConfirm}
            onOpenMentorMatrix={(b) => {
              setSelectedBatchForMatrix(b);
              const initialMatrix: Record<string, string[]> = {};
              b.includedPrograms?.forEach((prog: any) => {
                initialMatrix[prog.id] = prog.mentors?.map((m: any) => m.id) || [];
              });
              setMatrixProgramMentors(initialMatrix);
              setIsMentorMatrixModalOpen(true);
            }}
          />
        </TabsContent>

        {/* ──────── TAB 4: ABSENSI AKADEMIK ──────── */}
        <TabsContent value="attendance" className="space-y-6 outline-hidden">
          <AdminAttendance batches={batchesList} />
        </TabsContent>

        {/* ──────── TAB 5: PENGATURAN PROFIL ADMIN ──────── */}
        <TabsContent value="settings" className="space-y-6 outline-hidden">
          <AdminProfileSettings
            profile={profile}
            profileName={profileName}
            setProfileName={setProfileName}
            profileWhatsapp={profileWhatsapp}
            setProfileWhatsapp={setProfileWhatsapp}
            profileInstitution={profileInstitution}
            setProfileInstitution={setProfileInstitution}
            profileStudyProgram={profileStudyProgram}
            setProfileStudyProgram={setProfileStudyProgram}
            profileAvatarUrl={profileAvatarUrl}
            setProfileAvatarUrl={setProfileAvatarUrl}
            isSavingProfile={isSavingProfile}
            profileSaveError={profileSaveError}
            profileSaveSuccess={profileSaveSuccess}
            handleProfileFileChange={handleProfileFileChange}
            handleSaveProfile={handleSaveProfile}
          />
        </TabsContent>
      </Tabs>

      {/* Reusable Modals */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editingUserId={editingUserId}
        usersList={usersList}
        batchesList={batchesList}
        nameValue={editingNameValue}
        setNameValue={setEditingNameValue}
        emailValue={editingEmailValue}
        setEmailValue={setEditingEmailValue}
        whatsappValue={editingWhatsappValue}
        setWhatsappValue={setEditingWhatsappValue}
        institutionValue={editingInstitutionValue}
        setInstitutionValue={setEditingInstitutionValue}
        studyProgramValue={editingStudyProgramValue}
        setStudyProgramValue={setEditingStudyProgramValue}
        selectedProgramValue={editingSelectedProgramValue}
        setSelectedProgramValue={setEditingSelectedProgramValue}
        userBatches={editingUserBatches}
        setUserBatches={setEditingUserBatches}
        onSave={handleSaveUser}
      />

      <ReviewCsvModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        parsedStudents={parsedStudents}
        onConfirmImport={executeCsvImport}
      />

      <ProgramModal
        isOpen={isProgramModalOpen}
        onClose={() => setIsProgramModalOpen(false)}
        program={selectedProgramDetail}
        onOpenAssignMentor={() => {
          setSelectedMentorToAssign("");
          setIsAddMentorModalOpen(true);
        }}
        onOpenAddStudent={() => {
          setEnrollCase("case2");
          setSelectedStudentToEnroll("");
          setSelectedMentorForEnroll("");
          setIsAddStudentModalOpen(true);
        }}
      />

      <AssignMentorModal
        isOpen={isAddMentorModalOpen}
        onClose={() => setIsAddMentorModalOpen(false)}
        programName={selectedProgramDetail?.name || ""}
        availableMentors={programsData?.availableMentors || []}
        selectedMentorId={selectedMentorToAssign}
        setSelectedMentorId={setSelectedMentorToAssign}
        isSubmitting={isSubmittingAssignMentor}
        onSubmit={handleAssignMentorSubmit}
      />

      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        programName={selectedProgramDetail?.name || ""}
        enrollCase={enrollCase}
        setEnrollCase={setEnrollCase}
        usersList={usersList}
        programStudents={selectedProgramDetail?.students || []}
        programMentors={selectedProgramDetail?.mentors || []}
        selectedStudentId={selectedStudentToEnroll}
        setSelectedStudentId={setSelectedStudentToEnroll}
        selectedMentorId={selectedMentorForEnroll}
        setSelectedMentorId={setSelectedMentorForEnroll}
        isSubmitting={isSubmittingEnroll}
        onSubmit={handleEnrollSubmit}
      />

      <CreateBatchModal
        isOpen={isCreateBatchModalOpen}
        onClose={() => setIsCreateBatchModalOpen(false)}
        name={newBatchName}
        setName={setNewBatchName}
        startDate={newBatchStartDate}
        setStartDate={setNewBatchStartDate}
        endDate={newBatchEndDate}
        setEndDate={setNewBatchEndDate}
        status={newBatchStatus}
        setStatus={setNewBatchStatus}
        programsList={programsData?.programs || []}
        selectedProgramIds={selectedProgramIdsForBatch}
        setSelectedProgramIds={setSelectedProgramIdsForBatch}
        customProgramInput={customProgramInput}
        setCustomProgramInput={setCustomProgramInput}
        isSubmitting={isSubmittingCreateBatch}
        onSubmit={handleCreateBatchSubmit}
      />

      <EditBatchModal
        isOpen={isEditBatchModalOpen}
        onClose={() => setIsEditBatchModalOpen(false)}
        batch={selectedBatchForEdit}
        name={editBatchName}
        setName={setEditBatchName}
        startDate={editBatchStartDate}
        setStartDate={setEditBatchStartDate}
        endDate={editBatchEndDate}
        setEndDate={setEditBatchEndDate}
        programsList={programsData?.programs || []}
        includedProgramIds={editBatchIncludedProgramIds}
        setIncludedProgramIds={setEditBatchIncludedProgramIds}
        isSubmitting={isSubmittingEditBatch}
        onSubmit={handleEditBatchSubmit}
      />

      <BatchDetailModal
        isOpen={isBatchDetailModalOpen}
        onClose={() => setIsBatchDetailModalOpen(false)}
        batch={selectedBatchForDetail}
      />

      <MentorMatrixModal
        isOpen={isMentorMatrixModalOpen}
        onClose={() => setIsMentorMatrixModalOpen(false)}
        batch={selectedBatchForMatrix}
        usersList={usersList}
        matrixProgramMentors={matrixProgramMentors}
        setMatrixProgramMentors={setMatrixProgramMentors}
        isSubmitting={isSubmittingMatrix}
        onSave={handleSaveMentorMatrix}
      />

      <ConfirmActionModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={confirmTitle}
        description={confirmDescription}
        confirmButtonText={confirmButtonText}
        confirmCountdown={confirmCountdown}
        isDestructive={confirmIsDestructive}
        onConfirm={() => {
          if (confirmAction) confirmAction();
        }}
      />
    </div>
  );
}