import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock3, Info, LockKeyhole } from "lucide-react";
import { PublicHeader } from "@/components/public/public-header";

export const metadata: Metadata = {
  title: "Status Layanan",
  description: "Status kesiapan antarmuka dan dependency integrasi Infinite Learning LMS.",
};

export default async function StatusPage() {
  const t = await getTranslations("public");

  return (
    <main id="main-content" className="min-h-svh bg-muted/20">
      <a href="#status-content" className="skip-link">{t("skipToContent")}</a>
      <PublicHeader homeLabel={t("nav.home")} navigationLabel={t("nav.label")} statusLabel={t("nav.status")} loginLabel={t("nav.login")} />
      <div id="status-content" className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" aria-hidden="true" />{t("status.back")}</Link>
        <section aria-labelledby="status-title" className="mt-6">
          <p className="inline-flex min-h-8 items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3 text-xs font-semibold text-amber-700 dark:text-amber-300">{t("status.eyebrow")}</p>
          <h1 id="status-title" className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">{t("status.title")}</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{t("status.description")}</p>
        </section>

        <section aria-labelledby="service-status-title" className="mt-9 overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="border-b px-5 py-4 sm:px-6"><h2 id="service-status-title" className="font-heading text-lg font-semibold">{t("status.servicesTitle")}</h2></div>
          <div className="divide-y">
            <StatusItem icon={CheckCircle2} label={t("status.services.publicUi.label")} description={t("status.services.publicUi.description")} state={t("status.states.available")} tone="ready" />
            <StatusItem icon={Clock3} label={t("status.services.identity.label")} description={t("status.services.identity.description")} state={t("status.states.waitingOwner")} tone="waiting" />
            <StatusItem icon={Clock3} label={t("status.services.backend.label")} description={t("status.services.backend.description")} state={t("status.states.waitingBackend")} tone="waiting" />
            <StatusItem icon={AlertTriangle} label={t("status.services.journey.label")} description={t("status.services.journey.description")} state={t("status.states.notVerified")} tone="unknown" />
          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <aside className="rounded-2xl border bg-card p-5 sm:p-6"><LockKeyhole className="size-5 text-primary" aria-hidden="true" /><h2 className="mt-4 font-heading font-semibold">{t("status.safety.title")}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{t("status.safety.description")}</p></aside>
          <aside className="rounded-2xl border bg-card p-5 sm:p-6"><Info className="size-5 text-primary" aria-hidden="true" /><h2 className="mt-4 font-heading font-semibold">{t("status.freshness.title")}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{t("status.freshness.description")}</p></aside>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/login" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/85">{t("status.loginCta")}</Link>
          <Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-xl border bg-background px-5 text-sm font-bold transition-colors hover:bg-muted">{t("status.homeCta")}</Link>
        </div>
      </div>
    </main>
  );
}

function StatusItem({ icon: Icon, label, description, state, tone }: { icon: typeof Clock3; label: string; description: string; state: string; tone: "ready" | "waiting" | "unknown" }) {
  const toneClass = tone === "ready" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : tone === "waiting" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-muted text-muted-foreground";
  return (
    <article className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 gap-3"><Icon className={`mt-0.5 size-5 shrink-0 ${tone === "ready" ? "text-emerald-600 dark:text-emerald-300" : tone === "waiting" ? "text-amber-600 dark:text-amber-300" : "text-muted-foreground"}`} aria-hidden="true" /><div><h3 className="font-heading text-sm font-semibold">{label}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p></div></div>
      <span className={`ml-8 inline-flex min-h-8 w-fit shrink-0 items-center rounded-full px-3 text-xs font-semibold sm:ml-4 ${toneClass}`}>{state}</span>
    </article>
  );
}
