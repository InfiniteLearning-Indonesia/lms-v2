"use client";

import {
  AlertCircle,
  Edit2,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { Batch, UserListItem } from "./types";

interface AdminUsersListProps {
  usersList: UserListItem[];
  batchesList: Batch[];
  isLoadingUsers: boolean;
  userSearchQuery: string;
  setUserSearchQuery: (v: string) => void;
  userRoleFilter: string;
  setUserRoleFilter: (v: string) => void;
  userStatusFilter: string;
  setUserStatusFilter: (v: string) => void;
  userBatchFilter: string;
  setUserBatchFilter: (v: string) => void;
  selectedUserIds: string[];
  isAllSelected: boolean;
  handleSelectAllToggle: () => void;
  handleUserSelectToggle: (id: string) => void;
  isSendingEmailMap: Record<string, boolean>;
  fetchUsersList: () => void;
  triggerBulkDeleteConfirm: () => void;
  triggerSendWarningConfirm: (id: string, email: string) => void;
  handleEditClick: (user: UserListItem) => void;
  triggerSuspendConfirm: (id: string) => void;
  triggerUnsuspendConfirm: (id: string) => void;
  triggerDeleteConfirm: (id: string) => void;
}

export function AdminUsersList({
  usersList,
  batchesList,
  isLoadingUsers,
  userSearchQuery,
  setUserSearchQuery,
  userRoleFilter,
  setUserRoleFilter,
  userStatusFilter,
  setUserStatusFilter,
  userBatchFilter,
  setUserBatchFilter,
  selectedUserIds,
  isAllSelected,
  handleSelectAllToggle,
  handleUserSelectToggle,
  isSendingEmailMap,
  fetchUsersList,
  triggerBulkDeleteConfirm,
  triggerSendWarningConfirm,
  handleEditClick,
  triggerSuspendConfirm,
  triggerUnsuspendConfirm,
  triggerDeleteConfirm,
}: AdminUsersListProps) {
  // Filter logic
  const filteredUsersList = usersList.filter((u) => {
    // Role filter
    if (userRoleFilter && u.role !== userRoleFilter && !u.roles?.includes(userRoleFilter as any)) {
      return false;
    }
    // Status filter
    if (userStatusFilter && u.status !== userStatusFilter) {
      return false;
    }
    // Batch filter
    if (userBatchFilter && u.role !== "admin") {
      const isInBatch = u.batches?.some((b) => b.id === userBatchFilter);
      if (!isInBatch) return false;
    }
    // Search query
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchWhatsapp = u.whatsapp?.toLowerCase().includes(q) || false;
      const matchInst = u.institution?.toLowerCase().includes(q) || false;
      if (!matchName && !matchEmail && !matchWhatsapp && !matchInst) return false;
    }
    return true;
  });

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <h2 className="font-heading font-bold text-lg flex items-center gap-2 text-foreground">
            <Users className="w-5 h-5 text-brand-purple" />
            Daftar Pengguna Aktif
          </h2>
          <p className="text-3xs text-muted-foreground">
            Kelola data, edit info, suspend, atau hapus massal akun pengguna. Akun ber-domain non-Gmail
            ditandai dengan bendera kuning.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {selectedUserIds.length > 0 && (
            <button
              onClick={triggerBulkDeleteConfirm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold font-heading transition-colors shadow-sm cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Terpilih ({selectedUserIds.length})</span>
            </button>
          )}

          <button
            onClick={fetchUsersList}
            className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shadow-sm cursor-pointer"
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
            <option value="graduated">Graduated (Lulus)</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>
      {/* Batch/Cohort Filter */}
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
                          {user.batches.map((b) => (
                            <span
                              key={b.id}
                              className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-3xs border border-border truncate max-w-[140px] inline-block"
                              title={b.name}
                            >
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
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-3xs font-semibold ${
                          user.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : user.status === "graduated"
                            ? "bg-purple-500/10 text-purple-600 border border-purple-500/20 font-bold"
                            : user.status === "suspended"
                            ? "bg-red-500/10 text-red-500 border border-red-500/20"
                            : "bg-secondary text-muted-foreground border border-border"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right space-x-1">
                      <div className="inline-flex gap-1.5 justify-end">
                        {!isGmail && (
                          <button
                            onClick={() => triggerSendWarningConfirm(user.id, user.email)}
                            disabled={isSending}
                            className="p-1 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-500/10 rounded-md border border-yellow-500/20 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
                            title="Kirim Email Peringatan Ganti Email"
                          >
                            {isSending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Mail className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-1 text-muted-foreground hover:text-brand-purple hover:bg-muted/50 rounded-md border border-border shadow-2xs transition-colors cursor-pointer"
                          title="Edit Profil"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {user.role !== "admin" &&
                          (user.status === "suspended" ? (
                            <button
                              onClick={() => triggerUnsuspendConfirm(user.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-500/10 rounded-md border border-border shadow-2xs transition-colors cursor-pointer"
                              title="Aktifkan Kembali"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => triggerSuspendConfirm(user.id)}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded-md border border-border shadow-2xs transition-colors cursor-pointer"
                              title="Suspend"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          ))}

                        {user.role !== "admin" && (
                          <button
                            onClick={() => triggerDeleteConfirm(user.id)}
                            className="p-1 text-red-500 hover:bg-red-500/10 rounded-md border border-border shadow-2xs transition-colors cursor-pointer"
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
  );
}
