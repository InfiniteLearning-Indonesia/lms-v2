"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { API_BASE_URL } from "@/lib/config";
import {
  ArrowLeft,
  AlertCircle,
  KeyRound,
  Lock,
  Mail,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Setup Password Dialog States
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [setupEmail, setSetupEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupError, setSetupError] = useState("");

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login-local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.message?.includes("Password belum dibuat")) {
          setSetupEmail(email);
          setIsSetupModalOpen(true);
          setSetupError("Akun Anda belum memiliki password. Silakan buat password pertama Anda di bawah ini.");
        } else {
          setError(data.message || "Login gagal. Periksa kembali email dan password Anda.");
        }
        return;
      }

      setSuccess("Login berhasil! Mengalihkan ke dasbor...");
      localStorage.setItem("auth_token", data.token);
      setTimeout(() => {
        router.push(`/dashboard?token=${data.token}`);
      }, 500);
    } catch (err: any) {
      console.error(err);
      setError("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetupPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError("");

    if (newPassword.length < 6) {
      setSetupError("Password minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setSetupError("Konfirmasi password tidak cocok.");
      return;
    }

    setIsSettingUp(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/setup-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: setupEmail, password: newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSetupError(data.message || "Gagal membuat password.");
        return;
      }

      setIsSetupModalOpen(false);
      setSuccess("Password berhasil dibuat! Mengalihkan ke dasbor...");
      localStorage.setItem("auth_token", data.token);
      setTimeout(() => {
        router.push(`/dashboard?token=${data.token}`);
      }, 500);
    } catch (err) {
      console.error(err);
      setSetupError("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <div className="w-full max-w-sm font-sans">
      {/* Mobile back link */}
      <Link
        href="/"
        className="lg:hidden flex items-center gap-2 mb-10 text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Kembali</span>
      </Link>

      <div className="mb-6">
        <div className="lg:hidden mb-6 flex items-center">
          <img src="/logo-black.png" alt="Infinite Learning Logo" className="dark:hidden h-7 w-auto" />
          <img src="/logo-white.png" alt="Infinite Learning Logo" className="hidden dark:block h-7 w-auto" />
        </div>
        <h1 className="font-heading font-bold text-2xl tracking-tight text-foreground">
          Masuk ke LMS
        </h1>
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
          Selamat datang kembali. Silakan masuk menggunakan Email & Password atau akun Google Anda.
        </p>
      </div>

      <div className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </motion.div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleLocalLogin} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="pl-9 text-xs h-10 border-border"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 text-xs h-10 border-border"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-bold font-heading transition-colors shadow-sm cursor-pointer mt-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Masuk dengan Email & Password
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground font-mono text-[10px] tracking-wider">
              Atau
            </span>
          </div>
        </div>

        {/* Continue with Google button */}
        <motion.a
          href={`${API_BASE_URL}/auth/google`}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          className="w-full py-2.5 rounded-lg border border-border bg-card text-foreground font-sans font-medium text-xs hover:bg-muted/50 transition-colors flex items-center justify-center gap-2.5 shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Masuk dengan Google</span>
        </motion.a>

        <div className="mt-6 pt-4 border-t border-border text-center flex flex-col items-center gap-2">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Pastikan email Anda sudah terdaftar di sistem Infinite Learning.
          </p>
          <Link href="/status" className="underline inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-brand-purple transition-colors">
            <span>Cek Status Layanan LMS</span>
          </Link>
        </div>
      </div>

      {/* Setup Password Modal */}
      {isSetupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-xl p-6 shadow-xl w-full max-w-md space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-purple/10 text-brand-purple rounded-lg">
                <KeyRound className="w-5 h-5 text-brand-purple" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-foreground">
                  Buat Password Pertama Anda
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Untuk akun terdaftar yang belum memiliki password.
                </p>
              </div>
            </div>

            {setupError && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
                {setupError}
              </div>
            )}

            <form onSubmit={handleSetupPasswordSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email Terdaftar (Terkunci)</label>
                <Input
                  type="email"
                  required
                  disabled
                  readOnly
                  value={setupEmail}
                  className="text-xs h-10 border-border bg-muted text-muted-foreground opacity-90 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Password Baru</label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="text-xs h-10 border-border"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Konfirmasi Password Baru</label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="text-xs h-10 border-border"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSetupModalOpen(false)}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSettingUp}
                  className="bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-bold"
                >
                  {isSettingUp ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Simpan & Login
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentLoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-sans selection:bg-brand-purple/20 selection:text-brand-purple">
      {/* ── Left: Branding panel ── */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#12082b] via-brand-purple to-[#381a7d] text-white p-12 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-brand-yellow/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-brand-purple/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <img src="/logo-white.png" alt="Infinite Learning Logo" className="h-7 w-auto" />
          </Link>
        </div>

        <div className="max-w-md relative z-10 space-y-6">

          <h2 className="font-heading font-extrabold text-3xl md:text-4xl leading-tight tracking-tight text-white">
            Kelola kelas, kerjakan tugas, dan pantau progresmu di satu tempat.
          </h2>

          <p className="text-white/80 text-xs md:text-sm leading-relaxed font-sans">
            Platform Learning Management System untuk mendukung pengalaman belajar yang terstruktur, terukur, dan menyenangkan.
          </p>

          <div className="pt-4 border-t border-white/15 space-y-2.5 text-xs font-medium text-white/90">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
              <span>Akses langsung ke seluruh materi modul & tugas kelas</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
              <span>Sistem penilaian transparan & transkrip kompetensi</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} Infinite Learning Indonesia. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-background relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <Suspense fallback={<div className="text-xs text-muted-foreground animate-pulse font-heading">Memuat portal login...</div>}>
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}
