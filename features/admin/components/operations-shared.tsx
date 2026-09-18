import { AlertTriangle, CheckCircle2, Clock3, Info, LoaderCircle, ShieldAlert, XCircle } from "lucide-react";
import type { AdminJobViewModel } from "../model";

const stateClasses: Record<string, string> = {
  ACTIVE: "border-emerald-600/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  VERIFIED: "border-emerald-600/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  FRESH: "border-emerald-600/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  SUCCESS: "border-emerald-600/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  succeeded: "border-emerald-600/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  DISABLED: "border-border bg-muted text-muted-foreground",
  LOCKED: "border-amber-600/30 bg-amber-500/10 text-amber-900 dark:text-amber-100",
  INVITED: "border-blue-600/30 bg-blue-500/10 text-blue-800 dark:text-blue-200",
  PROVISIONING_PENDING: "border-blue-600/30 bg-blue-500/10 text-blue-800 dark:text-blue-200",
  running: "border-blue-600/30 bg-blue-500/10 text-blue-800 dark:text-blue-200",
  queued: "border-border bg-muted text-foreground",
  EVIDENCE_PENDING: "border-amber-600/30 bg-amber-500/10 text-amber-900 dark:text-amber-100",
  STALE: "border-amber-600/30 bg-amber-500/10 text-amber-900 dark:text-amber-100",
  DENIED: "border-amber-600/30 bg-amber-500/10 text-amber-900 dark:text-amber-100",
  partial: "border-amber-600/30 bg-amber-500/10 text-amber-900 dark:text-amber-100",
  INVITATION_EXPIRED: "border-destructive/30 bg-destructive/10 text-destructive",
  BLOCKED: "border-destructive/30 bg-destructive/10 text-destructive",
  FAILED: "border-destructive/30 bg-destructive/10 text-destructive",
  failed: "border-destructive/30 bg-destructive/10 text-destructive",
  UNAVAILABLE: "border-border bg-muted text-muted-foreground",
  UNKNOWN: "border-border bg-muted text-muted-foreground",
};

export function StatusBadge({ state, label }: { state: string; label: string }) {
  return <span className={`inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${stateClasses[state] ?? "border-border bg-muted text-foreground"}`}>{label}</span>;
}

export function DependencyNotice({ id, title, description, tone = "info" }: { id: string; title: string; description: string; tone?: "info" | "warning" }) {
  const Icon = tone === "warning" ? AlertTriangle : Info;
  return (
    <aside id={id} className={`flex gap-3 rounded-xl border p-4 ${tone === "warning" ? "border-amber-500/30 bg-amber-500/5" : "border-primary/20 bg-primary/5"}`}>
      <Icon className={`mt-0.5 size-5 shrink-0 ${tone === "warning" ? "text-amber-700 dark:text-amber-300" : "text-primary"}`} aria-hidden="true" />
      <div><p className="font-heading text-sm font-semibold">{title}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p></div>
    </aside>
  );
}

export function JobStatusList({ jobs, title, description, stateLabels }: { jobs: AdminJobViewModel[]; title: string; description: string; stateLabels: Record<AdminJobViewModel["state"], string> }) {
  return (
    <section className="rounded-xl border bg-card" aria-labelledby="admin-jobs-title">
      <div className="border-b p-4 sm:p-5"><h2 id="admin-jobs-title" className="font-heading text-lg font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>
      <div className="divide-y">
        {jobs.map((job) => {
          const Icon = job.state === "succeeded" ? CheckCircle2 : job.state === "failed" ? XCircle : job.state === "running" ? LoaderCircle : job.state === "partial" ? ShieldAlert : Clock3;
          return (
            <article key={job.id} className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:p-5">
              <div className="flex min-w-0 gap-3">
                <Icon className={`mt-0.5 size-5 shrink-0 ${job.state === "failed" ? "text-destructive" : "text-primary"}`} aria-hidden="true" />
                <div className="min-w-0"><h3 className="font-heading text-sm font-semibold">{job.label}</h3><p className="mt-1 text-xs text-muted-foreground">{formatAdminDate(job.updatedAt)} · {job.attempts} attempt{job.receiptId ? ` · ${job.receiptId}` : ""}</p>{job.detail ? <p className="mt-2 text-sm text-muted-foreground">{job.detail}</p> : null}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end"><StatusBadge state={job.state} label={stateLabels[job.state]} />{job.progress !== undefined ? <span className="text-xs font-semibold tabular-nums text-muted-foreground">{job.progress}%</span> : null}</div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function formatAdminDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(value));
}
