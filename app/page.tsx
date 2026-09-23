import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { PublicHeader } from "@/components/public/public-header";

export const metadata: Metadata = {
  title: "Ruang Belajar | Infinite Learning LMS",
  description: "Workspace pembelajaran Infinite Learning yang kontekstual, transparan, dan disiapkan untuk integrasi identity owner.",
};

export default async function LandingPage() {
  const t = await getTranslations("public");
  const features = [
    { icon: BookOpenCheck, title: t("features.context.title"), description: t("features.context.description") },
    { icon: UsersRound, title: t("features.roles.title"), description: t("features.roles.description") },
    { icon: ShieldCheck, title: t("features.integrity.title"), description: t("features.integrity.description") },
  ];
  const audiences = [
    { icon: GraduationCap, title: t("audiences.student.title"), description: t("audiences.student.description") },
    { icon: BookOpenCheck, title: t("audiences.teacher.title"), description: t("audiences.teacher.description") },
    { icon: ShieldCheck, title: t("audiences.admin.title"), description: t("audiences.admin.description") },
  ];

  return (
    <main id="main-content" className="min-h-svh overflow-hidden bg-background">
      <a href="#landing-content" className="skip-link">{t("skipToContent")}</a>
      <PublicHeader homeLabel={t("nav.home")} navigationLabel={t("nav.label")} statusLabel={t("nav.status")} loginLabel={t("nav.login")} />

      <div id="landing-content">
        <section className="relative isolate border-b bg-[linear-gradient(145deg,#16072f_0%,#3b1678_52%,#1d164d_100%)] text-white">
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-35 [background-image:radial-gradient(circle_at_18%_18%,rgba(255,205,41,0.28),transparent_22%),radial-gradient(circle_at_82%_28%,rgba(138,61,255,0.55),transparent_32%)]" />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.72fr)] lg:py-28">
            <div>
              <p className="inline-flex min-h-8 items-center rounded-full border border-white/20 bg-white/10 px-3 text-xs font-semibold tracking-wide text-brand-yellow">{t("hero.eyebrow")}</p>
              <h1 className="mt-5 max-w-3xl font-heading text-4xl font-bold leading-[1.1] tracking-tight text-balance sm:text-5xl lg:text-6xl">{t("hero.title")}</h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/82 sm:text-lg sm:leading-8">{t("hero.description")}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/status" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[#35136f] transition-colors hover:bg-white/90">
                  {t("hero.primaryCta")}<ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link href="/login" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/35 bg-white/5 px-5 text-sm font-bold text-white transition-colors hover:bg-white/10">{t("hero.secondaryCta")}</Link>
              </div>
              <p className="mt-5 flex max-w-xl items-start gap-2 text-sm leading-6 text-white/72">
                <LockKeyhole className="mt-0.5 size-4 shrink-0 text-brand-yellow" aria-hidden="true" />{t("hero.securityNote")}
              </p>
            </div>

            <aside aria-labelledby="readiness-title" className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/15 backdrop-blur-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-yellow">{t("readiness.eyebrow")}</p>
              <h2 id="readiness-title" className="mt-2 font-heading text-xl font-semibold text-white">{t("readiness.title")}</h2>
              <div className="mt-5 space-y-3">
                <ReadinessItem icon={CheckCircle2} label={t("readiness.publicUi")} state={t("readiness.available")} tone="ready" />
                <ReadinessItem icon={Clock3} label={t("readiness.login")} state={t("readiness.waitingOwner")} />
                <ReadinessItem icon={Clock3} label={t("readiness.integration")} state={t("readiness.waitingBackend")} />
              </div>
              <p className="mt-5 border-t border-white/15 pt-4 text-xs leading-5 text-white/68">{t("readiness.note")}</p>
            </aside>
          </div>
        </section>

        <section aria-labelledby="foundation-title" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">{t("features.eyebrow")}</p>
            <h2 id="foundation-title" className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">{t("features.title")}</h2>
            <p className="mt-4 leading-7 text-muted-foreground">{t("features.description")}</p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-2xl border bg-card p-6 shadow-sm shadow-black/[0.03]">
                <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" aria-hidden="true" /></div>
                <h3 className="mt-5 font-heading text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="audience-title" className="border-y bg-muted/35">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-primary">{t("audiences.eyebrow")}</p>
              <h2 id="audience-title" className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">{t("audiences.title")}</h2>
            </div>
            <div className="mt-9 grid gap-4 lg:grid-cols-3">
              {audiences.map(({ icon: Icon, title, description }) => (
                <article key={title} className="flex gap-4 rounded-2xl border bg-background p-5">
                  <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <div><h3 className="font-heading font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-col justify-between gap-6 rounded-3xl border bg-card p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl"><h2 className="font-heading text-2xl font-bold">{t("closing.title")}</h2><p className="mt-2 leading-7 text-muted-foreground">{t("closing.description")}</p></div>
            <Link href="/status" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/85">
              {t("closing.cta")}<ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>

      <footer className="border-t bg-muted/25">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          <Link href="/status" className="inline-flex min-h-11 items-center rounded-lg font-semibold text-foreground hover:text-primary">{t("nav.status")}</Link>
        </div>
      </footer>
    </main>
  );
}

function ReadinessItem({ icon: Icon, label, state, tone = "waiting" }: { icon: typeof Clock3; label: string; state: string; tone?: "ready" | "waiting" }) {
  return (
    <div className="flex min-h-15 items-center gap-3 rounded-2xl border border-white/12 bg-black/10 px-4 py-3">
      <Icon className={`size-5 shrink-0 ${tone === "ready" ? "text-emerald-300" : "text-brand-yellow"}`} aria-hidden="true" />
      <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-white">{label}</p><p className="mt-0.5 text-xs leading-5 text-white/68">{state}</p></div>
    </div>
  );
}
