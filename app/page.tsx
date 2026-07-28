"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Users,
  Brain,
  Code,
  Smartphone,
  Gamepad2,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { API_BASE_URL } from "@/lib/config";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/me`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          setIsLoggedIn(true);
        }
      })
      .catch((err) => {
        console.error("Auth check failed:", err);
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo-black.png" alt="Infinite Learning Logo" className="dark:hidden h-7 w-auto" />
            <img src="/logo-white.png" alt="Infinite Learning Logo" className="hidden dark:block h-7 w-auto" />
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-purple text-white font-heading font-medium text-sm hover:bg-brand-purple-hover transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-purple text-white font-heading font-medium text-sm hover:bg-brand-purple-hover transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-brand-purple to-brand-gradient-end overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 lg:py-40 text-white">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-2xl"
          >
            <motion.h1
              custom={0}
              variants={fadeUp}
              className="font-heading font-bold text-4xl md:text-5xl lg:text-[3.5rem] leading-tight tracking-tight text-balance"
            >
              Ruang belajar digital untuk masa depan pendidikan Indonesia.
            </motion.h1>
            <motion.p
              custom={1}
              variants={fadeUp}
              className="mt-6 text-lg text-white/80 leading-relaxed max-w-lg"
            >
              Satu platform yang menghubungkan siswa dan mentor dalam
              pengalaman belajar yang terstruktur, terukur, dan mudah diakses.
            </motion.p>
            <motion.div
              custom={2}
              variants={fadeUp}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-brand-purple font-heading font-semibold text-sm hover:bg-white/90 transition-colors"
              >
                Mulai sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#program"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/30 text-white font-heading font-medium text-sm hover:bg-white/10 transition-colors"
              >
                Pelajari lebih lanjut
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Subtle bottom curve instead of floating blobs */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background rounded-t-[2.5rem]" />
      </section>

      {/* ── Programs Section ── */}
      <section id="program" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-xl mb-16">
            <h2 className="font-heading font-bold text-2xl md:text-3xl tracking-tight text-foreground">
              Program Studi Pilihan
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Program studi intensif yang dirancang khusus untuk mempersiapkan karir profesional Anda di industri teknologi global.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: "AI Development",
                desc: "Pelajari konsep kecerdasan buatan, machine learning, deep learning, dan pengolahan data untuk membangun solusi masa depan.",
              },
              {
                icon: Code,
                title: "Web Development and UI/UX Design",
                desc: "Rancang antarmuka pengguna yang intuitif (UI/UX) dan bangun aplikasi web modern yang responsif, cepat, serta interaktif.",
              },
              {
                icon: Smartphone,
                title: "Mobile Development and UI/UX Design",
                desc: "Kembangkan aplikasi mobile berkinerja tinggi untuk iOS dan Android dengan desain antarmuka pengguna yang memikat.",
              },
              {
                icon: Gamepad2,
                title: "Game Development",
                desc: "Ciptakan dunia virtual dengan mempelajari logika game, desain aset, simulasi fisika, dan implementasi game engine.",
              },
            ].map((item, i) => (
              <motion.article
                key={item.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className="group border border-border rounded-xl p-6 bg-card hover:border-brand-purple/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-brand-purple/8 text-brand-purple flex items-center justify-center mb-5">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-semibold text-base text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Preview Card ── */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-2xl border border-border bg-secondary/40 p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-block px-3 py-1 rounded-md bg-brand-yellow/20 text-xs font-heading font-semibold text-foreground mb-4">
                  Tampilan Dashboard
                </span>
                <h2 className="font-heading font-bold text-2xl tracking-tight text-foreground mb-3">
                  Dirancang agar Anda langsung paham saat pertama kali membuka.
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Antarmuka yang bersih dan konsisten di setiap halaman. Tanpa
                  menu tersembunyi, tanpa kurva belajar yang curam.
                </p>
              </div>

              {/* Mini dashboard preview */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="border-b border-border px-5 py-3 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className="ml-3 text-xs text-muted-foreground font-heading">
                    Dashboard Siswa
                  </span>
                </div>
                <div className="p-5 space-y-4">
                  {/* Class banner */}
                  <div className="rounded-lg bg-gradient-to-r from-brand-purple to-brand-gradient-end p-4 text-white">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-yellow">
                      Kelas Aktif
                    </p>
                    <h4 className="font-heading font-bold text-base mt-1">
                      Dasar Pemrograman Web
                    </h4>
                    <p className="text-xs text-white/70 mt-0.5">
                      Mentor: Riyanda Azis Febrian
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 bg-white/20 h-1.5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "72%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="bg-brand-yellow h-full rounded-full"
                        />
                      </div>
                      <span className="text-[11px] font-semibold tabular-nums">
                        72%
                      </span>
                    </div>
                  </div>

                  {/* Task items */}
                  <div className="space-y-2">
                    {[
                      {
                        label: "Tugas 3: CSS Grid Layout",
                        meta: "Batas waktu: besok, 23:59",
                        icon: BookOpen,
                      },
                      {
                        label: "Diskusi: Responsive Design",
                        meta: "3 balasan baru",
                        icon: Users,
                      },
                    ].map((task) => (
                      <div
                        key={task.label}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:border-brand-purple/30 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-md bg-brand-purple/8 text-brand-purple flex items-center justify-center shrink-0">
                          <task.icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {task.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {task.meta}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-border bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <img src="/logo-black.png" alt="Infinite Learning Logo" className="dark:hidden h-5 w-auto" />
            <img src="/logo-white.png" alt="Infinite Learning Logo" className="hidden dark:block h-5 w-auto" />
          </div>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <Link href="ui" className="hover:text-foreground transition-colors">
              UI Components
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Kebijakan Privasi
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Infinite Learning. Hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
