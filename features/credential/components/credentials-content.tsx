"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Award,
  BadgeCheck,
  Ban,
  CheckCircle2,
  CircleAlert,
  Download,
  ExternalLink,
  FileBadge2,
  FileClock,
  History,
  LockKeyhole,
  RefreshCw,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui-v3/page-header";
import { EmptyState } from "@/components/ui-v3/states";
import { useClassContext } from "@/features/workspace/context";
import {
  credentialBelongsToClass,
  credentialUiPolicy,
  formatCredentialDate,
  type CertificateViewModel,
  type ClassCredentialViewModel,
  type CredentialState,
  type CredentialSubjectViewModel,
  type TranscriptState,
} from "../model";

const credentialStyles: Record<CredentialState, string> = {
  NOT_ELIGIBLE: "border-border bg-muted text-muted-foreground",
  ELIGIBLE: "border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-200",
  PENDING_ISSUANCE: "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200",
  ISSUED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  REVOKED: "border-destructive/30 bg-destructive/10 text-destructive",
  SUPERSEDED: "border-violet-500/30 bg-violet-500/10 text-violet-800 dark:text-violet-200",
};

const transcriptStyles: Record<TranscriptState, string> = {
  DRAFT: "border-border bg-muted text-muted-foreground",
  RELEASED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  CORRECTED: "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200",
};

export function CredentialsContent({ initialCredential }: { initialCredential?: ClassCredentialViewModel }) {
  const t = useTranslations("credentials");
  const { activeClass } = useClassContext();
  if (!activeClass) return null;
  const policy = credentialUiPolicy(activeClass.capabilities);
  if (!policy.canRead) return <EmptyState title={t("forbiddenTitle")} description={t("forbiddenBody")} />;
  if (initialCredential && !credentialBelongsToClass(initialCredential, activeClass.id)) {
    return <EmptyState title={t("contextMismatchTitle")} description={t("contextMismatchBody")} />;
  }
  if (!initialCredential) return <CredentialDependencyState />;
  if (initialCredential.subjects.length === 0) return <div className="space-y-6"><PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} /><EmptyState title={t("emptyTitle")} description={t("emptyBody")} /></div>;
  return <CredentialWorkspace model={initialCredential} canManage={policy.canIssue} />;
}

function CredentialWorkspace({ model, canManage }: { model: ClassCredentialViewModel; canManage: boolean }) {
  const t = useTranslations("credentials");
  const [selectedId, setSelectedId] = useState(model.subjects[0]?.studentId);
  const selected = model.subjects.find((subject) => subject.studentId === selectedId) ?? model.subjects[0];
  const managedProjection = model.subjects.some((subject) => !subject.self);
  return <div className="space-y-6"><PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} /><AuthorityNotice manage={canManage} />{managedProjection ? <section className="rounded-xl border bg-card p-4"><label htmlFor="credential-subject" className="text-sm font-medium">{t("studentLabel")}</label><select id="credential-subject" className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:max-w-sm" value={selected.studentId} onChange={(event) => setSelectedId(event.target.value)}>{model.subjects.map((subject) => <option key={subject.studentId} value={subject.studentId}>{subject.studentName}</option>)}</select></section> : null}<SubjectCredential key={selected.studentId} subject={selected} model={model} canManage={canManage} /></div>;
}

function SubjectCredential({ subject, model, canManage }: { subject: CredentialSubjectViewModel; model: ClassCredentialViewModel; canManage: boolean }) {
  return <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]"><TranscriptPanel subject={subject} timeZone={model.timeZone} canManage={canManage} /><CertificatePanel certificate={subject.certificate} studentName={subject.studentName} timeZone={model.timeZone} canManage={canManage} /></div>;
}

function TranscriptPanel({ subject, timeZone, canManage }: { subject: CredentialSubjectViewModel; timeZone: string; canManage: boolean }) {
  const t = useTranslations("credentials");
  const transcript = subject.transcript;
  return <article className="min-w-0 overflow-hidden rounded-xl border bg-card" aria-labelledby="transcript-title"><header className="border-b p-5 sm:p-6"><div className="flex flex-wrap items-center gap-2"><Badge variant="outline" className={transcriptStyles[transcript.state]}>{t(`transcriptStates.${transcript.state}`)}</Badge><Badge variant="outline">{t("snapshotVersion", { version: transcript.version })}</Badge><Badge variant="outline">{t("policyVersion", { version: transcript.policyVersion })}</Badge></div><h2 id="transcript-title" className="mt-4 font-heading text-xl font-semibold">{t("transcriptTitle")}</h2><p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><UserRound className="size-4" aria-hidden="true" />{subject.studentName}</p>{transcript.releasedAt ? <p className="mt-2 text-xs text-muted-foreground">{t("releasedAt", { date: formatCredentialDate(transcript.releasedAt, timeZone) })}</p> : null}</header>{transcript.state === "CORRECTED" ? <aside className="m-5 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"><History className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" /><div><h3 className="font-heading text-sm font-semibold">{t("correctionTitle")}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{transcript.correctionReason ?? t("correctionBody")}</p></div></aside> : null}<div className="p-5 sm:p-6"><div className="mb-4 rounded-lg border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">{t("provenanceLabel")}</p><p className="mt-1 text-sm font-semibold">{transcript.provenanceLabel}</p></div>{transcript.items.length === 0 ? <EmptyState title={t("transcriptEmptyTitle")} description={t("transcriptEmptyBody")} /> : <ul className="divide-y rounded-xl border" aria-label={t("transcriptItemsLabel")}>{transcript.items.map((item) => <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="font-heading text-sm font-semibold">{item.title}</p>{item.releasedAt ? <p className="mt-1 text-xs text-muted-foreground">{t("itemReleasedAt", { date: formatCredentialDate(item.releasedAt, timeZone) })}</p> : null}</div><div className="flex shrink-0 flex-wrap items-center gap-2"><Badge variant="outline">{t(`outcomes.${item.outcome}`)}</Badge>{item.gradeDisplay ? <Badge variant="secondary">{item.gradeDisplay}</Badge> : null}</div></li>)}</ul>}<div className="mt-5 flex justify-end"><Button type="button" disabled aria-describedby="credential-command-pending"><Send className="size-4" aria-hidden="true" />{t("releaseTranscript")}</Button></div>{!canManage ? <p className="mt-2 text-right text-xs text-muted-foreground">{t("transcriptReadOnly")}</p> : null}</div></article>;
}

function CertificatePanel({ certificate, studentName, timeZone, canManage }: { certificate: CertificateViewModel; studentName: string; timeZone: string; canManage: boolean }) {
  const t = useTranslations("credentials");
  const Icon = certificate.state === "ISSUED" ? BadgeCheck : certificate.state === "REVOKED" ? Ban : certificate.state === "SUPERSEDED" ? RefreshCw : FileClock;
  const canOpenVerification = Boolean(certificate.verificationCode);
  return <aside className="min-w-0 overflow-hidden rounded-xl border bg-card" aria-labelledby="certificate-title"><div className="bg-gradient-to-br from-primary/15 via-primary/5 to-brand-yellow/10 p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><span className="grid size-12 place-items-center rounded-xl bg-background text-primary shadow-sm"><Icon className="size-6" aria-hidden="true" /></span><Badge variant="outline" className={credentialStyles[certificate.state]}>{t(`certificateStates.${certificate.state}`)}</Badge></div><h2 id="certificate-title" className="mt-5 font-heading text-xl font-semibold">{t("certificateTitle")}</h2><p className="mt-1 text-sm text-muted-foreground">{studentName}</p>{certificate.identifier ? <p className="mt-3 break-all font-mono text-xs text-muted-foreground">{certificate.identifier}</p> : null}</div><div className="space-y-5 p-5 sm:p-6"><section aria-labelledby="eligibility-title"><h3 id="eligibility-title" className="font-heading text-sm font-semibold">{t("eligibilityTitle")}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{certificate.eligible ? t("eligibleBody") : t("notEligibleBody")}</p>{certificate.eligibilityReasons.length > 0 ? <ul className="mt-3 grid gap-2">{certificate.eligibilityReasons.map((reason) => <li key={reason} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />{reason}</li>)}</ul> : null}</section>{certificate.issuedAt ? <p className="text-xs text-muted-foreground">{t("issuedAt", { date: formatCredentialDate(certificate.issuedAt, timeZone) })}</p> : null}{certificate.revokedAt ? <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3"><p className="text-sm font-semibold text-destructive">{t("revokedAt", { date: formatCredentialDate(certificate.revokedAt, timeZone) })}</p>{certificate.revokeReason ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{certificate.revokeReason}</p> : null}</div> : null}{certificate.supersededBy ? <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-3"><p className="text-sm font-semibold">{t("supersededBy")}</p><p className="mt-1 break-all font-mono text-xs text-muted-foreground">{certificate.supersededBy}</p></div> : null}<div className="grid gap-2"><Button type="button" className="min-h-11" disabled aria-describedby="credential-command-pending"><Download className="size-4" aria-hidden="true" />{t("downloadCertificate")}</Button>{canOpenVerification ? <Link href={`/certificate/verify/${encodeURIComponent(certificate.verificationCode as string)}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"><ExternalLink className="size-4" aria-hidden="true" />{t("openVerification")}</Link> : null}{canManage ? <><Button type="button" variant="outline" className="min-h-11" disabled aria-describedby="credential-command-pending"><Award className="size-4" aria-hidden="true" />{t("issueCertificate")}</Button><Button type="button" variant="outline" className="min-h-11" disabled aria-describedby="credential-command-pending"><Ban className="size-4" aria-hidden="true" />{t("revokeCertificate")}</Button></> : null}</div><div id="credential-command-pending" role="status" className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-5 text-muted-foreground"><CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden="true" />{t("commandPendingBody")}</div></div></aside>;
}

function AuthorityNotice({ manage }: { manage: boolean }) {
  const t = useTranslations("credentials");
  return <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" /><p><span className="font-semibold text-foreground">{t("authorityTitle")}.</span> {manage ? t("authorityManageBody") : t("authorityLearnerBody")}</p></div>;
}

function CredentialDependencyState() {
  const t = useTranslations("credentials");
  return <div className="space-y-6"><PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} /><section role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5"><div className="flex items-start gap-3"><CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" /><div><h2 className="font-heading font-semibold">{t("dependencyTitle")}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("dependencyBody")}</p></div></div></section><div className="grid gap-3 md:grid-cols-3"><DependencyCard icon={FileBadge2} title={t("dependencyTranscriptTitle")} body={t("dependencyTranscriptBody")} /><DependencyCard icon={Award} title={t("dependencyCertificateTitle")} body={t("dependencyCertificateBody")} /><DependencyCard icon={LockKeyhole} title={t("dependencyPrivacyTitle")} body={t("dependencyPrivacyBody")} /></div></div>;
}

function DependencyCard({ icon: Icon, title, body }: { icon: typeof Award; title: string; body: string }) {
  return <article className="rounded-xl border bg-card p-4"><Icon className="size-5 text-primary" aria-hidden="true" /><h2 className="mt-3 font-heading text-sm font-semibold">{title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p></article>;
}
