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
import { API_BASE_URL } from "@/lib/config";

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

  const fetchProfile = async () => {
    try {
      const existingToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      
      if (code) {
        try {
          // Exchange code for token
          const exchangeRes = await fetch(`${API_BASE_URL}/auth/exchange-code`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ code }),
            credentials: "include",
          });
          
          if (exchangeRes.ok) {
            const data = await exchangeRes.json();
            localStorage.setItem("auth_token", data.token);
          } else if (!existingToken) {
            throw new Error("Gagal memverifikasi login.");
          }
        } catch (exchangeErr) {
          if (!existingToken) {
            throw exchangeErr;
          }
        } finally {
          // Always strip code parameter from URL to prevent re-submitting on back/forward
          const url = new URL(window.location.href);
          url.searchParams.delete("code");
          window.history.replaceState({}, "", url.toString());
        }
      }
      
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Sesi login tidak ditemukan.");
      }
      
      const headers: Record<string, string> = { 
        Accept: "application/json",
        Authorization: `Bearer ${token}` 
      };

      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Sesi login berakhir atau belum terautentikasi.");
      }
      
      const profileData = await res.json();
      setProfile(profileData);
      setIsLoadingProfile(false);
    } catch (err: any) {
      console.error(err);
      localStorage.removeItem("auth_token");
      router.push("/login?error=" + encodeURIComponent(err.message));
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers,
        credentials: "include",
      });
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem("auth_token");
      router.push("/login");
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Navbar profile={null} onLogout={handleLogout} />
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
          <p className="text-sm font-medium text-muted-foreground">Memuat data dasbor...</p>
        </div>
      </div>
    );
  }

  const activeRoles = profile?.roles || (profile?.role ? [profile.role] : []);
  const isAdmin = activeRoles.includes("admin");
  const isFacilitator = activeRoles.includes("facilitator");
  const isMentor = activeRoles.includes("mentor");
  const isStudent = activeRoles.includes("student");

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar profile={profile} onLogout={handleLogout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAdmin && profile && <AdminDashboard profile={profile} onProfileUpdate={fetchProfile} />}
        {!isAdmin && isFacilitator && profile && <FacilitatorDashboard profile={profile} onProfileUpdate={fetchProfile} />}
        {!isAdmin && !isFacilitator && isMentor && profile && <MentorDashboard profile={profile} onProfileUpdate={fetchProfile} />}
        {!isAdmin && !isFacilitator && !isMentor && isStudent && profile && <StudentDashboard profile={profile} onProfileUpdate={fetchProfile} />}
      </main>
    </div>
  );
}
