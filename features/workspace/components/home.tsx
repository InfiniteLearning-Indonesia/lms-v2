"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, BookOpenCheck, Clock3, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui-v3/page-header";
import { EmptyState } from "@/components/ui-v3/states";
import { useActorSession } from "@/lib/auth/provider";
import { useClassContext } from "../context";

export function WorkspaceHomeContent() {
  const t = useTranslations("workspace");
  const { actor } = useActorSession();
  const { availableClasses, classSearch, directoryAvailable, filteredClasses, setClassSearch } = useClassContext();

  return (
    <div className="space-y-8">
      <PageHeader eyebrow={t("contextual")} title={t("greeting")} description={actor.display_name ?? t("actorFallback")} />
      {!directoryAvailable ? (
        <EmptyState title={t("contractPendingTitle")} description={t("contractPendingBody")} />
      ) : availableClasses.length === 0 ? (
        <EmptyState title={t("noClass")} description={t("noClassBody")} />
      ) : filteredClasses.length === 0 ? (
        <EmptyState
          title={t("noClassSearchTitle")}
          description={t("noClassSearchBody", { query: classSearch })}
          action={<Button variant="outline" className="min-h-11" onClick={() => setClassSearch("")}>{t("clearClassSearch")}</Button>}
        />
      ) : (
        <section aria-labelledby="my-classes-title">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 id="my-classes-title" className="font-heading text-lg font-semibold">{t("myClasses")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("classSearchResults", { visible: filteredClasses.length, total: availableClasses.length })}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredClasses.map((item) => (
              <Card key={item.id}>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BookOpenCheck className="size-4 text-primary" />{item.name}</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{[item.program_label, item.cohort_label].filter(Boolean).join(" · ") || item.state}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm"><Sparkles className="size-4 text-primary" /><span>{t("capabilityCount", { count: item.capabilities?.length ?? 0 })}</span></div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Clock3 className="size-4" /><span>{item.next_actions?.[0] ?? t("noPendingAction")}</span></div>
                  {item.capabilities?.includes("class.read") && <Link href={`/app/classes/${item.id}`} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary">{t("openOverview")} <ArrowRight className="size-4" /></Link>}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
