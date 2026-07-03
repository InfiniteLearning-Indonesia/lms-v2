"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  GraduationCap,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Plus,
  Search,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Info,
  Sliders,
  Sparkles,
  ChevronDown,
  Settings,
  HelpCircle,
  BookOpen,
} from "lucide-react";

export default function UIShowcasePage() {
  const [showPassword, setShowPassword] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [errorVal, setErrorVal] = useState("");
  const [checkboxChecked, setCheckboxChecked] = useState<boolean>(false);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDemoProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 50); // Loop progress bar values in the UI catalog
    return () => clearInterval(interval);
  }, []);

  const swatches = [
    { name: "Brand Purple", hex: "#8A3DFF", variable: "var(--primary)", usage: "Primary CTA, active elements, brand identity" },
    { name: "Brand Yellow", hex: "#FFCD29", variable: "var(--secondary)", usage: "Accent highlights, alert states, secondary emphasis" },
    { name: "Brand Gray", hex: "#8E8E93", variable: "var(--muted-foreground)", usage: "Secondary text, borders, placeholders" },
    { name: "White", hex: "#FFFFFF", variable: "var(--background)", usage: "Main background, card backgrounds, light contrast" },
    { name: "Black", hex: "#000000", variable: "var(--foreground)", usage: "Primary text, headers, maximum contrast" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-brand-purple/20 selection:text-brand-purple">
      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center">
            <img src="/logo-black.png" alt="Infinite Learning Logo" className="dark:hidden h-7 w-auto" />
            <img src="/logo-white.png" alt="Infinite Learning Logo" className="hidden dark:block h-7 w-auto" />
          </Link>
          <span className="text-border font-light text-sm">|</span>
          <span className="font-heading font-medium text-sm text-muted-foreground">
            Design System Workspace
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/" className="text-xs font-semibold text-brand-purple hover:text-brand-purple-hover flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-16">
          <h1 className="font-heading font-bold text-4xl tracking-tight">
            Sistem Desain & Panduan UI
          </h1>
          <p className="mt-2 text-base text-[#8E8E93] max-w-2xl">
            Katalog visual ini menampilkan semua komponen dasar yang dibangun menggunakan
            prinsip layout Google Classroom yang terstruktur serta estetika kontras tinggi dari Anthropic Claude.
          </p>
        </div>

        <div className="grid lg:grid-cols-[200px_1fr] gap-12">
          {/* Navigation Sidebar */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1.5 font-heading font-medium text-sm text-[#8E8E93]">
              <a href="#typography" className="block py-1 hover:text-foreground transition-colors">Tipografi</a>
              <a href="#colors" className="block py-1 hover:text-foreground transition-colors">Palet Warna</a>
              <a href="#buttons" className="block py-1 hover:text-foreground transition-colors">Tombol (Button)</a>
              <a href="#inputs" className="block py-1 hover:text-foreground transition-colors">Input & Form</a>
              <a href="#cards" className="block py-1 hover:text-foreground transition-colors">Kartu (Card)</a>
              <a href="#badges" className="block py-1 hover:text-foreground transition-colors">Lencana (Badge)</a>
              <a href="#alerts" className="block py-1 hover:text-foreground transition-colors">Pemberitahuan (Alert)</a>
              <a href="#tabs" className="block py-1 hover:text-foreground transition-colors">Tab (Tabs)</a>
              <a href="#dialogs" className="block py-1 hover:text-foreground transition-colors">Dialog &amp; Modal</a>
              <a href="#dropdowns" className="block py-1 hover:text-foreground transition-colors">Dropdown Menu</a>
              <a href="#toggles" className="block py-1 hover:text-foreground transition-colors">Toggles &amp; Checkbox</a>
              <a href="#avatar-tooltip" className="block py-1 hover:text-foreground transition-colors">Avatar &amp; Tooltip</a>
              <a href="#sheets" className="block py-1 hover:text-foreground transition-colors">Panel Sisi (Sheet)</a>
              <a href="#scroll-areas" className="block py-1 hover:text-foreground transition-colors">Scroll Area</a>
              <a href="#skeletons" className="block py-1 hover:text-foreground transition-colors">Skeleton Loading</a>
              <a href="#toasts" className="block py-1 hover:text-foreground transition-colors">Notifikasi Toast</a>
              <a href="#progress" className="block py-1 hover:text-foreground transition-colors">Indikator Progres</a>
            </nav>
          </aside>

          {/* Catalog Sections */}
          <div className="space-y-16">
            {/* Typography Section */}
            <section id="typography" className="scroll-mt-20">
              <h2 className="font-heading font-bold text-xl border-b border-border pb-3 mb-6">
                Tipografi
              </h2>
              <div className="bg-card border border-border rounded-xl p-8 space-y-8">
                {/* Header Font */}
                <div className="grid md:grid-cols-[140px_1fr] gap-4">
                  <div className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mt-1.5">
                    Font Header
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-3xl mb-1 text-foreground">
                      Lexend Deca
                    </h3>
                    <p className="text-xs text-[#8E8E93] font-mono mb-4">
                      --font-heading | Used for Titles, Hero Text, Page Names
                    </p>
                    <div className="space-y-1.5">
                      <p className="font-heading font-bold text-2xl">
                        Ayo Mulai Belajar!
                      </p>
                      <p className="font-heading font-semibold text-lg">
                        Kelas Pemrograman Web & UI/UX
                      </p>
                      <p className="font-heading font-medium text-sm">
                        Mentor Riyanda Azis Febrian
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="border-border" />

                {/* Body Font */}
                <div className="grid md:grid-cols-[140px_1fr] gap-4">
                  <div className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mt-1.5">
                    Font Body
                  </div>
                  <div>
                    <h3 className="font-sans text-3xl mb-1 text-foreground">
                      Inclusive Sans
                    </h3>
                    <p className="text-xs text-[#8E8E93] font-mono mb-4">
                      --font-sans | Used for Body Text, Descriptions, Labels, Form Inputs
                    </p>
                    <div className="space-y-2 max-w-xl">
                      <p className="font-sans text-sm leading-relaxed text-foreground">
                        Satu platform yang menghubungkan siswa dan mentor dalam pengalaman belajar yang terstruktur, terukur, dan mudah diakses.
                      </p>
                      <p className="font-sans text-xs text-[#8E8E93] leading-relaxed">
                        Label input, form bantuan, copyright teks, dan metadata menggunakan Inclusive Sans untuk keterbacaan tinggi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Colors Section */}
            <section id="colors" className="scroll-mt-20">
              <h2 className="font-heading font-bold text-xl border-b border-border pb-3 mb-6">
                Palet Warna
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {swatches.map((color) => (
                  <div key={color.name} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                    <div
                      className="h-24 w-full border-b border-border"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-heading font-semibold text-sm text-foreground">
                          {color.name}
                        </h4>
                        <p className="text-xs font-mono font-semibold text-[#8E8E93] mt-0.5">
                          {color.hex}
                        </p>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-normal mt-3 border-t border-border/60 pt-2">
                        {color.usage}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Buttons Section */}
            <section id="buttons" className="scroll-mt-20">
              <h2 className="font-heading font-bold text-xl border-b border-border pb-3 mb-6">
                Tombol (Button)
              </h2>
              <div className="bg-card border border-border rounded-xl p-8 space-y-10">
                {/* Variant Showcases */}
                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-xs text-[#8E8E93] uppercase tracking-wider">
                    Varian Tombol
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="default">Default (Purple)</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="secondary">Secondary (Yellow)</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link Style</Button>
                  </div>
                </div>

                {/* Size Showcases */}
                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-xs text-[#8E8E93] uppercase tracking-wider">
                    Ukuran Tombol
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button size="xs" variant="outline">Extra Small (xs)</Button>
                    <Button size="sm" variant="outline">Small (sm)</Button>
                    <Button size="default" variant="outline">Default</Button>
                    <Button size="lg" variant="outline">Large (lg)</Button>
                  </div>
                </div>

                {/* States / Interactive */}
                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-xs text-[#8E8E93] uppercase tracking-wider">
                    Keadaan Khusus & Animasi
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <Button disabled>Disabled State</Button>
                    <Button className="inline-flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Dengan Ikon
                    </Button>
                    <Button disabled className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses…
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Inputs & Form Controls */}
            <section id="inputs" className="scroll-mt-20">
              <h2 className="font-heading font-bold text-xl border-b border-border pb-3 mb-6">
                Input & Form
              </h2>
              <div className="bg-card border border-border rounded-xl p-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Default Inputs */}
                  <div className="space-y-4">
                    <h3 className="font-heading font-bold text-xs text-[#8E8E93] uppercase tracking-wider">
                      Input Standar
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="standard-username">Username</Label>
                        <Input
                          id="standard-username"
                          placeholder="Masukkan username Anda…"
                          className="border-brand-gray/40 focus-visible:border-brand-purple focus-visible:ring-brand-purple/20 h-10"
                        />
                        <p className="text-xs text-muted-foreground">
                          Label dan deskripsi bantuan menggunakan Inclusive Sans.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="email-input">Alamat Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                          <Input
                            id="email-input"
                            type="email"
                            placeholder="nama@email.com"
                            className="pl-10 h-10 border-brand-gray/40 focus-visible:border-brand-purple focus-visible:ring-brand-purple/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Password / Interactive Inputs */}
                  <div className="space-y-4">
                    <h3 className="font-heading font-bold text-xs text-[#8E8E93] uppercase tracking-wider">
                      Input Khusus
                    </h3>
                    <div className="space-y-4">
                      {/* Password input with eye toggle */}
                      <div className="space-y-1.5">
                        <Label htmlFor="password-toggle">Kata Sandi</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                          <Input
                            id="password-toggle"
                            type={showPassword ? "text" : "password"}
                            placeholder="Masukkan kata sandi…"
                            className="pl-10 pr-10 h-10 border-brand-gray/40 focus-visible:border-brand-purple focus-visible:ring-brand-purple/20"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Interactive testing input */}
                      <div className="space-y-1.5">
                        <Label htmlFor="error-testing">Validasi Langsung (Uji Coba)</Label>
                        <Input
                          id="error-testing"
                          value={inputVal}
                          onChange={(e) => {
                            setInputVal(e.target.value);
                            if (e.target.value.length > 0 && e.target.value.length < 5) {
                              setErrorVal("Minimal masukan harus 5 karakter.");
                            } else {
                              setErrorVal("");
                            }
                          }}
                          placeholder="Ketik sesuatu di sini untuk menguji error…"
                          className={`h-10 border-brand-gray/40 focus-visible:border-brand-purple focus-visible:ring-brand-purple/20 ${
                            errorVal ? "border-destructive/80 focus-visible:border-destructive focus-visible:ring-destructive/10" : ""
                          }`}
                        />
                        {errorVal ? (
                          <p className="text-xs text-destructive flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errorVal}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Ketik minimal 5 karakter untuk menghilangkan pesan galat.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Cards Section */}
            <section id="cards" className="scroll-mt-20">
              <h2 className="font-heading font-bold text-xl border-b border-border pb-3 mb-6">
                Kartu (Card)
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Standard card layout */}
                <Card className="border-border shadow-sm">
                  <CardHeader>
                    <CardTitle>Kelas Pemrograman Dasar</CardTitle>
                    <CardDescription>Materi tingkat awal untuk pemula</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Modul ini mencakup HTML5, CSS3 Grid, Flexbox, dasar Javascript, dan arsitektur web modern. Mentor akan memandu tugas mingguan secara terarah.
                    </p>
                  </CardContent>
                  <CardFooter className="border-t border-border">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs text-muted-foreground font-mono">Batas: Besok, 23:59</span>
                      <Button size="sm">Buka Kelas</Button>
                    </div>
                  </CardFooter>
                </Card>

                {/* Dashboard layout styling card */}
                <Card className="border-border shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-brand-purple to-brand-gradient-end px-6 py-5 text-white">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-yellow">
                      Sedang Berjalan
                    </p>
                    <CardTitle className="text-white text-lg mt-1">Dasar Pemrograman Web</CardTitle>
                    <p className="text-xs text-white/70 mt-0.5">Mentor: Riyanda Azis Febrian</p>
                  </div>
                  <CardContent className="py-5 space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Penyelesaian Modul</span>
                        <span>72%</span>
                      </div>
                      <div className="w-full bg-[#F5F5F7] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-brand-purple h-full w-[72%] rounded-full" />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-yellow" />
                      2 tugas baru ditambahkan oleh mentor
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Badges Section */}
            <section id="badges" className="scroll-mt-20">
              <h2 className="font-heading font-bold text-xl border-b border-border pb-3 mb-6">
                Lencana (Badge)
              </h2>
              <div className="bg-card border border-border rounded-xl p-8 space-y-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <Badge variant="default">Active</Badge>
                  <Badge variant="secondary">In Progress</Badge>
                  <Badge variant="destructive">Suspended</Badge>
                  <Badge variant="outline">Draft State</Badge>
                </div>
              </div>
            </section>

            {/* Alerts Section */}
            <section id="alerts" className="scroll-mt-20">
              <h2 className="font-heading font-bold text-xl border-b border-border pb-3 mb-6">
                Pemberitahuan (Alert)
              </h2>
              <div className="space-y-4">
                {/* Info Alert */}
                <Alert className="border-border">
                  <Info className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
                  <div>
                    <AlertTitle className="font-heading font-semibold text-sm">
                      Informasi Pembaruan
                    </AlertTitle>
                    <AlertDescription className="text-xs">
                      Sistem autentikasi dual-portal (Siswa dan Staf) saat ini berjalan secara simulatif. Fitur dashboard penuh akan dirilis pada fase 2.
                    </AlertDescription>
                  </div>
                </Alert>

                {/* Warning / Error Alert */}
                <Alert variant="destructive" className="border-destructive/20 text-destructive bg-destructive/5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <AlertTitle className="font-heading font-semibold text-sm">
                      Akses Ditolak
                    </AlertTitle>
                    <AlertDescription className="text-xs text-destructive/90">
                      Kata sandi yang Anda masukkan salah. Sisa batas percobaan tersisa 3 kali sebelum akun dibekukan sementara.
                    </AlertDescription>
                  </div>
                </Alert>
              </div>
            </section>

            {/* Tabs Section */}
            <section id="tabs" className="scroll-mt-20">
              <h2 className="font-heading font-bold text-xl border-b border-border pb-3 mb-6">
                Tab (Tabs)
              </h2>
              <div className="bg-card border border-border rounded-xl p-8">
                <Tabs defaultValue="materi" className="w-full">
                  <TabsList className="max-w-[400px] mb-6">
                    <TabsTrigger value="materi">Materi</TabsTrigger>
                    <TabsTrigger value="tugas">Tugas</TabsTrigger>
                    <TabsTrigger value="diskusi">Diskusi</TabsTrigger>
                  </TabsList>
                  <TabsContent value="materi" className="space-y-4">
                    <div className="p-4 border border-border rounded-xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-brand-purple/8 text-brand-purple flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-heading font-semibold text-sm text-foreground">Pengenalan Web Semantik</h4>
                        <p className="text-xs text-muted-foreground">Materi dibaca • Diunggah 2 hari yang lalu oleh Rian Prasetya</p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="tugas" className="space-y-4">
                    <div className="p-4 border border-border rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-brand-purple/8 text-brand-purple flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-heading font-semibold text-sm text-foreground">Tugas Akhir: UI/UX Redesign</h4>
                          <p className="text-xs text-muted-foreground">Batas waktu: 3 Juli 2026, 23:59</p>
                        </div>
                      </div>
                      <Badge variant="outline">Belum Mengumpulkan</Badge>
                    </div>
                  </TabsContent>
                  <TabsContent value="diskusi" className="space-y-4">
                    <div className="p-4 border border-border rounded-xl">
                      <p className="text-sm font-sans text-foreground">Diskusi tentang penerapan Tailwind CSS v4 di project lms-v2.</p>
                      <p className="text-xs text-muted-foreground mt-2">Dibuat oleh Siswa A • 3 balasan dari teman sekelas</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </section>

            {/* Dialogs Section */}
            <section id="dialogs" className="scroll-mt-20">
              <h2 className="font-heading font-bold text-xl border-b border-border pb-3 mb-6">
                Dialog &amp; Modal
              </h2>
              <div className="bg-card border border-border rounded-xl p-8 flex flex-wrap gap-4">
                <Dialog>
                  <DialogTrigger render={<Button variant="default">Tambah Kelas Baru</Button>} />
                  <DialogContent className="max-w-[425px] border border-border bg-popover p-6 rounded-xl shadow-lg">
                    <DialogHeader className="mb-4">
                      <DialogTitle className="font-heading font-bold text-lg text-foreground">Tambah Kelas</DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground">
                        Buat kelas baru dan undang siswa untuk mulai belajar bersama.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mb-6">
                      <div className="space-y-1.5">
                        <Label htmlFor="dialog-class-name">Nama Kelas</Label>
                        <Input id="dialog-class-name" placeholder="Contoh: Game Development Dasar" className="h-10" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="dialog-mentor">Nama Mentor</Label>
                        <Input id="dialog-mentor" placeholder="Contoh: Budi Santoso" className="h-10" />
                      </div>
                    </div>
                    <DialogFooter className="flex justify-end gap-2 border-t border-border pt-4">
                      <Button variant="outline" size="sm">Batal</Button>
                      <Button variant="default" size="sm">Simpan Kelas</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </section>

            {/* Dropdown Menu Section */}
            <section id="dropdowns" className="scroll-mt-20">
              <h2 className="font-heading font-bold text-xl border-b border-border pb-3 mb-6">
                Dropdown Menu
              </h2>
              <div className="bg-card border border-border rounded-xl p-8">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="outline" className="inline-flex items-center gap-1.5 h-10 px-4">
                        Pilihan Aksi
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent className="w-56 bg-popover border border-border rounded-xl p-1.5 shadow-md">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="px-2.5 py-1.5 text-xs font-semibold text-[#8E8E93] font-sans">Aksi Siswa</DropdownMenuLabel>
                      <DropdownMenuSeparator className="h-px bg-border my-1" />
                      <DropdownMenuItem className="flex items-center gap-2 px-2.5 py-2 text-sm rounded-lg hover:bg-secondary cursor-pointer transition-colors outline-none font-medium">
                        <User className="w-4 h-4 text-muted-foreground" />
                        Detail Profil
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 px-2.5 py-2 text-sm rounded-lg hover:bg-secondary cursor-pointer transition-colors outline-none font-medium">
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        Pengaturan
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="h-px bg-border my-1" />
                    <DropdownMenuItem className="flex items-center gap-2 px-2.5 py-2 text-sm rounded-lg hover:bg-red-50 text-red-600 cursor-pointer transition-colors outline-none font-medium">
                      Keluar Portal
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </section>

            {/* Toggles & Checkbox Section */}
            <section id="toggles" className="scroll-mt-20">
              <h2 className="font-heading font-bold text-xl border-b border-border pb-3 mb-6">
                Toggles &amp; Checkbox
              </h2>
              <div className="bg-card border border-border rounded-xl p-8 space-y-6">
                {/* Checkbox state */}
                <div className="flex items-start gap-3">
                  <Checkbox 
                    id="todo-item" 
                    checked={checkboxChecked} 
                    onCheckedChange={(checked) => setCheckboxChecked(checked)} 
                  />
                  <div className="space-y-1">
                    <Label htmlFor="todo-item" className="cursor-pointer font-medium text-sm">
                      Kirim laporan mingguan secara otomatis
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Status: {checkboxChecked ? <span className="text-green-600 font-bold">Aktif</span> : "Non-aktif"}
                    </p>
                  </div>
                </div>

                <hr className="border-border" />

                {/* Switch state */}
                <div className="flex items-center justify-between max-w-sm">
                  <div className="space-y-1 pr-4">
                    <Label htmlFor="notif-toggle" className="cursor-pointer font-medium text-sm">
                      Mode Senyap (Mute Notifications)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Matikan semua bunyi pemberitahuan aplikasi lms.
                    </p>
                  </div>
                  <Switch 
                    id="notif-toggle" 
                    checked={switchChecked} 
                    onCheckedChange={(checked) => setSwitchChecked(checked)} 
                  />
                </div>
              </div>
            </section>

            {/* Avatar & Tooltip Section */}
            <section id="avatar-tooltip" className="scroll-mt-20">
              <h2 className="font-heading font-bold text-xl border-b border-border pb-3 mb-6">
                Avatar &amp; Tooltip
              </h2>
              <div className="bg-card border border-border rounded-xl p-8 space-y-8">
                {/* Avatars */}
                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-xs text-[#8E8E93] uppercase tracking-wider">
                    Avatar Pengguna
                  </h3>
                  <div className="flex items-center gap-4">
                    {/* With image */}
                    <Avatar className="w-10 h-10 rounded-full border border-border">
                      <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" alt="Profil User" />
                      <AvatarFallback>AU</AvatarFallback>
                    </Avatar>

                    {/* Fallback Initials */}
                    <Avatar className="w-10 h-10 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center font-bold text-sm">
                      <AvatarFallback>RP</AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <hr className="border-border" />

                {/* Tooltips */}
                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-xs text-[#8E8E93] uppercase tracking-wider">
                    Bantuan Mengambang (Tooltip)
                  </h3>
                  <div className="flex items-center gap-4">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button variant="outline" className="w-10 h-10 p-0 flex items-center justify-center">
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        }
                      />
                      <TooltipContent className="bg-foreground text-background text-xs py-1 px-2.5 rounded shadow-md">
                        Klik untuk mendapatkan informasi bantuan sistem
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </section>

            {/* Sheets Section */}
            <section id="sheets" className="scroll-mt-20">
              <h2 className="font-heading font-bold text-xl border-b border-border pb-3 mb-6">
                Panel Sisi (Sheet)
              </h2>
              <div className="bg-card border border-border rounded-xl p-8 flex flex-wrap gap-4">
                <Sheet>
                  <SheetTrigger render={<Button variant="outline">Buka Panel Pengaturan</Button>} />
                  <SheetContent side="right" className="border-l border-border bg-popover w-[380px] p-0">
                    <SheetHeader className="border-b border-border p-4">
                      <SheetTitle>Pengaturan Portal LMS</SheetTitle>
                      <SheetDescription>
                        Konfigurasi preferensi tampilan dan notifikasi akun Anda.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="p-4 space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notifikasi</h4>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sheet-email-notif" className="cursor-pointer">Notifikasi Email</Label>
                          <Switch id="sheet-email-notif" defaultChecked />
                        </div>
                      </div>
                      <hr className="border-border" />
                      <div className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tampilan</h4>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sheet-compact-mode" className="cursor-pointer">Mode Padat (Compact)</Label>
                          <Switch id="sheet-compact-mode" />
                        </div>
                      </div>
                    </div>
                    <SheetFooter className="border-t border-border p-4 mt-auto">
                      <Button variant="default" className="w-full">Simpan Preferensi</Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </section>

            {/* Scroll Area Section */}
            <section id="scroll-areas" className="scroll-mt-20">
              <h2 className="font-heading font-bold text-xl border-b border-border pb-3 mb-6">
                Scroll Area
              </h2>
              <div className="bg-card border border-border rounded-xl p-8">
                <ScrollArea className="h-48 w-full max-w-[400px] border border-border rounded-xl p-4 bg-secondary/20">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aktivitas Terbaru</h4>
                    {[
                      "Rian Prasetya memposting materi baru: CSS Grid.",
                      "Tugas Akhir UI/UX diperbarui oleh Budi Santoso.",
                      "Siswa A berkomentar di modul Web Semantik.",
                      "Akun mentor baru berhasil terdaftar di sistem.",
                      "Ujian Tengah Semester dijadwalkan ulang.",
                      "Siswa B mengunggah revisi Tugas 3.",
                      "Sistem LMS ditingkatkan ke versi 2.0.",
                    ].map((activity, idx) => (
                      <div key={idx} className="text-sm font-sans pb-3 border-b border-border/40 last:border-0 last:pb-0">
                        <p className="text-foreground font-medium">{activity}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{idx + 1} jam yang lalu</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </section>

            {/* Skeleton Section */}
            <section id="skeletons" className="scroll-mt-20">
              <h2 className="font-heading font-bold text-xl border-b border-border pb-3 mb-6">
                Skeleton Loading
              </h2>
              <div className="bg-card border border-border rounded-xl p-8 max-w-sm">
                <div className="space-y-5">
                  {/* Mock card preview load state */}
                  <div className="h-28 bg-[#F5F5F7] rounded-lg animate-pulse flex items-center justify-center text-muted-foreground text-xs font-medium">
                    Loading Banner…
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-[60%] bg-muted" />
                    <Skeleton className="h-3 w-[85%] bg-muted/80" />
                    <Skeleton className="h-3 w-[70%] bg-muted/60" />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Skeleton className="h-9 w-9 rounded-full bg-muted" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3 w-[40%] bg-muted" />
                      <Skeleton className="h-2 w-[25%] bg-muted/80" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Extra: Interactive Toasts (Sonner) */}
            <section id="toasts" className="scroll-mt-20">
              <h2 className="font-heading font-bold text-xl border-b border-border pb-3 mb-6">
                Toast Notifications (Sonner)
              </h2>
              <div className="bg-card border border-border rounded-xl p-8 flex flex-wrap gap-4">
                <Button 
                  onClick={() => toast.success("Tugas Anda berhasil diunggah!")} 
                  variant="outline"
                >
                  Picu Toast Sukses
                </Button>
                <Button 
                  onClick={() => toast.error("Gagal menyimpan perubahan. Coba lagi.")} 
                  variant="destructive"
                >
                  Picu Toast Galat
                </Button>
              </div>
            </section>

            {/* Indikator Progres Section */}
            <section id="progress" className="scroll-mt-20">
              <h2 className="font-heading font-bold text-xl border-b border-border pb-3 mb-6">
                Indikator Progres (Progress Bar)
              </h2>
              <div className="bg-card border border-border rounded-xl p-8 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-xs text-muted-foreground uppercase tracking-wider">
                    Default Progress (Brand Purple)
                  </h3>
                  <Progress value={demoProgress} className="w-full max-w-md h-1.5" />
                  <p className="text-xs text-muted-foreground font-mono tabular-nums">Animasi pengisian otomatis: {demoProgress}%</p>
                </div>

                <hr className="border-border" />

                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-xs text-muted-foreground uppercase tracking-wider">
                    Success State (Green)
                  </h3>
                  <Progress value={100} className="w-full max-w-md h-1.5" />
                  <p className="text-xs text-muted-foreground">Seluruh tugas berhasil dikirim (100%)</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 text-center mt-12 text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Infinite Learning.</p>
      </footer>
    </div>
  );
}
