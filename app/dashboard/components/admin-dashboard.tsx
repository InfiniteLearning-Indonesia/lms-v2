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
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminRules } from "./admin-rules";

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: "admin" | "mentor" | "student";
  status: "invited" | "active" | "suspended";
  createdAt: string;
  lastLoginAt: string | null;
  whatsapp?: string | null;
  institution?: string | null;
  studyProgram?: string | null;
  selectedProgram?: string | null;
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

  useEffect(() => {
    fetchUsersList();
  }, []);

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

      setSuccessMsg(`Berhasil menambahkan ${data.email} ke dalam database (Silent Whitelist).`);
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
        <TabsList className="grid w-full max-w-xl grid-cols-5 mb-8 min-h-12 p-1 bg-secondary border border-border rounded-lg">
          <TabsTrigger value="users" className="text-xs font-semibold font-heading">
            Pengguna
          </TabsTrigger>
          <TabsTrigger value="programs" className="text-xs font-semibold font-heading">
            Program
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

                            <td className="py-3 px-3 capitalize text-2xs">
                              {user.role}
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

        {/* ──────── TAB 2: MANAJEMEN PROGRAM (FUTURE FEATURE SPEC CARD) ──────── */}
        <TabsContent value="programs" className="space-y-6 outline-hidden">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-heading font-bold text-lg flex items-center gap-2 border-b border-border pb-3">
              <Layers className="w-5 h-5 text-brand-purple" />
              Manajemen Program Akademik (Fase 2)
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Modul ini akan menyediakan kontrol penuh bagi administrator untuk mengelola pendaftaran program, relasi penugasan mentor utama/pendukung, serta otomatisasi alokasi bimbingan murid.
            </p>

            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <div className="border border-border rounded-xl p-4 space-y-2 bg-secondary/10">
                <h3 className="font-heading font-bold text-xs">AI & Game Development Tracks</h3>
                <p className="text-2xs text-muted-foreground leading-relaxed">
                  Mentor utama dialokasikan rata bagi murid AI dan murid Game secara eksklusif. Kolaborasi bimbingan soft skills dan capstone project dilayani masing-masing oleh Mentor Professional dan Mentor UI/UX.
                </p>
              </div>

              <div className="border border-border rounded-xl p-4 space-y-2 bg-secondary/10">
                <h3 className="font-heading font-bold text-xs">Web & Mobile Development Tracks</h3>
                <p className="text-2xs text-muted-foreground leading-relaxed">
                  Menerapkan sistem bimbingan berlapis (Primary Mentor Web/Mobile, Secondary UI/UX, Supporting Professional). Sisa pembagian murid yang tidak habis dibagikan secara otomatis ke jajaran mentor pendukung.
                </p>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <span className="text-3xs font-semibold text-brand-purple bg-brand-purple/10 px-2 py-1 rounded border border-brand-purple/20">
                Segera Hadir di Fase 2
              </span>
            </div>
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
                    <option value="">-- Tanpa Program --</option>
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
