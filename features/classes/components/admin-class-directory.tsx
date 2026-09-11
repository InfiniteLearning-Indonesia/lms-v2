"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Eye, Pencil, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui-v3/page-header";
import { EmptyState } from "@/components/ui-v3/states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ClassAccessSummary } from "@/lib/api/types";
import { matchesManagedClass } from "../model";
import { classDetailsFormSchema, type ClassDetailsFormValues } from "../schemas";
import { ClassStateBadge, FieldMessage, IntegrationNotice } from "./shared";

type ClassStateFilter = ClassAccessSummary["state"] | "ALL";
type ClassField = keyof ClassDetailsFormValues;

const initialValues: ClassDetailsFormValues = { name: "", programLabel: "", cohortLabel: "" };

export function AdminClassDirectory({ initialClasses }: { initialClasses?: ClassAccessSummary[] }) {
  const t = useTranslations("adminClasses");
  const commonT = useTranslations("common");
  const [query, setQuery] = useState("");
  const [state, setState] = useState<ClassStateFilter>("ALL");
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<ClassField, string>>>({});
  const filtered = useMemo(
    () => initialClasses?.filter((item) => matchesManagedClass(item, query, state)) ?? [],
    [initialClasses, query, state],
  );
  const filtersActive = Boolean(query || state !== "ALL");

  function updateField(field: ClassField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validateField(field: ClassField) {
    const result = classDetailsFormSchema.safeParse(values);
    const issue = result.success ? undefined : result.error.issues.find((item) => item.path[0] === field);
    setErrors((current) => ({ ...current, [field]: issue?.message }));
  }

  const createDialog = (
    <Dialog>
      <DialogTrigger render={<Button className="h-11 px-4" />}>
        <Plus className="size-4" aria-hidden="true" />
        {t("createClass")}
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="pr-12">
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
        </DialogHeader>
        <DialogClose render={<Button variant="ghost" size="icon" className="absolute right-2 top-2 size-11" aria-label={t("closeDialog")} />}>
          <X className="size-4" aria-hidden="true" />
        </DialogClose>
        <form onSubmit={(event) => event.preventDefault()} className="grid gap-5" noValidate>
          <div className="grid gap-2">
            <label htmlFor="create-class-name" className="text-sm font-medium">{t("nameLabel")}</label>
            <Input
              id="create-class-name"
              className="h-11"
              value={values.name}
              onChange={(event) => updateField("name", event.target.value)}
              onBlur={() => validateField("name")}
              placeholder={t("namePlaceholder")}
              aria-invalid={Boolean(errors.name)}
              aria-describedby="create-class-name-help"
            />
            <FieldMessage id="create-class-name-help" error={errors.name} help={t("nameHelp")} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid content-start gap-2">
              <label htmlFor="create-class-program" className="text-sm font-medium">{t("programLabel")}</label>
              <Input
                id="create-class-program"
                className="h-11"
                value={values.programLabel}
                onChange={(event) => updateField("programLabel", event.target.value)}
                onBlur={() => validateField("programLabel")}
                placeholder={t("programPlaceholder")}
                aria-invalid={Boolean(errors.programLabel)}
                aria-describedby="create-class-program-help"
              />
              <FieldMessage id="create-class-program-help" error={errors.programLabel} help={t("optionalHelp")} />
            </div>
            <div className="grid content-start gap-2">
              <label htmlFor="create-class-cohort" className="text-sm font-medium">{t("cohortLabel")}</label>
              <Input
                id="create-class-cohort"
                className="h-11"
                value={values.cohortLabel}
                onChange={(event) => updateField("cohortLabel", event.target.value)}
                onBlur={() => validateField("cohortLabel")}
                placeholder={t("cohortPlaceholder")}
                aria-invalid={Boolean(errors.cohortLabel)}
                aria-describedby="create-class-cohort-help"
              />
              <FieldMessage id="create-class-cohort-help" error={errors.cohortLabel} help={t("optionalHelp")} />
            </div>
          </div>
          <IntegrationNotice id="create-class-integration-note" title={t("createDisabledTitle")} description={t("createDisabledBody")} />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" className="h-11" />}>{commonT("cancel")}</DialogClose>
            <Button type="submit" className="h-11" disabled aria-describedby="create-class-integration-note">
              <Plus className="size-4" aria-hidden="true" />
              {t("createClass")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} actions={createDialog} />

      {initialClasses === undefined ? (
        <section className="space-y-4" aria-label={t("directoryPendingTitle")}>
          <IntegrationNotice id="class-directory-dependency" title={t("directoryPendingTitle")} description={t("directoryPendingBody")} />
          <div className="rounded-xl border border-dashed bg-muted/20 p-5" aria-hidden="true">
            <div className="h-11 rounded-lg bg-muted" />
            <div className="mt-4 h-24 rounded-lg bg-muted/60" />
          </div>
        </section>
      ) : (
        <>
          <section aria-label={t("title")} className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
            <div className="grid gap-2">
              <label htmlFor="admin-class-search" className="text-sm font-medium">{t("searchLabel")}</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input id="admin-class-search" type="search" className="h-11 pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchPlaceholder")} />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="admin-class-state" className="text-sm font-medium">{t("stateFilterLabel")}</label>
              <select id="admin-class-state" className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" value={state} onChange={(event) => setState(event.target.value as ClassStateFilter)}>
                <option value="ALL">{t("allStates")}</option>
                {(["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"] as const).map((item) => <option key={item} value={item}>{t(`states.${item}`)}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
              <p aria-live="polite" className="text-xs text-muted-foreground">{t("results", { visible: filtered.length, total: initialClasses.length })}</p>
              {filtersActive ? <Button type="button" variant="ghost" className="h-11" onClick={() => { setQuery(""); setState("ALL"); }}><X className="size-4" aria-hidden="true" />{t("clearFilters")}</Button> : null}
            </div>
          </section>

          {initialClasses.length === 0 ? (
            <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />
          ) : filtered.length === 0 ? (
            <EmptyState title={t("noResultsTitle")} description={t("noResultsBody")} action={<Button variant="outline" className="h-11" onClick={() => { setQuery(""); setState("ALL"); }}>{t("clearFilters")}</Button>} />
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card">
              <table className="block w-full md:table">
                <caption className="sr-only">{t("title")}</caption>
                <thead className="hidden border-b bg-muted/40 md:table-header-group">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("classColumn")}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("stateColumn")}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("versionColumn")}</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("actionColumn")}</th>
                  </tr>
                </thead>
                <tbody className="block divide-y md:table-row-group">
                  {filtered.map((item) => (
                    <tr key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 p-4 md:table-row md:p-0">
                      <td className="col-span-2 min-w-0 md:table-cell md:px-4 md:py-4">
                        <p className="truncate font-heading text-sm font-semibold">{item.name}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{[item.program_label, item.cohort_label].filter(Boolean).join(" · ") || t("notAvailable")}</p>
                      </td>
                      <td className="md:table-cell md:px-4 md:py-4"><ClassStateBadge state={item.state} label={t(`states.${item.state}`)} /></td>
                      <td className="text-right text-xs text-muted-foreground md:table-cell md:px-4 md:py-4 md:text-left"><span className="md:hidden">{t("versionColumn")}: </span>{t("version", { version: item.version })}</td>
                      <td className="col-span-2 md:table-cell md:px-4 md:py-4">
                        <div className="flex flex-wrap justify-end gap-1">
                          <Link href={`/app/classes/${encodeURIComponent(item.id)}/settings`} aria-label={item.state === "ARCHIVED" ? t("viewSettingsFor", { name: item.name }) : t("editClass", { name: item.name })} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                            {item.state === "ARCHIVED" ? <Eye className="size-4" aria-hidden="true" /> : <Pencil className="size-4" aria-hidden="true" />}
                            {item.state === "ARCHIVED" ? t("viewSettings") : t("edit")}
                          </Link>
                          <Link href={`/app/classes/${encodeURIComponent(item.id)}`} aria-label={t("openClass", { name: item.name })} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                            {t("open")} <ArrowRight className="size-4" aria-hidden="true" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
