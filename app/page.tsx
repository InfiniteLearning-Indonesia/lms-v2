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
  Sparkles,
  MapPin,
  Rocket,
  CheckCircle2,
  Layers,
  Laptop,
  Activity,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { API_BASE_URL } from "@/lib/config";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08 },
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
    <div className="flex flex-col min-h-screen bg-background font-sans selection:bg-brand-purple/20 selection:text-brand-purple">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo-black.png" alt="Infinite Learning Logo" className="dark:hidden h-7 w-auto" />
            <img src="/logo-white.png" alt="Infinite Learning Logo" className="hidden dark:block h-7 w-auto" />
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-purple text-white font-heading font-semibold text-xs hover:bg-brand-purple-hover transition-all shadow-sm shadow-brand-purple/20 hover:scale-[1.02]"
              >
                <span>Dashboard LMS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-purple text-white font-heading font-semibold text-xs hover:bg-brand-purple-hover transition-all shadow-sm shadow-brand-purple/20 hover:scale-[1.02]"
              >
                <span>Login Akun</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Left-Aligned Hero Section ── */}
      <section className="relative bg-gradient-to-br from-[#12082b] via-brand-purple to-[#381a7d] overflow-hidden text-white">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-brand-purple/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 lg:py-36 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-2xl text-left"
          >
            {/* Light Badge */}
            <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-brand-yellow mb-6">
              <MapPin className="w-3.5 h-3.5 text-brand-yellow" />
              <span>Infinite Learning Indonesia • Nongsa Digital Park, Batam</span>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.15] tracking-tight text-white text-balance"
            >
              Ruang belajar digital & ekosistem talenta teknologi masa depan.
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="mt-5 text-sm sm:text-base md:text-lg text-white/85 leading-relaxed max-w-xl font-sans"
            >
              Platform LMS terpadu untuk mendampingi pembelajaran interaktif, pengerjaan tugas berbasis proyek, serta penguasaan kompetensi teknologi praktis secara terstruktur.
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center gap-3.5"
            >
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-brand-purple font-heading font-bold text-xs hover:bg-white/95 transition-all shadow-md hover:scale-[1.02] cursor-pointer"
              >
                <span>Mulai Belajar Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#program"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/25 bg-white/5 backdrop-blur-md text-white font-heading font-medium text-xs hover:bg-white/15 transition-all cursor-pointer"
              >
                <span>Jelajahi Program</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Soft transition curve to white/background */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-background rounded-t-[2rem]" />
      </section>

      {/* ── Key Highlights (Light Info) Section ── */}
      <section className="py-14 border-b border-border/60 bg-secondary/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Rocket,
                title: "Pembelajaran Berbasis Proyek",
                desc: "Siswa diajak langsung menyelesaikan studi kasus & produk digital dunia nyata.",
              },
              {
                icon: Users,
                title: "Pendampingan Mentor Spesialis",
                desc: "Bimbingan langsung dari praktisi industri teknologi yang berpengalaman di bidangnya.",
              },
              {
                icon: Laptop,
                title: "Kurikulum Praktis & Relevan",
                desc: "Materi terstruktur yang mengombinasikan keahlian teknis (hard skills) dan soft skills.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className="p-5 rounded-2xl border border-border bg-card shadow-2xs flex items-start gap-4"
              >
                <div className="p-2.5 rounded-xl bg-brand-purple/10 text-brand-purple shrink-0">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-foreground">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Programs Section ── */}
      <section id="program" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-xl mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple text-xs font-bold font-heading mb-3">
              <Layers className="w-3.5 h-3.5" />
              Pilihan Spesialisasi
            </span>
            <h2 className="font-heading font-bold text-2xl md:text-3xl tracking-tight text-foreground">
              Program Studi & Jalur Karir Teknologi
            </h2>
            <p className="mt-2.5 text-xs md:text-sm text-muted-foreground leading-relaxed">
              Program pelatihan intensif yang dirancang untuk membangun portofolio dan kesiapan karir digital Anda.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: "AI Development",
                badge: "Intensif",
                desc: "Konsep kecerdasan buatan, machine learning, deep learning, dan pengolahan data praktis.",
              },
              {
                icon: Code,
                title: "Web Development & UI/UX",
                badge: "Populer",
                desc: "Desain antarmuka modern (UI/UX) dan pengembangan aplikasi web yang responsif & cepat.",
              },
              {
                icon: Smartphone,
                title: "Mobile Development & UI/UX",
                badge: "Populer",
                desc: "Pengembangan aplikasi mobile berkinerja tinggi untuk Android & iOS dengan antarmuka memikat.",
              },
              {
                icon: Gamepad2,
                title: "Game Development",
                badge: "Kreatif",
                desc: "Logika permainan, desain aset 2D/3D, simulasi fisika, dan implementasi game engine modern.",
              },
            ].map((item, i) => (
              <motion.article
                key={item.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className="group border border-border/80 rounded-2xl p-6 bg-card hover:border-brand-purple/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-base text-foreground mb-2 group-hover:text-brand-purple transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 flex items-center text-xs font-semibold text-brand-purple gap-1">
                  <span>Lihat Kurikulum</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Preview Card Section ── */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-3xl border border-border bg-secondary/30 p-8 md:p-12 shadow-xs">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-yellow/20 text-xs font-heading font-bold text-amber-800 dark:text-brand-yellow">
                  <Sparkles className="w-3.5 h-3.5" />
                  Pengalaman Pengguna Simpel
                </span>
                <h2 className="font-heading font-extrabold text-2xl md:text-3xl tracking-tight text-foreground">
                  Antarmuka ringkas yang langsung dapat dipahami sejak hari pertama.
                </h2>
                <p className="text-muted-foreground leading-relaxed text-xs md:text-sm">
                  Seluruh jadwal kelas, silabus modul, pengumpulan tugas, dan absensi tersusun rapi tanpa kerumitan menu. Fokus belajar tanpa hambatan navigasi.
                </p>
                <div className="pt-2 space-y-2 text-xs text-foreground font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Rekap nilai & rubrik kriteria transparan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Akses cepat materi PDF, Video, & Link Praktik</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Pengingat batas waktu tugas otomatis</span>
                  </div>
                </div>
              </div>

              {/* Mini Dashboard Preview Mockup */}
              <div className="bg-card border border-border/80 rounded-2xl shadow-lg overflow-hidden">
                <div className="border-b border-border px-5 py-3.5 flex items-center justify-between bg-secondary/40">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs text-muted-foreground font-heading font-medium">
                    Infinite Learning LMS
                  </span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="rounded-xl bg-gradient-to-r from-brand-purple to-brand-gradient-end p-4 text-white shadow-xs">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-brand-yellow">
                      Kelas Aktif
                    </p>
                    <h4 className="font-heading font-bold text-base mt-1">
                      Web Development & UI/UX Design
                    </h4>
                    <p className="text-xs text-white/70 mt-0.5">
                      Batch 7 • Pembelajaran Cohort
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 bg-white/20 h-1.5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "75%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="bg-brand-yellow h-full rounded-full"
                        />
                      </div>
                      <span className="text-[11px] font-semibold tabular-nums">
                        75%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        label: "Tugas 3: Responsive Grid Layout",
                        meta: "Batas waktu: Besok, 23:59 WIB",
                        icon: BookOpen,
                      },
                      {
                        label: "Modul Praktik: React & Tailwind",
                        meta: "Materi PDF & Video Pembelajaran",
                        icon: Code,
                      },
                    ].map((task) => (
                      <div
                        key={task.label}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:border-brand-purple/30 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-brand-purple/10 text-brand-purple flex items-center justify-center shrink-0">
                          <task.icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {task.label}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
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
      <footer className="mt-auto border-t border-border/80 bg-card py-10 font-sans">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo-black.png" alt="Infinite Learning Logo" className="dark:hidden h-5 w-auto" />
            <img src="/logo-white.png" alt="Infinite Learning Logo" className="hidden dark:block h-5 w-auto" />
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/status" className="underline inline-flex items-center gap-1.5 hover:text-brand-purple transition-colors">
              <span>Status Layanan</span>
            </Link>
            <span>•</span>
            <p>&copy; {new Date().getFullYear()} Infinite Learning Indonesia. Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

