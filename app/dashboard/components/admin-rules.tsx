"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  BookOpen,
  Database,
  Users,
  Award,
  GitBranch,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Code2,
  Copy,
  Check,
  Search,
  ArrowRight,
  Cpu,
  Globe,
  Smartphone,
  Gamepad2,
  Palette,
  Briefcase,
  Share2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminRules() {
  const [activeTab, setActiveTab] = useState<"visual" | "rules" | "mermaid">("visual");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const mermaidERD = `erDiagram
    PROGRAM ||--o{ BATCH : "memiliki"
    PROGRAM ||--o{ COMPETENCY : "membuat standar"
    BATCH ||--o{ CLASS : "menyelenggarakan"
    USER ||--o{ CLASS : "mengajar (sebagai Mentor)"
    USER ||--o{ ENROLLMENT : "terdaftar (sebagai Student)"
    CLASS ||--o{ ENROLLMENT : "memiliki"
    CLASS ||--o{ MATERIAL : "berisi"
    CLASS ||--o{ ASSIGNMENT : "berisi"
    COMPETENCY ||--o{ MATERIAL : "memenuhi standar"
    COMPETENCY ||--o{ ASSIGNMENT : "menguji"
    USER ||--o{ COMPETENCY : "membuat (Author/Creator)"
    ASSIGNMENT ||--o{ SUBMISSION : "menerima"
    USER ||--o{ SUBMISSION : "mengirim (Student)"
    USER ||--o{ SUBMISSION : "menilai (Mentor)"`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mermaidERD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rulesList = [
    {
      id: 1,
      title: "Otoritas Pembuatan Kompetensi AI & Game",
      category: "Kompetensi",
      desc: "Seluruh kompetensi pada Program AI Development dan Game Development dibuat secara eksklusif oleh Mentor AI dan Mentor Game. Tidak ada intervensi dari mentor disiplin lain.",
      badge: "Eksklusif",
    },
    {
      id: 2,
      title: "Kolaborasi Web & Mobile dengan UI/UX",
      category: "Kolaborasi",
      desc: "Kompetensi teknis pada Program Web dan Mobile dibuat secara bersama-sama oleh Mentor Web/Mobile dan Mentor UI/UX untuk memastikan integrasi antarmuka dan logika yang sempurna.",
      badge: "Kolaboratif",
    },
    {
      id: 3,
      title: "Kewenangan Mutlak Soft Skills (CCA)",
      category: "Kompetensi",
      desc: "Modul Soft Skills (Communication, Critical Thinking, Leadership / CCA) dikelola secara mutlak dan terpusat oleh Mentor Professional untuk seluruh program studi.",
      badge: "Mutlak",
    },
    {
      id: 4,
      title: "Kewenangan Mutlak Capstone Project",
      category: "Kompetensi",
      desc: "Modul dan standar penilaian Capstone Project lintas program studi dikelola sepenuhnya oleh Mentor UI/UX sebagai arsitek perancangan produk akhir.",
      badge: "Mutlak",
    },
    {
      id: 5,
      title: "Distribusi Siswa Round-Robin",
      category: "Distribusi",
      desc: "Siswa yang mendaftar pada suatu program dibagi rata (round-robin) ke tim mentor utama sesuai spesialisasi program studi yang dipilih.",
      badge: "Sistemik",
    },
    {
      id: 6,
      title: "Alokasi Sisa Pembagian (Modulo)",
      category: "Distribusi",
      desc: "Jika terdapat sisa pembagian siswa (modulo), siswa tersebut dialokasikan secara merata kepada Mentor Professional dan Mentor UI/UX sebagai mentor pembimbing sekunder.",
      badge: "Sistemik",
    },
    {
      id: 7,
      title: "Keamanan Login Eksklusif Google OAuth",
      category: "Keamanan",
      desc: "Sistem otentikasi LMS hanya mendukung Google OAuth 2.0 (@gmail.com). Akun dengan domain lain wajib di-whitelist namun diberikan status peringatan agar memperbarui akun ke Gmail.",
      badge: "Keamanan",
    },
    {
      id: 8,
      title: "Silent Whitelisting tanpa Email Blast",
      category: "Notifikasi",
      desc: "Proses penambahan pengguna (tunggal maupun CSV Bulk) bersifat internal (database-only). Email undangan tidak akan dikirimkan secara otomatis untuk mencegah email spam.",
      badge: "Privasi",
    },
    {
      id: 9,
      title: "Peringatan Email Manual untuk Non-Gmail",
      category: "Notifikasi",
      desc: "Pengiriman email peringatan untuk pengguna Non-Gmail dilakukan secara manual melalui tombol 'Kirim Email' setelah admin menyetujui dialog konfirmasi pengiriman.",
      badge: "Manual",
    },
    {
      id: 10,
      title: "Penilaian Tugas oleh Mentor Pembimbing",
      category: "Evaluasi",
      desc: "Setiap submission tugas siswa hanya dapat dinilai dan diberikan umpan balik (feedback) oleh mentor yang ditugaskan pada kelas atau kelompok binaan tersebut.",
      badge: "Evaluasi",
    },
    {
      id: 11,
      title: "Struktur Kurikulum Berbasis Kompetensi",
      category: "Kurikulum",
      desc: "Setiap materi (Material) dan tugas (Assignment) di dalam kelas wajib dipetakan ke entitas Kompetensi (Competency) resmi agar pelacakan progres pembelajaran akurat.",
      badge: "Kurikulum",
    },
    {
      id: 12,
      title: "Normalisasi Data Pengguna Baru",
      category: "Data",
      desc: "Saat impor data (CSV/Single), sistem otomatis melakukan normalisasi nama (Capitalized) dan pembersihan format nomor WhatsApp ke angka murni.",
      badge: "Infrastruktur",
    },
    {
      id: 13,
      title: "Koordinasi Makro Primary Mentor",
      category: "Kurikulum",
      desc: "Fungsi Primary Mentor memegang peranan tertinggi atas koordinasi struktur akademik makro dari masing-masing program yang dipimpinnya.",
      badge: "Otoritas",
    },
    {
      id: 14,
      title: "Fokus Operasional Secondary Mentor",
      category: "Kurikulum",
      desc: "Fungsi Secondary Mentor (UI/UX) dibatasi secara ketat memiliki hak akses operasional dan tanggung jawab penuh pada pemenuhan aspek desain antarmuka.",
      badge: "Otoritas",
    },
    {
      id: 15,
      title: "Intervensi Pendukung Supporting Mentor",
      category: "Kurikulum",
      desc: "Supporting Mentor bertindak sebagai penyedia intervensi kompetensi pendukung (Soft Skills/CCA) lintas program tanpa hak kepemilikan struktural.",
      badge: "Otoritas",
    },
    {
      id: 16,
      title: "Logika Otomatisasi Alokasi Modulo",
      category: "Distribusi",
      desc: "Logika backend wajib menerapkan pembagian rata (round-robin) untuk tim utama dan mengalihkan sisa nilai pembagian (remainder) ke mentor pendukung.",
      badge: "Sistemik",
    },
    {
      id: 17,
      title: "Otoritas Admin & Delegasi Operasional",
      category: "Keamanan",
      desc: "Konfigurasi sistem adalah wewenang mutlak Admin. Namun pada level operasional program, Admin mendelegasikan wewenang enrollment dan alokasi tim kepada Primary Mentor.",
      badge: "Delegasi",
    },
    {
      id: 18,
      title: "Rangkap Jabatan & Workflow Approval",
      category: "Keamanan",
      desc: "Admin diperbolehkan merangkap sebagai Mentor. Namun Mentor tidak memiliki hak Admin secara default dan harus melalui persetujuan (approval) eksplisit.",
      badge: "Keamanan",
    },
    {
      id: 19,
      title: "Proteksi Penghapusan pada Batch Aktif",
      category: "Keselamatan",
      desc: "Sistem dilarang keras melakukan Hard Delete pada akun Mentor/Student yang aktif di Batch berjalan agar tidak merusak integritas kelas dan bimbingan.",
      badge: "Keselamatan",
    },
    {
      id: 20,
      title: "Alur Wajib Handover / Reassignment",
      category: "Keselamatan",
      desc: "Sebelum Mentor yang aktif diganti atau resign, Admin wajib melalui alur Handover untuk memindahkan kelas, antrean tugas, dan murid ke Mentor Pengganti.",
      badge: "Handover",
    },
    {
      id: 21,
      title: "Kekebalan Arsip Historis (Read-Only)",
      category: "Keselamatan",
      desc: "Saat Batch berakhir (Completed), seluruh data menjadi Read-Only. Terhadap pengguna di batch lampau diterapkan Soft Delete agar jejak sejarah tetap sah.",
      badge: "Arsip",
    },
    {
      id: 22,
      title: "Pembatasan 4 Program Resmi",
      category: "Kurikulum",
      desc: "Pembuatan program oleh Admin dibatasi mutlak hanya pada 4 rumpun resmi: AI, Game, Web & UI/UX, dan Mobile & UI/UX Development.",
      badge: "Infrastruktur",
    },
    {
      id: 23,
      title: "Mode Read-Only Batch Selesai",
      category: "Keselamatan",
      desc: "Saat Batch bermarkah 'Selesai', seluruh data program dan kelas terkunci menjadi Read-Only bagi Mentor dan Student. Hak edit transaksional hanya milik Admin.",
      badge: "Arsip",
    },
    {
      id: 24,
      title: "Guardrail CRUD & Suspend Murid oleh Mentor",
      category: "Keselamatan",
      desc: "Mentor diperbolehkan mendaftarkan (enrollment), mengedit, dan menonaktifkan/suspend akun murid di programnya, tetapi dilarang keras melakukan Hard Delete.",
      badge: "Keselamatan",
    },
    {
      id: 25,
      title: "Clean Transfer & Reset Progress Lintas Program",
      category: "Keselamatan",
      desc: "Memindahkan murid antar program (Case 3) akan menghapus seluruh nilai, absen, tugas, dan progres di program lama. Murid wajib mengulang dari awal.",
      badge: "Clean Transfer",
    },
  ];

  const filteredRules = rulesList.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-lg border border-white/10">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-purple/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-brand-yellow">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Source of Truth v2.0 • Dokumen Legal Sistem</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-white">
              Arsitektur Domain & Aturan Bisnis LMS
            </h1>
            <p className="text-sm text-white/80 leading-relaxed">
              Panduan otoritas spesialisasi mentor, relasi entitas database (ERD), dan aturan bisnis mutlak yang menjadi fondasi seluruh logika aplikasi LMS Infinite Learning.
            </p>
          </div>

          <div className="flex bg-white/10 p-1 rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => setActiveTab("visual")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "visual" ? "bg-white text-slate-900 shadow-sm" : "text-white/80 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Visual Domain
            </button>
            <button
              onClick={() => setActiveTab("rules")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "rules" ? "bg-white text-slate-900 shadow-sm" : "text-white/80 hover:text-white"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              25 Rules (Safety & Delegation)
            </button>
            <button
              onClick={() => setActiveTab("mermaid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "mermaid" ? "bg-white text-slate-900 shadow-sm" : "text-white/80 hover:text-white"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Mermaid ERD
            </button>
          </div>
        </div>
      </div>

      {/* ── TAB 1: VISUAL DOMAIN & ARSITEKTUR ── */}
      {activeTab === "visual" && (
        <div className="space-y-8">
          {/* Matriks Otoritas Mentor */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-heading font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-purple" />
                Matriks Spesialisasi & Otoritas Mentor
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Pembagian kewenangan pembuatan kurikulum dan pemetaan siswa berdasarkan spesialisasi mentor.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-lg bg-blue-500/10 text-blue-600 font-bold text-xs flex items-center gap-1.5">
                      <Globe className="w-4 h-4" /> Web & Mobile
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-200">
                      Kolaboratif
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-foreground">Mentor Web/Mobile + Mentor UI/UX</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Kompetensi teknis dibuat bersama untuk menyelaraskan logika pemrograman dan desain antarmuka.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-lg bg-purple-500/10 text-purple-600 font-bold text-xs flex items-center gap-1.5">
                      <Cpu className="w-4 h-4" /> AI & Game
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-200">
                      Eksklusif
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-foreground">Mentor AI & Mentor Game</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Memiliki otoritas penuh dan mandiri atas kurikulum serta penilaian teknis pada program studi terkait.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-lg bg-amber-500/10 text-amber-600 font-bold text-xs flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" /> Professional & UI/UX
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-300">
                      Lintas Program
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-foreground">Soft Skills (CCA) & Capstone</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Mentor Professional mengelola mutlak Soft Skills. Mentor UI/UX mengelola mutlak Capstone Project.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visualisasi Distribusi Siswa */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-heading font-bold text-foreground flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-600" />
                Alur Distribusi Siswa (Round-Robin & Modulo)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Bagaimana sistem membagi ribuan siswa secara adil ke mentor pembimbing.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-secondary/20 border border-border">
                <div className="text-center md:text-left space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Langkah 1</span>
                  <p className="text-xs font-bold text-foreground">Registrasi Siswa Baru</p>
                  <p className="text-[11px] text-muted-foreground">Siswa memilih program (Web, AI, Mobile, Game)</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground hidden md:block" />
                <div className="text-center md:text-left space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">Langkah 2</span>
                  <p className="text-xs font-bold text-foreground">Pembagian Round-Robin</p>
                  <p className="text-[11px] text-muted-foreground">Siswa dibagi rata ke Tim Mentor Utama prodi</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground hidden md:block" />
                <div className="text-center md:text-left space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Langkah 3</span>
                  <p className="text-xs font-bold text-foreground">Alokasi Modulo (Sisa)</p>
                  <p className="text-[11px] text-muted-foreground">Sisa siswa dialokasikan ke Mentor Professional / UX</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 2: 18 RULES ── */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Cari aturan bisnis atau kata kunci..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs bg-secondary/50"
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Menampilkan {filteredRules.length} dari {rulesList.length} Aturan
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filteredRules.map((rule) => (
              <Card key={rule.id} className="border-border bg-card shadow-sm hover:border-brand-purple/40 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-brand-purple/10 text-brand-purple font-bold text-xs flex items-center justify-center">
                        #{rule.id}
                      </span>
                      <CardTitle className="text-sm font-heading font-bold text-foreground">
                        {rule.title}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-secondary text-muted-foreground shrink-0">
                      {rule.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {rule.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: MERMAID ERD READER ── */}
      {activeTab === "mermaid" && (
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-heading font-bold text-foreground flex items-center gap-2">
                <Code2 className="w-5 h-5 text-brand-purple" />
                Mermaid ERD Schema Reader
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Representasi hubungan antar entitas database dalam sintaks Mermaid.js.
              </CardDescription>
            </div>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Tersalin!" : "Salin Kode"}
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-slate-950 text-slate-100 p-6 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
              <pre>{mermaidERD}</pre>
            </div>
            <div className="mt-4 p-4 rounded-xl bg-secondary/30 border border-border flex items-center gap-3 text-xs text-muted-foreground">
              <Database className="w-4 h-4 text-brand-purple shrink-0" />
              <span>
                <strong>Catatan Arsitektur:</strong> Seluruh foreign key dan relasi di atas dijamin integritasnya oleh TypeORM dengan mode sinkronisasi otomatis.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
