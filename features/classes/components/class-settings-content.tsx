"use client";

import { Archive, CheckCircle2, RotateCcw, Save, Send, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { PageHeader } from "@/components/ui-v3/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClassContext } from "@/features/workspace/context";
import type { ClassLifecycleAction } from "../model";
import { lifecycleActionsFor } from "../model";
import { classDetailsFormSchema, type ClassDetailsFormValues } from "../schemas";
import { ClassStateBadge, FieldMessage, IntegrationNotice } from "./shared";

type ClassField = keyof ClassDetailsFormValues;

const actionIcons: Record<ClassLifecycleAction, typeof Send> = {
  publish: Send,
  close: XCircle,
  reopen: RotateCcw,
  archive: Archive,
};

export function ClassSettingsContent() {
  const t = useTranslations("classSettings");
  const commonT = useTranslations("common");
  const { activeClass } = useClassContext();
  const [values, setValues] = useState<ClassDetailsFormValues>(() => ({
    name: activeClass?.name ?? "",
    programLabel: activeClass?.program_label ?? "",
    cohortLabel: activeClass?.cohort_label ?? "",
  }));
  const [errors, setErrors] = useState<Partial<Record<ClassField, string>>>({});

  if (!activeClass) return null;

  const readOnly = activeClass.state === "ARCHIVED";
  const lifecycleActions = lifecycleActionsFor(activeClass.state);

  function updateField(field: ClassField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validateField(field: ClassField) {
    const result = classDetailsFormSchema.safeParse(values);
    const issue = result.success ? undefined : result.error.issues.find((item) => item.path[0] === field);
    setErrors((current) => ({ ...current, [field]: issue?.message }));
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
        <section className="rounded-xl border bg-card p-5 sm:p-6" aria-labelledby="class-metadata-title">
          <div>
            <h2 id="class-metadata-title" className="font-heading text-lg font-semibold">{t("metadataTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("metadataDescription")}</p>
          </div>
          <form onSubmit={(event) => event.preventDefault()} className="mt-6 grid gap-5" noValidate>
            <div className="grid gap-2">
              <label htmlFor="class-settings-name" className="text-sm font-medium">{t("nameLabel")}</label>
              <Input id="class-settings-name" className="h-11" value={values.name} disabled={readOnly} onChange={(event) => updateField("name", event.target.value)} onBlur={() => validateField("name")} aria-invalid={Boolean(errors.name)} aria-describedby="class-settings-name-help" />
              <FieldMessage id="class-settings-name-help" error={errors.name} help={t("fieldHelp")} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid content-start gap-2">
                <label htmlFor="class-settings-program" className="text-sm font-medium">{t("programLabel")}</label>
                <Input id="class-settings-program" className="h-11" value={values.programLabel} disabled={readOnly} placeholder={t("optionalPlaceholder")} onChange={(event) => updateField("programLabel", event.target.value)} onBlur={() => validateField("programLabel")} aria-invalid={Boolean(errors.programLabel)} aria-describedby="class-settings-program-help" />
                <FieldMessage id="class-settings-program-help" error={errors.programLabel} help={t("fieldHelp")} />
              </div>
              <div className="grid content-start gap-2">
                <label htmlFor="class-settings-cohort" className="text-sm font-medium">{t("cohortLabel")}</label>
                <Input id="class-settings-cohort" className="h-11" value={values.cohortLabel} disabled={readOnly} placeholder={t("optionalPlaceholder")} onChange={(event) => updateField("cohortLabel", event.target.value)} onBlur={() => validateField("cohortLabel")} aria-invalid={Boolean(errors.cohortLabel)} aria-describedby="class-settings-cohort-help" />
                <FieldMessage id="class-settings-cohort-help" error={errors.cohortLabel} help={t("fieldHelp")} />
              </div>
            </div>
            <IntegrationNotice id="class-settings-integration" title={t("commandPendingTitle")} description={t("commandPendingBody")} />
            <div className="flex justify-end">
              <Button type="submit" className="h-11 px-4" disabled aria-describedby="class-settings-integration">
                <Save className="size-4" aria-hidden="true" />
                {t("saveChanges")}
              </Button>
            </div>
          </form>
        </section>

        <aside className="rounded-xl border bg-card p-5 sm:p-6" aria-labelledby="class-status-title">
          <h2 id="class-status-title" className="font-heading text-lg font-semibold">{t("statusTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("statusDescription")}</p>
          <dl className="mt-6 grid gap-5">
            <div className="flex items-center justify-between gap-3 border-b pb-4">
              <dt className="text-sm text-muted-foreground">{t("stateLabel")}</dt>
              <dd><ClassStateBadge state={activeClass.state} label={t(`states.${activeClass.state}`)} /></dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-sm text-muted-foreground">{t("versionLabel")}</dt>
              <dd className="font-mono text-sm font-semibold">{t("versionValue", { version: activeClass.version })}</dd>
            </div>
          </dl>
          <p className="mt-6 rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">{t("conflictHint")}</p>
        </aside>
      </div>

      <section className="rounded-xl border bg-card p-5 sm:p-6" aria-labelledby="class-lifecycle-title">
        <h2 id="class-lifecycle-title" className="font-heading text-lg font-semibold">{t("lifecycleTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("lifecycleDescription")}</p>
        {lifecycleActions.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed bg-muted/20 p-6 text-center">
            <CheckCircle2 className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
            <h3 className="mt-3 font-heading text-sm font-semibold">{t("noLifecycleTitle")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("noLifecycleBody")}</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {lifecycleActions.map((action) => {
              const Icon = actionIcons[action];
              return (
                <AlertDialog key={action}>
                  <AlertDialogTrigger render={<Button type="button" variant={action === "archive" ? "destructive" : "outline"} className="h-auto min-h-16 justify-start whitespace-normal px-4 py-3 text-left" />}>
                    <Icon className="size-5" aria-hidden="true" />
                    <span><span className="block font-semibold">{t(`actions.${action}`)}</span><span className="mt-0.5 block text-xs font-normal text-muted-foreground">{t(`actionDescriptions.${action}`)}</span></span>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogMedia><Icon className="size-5" aria-hidden="true" /></AlertDialogMedia>
                      <AlertDialogTitle>{t("confirmAction", { action: t(`actions.${action}`) })}</AlertDialogTitle>
                      <AlertDialogDescription>{t("confirmBody", { action: t(`actions.${action}`).toLocaleLowerCase("id-ID"), name: activeClass.name })}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <p id={`class-${action}-disabled`} className="rounded-lg bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-900 dark:text-amber-100">{t("confirmDisabled")}</p>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="h-11" aria-label={t("closeConfirmation")}>{commonT("cancel")}</AlertDialogCancel>
                      <AlertDialogAction className="h-11" disabled aria-describedby={`class-${action}-disabled`}>{t(`actions.${action}`)}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
