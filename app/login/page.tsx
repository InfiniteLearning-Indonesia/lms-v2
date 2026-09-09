"use client";

import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, KeyRound, Loader2, Lock, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/ui-v3/states";
import { requestAuthChallenge } from "@/lib/api/auth";
import { ApiRequestError } from "@/lib/api/errors";

type LoginError = { title: string; description: string };

export default function LoginPage() {
  const t = useTranslations("login");
  const inFlight = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LoginError>();
  const [integrationPending, setIntegrationPending] = useState(false);

  async function startLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;

    inFlight.current = true;
    setLoading(true);
    setError(undefined);
    setIntegrationPending(false);

    try {
      await requestAuthChallenge();
      // The v3 contract currently exposes only an opaque nonce. Until FE01
      // freezes an identity-owner authorization URL, the browser must stop here.
      setIntegrationPending(true);
    } catch (caught) {
      let title = t("genericErrorTitle");
      let description = t("genericErrorBody");

      if (caught instanceof ApiRequestError) {
        if (caught.apiError.status === 401) {
          title = t("unauthorizedTitle");
          description = t("unauthorizedBody");
        } else if (caught.apiError.status === 429) {
          title = t("rateLimitTitle");
          description = t("rateLimitBody");
        } else if (caught.apiError.status === 503) {
          title = t("unavailableTitle");
          description = t("unavailableBody");
        }

        if (caught.apiError.request_id) {
          description = `${description} ${t("requestId", { requestId: caught.apiError.request_id })}`;
        }
      }

      setError({ title, description });
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-svh font-sans selection:bg-brand-purple/20 selection:text-brand-purple lg:grid-cols-2">
      <section
        aria-label="Infinite Learning"
        className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#12082b] via-brand-purple to-[#381a7d] p-12 text-white lg:flex"
      >
        <div className="pointer-events-none absolute -right-12 -top-12 size-80 rounded-full bg-brand-yellow/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 size-80 rounded-full bg-brand-purple/40 blur-3xl" />

        <div className="relative z-10">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <Image src="/logo-white.png" alt="Infinite Learning" width={180} height={32} className="h-7 w-auto" priority />
          </Link>
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <h2 className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-white md:text-4xl">
            {t("brandHeadline")}
          </h2>
          <p className="text-xs leading-relaxed text-white/80 md:text-sm">{t("brandDescription")}</p>
          <div className="space-y-2.5 border-t border-white/15 pt-4 text-xs font-medium text-white/90">
            <Benefit>{t("benefitMaterials")}</Benefit>
            <Benefit>{t("benefitAssessment")}</Benefit>
          </div>
        </div>

        <p className="relative z-10 pt-6 text-xs text-white/50">
          &copy; {new Date().getFullYear()} {t("copyright")}
        </p>
      </section>

      <section className="relative flex items-center justify-center bg-background p-6 sm:p-12">
        <div className="absolute right-6 top-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 flex items-center gap-2 text-foreground lg:hidden">
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span className="text-sm font-medium">{t("back")}</span>
          </Link>

          <div className="mb-6">
            <div className="mb-6 flex items-center lg:hidden">
              <Image src="/logo-black.png" alt="Infinite Learning" width={180} height={32} className="h-7 w-auto dark:hidden" priority />
              <Image src="/logo-white.png" alt="Infinite Learning" width={180} height={32} className="hidden h-7 w-auto dark:block" priority />
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{t("intro")}</p>
          </div>

          <div aria-live="polite">
            {error ? (
              <motion.div className="mb-4" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                <ErrorState title={error.title} description={error.description} />
              </motion.div>
            ) : null}
            {integrationPending ? (
              <motion.div
                role="status"
                className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="mb-2 size-5 text-amber-600" aria-hidden="true" />
                <h2 className="font-heading text-sm font-semibold">{t("pendingTitle")}</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("pendingBody")}</p>
              </motion.div>
            ) : null}
          </div>

          <form onSubmit={startLogin} className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-foreground">{t("email")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" aria-hidden="true" />
                <Input id="email" name="email" type="email" disabled placeholder={t("emailPlaceholder")} className="h-10 pl-9 text-xs" aria-describedby="credentials-note" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-foreground">{t("password")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" aria-hidden="true" />
                <Input id="password" name="password" type="password" disabled placeholder={t("passwordPlaceholder")} className="h-10 pl-9 text-xs" aria-describedby="credentials-note" />
              </div>
            </div>

            <p id="credentials-note" className="text-[11px] leading-relaxed text-muted-foreground">{t("credentialsManaged")}</p>

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-10 w-full bg-brand-purple font-heading text-xs font-bold text-white shadow-sm hover:bg-brand-purple-hover"
            >
              {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <KeyRound className="size-4" aria-hidden="true" />}
              {loading ? t("loading") : t("continue")}
            </Button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2 border-t border-border pt-4 text-center">
            <p className="text-[11px] leading-relaxed text-muted-foreground">{t("registeredHint")}</p>
            <Link href="/status" className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground underline transition-colors hover:text-brand-purple">
              {t("serviceStatus")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Benefit({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="size-1.5 rounded-full bg-brand-yellow" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
