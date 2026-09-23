import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("public.notFound");
  return (
    <main className="grid min-h-svh place-items-center bg-muted/20 px-4 py-12">
      <section className="w-full max-w-lg rounded-3xl border bg-card p-7 text-center shadow-sm sm:p-10">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><FileQuestion className="size-6" aria-hidden="true" /></div>
        <h1 className="mt-5 font-heading text-2xl font-bold">{t("title")}</h1>
        <p className="mt-3 leading-7 text-muted-foreground">{t("description")}</p>
        <Link href="/" className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/85">
          <ArrowLeft className="size-4" aria-hidden="true" />{t("home")}
        </Link>
      </section>
    </main>
  );
}
