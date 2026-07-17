"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  LayoutDashboard,
  Shield,
  User,
  Settings,
  ChevronDown,
  ArrowLeft,
  BookOpen,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "admin" | "mentor" | "student";
  roles?: ("admin" | "mentor" | "student")[];
  status: "invited" | "active" | "suspended";
  avatarUrl: string | null;
}

interface NavbarProps {
  profile: UserProfile | null;
  onLogout: () => void;
  title?: string;
  showBackButton?: boolean;
  backUrl?: string;
}

export function Navbar({ profile, onLogout, title = "Dasbor Utama", showBackButton = false, backUrl }: NavbarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const getEffectiveAvatar = () => {
    if (!profile) return "/avatars/avatar_1.png";
    if (profile.avatarUrl) return profile.avatarUrl;
    const code = profile.id ? profile.id.charCodeAt(0) + profile.id.charCodeAt(profile.id.length - 1) : 1;
    const index = (code % 5) + 1;
    return `/avatars/avatar_${index}.png`;
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border px-6 h-16 flex items-center justify-between shadow-xs">
      {/* Brand & Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center hover:opacity-90 transition-opacity">
          <img src="/logo-black.png" alt="Infinite Learning Logo" className="dark:hidden h-7 w-auto" />
          <img src="/logo-white.png" alt="Infinite Learning Logo" className="hidden dark:block h-7 w-auto" />
        </Link>
        <span className="text-border font-light text-sm">|</span>
        <span className="font-heading font-medium text-sm text-muted-foreground flex items-center gap-1.5">
          <LayoutDashboard className="w-4 h-4 text-brand-purple" />
          {title}
        </span>
      </div>

      {/* Quick Actions & Profile Dropdown */}
      <div className="flex items-center gap-4">
        {/* Back Button (if requested) */}
        {showBackButton && (
          <Link
            href={backUrl || "/dashboard"}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors border border-border px-3 py-1.5 rounded-lg bg-card shadow-2xs hover:bg-muted/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kembali</span>
          </Link>
        )}

        <ThemeToggle />

        {/* User Menu Trigger */}
        {profile && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2.5 p-1 px-2 rounded-full border border-border/80 bg-secondary/30 hover:bg-secondary/60 hover:border-brand-purple/40 transition-all duration-200 cursor-pointer shadow-2xs group"
            >
              <img
                src={getEffectiveAvatar()}
                alt={profile.name}
                className="w-8 h-8 rounded-full object-cover border border-border shadow-2xs"
              />
              <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground hidden md:inline-block transition-colors max-w-[120px] truncate">
                {profile.name}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-2.5 w-64 rounded-xl border border-border bg-card shadow-lg p-2.5 space-y-2 overflow-hidden text-sm"
                >
                  {/* User Profile Header Summary */}
                  <div className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg border border-border/30">
                    <img
                      src={getEffectiveAvatar()}
                      alt={profile.name}
                      className="w-10 h-10 rounded-full object-cover border border-border"
                    />
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="font-heading font-bold text-xs text-foreground truncate">{profile.name}</h4>
                      <p className="text-[10px] text-muted-foreground truncate">{profile.email}</p>
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.25 rounded-full text-[9px] font-bold uppercase tracking-wider border ${roleColors[profile.role]}`}>
                        <Shield className="w-2 h-2 shrink-0" />
                        {roleLabels[profile.role]}
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Options */}
                  <div className="space-y-0.5 pt-1">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/dashboard");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors text-left"
                    >
                      <LayoutDashboard className="w-4 h-4 text-brand-purple shrink-0" />
                      <span>Dasbor Utama</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/dashboard?tab=settings");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors text-left"
                    >
                      <Settings className="w-4 h-4 text-brand-purple shrink-0" />
                      <span>Pengaturan Profil</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border/60 my-1" />

                  {/* Logout Option */}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Keluar Sesi</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
