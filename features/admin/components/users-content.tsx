"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Clock3, Eye, MailPlus, Search, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { PageHeader } from "@/components/ui-v3/page-header";
import { EmptyState } from "@/components/ui-v3/states";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { AdminInvitationFormValues, AdminUserDirectoryViewModel } from "../model";
import { matchesAdminUser, validateAdminInvitationField } from "../model";
import { DependencyNotice, formatAdminDate, StatusBadge } from "./operations-shared";

type AccountFilter = "ALL" | AdminUserDirectoryViewModel["users"][number]["accountState"];

export function AdminUsersContent({ initialData }: { initialData?: AdminUserDirectoryViewModel }) {
  const t = useTranslations("adminOperations");
  const commonT = useTranslations("common");
  const [query, setQuery] = useState("");
  const [accountState, setAccountState] = useState<AccountFilter>("ALL");
  const { register, handleSubmit, formState: { errors } } = useForm<AdminInvitationFormValues>({ defaultValues: { email: "", purpose: "" }, mode: "onBlur" });
  const users = useMemo(() => initialData?.users.filter((user) => matchesAdminUser(user, query, accountState)) ?? [], [accountState, initialData, query]);

  const inviteDialog = (
    <Dialog>
      <DialogTrigger render={<Button className="h-11" />}><MailPlus className="size-4" aria-hidden="true" />{t("users.invite")}</DialogTrigger>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader className="pr-12"><DialogTitle>{t("users.inviteTitle")}</DialogTitle><DialogDescription>{t("users.inviteDescription")}</DialogDescription></DialogHeader>
        <DialogClose render={<Button variant="ghost" size="icon" className="absolute right-2 top-2 size-11" aria-label={commonT("close")} />}><X className="size-4" /></DialogClose>
        <form className="grid gap-5" onSubmit={handleSubmit(() => undefined)} noValidate>
          <div className="grid gap-2"><label htmlFor="admin-invite-email" className="text-sm font-medium">{t("users.email")}</label><Input id="admin-invite-email" type="email" className="h-11" placeholder="nama@example.com" autoComplete="email" {...register("email", { validate: (value) => validateAdminInvitationField("email", value) })} aria-invalid={Boolean(errors.email)} aria-describedby="admin-invite-email-help" /><p id="admin-invite-email-help" role={errors.email ? "alert" : undefined} className={errors.email ? "text-xs text-destructive" : "sr-only"}>{errors.email?.message ?? t("users.email")}</p></div>
          <div className="grid gap-2"><label htmlFor="admin-invite-purpose" className="text-sm font-medium">{t("users.purpose")}</label><Input id="admin-invite-purpose" className="h-11" placeholder={t("users.purposePlaceholder")} {...register("purpose", { validate: (value) => validateAdminInvitationField("purpose", value) })} aria-invalid={Boolean(errors.purpose)} aria-describedby="admin-invite-purpose-help" /><p id="admin-invite-purpose-help" role={errors.purpose ? "alert" : undefined} className={`text-xs ${errors.purpose ? "text-destructive" : "text-muted-foreground"}`}>{errors.purpose?.message ?? t("users.purposeHelp")}</p></div>
          <DependencyNotice id="invite-contract-note" title={t("commandPendingTitle")} description={t("users.invitePending")} />
          <DialogFooter><DialogClose render={<Button type="button" variant="outline" className="h-11" />}>{commonT("cancel")}</DialogClose><Button type="submit" className="h-11" disabled aria-describedby="invite-contract-note">{t("users.sendInvite")}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t("eyebrow")} title={t("users.title")} description={t("users.description")} actions={inviteDialog} />
      {initialData === undefined ? <DependencyState section="users" t={t} /> : (
        <>
          <DependencyNotice id="identity-owner-boundary" title={t("users.boundaryTitle")} description={t("users.boundaryBody")} />
          <section className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_14rem]" aria-label={t("users.filters")}>
            <div className="grid gap-2"><label htmlFor="admin-user-search" className="text-sm font-medium">{t("users.search")}</label><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input id="admin-user-search" type="search" className="h-11 pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("users.searchPlaceholder")} /></div></div>
            <div className="grid gap-2"><label htmlFor="admin-user-state" className="text-sm font-medium">{t("users.accountFilter")}</label><select id="admin-user-state" className="h-11 rounded-lg border border-input bg-background px-3 text-sm" value={accountState} onChange={(event) => setAccountState(event.target.value as AccountFilter)}><option value="ALL">{t("all")}</option><option value="ACTIVE">{t("states.ACTIVE")}</option><option value="LOCKED">{t("states.LOCKED")}</option><option value="DISABLED">{t("states.DISABLED")}</option></select></div>
            <p aria-live="polite" className="text-xs text-muted-foreground sm:col-span-2">{t("users.results", { visible: users.length, total: initialData.users.length })}</p>
          </section>
          {users.length === 0 ? <EmptyState title={t("users.noResults")} description={t("users.noResultsBody")} /> : <UserTable users={users} t={t} />}
          <p className="text-xs text-muted-foreground">{t("updatedAt", { date: formatAdminDate(initialData.updatedAt) })}</p>
        </>
      )}
    </div>
  );
}

function UserTable({ users, t }: { users: AdminUserDirectoryViewModel["users"]; t: ReturnType<typeof useTranslations<"adminOperations">> }) {
  return <div className="overflow-hidden rounded-xl border bg-card"><table className="block w-full md:table"><caption className="sr-only">{t("users.title")}</caption><thead className="hidden border-b bg-muted/40 md:table-header-group"><tr><Header>{t("users.identity")}</Header><Header>{t("users.accountState")}</Header><Header>{t("users.classAccess")}</Header><Header alignRight>{t("users.detail")}</Header></tr></thead><tbody className="block divide-y md:table-row-group">{users.map((user) => <tr key={user.id} className="grid gap-3 p-4 md:table-row md:p-0"><td className="min-w-0 md:table-cell md:px-4 md:py-4"><p className="font-heading text-sm font-semibold">{user.displayName}</p><p className="mt-1 break-all text-xs text-muted-foreground">{user.email}</p><div className="mt-2"><StatusBadge state={user.identityState} label={t(`states.${user.identityState}`)} /></div></td><td className="md:table-cell md:px-4 md:py-4"><StatusBadge state={user.accountState} label={t(`states.${user.accountState}`)} /></td><td className="text-sm text-muted-foreground md:table-cell md:px-4 md:py-4">{t("users.classCount", { count: user.classCount })}</td><td className="md:table-cell md:px-4 md:py-4 md:text-right"><UserDetail user={user} t={t} /></td></tr>)}</tbody></table></div>;
}

function UserDetail({ user, t }: { user: AdminUserDirectoryViewModel["users"][number]; t: ReturnType<typeof useTranslations<"adminOperations">> }) {
  return <Dialog><DialogTrigger render={<Button variant="ghost" className="h-11" />}><Eye className="size-4" aria-hidden="true" />{t("users.view")}</DialogTrigger><DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>{user.displayName}</DialogTitle><DialogDescription>{t("users.detailDescription")}</DialogDescription></DialogHeader><dl className="grid gap-3 rounded-xl border bg-muted/20 p-4 text-sm sm:grid-cols-2"><div><dt className="text-xs text-muted-foreground">{t("users.email")}</dt><dd className="mt-1 break-all font-medium">{user.email}</dd></div><div><dt className="text-xs text-muted-foreground">{t("users.version")}</dt><dd className="mt-1 font-medium tabular-nums">v{user.version}</dd></div><div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">{t("users.subject")}</dt><dd className="mt-1 font-medium">{user.immutableSubjectLabel ?? t("notAvailable")}</dd></div></dl><section><h3 className="font-heading text-sm font-semibold">{t("users.history")}</h3><ol className="mt-3 space-y-3">{user.history.map((entry) => <li key={entry.id} className="flex gap-3 rounded-lg border p-3"><Clock3 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /><div><p className="text-sm font-medium">{entry.label}</p><p className="mt-1 text-xs text-muted-foreground">{formatAdminDate(entry.occurredAt)}</p></div></li>)}</ol></section><DependencyNotice id={`user-${user.id}-boundary`} title={t("users.lastAdminTitle")} description={t("users.lastAdminBody")} tone="warning" /></DialogContent></Dialog>;
}

function Header({ children, alignRight = false }: { children: React.ReactNode; alignRight?: boolean }) { return <th scope="col" className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${alignRight ? "text-right" : "text-left"}`}>{children}</th>; }

function DependencyState({ section, t }: { section: "users"; t: ReturnType<typeof useTranslations<"adminOperations">> }) { return <section className="space-y-4"><DependencyNotice id={`${section}-dependency`} title={t("dependencyTitle")} description={t("dependencyBody")} /><div className="rounded-xl border border-dashed bg-muted/20 p-5" aria-hidden="true"><div className="h-11 rounded-lg bg-muted" /><div className="mt-4 h-40 rounded-lg bg-muted/60" /></div></section>; }
