"use client";

import { useState, useMemo } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Filter,
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
  // Extra Domain Email Filter
  const [emailDomainFilter, setEmailDomainFilter] = useState<string>("all");

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filter logic
  const filteredUsersList = useMemo(() => {
    return usersList.filter((u) => {
      // Role filter
      if (
        userRoleFilter &&
        u.role !== userRoleFilter &&
        !u.roles?.includes(userRoleFilter as any)
      ) {
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
      // Email Domain filter
      if (emailDomainFilter !== "all") {
        const isGmail = u.email.toLowerCase().endsWith("@gmail.com");
        if (emailDomainFilter === "gmail" && !isGmail) return false;
        if (emailDomainFilter === "nongmail" && isGmail) return false;
      }
      // Search query
      if (userSearchQuery.trim()) {
        const q = userSearchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchWhatsapp = u.whatsapp?.toLowerCase().includes(q) || false;
        const matchInst = u.institution?.toLowerCase().includes(q) || false;
        if (!matchName && !matchEmail && !matchWhatsapp && !matchInst)
          return false;
      }
      return true;
    });
  }, [
    usersList,
    userRoleFilter,
    userStatusFilter,
    userBatchFilter,
    emailDomainFilter,
    userSearchQuery,
  ]);

  // Pagination calculations
  const totalItems = filteredUsersList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedUsersList = useMemo(() => {
    const start = (activePage - 1) * pageSize;
    return filteredUsersList.slice(start, start + pageSize);
  }, [filteredUsersList, activePage, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 font-sans overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <h2 className="font-heading font-bold text-lg flex items-center gap-2 text-foreground">
            <Users className="w-5 h-5 text-brand-purple" />
            Daftar Pengguna Aktif ({filteredUsersList.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            Kelola akun terdaftar, filter per peran/batch/domain, serta suspend
            atau hapus massal akun pengguna.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {selectedUserIds.length > 0 && (
            <button
              onClick={triggerBulkDeleteConfirm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold font-heading transition-colors shadow-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Terpilih ({selectedUserIds.length})</span>
            </button>
          )}

          <button
            onClick={fetchUsersList}
            className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shadow-xs cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoadingUsers ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Search & Filters Grid */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, email, whatsapp, atau kampus..."
            value={userSearchQuery}
            onChange={(e) => {
              setUserSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-brand-purple"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* Role Filter */}
          <div>
            <select
              value={userRoleFilter}
              onChange={(e) => {
                setUserRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground font-medium focus:outline-hidden focus:ring-1 focus:ring-brand-purple cursor-pointer"
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
              onChange={(e) => {
                setUserStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground font-medium focus:outline-hidden focus:ring-1 focus:ring-brand-purple cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="invited">Invited</option>
              <option value="graduated">Graduated (Lulus)</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Email Domain Filter */}
          <div>
            <select
              value={emailDomainFilter}
              onChange={(e) => {
                setEmailDomainFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground font-medium focus:outline-hidden focus:ring-1 focus:ring-brand-purple cursor-pointer"
            >
              <option value="all">Semua Domain Email</option>
              <option value="gmail">Gmail (@gmail.com)</option>
              <option value="nongmail">Non-Gmail</option>
            </select>
          </div>

          {/* Batch Filter */}
          <div>
            <select
              value={userBatchFilter}
              onChange={(e) => {
                setUserBatchFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground font-medium focus:outline-hidden focus:ring-1 focus:ring-brand-purple cursor-pointer"
            >
              <option value="">Semua Batch / Cohort</option>
              {batchesList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border border-border rounded-xl bg-background">
        {isLoadingUsers ? (
          <div className="py-12 text-center text-xs text-muted-foreground animate-pulse font-medium">
            Memuat data pengguna terdaftar...
          </div>
        ) : paginatedUsersList.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground font-medium">
            Tidak ada pengguna terdaftar yang cocok dengan kriteria filter.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-muted-foreground font-semibold uppercase text-[11px] tracking-wider">
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
              {paginatedUsersList.map((user) => {
                const isGmail = user.email.toLowerCase().endsWith("@gmail.com");
                const isSending = !!isSendingEmailMap[user.id];

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-secondary/20 transition-colors"
                  >
                    <td className="py-3 px-3 text-center">
                      {user.role !== "admin" ? (
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user.id)}
                          onChange={() => handleUserSelectToggle(user.id)}
                          className="rounded border-border text-brand-purple focus:ring-brand-purple h-3.5 w-3.5 cursor-pointer accent-brand-purple"
                        />
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">
                          -
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-semibold text-foreground max-w-[150px] truncate">
                      {user.name}
                    </td>

                    <td className="py-3 px-3 max-w-[170px] truncate">
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {user.email}
                      </div>
                      {!isGmail && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 leading-none">
                          <AlertCircle className="w-2.5 h-2.5" />
                          Non-Gmail
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-[11px]">
                      {user.whatsapp || (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-[11px] truncate max-w-[140px]">
                      {user.institution || (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-[11px] truncate max-w-[120px]">
                      {user.studyProgram || (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-[11px] font-medium text-brand-purple max-w-[140px] truncate">
                      {user.selectedProgram || (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-[11px] max-w-[160px]">
                      {user.batches && user.batches.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.batches.map((b) => (
                            <span
                              key={b.id}
                              className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-[10px] border border-border truncate max-w-[140px] inline-block font-medium"
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

                    <td className="py-3 px-3 text-[11px]">
                      {user.roles && user.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((r) => (
                            <span
                              key={r}
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                r === "admin"
                                  ? "bg-red-500/10 text-red-600 border border-red-500/20"
                                  : r === "mentor"
                                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                  : "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                              }`}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="capitalize">{user.role}</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          user.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : user.status === "graduated"
                            ? "bg-purple-500/10 text-purple-600 border border-purple-500/20 font-bold"
                            : user.status === "suspended"
                            ? "bg-red-500/10 text-red-600 border border-red-500/20"
                            : "bg-secondary text-muted-foreground border border-border"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex gap-1.5 justify-end">
                        {!isGmail && (
                          <button
                            onClick={() =>
                              triggerSendWarningConfirm(user.id, user.email)
                            }
                            disabled={isSending}
                            className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 rounded-lg border border-amber-500/20 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
                            title="Kirim Peringatan Email"
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
                          className="p-1.5 text-muted-foreground hover:text-brand-purple hover:bg-muted/50 rounded-lg border border-border shadow-2xs transition-colors cursor-pointer"
                          title="Edit Profil"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {user.role !== "admin" &&
                          (user.status === "suspended" ? (
                            <button
                              onClick={() => triggerUnsuspendConfirm(user.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-500/10 rounded-lg border border-border shadow-2xs transition-colors cursor-pointer"
                              title="Aktifkan Kembali"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => triggerSuspendConfirm(user.id)}
                              className="p-1.5 text-amber-600 hover:bg-amber-500/10 rounded-lg border border-border shadow-2xs transition-colors cursor-pointer"
                              title="Suspend"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          ))}

                        {user.role !== "admin" && (
                          <button
                            onClick={() => triggerDeleteConfirm(user.id)}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg border border-border shadow-2xs transition-colors cursor-pointer"
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

      {/* Pagination Bar */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Tampilkan per halaman:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-8 px-2 text-xs bg-background border border-border rounded-lg text-foreground font-medium focus:outline-hidden cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="ml-2 font-medium">
            Menampilkan {totalItems === 0 ? 0 : (activePage - 1) * pageSize + 1} -{" "}
            {Math.min(activePage * pageSize, totalItems)} dari {totalItems} pengguna
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handlePageChange(activePage - 1)}
            disabled={activePage <= 1}
            className="p-1.5 rounded-lg border border-border bg-background hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 font-medium text-foreground bg-background border border-border rounded-lg">
            Halaman {activePage} dari {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(activePage + 1)}
            disabled={activePage >= totalPages}
            className="p-1.5 rounded-lg border border-border bg-background hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
