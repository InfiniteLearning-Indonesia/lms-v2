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
import { Profile } from "@/lib/types/profile";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const fetchProfile = async () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlToken = searchParams.get("token");
      if (urlToken) {
        localStorage.setItem("auth_token", urlToken);
        const url = new URL(window.location.href);
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.toString());
      }

      const existingToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
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

      // Interceptor automatically adds Bearer token + credentials
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Accept: "application/json" },
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
    } catch {
      // Network error: still clear local state and redirect
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("dashboard_view_mode");
      router.push("/login");
    }
  };

  const [viewModeOverride, setViewModeOverride] = useState<string | null>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("dashboard_view_mode") : null;
  });

  const handleSwitchViewMode = (mode: "admin" | "facilitator" | "mentor" | "student") => {
    setViewModeOverride(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboard_view_mode", mode);
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

  // Determine effective active role based on user selection or highest default priority
  const effectiveRole = (viewModeOverride && activeRoles.includes(viewModeOverride as any))
    ? viewModeOverride
    : (activeRoles.includes("admin")
      ? "admin"
      : (activeRoles.includes("facilitator")
        ? "facilitator"
        : (activeRoles.includes("mentor")
          ? "mentor"
          : "student")));

  const isAdmin = effectiveRole === "admin";
  const isFacilitator = effectiveRole === "facilitator";
  const isMentor = effectiveRole === "mentor";
  const isStudent = effectiveRole === "student";

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar
        profile={profile}
        onLogout={handleLogout}
        currentViewMode={effectiveRole}
        onSwitchViewMode={handleSwitchViewMode}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAdmin && profile && <AdminDashboard profile={profile} onProfileUpdate={fetchProfile} />}
        {!isAdmin && isFacilitator && profile && <FacilitatorDashboard profile={profile} onProfileUpdate={fetchProfile} />}
        {!isAdmin && !isFacilitator && isMentor && profile && <MentorDashboard profile={profile} onProfileUpdate={fetchProfile} />}
        {!isAdmin && !isFacilitator && !isMentor && isStudent && profile && <StudentDashboard profile={profile} onProfileUpdate={fetchProfile} />}
        {!isAdmin && !isFacilitator && !isMentor && !isStudent && profile && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mb-4" />
            <h2 className="font-heading font-bold text-lg text-foreground">Role Tidak Dikenal</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Akun Anda memiliki role &quot;{profile.role}&quot; yang belum didukung di dasbor ini. Hubungi admin untuk informasi lebih lanjut.
            </p>
            <button onClick={handleLogout} className="mt-6 px-4 py-2 text-xs font-medium text-brand-purple border border-brand-purple/30 rounded-lg hover:bg-brand-purple/10 transition-colors">
              Keluar
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
