"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LogOut,
  LayoutDashboard,
  Shield,
  Loader2,
} from "lucide-react";

import { StudentDashboard } from "./components/student-dashboard";
import { MentorDashboard } from "./components/mentor-dashboard";
import { AdminDashboard } from "./components/admin-dashboard";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "admin" | "mentor" | "student";
  status: "invited" | "active" | "suspended";
  avatarUrl: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  selectedProgram?: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Role tab for Admin (who can switch to Mentor view)
  const [adminActiveTab, setAdminActiveTab] = useState<"admin" | "mentor">("admin");

  useEffect(() => {
    // Fetch profile
    fetch("http://localhost:7000/auth/me", {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Sesi login berakhir atau belum terautentikasi.");
        }
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setIsLoadingProfile(false);
      })
      .catch((err) => {
        console.error(err);
        router.push("/login?error=" + encodeURIComponent(err.message));
      });
  }, [router]);

  async function handleLogout() {
    try {
      const res = await fetch("http://localhost:7000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        router.push("/login");
      }
    } catch (err) {
      console.error(err);
    }
  }

  const roleColors = {
    admin: "bg-red-500/10 text-red-500 border-red-500/20",
    mentor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    student: "bg-brand-purple/10 text-brand-purple border-brand-purple/20",
  };

  const roleLabels = {
    admin: "Administrator",
    mentor: "Mentor Kelas",
    student: "Siswa LMS",
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-brand-purple animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground animate-pulse font-heading">
          Memuat halaman dasbor…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-brand-purple/20 selection:text-brand-purple">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center">
            <img src="/logo-black.png" alt="Infinite Learning Logo" className="dark:hidden h-7 w-auto" />
            <img src="/logo-white.png" alt="Infinite Learning Logo" className="hidden dark:block h-7 w-auto" />
          </Link>
          <span className="text-border font-light text-sm">|</span>
          <span className="font-heading font-medium text-sm text-muted-foreground flex items-center gap-1.5">
            <LayoutDashboard className="w-4 h-4 text-brand-purple" />
            Dasbor Utama
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <span className="text-xs text-muted-foreground hidden sm:inline-block">
            Halo, <strong className="text-foreground">{profile?.name}</strong>
          </span>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground font-sans font-medium text-xs hover:bg-muted/50 transition-colors shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <div className="space-y-6">
          
          {/* Welcome Panel */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold border ${profile ? roleColors[profile.role] : ""}`}>
                <Shield className="w-3 h-3" />
                {profile ? roleLabels[profile.role] : ""}
              </span>
              <h1 className="font-heading font-bold text-2xl tracking-tight text-foreground">
                Selamat datang kembali, {profile?.name}!
              </h1>
              <p className="text-xs text-muted-foreground">
                Email Anda: <span className="font-medium text-foreground">{profile?.email}</span>
              </p>
            </div>
            
            {/* Tabs for Admin / Mentor Role Switcher */}
            {profile?.role === "admin" && (
              <div className="flex bg-secondary border border-border p-0.5 rounded-lg">
                <button
                  onClick={() => setAdminActiveTab("admin")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold font-heading transition-all ${
                    adminActiveTab === "admin"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Tab Admin
                </button>
                <button
                  onClick={() => setAdminActiveTab("mentor")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold font-heading transition-all ${
                    adminActiveTab === "mentor"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Tab Mentor
                </button>
              </div>
            )}
          </div>

          {/* Views Routing based on Role & Active Tab */}
          {profile?.role === "student" && <StudentDashboard profile={profile} />}
          
          {(profile?.role === "mentor" || (profile?.role === "admin" && adminActiveTab === "mentor")) && (
            <MentorDashboard />
          )}

          {profile?.role === "admin" && adminActiveTab === "admin" && (
            <AdminDashboard />
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6 text-center text-xs text-muted-foreground mt-12">
        <p>&copy; {new Date().getFullYear()} Infinite Learning.</p>
      </footer>
    </div>
  );
}
