"use client";

import { useState, useMemo } from "react";
import { AlertCircle, MessageSquare, Search, UserCheck, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

interface MentorStudentsViewProps {
  allStudents: any[];
  filteredStudents?: any[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  isReadOnly: boolean;
  onRefreshData?: () => void;
  onOpenSuspendDialog: (student: any, action: "suspend" | "unsuspend") => void;
}

export function MentorStudentsView({
  allStudents,
  searchQuery,
  setSearchQuery,
  isReadOnly,
  onRefreshData,
  onOpenSuspendDialog,
}: MentorStudentsViewProps) {
  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [emailFilter, setEmailFilter] = useState<string>("all");
  const [waFilter, setWaFilter] = useState<string>("all");

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Claim Mentee Modal States
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [unassignedStudents, setUnassignedStudents] = useState<any[]>([]);
  const [isLoadingUnassigned, setIsLoadingUnassigned] = useState(false);
  const [claimSearch, setClaimSearch] = useState("");
  const [selectedToClaim, setSelectedToClaim] = useState<string[]>([]);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  const fetchUnassignedStudents = async () => {
    setIsLoadingUnassigned(true);
    try {
      const res = await fetch(`${API_BASE_URL}/classes/unassigned-students`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUnassignedStudents(data);
      } else {
        toast.error("Gagal memuat daftar siswa unassigned");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsLoadingUnassigned(false);
    }
  };

  const handleOpenClaimModal = () => {
    setIsClaimModalOpen(true);
    setClaimSearch("");
    setSelectedToClaim([]);
    fetchUnassignedStudents();
  };

  const handleClaimMentees = async () => {
    if (selectedToClaim.length === 0) return;
    setIsSubmittingClaim(true);
    let successCount = 0;
    
    try {
      for (const studentId of selectedToClaim) {
        const res = await fetch(`${API_BASE_URL}/classes/claim-mentee`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ studentId }),
        });
        if (res.ok) successCount++;
      }
      
      if (successCount > 0) {
        toast.success(`Berhasil menambahkan ${successCount} siswa ke daftar binaan!`);
        setIsClaimModalOpen(false);
        if (onRefreshData) onRefreshData();
      } else {
        toast.error("Gagal menambahkan siswa");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat menambahkan siswa");
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const filteredUnassigned = unassignedStudents.filter(s => {
    const q = claimSearch.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q))
    );
  });

  // Exclude mentors & facilitators from students view
  const validStudents = useMemo(() => {
    return allStudents.filter((student) => {
      const roles = (student.roles || []).map((r: any) => String(r).toLowerCase());
      const roleStr = String(student.role || "").toLowerCase();
      const isMentor = roles.includes("mentor") || roleStr === "mentor";
      const isFacilitator = roles.includes("facilitator") || roleStr === "facilitator";
      return !isMentor && !isFacilitator;
    });
  }, [allStudents]);

  // Apply all filters
  const processedStudents = useMemo(() => {
    return validStudents.filter((student) => {
      // 1. Search Query
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const nameMatch = student.name && student.name.toLowerCase().includes(query);
        const emailMatch = student.email && student.email.toLowerCase().includes(query);
        const progMatch = student.selectedProgram && student.selectedProgram.toLowerCase().includes(query);
        if (!nameMatch && !emailMatch && !progMatch) return false;
      }

      // 2. Status Filter
      if (statusFilter !== "all") {
        const isSuspended = student.status === "suspended";
        if (statusFilter === "suspended" && !isSuspended) return false;
        if (statusFilter === "active" && isSuspended) return false;
      }

      // 3. Email Filter
      if (emailFilter !== "all") {
        const isGmail = student.email && student.email.toLowerCase().endsWith("@gmail.com");
        if (emailFilter === "gmail" && !isGmail) return false;
        if (emailFilter === "nongmail" && isGmail) return false;
      }

      // 4. WhatsApp Filter
      if (waFilter !== "all") {
        const hasWa = Boolean(student.whatsapp && student.whatsapp.trim() !== "");
        if (waFilter === "available" && !hasWa) return false;
        if (waFilter === "unavailable" && hasWa) return false;
      }

      return true;
    });
  }, [validStudents, searchQuery, statusFilter, emailFilter, waFilter]);

  // Pagination Calculation
  const totalItems = processedStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedStudents = useMemo(() => {
    const start = (activePage - 1) * pageSize;
    return processedStudents.slice(start, start + pageSize);
  }, [processedStudents, activePage, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm font-sans rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-border pb-5 bg-secondary/10">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-heading font-bold text-foreground">
                Manajemen Siswa Binaan ({validStudents.length} Siswa)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Daftar siswa di bawah bimbingan akademik dan kepemilikan personal Anda.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!isReadOnly && (
                <Dialog open={isClaimModalOpen} onOpenChange={setIsClaimModalOpen}>
                  <DialogTrigger render={
                    <Button onClick={handleOpenClaimModal} variant="default" size="sm" className="h-9 gap-1.5">
                      <Plus className="w-4 h-4" /> Tambah Mentee
                    </Button>
                  } />
                  <DialogContent className="max-w-[450px] border border-border bg-popover p-6 rounded-xl shadow-lg font-sans">
                    <DialogHeader className="mb-4">
                      <DialogTitle className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-brand-purple" /> Tambah Personal Mentee
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground mt-1">
                        Pilih siswa yang belum memiliki personal mentor untuk ditambahkan ke daftar binaan Anda.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mb-4">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                        <Input
                          placeholder="Cari nama atau email..."
                          value={claimSearch}
                          onChange={(e) => setClaimSearch(e.target.value)}
                          className="pl-9 h-9 text-xs"
                        />
                      </div>

                      <div className="border border-border rounded-lg overflow-hidden max-h-[300px] flex flex-col">
                        {isLoadingUnassigned ? (
                          <div className="p-8 text-center text-xs text-muted-foreground">Memuat data...</div>
                        ) : filteredUnassigned.length === 0 ? (
                          <div className="p-8 text-center text-xs text-muted-foreground">
                            {unassignedStudents.length === 0 
                              ? "Semua siswa di angkatan ini sudah memiliki personal mentor ✅" 
                              : "Tidak ada siswa yang cocok dengan pencarian"}
                          </div>
                        ) : (
                          <div className="overflow-y-auto">
                            <div className="divide-y divide-border">
                              {filteredUnassigned.map(s => (
                                <div key={s.id} className="flex items-start gap-3 p-3 hover:bg-secondary/20 transition-colors">
                                  <Checkbox 
                                    id={`claim-${s.id}`} 
                                    checked={selectedToClaim.includes(s.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) setSelectedToClaim(prev => [...prev, s.id]);
                                      else setSelectedToClaim(prev => prev.filter(id => id !== s.id));
                                    }}
                                    className="mt-1"
                                  />
                                  <label htmlFor={`claim-${s.id}`} className="flex-1 cursor-pointer">
                                    <div className="text-sm font-semibold text-foreground">{s.name}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">{s.email}</div>
                                    <div className="text-[10px] font-medium text-brand-purple bg-brand-purple/10 inline-block px-1.5 py-0.5 rounded mt-1.5">
                                      {s.selectedProgram || "Program"}
                                    </div>
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <DialogFooter className="flex justify-end gap-2 border-t border-border pt-4">
                      <Button variant="outline" size="sm" onClick={() => setIsClaimModalOpen(false)}>
                        Batal
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={handleClaimMentees}
                        disabled={selectedToClaim.length === 0 || isSubmittingClaim}
                      >
                        {isSubmittingClaim ? "Memproses..." : `Tambahkan (${selectedToClaim.length})`}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 h-9 text-xs bg-background/80"
                />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-border/40">
            {/* Status Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3 h-3" /> Status Akun
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-8 px-2.5 text-xs bg-background border border-border rounded-lg text-foreground font-medium focus:outline-hidden focus:ring-1 focus:ring-brand-purple"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Email Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Domain Email
              </label>
              <select
                value={emailFilter}
                onChange={(e) => {
                  setEmailFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-8 px-2.5 text-xs bg-background border border-border rounded-lg text-foreground font-medium focus:outline-hidden focus:ring-1 focus:ring-brand-purple"
              >
                <option value="all">Semua Email</option>
                <option value="gmail">Gmail (@gmail.com)</option>
                <option value="nongmail">Non-Gmail</option>
              </select>
            </div>

            {/* WhatsApp Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                WhatsApp
              </label>
              <select
                value={waFilter}
                onChange={(e) => {
                  setWaFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-8 px-2.5 text-xs bg-background border border-border rounded-lg text-foreground font-medium focus:outline-hidden focus:ring-1 focus:ring-brand-purple"
              >
                <option value="all">Semua WA</option>
                <option value="available">Tersedia</option>
                <option value="unavailable">Tidak Ada</option>
              </select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Email Terdaftar</th>
                <th className="py-3 px-4">WhatsApp</th>
                <th className="py-3 px-4">Program Studi</th>
                <th className="py-3 px-4 text-center">Status Akun</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground font-medium">
                    Tidak ada data siswa yang cocok dengan kriteria filter Anda.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student: any, idx: number) => {
                  const isGmail =
                    student.email && student.email.toLowerCase().endsWith("@gmail.com");
                  return (
                    <tr
                      key={student.id || idx}
                      className="hover:bg-secondary/20 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        {student.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-muted-foreground">
                        {student.email}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {student.whatsapp || "-"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
                          {student.selectedProgram || "Web Development"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          {student.status === "suspended" ? (
                            <Badge
                              variant="outline"
                              className="bg-red-500/10 text-red-600 border-red-200 gap-1 text-[10px] py-0.5 px-2 font-medium"
                            >
                              <AlertCircle className="w-3 h-3" />
                              Suspended
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-600 border-emerald-200 gap-1 text-[10px] py-0.5 px-2 font-medium"
                            >
                              <UserCheck className="w-3 h-3" />
                              Aktif
                            </Badge>
                          )}
                          {isGmail ? (
                            <Badge
                              variant="outline"
                              className="bg-blue-500/10 text-blue-600 border-blue-200 text-[10px] py-0.5 px-2 font-medium"
                            >
                              Gmail
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-500/10 text-amber-600 border-amber-300 text-[10px] py-0.5 px-2 font-medium"
                            >
                              Non-Gmail
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {student.whatsapp && (
                            <a
                              href={`https://wa.me/${student.whatsapp.replace(/^0/, "62")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] transition-colors shadow-2xs"
                            >
                              <MessageSquare className="w-3 h-3" />
                              WA
                            </a>
                          )}
                          {!isReadOnly &&
                            (student.status === "suspended" ? (
                              <button
                                onClick={() => onOpenSuspendDialog(student, "unsuspend")}
                                className="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-emerald-600 text-[11px] font-medium transition-colors cursor-pointer"
                              >
                                Aktifkan Kembali
                              </button>
                            ) : (
                              <button
                                onClick={() => onOpenSuspendDialog(student, "suspend")}
                                className="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-amber-600 text-[11px] font-medium transition-colors cursor-pointer"
                              >
                                Suspend
                              </button>
                            ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Responsive Pagination Bar */}
        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground bg-secondary/10">
          <div className="flex items-center gap-2">
            <span>Tampilkan per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-8 px-2 text-xs bg-background border border-border rounded-lg text-foreground font-medium focus:outline-hidden"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="ml-2 font-medium">
              Menampilkan {totalItems === 0 ? 0 : (activePage - 1) * pageSize + 1} -{" "}
              {Math.min(activePage * pageSize, totalItems)} dari {totalItems} siswa
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
      </CardContent>
    </Card>
  );
}
