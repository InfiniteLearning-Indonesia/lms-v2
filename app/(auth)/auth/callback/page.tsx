import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * FE00 deliberately does not consume callback query parameters. The browser
 * identity contract (redirect, one-time code, exchange and CSRF bootstrap) is
 * an explicit FE01 dependency.
 */
export default async function AuthCallbackPage() {
  const t = await getTranslations("login");

  return (
    <main className="grid min-h-svh place-items-center bg-muted/20 p-5">
      <div role="status" className="w-full max-w-lg rounded-2xl border bg-card p-7 shadow-sm">
        <AlertCircle className="mb-4 size-7 text-amber-600" aria-hidden="true" />
        <h1 className="font-heading text-xl font-semibold">{t("callbackTitle")}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("callbackBody")}</p>
        <Link href="/login" className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>
          <ArrowLeft className="size-4" aria-hidden="true" />{t("back")}
        </Link>
      </div>
    </main>
  );
}
