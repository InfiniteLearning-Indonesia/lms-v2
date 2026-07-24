"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Navbar } from "@/components/navbar";
import {
  LogOut,
  LayoutDashboard,
  Shield,
  Loader2,
} from "lucide-react";

import { StudentDashboard } from "./components/student-dashboard";
import { MentorDashboard } from "./components/mentor-dashboard";
import { AdminDashboard } from "./components/admin-dashboard";
import { FacilitatorDashboard } from "./components/facilitator-dashboard";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "admin" | "facilitator" | "mentor" | "student";
  roles?: ("admin" | "facilitator" | "mentor" | "student")[];
  status: "invited" | "active" | "suspended";
  avatarUrl: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  selectedProgram?: string | null;
  programId?: string | null;
  specialization?: string | null;
  whatsapp?: string | null;
  institution?: string | null;
  studyProgram?: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const fetchProfile = () => {
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
  };

  useEffect(() => {
    fetchProfile();
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
    facilitator: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    mentor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    student: "bg-brand-purple/10 text-brand-purple border-brand-purple/20",
  };

  const roleLabels = {
    admin: "Administrator",
    facilitator: "Facilitator Program",
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
      <Navbar profile={profile} onLogout={handleLogout} title="Dasbor Utama" />

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <div className="space-y-6">

          {/* Welcome Panel */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {profile && (
                <img
                  src={profile.avatarUrl || `/avatars/avatar_${((profile.id ? (profile.id.charCodeAt(0) + profile.id.charCodeAt(profile.id.length - 1)) : 1) % 5) + 1}.png`}
                  alt={profile.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-brand-purple/20 shadow-sm"
                />
              )}
              <div className="space-y-1.5">
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${profile ? roleColors[profile.role] : ""}`}>
                  <Shield className="w-2.5 h-2.5" />
                  {profile ? roleLabels[profile.role] : ""}
                </span>
                <h1 className="font-heading font-bold text-2xl tracking-tight text-foreground">
                  Selamat datang kembali, {profile?.name}!
                </h1>
                <p className="text-xs text-muted-foreground">
                  Email Anda: <span className="font-medium text-foreground">{profile?.email}</span>
                </p>
              </div>
            </div>

          </div>

          {/* Views Routing based on Role */}
          {profile?.roles?.includes("student") && !profile?.roles?.includes("mentor") && !profile?.roles?.includes("facilitator") && !profile?.roles?.includes("admin") && <StudentDashboard profile={profile} onProfileUpdate={fetchProfile} />}
          {profile?.roles?.includes("facilitator") && !profile?.roles?.includes("admin") && <FacilitatorDashboard profile={profile} onProfileUpdate={fetchProfile} />}
          {profile?.roles?.includes("mentor") && !profile?.roles?.includes("facilitator") && !profile?.roles?.includes("admin") && <MentorDashboard profile={profile} onProfileUpdate={fetchProfile} />}
          {profile?.roles?.includes("admin") && <AdminDashboard profile={profile} onProfileUpdate={fetchProfile} />}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6 text-center text-xs text-muted-foreground mt-12">
        <p>&copy; {new Date().getFullYear()} Infinite Learning.</p>
      </footer>
    </div>
  );
}
