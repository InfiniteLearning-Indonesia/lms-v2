"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  FileSpreadsheet,
  ShieldAlert,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import { Batch } from "./types";

interface AdminUserInviteProps {
  inviteName: string;
  setInviteName: (v: string) => void;
  inviteEmail: string;
  setInviteEmail: (v: string) => void;
  inviteRole: "student" | "mentor" | "admin";
  setInviteRole: (v: "student" | "mentor" | "admin") => void;
  inviteWhatsapp: string;
  setInviteWhatsapp: (v: string) => void;
  inviteInstitution: string;
  setInviteInstitution: (v: string) => void;
  inviteStudyProgram: string;
  setInviteStudyProgram: (v: string) => void;
  inviteSelectedProgram: string;
  setInviteSelectedProgram: (v: string) => void;
  inviteSpecialization: string;
  setInviteSpecialization: (v: string) => void;
  isSubmittingInvite: boolean;
  handleSingleInvite: (e: React.FormEvent) => void;

  batchesList: Batch[];
  selectedBatchForImport: string;
  setSelectedBatchForImport: (v: string) => void;
  useFileUpload: boolean;
  setUseFileUpload: (v: boolean) => void;
  csvText: string;
  setCsvText: (v: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCsvReview: (e: React.FormEvent) => void;
  isSubmittingImport: boolean;
  importResult: { successCount: number; failedCount: number } | null;
}

export function AdminUserInvite({
  inviteName,
  setInviteName,
  inviteEmail,
  setInviteEmail,
  inviteRole,
  setInviteRole,
  inviteWhatsapp,
  setInviteWhatsapp,
  inviteInstitution,
  setInviteInstitution,
  inviteStudyProgram,
  setInviteStudyProgram,
  inviteSelectedProgram,
  setInviteSelectedProgram,
  inviteSpecialization,
  setInviteSpecialization,
  isSubmittingInvite,
  handleSingleInvite,
  batchesList,
  selectedBatchForImport,
  setSelectedBatchForImport,
  useFileUpload,
  setUseFileUpload,
  csvText,
  setCsvText,
  handleFileChange,
  handleCsvReview,
  isSubmittingImport,
  importResult,
}: AdminUserInviteProps) {
  const [copiedHeader, setCopiedHeader] = useState(false);

  return (
    <div className="space-y-6 font-sans">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Single Invite Panel */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-heading font-bold text-lg flex items-center gap-2 border-b border-border pb-3 text-foreground">
            <UserPlus className="w-5 h-5 text-brand-purple" />
            Tambah Pengguna Baru
          </h2>
          <form onSubmit={handleSingleInvite} className="space-y-4">
            <div className="space-y-1.5 bg-secondary/35 p-3 rounded-lg border border-border">
              <label className="text-xs font-bold text-foreground">
                1. Pilih Peran Akses LMS Terlebih Dahulu
              </label>
              <select
                value={inviteRole}
                onChange={(e) => {
                  setInviteRole(e.target.value as any);
                  setInviteSelectedProgram("");
                  setInviteSpecialization("");
                  setInviteInstitution("");
                  setInviteStudyProgram("");
                }}
                className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background font-semibold focus:outline-none focus:ring-1 focus:ring-brand-purple cursor-pointer text-foreground"
              >
                <option value="student">Siswa LMS</option>
                <option value="mentor">Mentor Kelas</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple text-foreground"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Alamat Email (Google) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="contoh@gmail.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple text-foreground"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                No WhatsApp (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: 08123456789"
                value={inviteWhatsapp}
                onChange={(e) => setInviteWhatsapp(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple text-foreground"
              />
            </div>

            {inviteRole === "student" && (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Institusi / Kampus (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Universitas Indonesia"
                      value={inviteInstitution}
                      onChange={(e) => setInviteInstitution(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple text-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Program Studi / Jurusan (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Teknik Informatika"
                      value={inviteStudyProgram}
                      onChange={(e) => setInviteStudyProgram(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Program IL yang dipilih <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={inviteSelectedProgram}
                    onChange={(e) => setInviteSelectedProgram(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple text-foreground"
                    required
                  >
                    <option value="">-- Pilih Program --</option>
                    <option value="AI Development">AI Development</option>
                    <option value="Web Development and UI/UX Design">
                      Web Development & UI/UX Design
                    </option>
                    <option value="Mobile Development and UI/UX Design">
                      Mobile Development & UI/UX Design
                    </option>
                    <option value="Game Development">Game Development</option>
                  </select>
                </div>
              </>
            )}

            {inviteRole === "mentor" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Program IL yang dipilih <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={inviteSelectedProgram}
                    onChange={(e) => setInviteSelectedProgram(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple text-foreground"
                    required
                  >
                    <option value="">-- Pilih Program --</option>
                    <option value="AI Development">AI Development</option>
                    <option value="Web Development and UI/UX Design">
                      Web Development & UI/UX Design
                    </option>
                    <option value="Mobile Development and UI/UX Design">
                      Mobile Development & UI/UX Design
                    </option>
                    <option value="Game Development">Game Development</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Spesialisasi Mentor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={inviteSpecialization}
                    onChange={(e) => setInviteSpecialization(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-brand-purple text-foreground"
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
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmittingInvite}
                className="px-4 py-2 rounded-lg bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold font-heading transition-colors shadow-sm disabled:opacity-50 w-full sm:w-auto cursor-pointer"
              >
                {isSubmittingInvite ? "Mendaftarkan…" : "Tambah Pengguna"}
              </button>
            </div>
          </form>
        </div>

        {/* CSV Importer */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col gap-3 border-b border-border pb-3">
            <div>
              <h2 className="font-heading font-bold text-lg flex items-center gap-2 text-foreground">
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
                  navigator.clipboard.writeText(
                    "name,email,whatsapp,institution,studyProgram,selectedProgram"
                  );
                  setCopiedHeader(true);
                  setTimeout(() => setCopiedHeader(false), 2000);
                }}
                className="p-1 hover:bg-muted rounded text-foreground transition-colors shrink-0 cursor-pointer"
                title="Salin Template Header"
              >
                {copiedHeader ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <form onSubmit={handleCsvReview} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Pilih Angkatan / Batch Tujuan:
                </label>
                <select
                  value={selectedBatchForImport}
                  onChange={(e) => setSelectedBatchForImport(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-medium focus:outline-none focus:border-brand-purple cursor-pointer"
                  required
                >
                  <option value="">-- Pilih Batch (Hanya Batch Aktif) --</option>
                  {batchesList
                    .filter((b) => b.status === "active")
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} (ACTIVE) - {b.includedPrograms?.length || 0} Program
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
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
                    <span className="text-xs font-semibold text-emerald-600">
                      File CSV Berhasil Dimuat!
                    </span>
                    <p className="text-3xs text-muted-foreground font-mono truncate max-w-[280px]">
                      Header: {csvText.split("\n")[0]}
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
                    <span className="text-xs font-semibold text-foreground">
                      Pilih file CSV (.csv) atau seret ke sini
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      Gunakan header name, email, dll.
                    </span>
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
                  <label className="text-xs font-semibold text-foreground">
                    Paste Isi Data CSV / Spreadsheet:
                  </label>
                  <span className="text-3xs text-muted-foreground font-medium">
                    Tip: Gunakan koma (,) sebagai pemisah kolom
                  </span>
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

          {importResult && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs space-y-1">
              <p className="font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Hasil Impor CSV:
              </p>
              <p>
                Berhasil menambahkan <strong>{importResult.successCount}</strong> siswa baru. Gagal:{" "}
                <strong>{importResult.failedCount}</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
