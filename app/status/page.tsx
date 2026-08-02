'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '@/lib/config';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Activity,
  Server,
  Database,
  Clock,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface HealthData {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptimeSeconds: number;
  database: { status: string; latencyMs: number };
  memory: { rssMb: number; heapTotalMb: number; heapUsedMb: number };
}

interface DayUptime {
  date: string;
  uptimePercent: number | null;
  status: 'operational' | 'degraded' | 'outage' | 'no-data';
  incident: string | null;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  day: DayUptime | null;
}

// ─── Uptime Bar ───────────────────────────────────────────────────────────────

function UptimeBar({ days, label }: { days: DayUptime[]; label: string }) {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, day: null });
  const containerRef = useRef<HTMLDivElement>(null);

  const overallPercent =
    days.filter((d) => d.uptimePercent !== null).length === 0
      ? null
      : +(
          days
            .filter((d) => d.uptimePercent !== null)
            .reduce((acc, d) => acc + (d.uptimePercent ?? 100), 0) /
          days.filter((d) => d.uptimePercent !== null).length
        ).toFixed(1);

  const hasIssues = days.some((d) => d.status === 'degraded' || d.status === 'outage');

  const barColor = (status: DayUptime['status']) => {
    switch (status) {
      case 'operational': return 'bg-emerald-500 hover:bg-emerald-400';
      case 'degraded': return 'bg-amber-400 hover:bg-amber-300';
      case 'outage': return 'bg-red-500 hover:bg-red-400';
      case 'no-data': return 'bg-border hover:bg-muted-foreground/40';
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, day: DayUptime) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 12,
      day,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip((prev) => ({ ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top - 12 }));
  };

  return (
    <div className="border border-border/80 rounded-2xl bg-card p-5 space-y-3">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`h-2 w-2 rounded-full ${hasIssues ? 'bg-amber-400' : 'bg-emerald-500'}`} />
          <span className="text-sm font-heading font-semibold text-foreground">{label}</span>
        </div>
        <span className={`text-xs font-mono font-semibold ${hasIssues ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
          {overallPercent === null ? 'Mulai merekam...' : `${overallPercent}% uptime`}
        </span>
      </div>

      {/* Bar Strip */}
      <div
        ref={containerRef}
        className="relative select-none"
        onMouseLeave={() => setTooltip((p) => ({ ...p, visible: false }))}
      >
        <div className="flex gap-[2px] h-8 items-end">
          {days.map((day, i) => (
            <div
              key={day.date}
              className={`flex-1 h-full rounded-[2px] transition-all duration-100 cursor-default ${barColor(day.status)}`}
              onMouseEnter={(e) => handleMouseEnter(e, day)}
              onMouseMove={handleMouseMove}
              aria-label={`${day.date}: ${day.status}`}
            />
          ))}
        </div>

        {/* Tooltip */}
        {tooltip.visible && tooltip.day && (
          <div
            className="absolute z-50 pointer-events-none"
            style={{ left: Math.min(tooltip.x, (containerRef.current?.offsetWidth ?? 300) - 220), top: tooltip.y - 70 }}
          >
            <div className="bg-popover border border-border rounded-xl shadow-xl p-3 w-52 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-semibold text-foreground">{tooltip.day.date}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  tooltip.day.status === 'operational' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                  tooltip.day.status === 'degraded' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                  tooltip.day.status === 'outage' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {tooltip.day.status === 'operational' ? 'Operational' :
                   tooltip.day.status === 'degraded' ? 'Degraded' :
                   tooltip.day.status === 'outage' ? 'Outage' : 'No Data'}
                </span>
              </div>
              {tooltip.day.uptimePercent !== null && (
                <p className="text-xs text-muted-foreground">
                  Uptime: <strong className="text-foreground">{tooltip.day.uptimePercent}%</strong>
                </p>
              )}
              {tooltip.day.incident && (
                <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border pt-1.5">
                  {tooltip.day.incident}
                </p>
              )}
              {tooltip.day.status === 'no-data' && (
                <p className="text-[10px] text-muted-foreground">Belum ada data untuk hari ini.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer labels */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-sans">
        <span>90 hari lalu</span>
        <span>Hari ini</span>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function StatusPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [dailyData, setDailyData] = useState<DayUptime[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [lastCheck, setLastCheck] = useState('');

  const fetchStatus = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (!res.ok) throw new Error();
      setData(await res.json());
      setError(false);
      setLastCheck(
        new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          timeZone: 'Asia/Jakarta',
        }) + ' WIB'
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchDaily = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health/daily?days=90`);
      if (!res.ok) return;
      setDailyData(await res.json());
    } finally {
      setDailyLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchDaily();
    const iv = setInterval(() => { fetchStatus(); fetchDaily(); }, 30000);
    return () => clearInterval(iv);
  }, []);

  const formatUptime = (s: number) => {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (d > 0) return `${d}h ${h}j`;
    if (h > 0) return `${h}j ${m}m`;
    return `${m}m ${Math.floor(s % 60)}d`;
  };

  const overallStatus = error || !data
    ? { label: 'Sistem Offline', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle }
    : data.status === 'ok'
    ? { label: 'Semua Sistem Beroperasi Normal', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 }
    : { label: 'Performa Terdegradasi', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: AlertTriangle };

  const StatusIcon = overallStatus.icon;

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans text-foreground selection:bg-brand-purple/20 selection:text-brand-purple">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/80">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <img src="/logo-black.png" alt="Infinite Learning" className="dark:hidden h-7 w-auto" />
              <img src="/logo-white.png" alt="Infinite Learning" className="hidden dark:block h-7 w-auto" />
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="text-xs font-heading font-semibold text-muted-foreground hidden sm:inline-flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-brand-purple" />
              System Status
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-purple text-white font-heading font-semibold text-xs hover:opacity-90 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kembali ke LMS</span>
              <span className="sm:hidden">LMS</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-8 space-y-6">

        {/* ── Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a103c] via-[#2d1b69] to-[#1e144a] p-6 md:p-8 text-white shadow-lg border border-white/10"
        >
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-brand-purple/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-brand-yellow/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-brand-yellow">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>System Monitor</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">
                Status Layanan LMS
              </h1>
              <p className="text-sm text-white/75 leading-relaxed font-sans max-w-xl">
                Monitor real-time ketersediaan layanan, latensi database, dan kesehatan server Infinite Learning.
              </p>
            </div>
            {loading ? (
              <Skeleton className="h-12 w-52 bg-white/20 rounded-2xl shrink-0" />
            ) : (
              <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl border backdrop-blur-md shrink-0 ${
                error ? 'bg-red-500/20 border-red-400/30' :
                data?.status === 'ok' ? 'bg-emerald-500/20 border-emerald-400/30' :
                'bg-amber-500/20 border-amber-400/30'
              }`}>
                {error ? <XCircle className="w-5 h-5 text-red-400 animate-pulse" /> :
                 data?.status === 'ok' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> :
                 <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />}
                <div>
                  <p className="text-[11px] text-white/60 font-medium">Status Sistem</p>
                  <p className="text-sm font-bold font-heading">
                    {error ? 'Offline' : data?.status === 'ok' ? 'Operational' : 'Degraded'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Overall Status Bar ── */}
        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${overallStatus.bg}`}>
          <StatusIcon className={`w-5 h-5 shrink-0 ${overallStatus.color}`} />
          <span className={`text-sm font-heading font-semibold ${overallStatus.color}`}>
            {overallStatus.label}
          </span>
          <div className="ml-auto flex items-center gap-2.5">
            {lastCheck && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Dicek: {lastCheck}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => { fetchStatus(true); fetchDaily(); }}
              disabled={isRefreshing || loading}
              className="h-8 rounded-xl gap-1.5 text-xs font-heading font-semibold cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* ── Metrics Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: 'API Backend',
              value: loading ? null : error ? 'Down' : data?.status,
              sub: loading ? null : error ? 'Gagal terhubung' : 'REST API berjalan normal',
              icon: Activity,
              iconClass: loading || error ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400',
            },
            {
              label: 'Database',
              value: loading ? null : error ? 'Offline' : data?.database.status,
              sub: loading ? null : `Latensi: ${data?.database.latencyMs ?? '—'}ms`,
              icon: Database,
              iconClass: 'text-brand-purple',
            },
            {
              label: 'Memory (RSS)',
              value: loading ? null : error ? '—' : `${data?.memory.rssMb} MB`,
              sub: 'Batas VPS: 1920 MB',
              icon: Server,
              iconClass: 'text-blue-500',
            },
            {
              label: 'Uptime',
              value: loading ? null : error ? '—' : formatUptime(data?.uptimeSeconds ?? 0),
              sub: 'Sejak restart terakhir',
              icon: Clock,
              iconClass: 'text-amber-500',
            },
          ].map((m) => (
            <div key={m.label} className="border border-border/80 bg-card rounded-2xl p-4 space-y-3 hover:border-brand-purple/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-sans">{m.label}</span>
                <m.icon className={`w-4 h-4 ${m.iconClass}`} />
              </div>
              {m.value === null ? (
                <Skeleton className="h-6 w-20 bg-muted" />
              ) : (
                <p className="text-lg font-heading font-bold text-foreground capitalize">{m.value}</p>
              )}
              <p className="text-[11px] text-muted-foreground border-t border-border/50 pt-2">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Uptime History ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-heading font-semibold text-foreground">Riwayat Uptime — 90 Hari Terakhir</h2>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-sans">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500 inline-block" /> Operational</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-amber-400 inline-block" /> Degraded</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-red-500 inline-block" /> Outage</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-border inline-block" /> No data</span>
            </div>
          </div>

          {dailyLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          ) : (
            <div className="space-y-3">
              <UptimeBar days={dailyData} label="API Backend & Server" />
              <UptimeBar days={dailyData} label="Database Supabase" />
            </div>
          )}
        </div>

        {/* ── Info Note ── */}
        <p className="text-xs text-muted-foreground text-center pb-2 font-sans">
          Data diperbarui otomatis setiap 30 detik. Monitoring dimulai dari 02/08/2026.
          Hover bar untuk melihat detail insiden harian.
        </p>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/80 bg-card py-6">
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo-black.png" alt="Infinite Learning" className="dark:hidden h-5 w-auto" />
            <img src="/logo-white.png" alt="Infinite Learning" className="hidden dark:block h-5 w-auto" />
          </div>
          <p className="text-xs text-muted-foreground text-center sm:text-right font-sans">
            &copy; {new Date().getFullYear()} Infinite Learning Indonesia. System Health Monitor.
          </p>
        </div>
      </footer>
    </div>
  );
}
