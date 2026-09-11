"use client";

import { History, Search, UserPlus, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui-v3/page-header";
import { EmptyState } from "@/components/ui-v3/states";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { useClassContext } from "@/features/workspace/context";
import { useActorSession } from "@/lib/auth/provider";
import type { ClassParticipantViewModel, IdentityCandidateViewModel, ParticipantRole, ParticipationAction, ParticipationState } from "../model";
import { assignableParticipantRoles, canManageParticipants, formatParticipantDate, matchesParticipant, participationActionsFor } from "../model";
import { IntegrationNotice, ParticipantRoleBadge, ParticipationStateBadge } from "./shared";

export function ClassPeopleContent({
  initialParticipants,
  identityCandidates,
}: {
  initialParticipants?: ClassParticipantViewModel[];
  identityCandidates?: IdentityCandidateViewModel[];
}) {
  const t = useTranslations("classPeople");
  const commonT = useTranslations("common");
  const { actor } = useActorSession();
  const { activeClass } = useClassContext();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<ParticipantRole | "ALL">("ALL");
  const [state, setState] = useState<ParticipationState | "ALL">("ALL");

  const filtered = useMemo(
    () => initialParticipants?.filter((participant) => matchesParticipant(participant, query, role, state)) ?? [],
    [initialParticipants, query, role, state],
  );

  if (!activeClass) return null;
  const canManage = canManageParticipants(activeClass);
  const roles = assignableParticipantRoles(actor, activeClass);
  const filtersActive = Boolean(query || role !== "ALL" || state !== "ALL");

  const actions = canManage ? (
    <>
      <Button type="button" variant="outline" className="h-11" disabled aria-describedby="class-people-bulk-note">
        <Upload className="size-4" aria-hidden="true" />
        {t("bulkPreview")}
      </Button>
      <AddParticipantDialog candidates={identityCandidates} roles={roles} />
    </>
  ) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} actions={actions} />

      <div className="grid gap-3 sm:grid-cols-2">
        <p className="rounded-xl border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">{t("selfEnrollmentNote")}</p>
        {canManage ? <p id="class-people-bulk-note" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm leading-relaxed text-muted-foreground"><span className="font-semibold text-foreground">{t("bulkPendingTitle")}.</span> {t("bulkPendingBody")}</p> : null}
      </div>

      {initialParticipants === undefined ? (
        <section className="space-y-4" aria-label={t("directoryPendingTitle")}>
          <IntegrationNotice title={t("directoryPendingTitle")} description={t("directoryPendingBody")} />
          <div className="rounded-xl border border-dashed bg-muted/20 p-5" aria-hidden="true"><div className="h-11 rounded-lg bg-muted" /><div className="mt-4 h-28 rounded-lg bg-muted/60" /></div>
        </section>
      ) : (
        <>
          <section className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-[minmax(0,1fr)_12rem_12rem]" aria-label={t("title")}>
            <div className="grid gap-2">
              <label htmlFor="participant-search" className="text-sm font-medium">{t("searchLabel")}</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input id="participant-search" type="search" className="h-11 pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchPlaceholder")} />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="participant-role" className="text-sm font-medium">{t("roleFilterLabel")}</label>
              <select id="participant-role" className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" value={role} onChange={(event) => setRole(event.target.value as ParticipantRole | "ALL")}>
                <option value="ALL">{t("allRoles")}</option>
                {(["teacher", "student"] as const).map((value) => <option key={value} value={value}>{t(`roleLabels.${value}`)}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="participant-state" className="text-sm font-medium">{t("stateFilterLabel")}</label>
              <select id="participant-state" className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" value={state} onChange={(event) => setState(event.target.value as ParticipationState | "ALL")}>
                <option value="ALL">{t("allStates")}</option>
                {(["ACTIVE", "SUSPENDED", "ENDED"] as const).map((value) => <option key={value} value={value}>{t(`stateLabels.${value}`)}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-3">
              <p aria-live="polite" className="text-xs text-muted-foreground">{t("results", { visible: filtered.length, total: initialParticipants.length })}</p>
              {filtersActive ? <Button type="button" variant="ghost" className="h-11" onClick={() => { setQuery(""); setRole("ALL"); setState("ALL"); }}><X className="size-4" aria-hidden="true" />{t("clearFilters")}</Button> : null}
            </div>
          </section>

          {initialParticipants.length === 0 ? (
            <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />
          ) : filtered.length === 0 ? (
            <EmptyState title={t("noResultsTitle")} description={t("noResultsBody")} action={<Button variant="outline" className="h-11" onClick={() => { setQuery(""); setRole("ALL"); setState("ALL"); }}>{t("clearFilters")}</Button>} />
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card">
              <table className="block w-full lg:table">
                <caption className="sr-only">{t("title")}</caption>
                <thead className="hidden border-b bg-muted/40 lg:table-header-group">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("participantColumn")}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("roleColumn")}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("stateColumn")}</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("joinedColumn")}</th>
                    <th scope="col" className="px-4 py-3 text-right"><span className="sr-only">{t("actionColumn")}</span></th>
                  </tr>
                </thead>
                <tbody className="block divide-y lg:table-row-group">
                  {filtered.map((participant) => (
                    <tr key={participant.enrollmentId} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 p-4 lg:table-row lg:p-0">
                      <td className="col-span-2 min-w-0 lg:table-cell lg:px-4 lg:py-4">
                        <p className="truncate font-heading text-sm font-semibold">{participant.displayName}</p>
                        {participant.email ? <p className="mt-1 truncate text-xs text-muted-foreground">{participant.email}</p> : null}
                      </td>
                      <td className="flex flex-wrap gap-1 lg:table-cell lg:px-4 lg:py-4">{participant.roles.map((participantRole) => <ParticipantRoleBadge key={participantRole} role={participantRole} label={t(`roleLabels.${participantRole}`)} />)}</td>
                      <td className="text-right lg:table-cell lg:px-4 lg:py-4 lg:text-left"><ParticipationStateBadge state={participant.state} label={t(`stateLabels.${participant.state}`)} /></td>
                      <td className="col-span-2 text-xs text-muted-foreground lg:table-cell lg:px-4 lg:py-4"><span className="lg:hidden">{t("joinedColumn")}: </span>{formatParticipantDate(participant.joinedAt)}</td>
                      <td className="col-span-2 text-right lg:table-cell lg:px-4 lg:py-4"><ParticipantDetailsDialog participant={participant} canManage={canManage} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      <span className="sr-only">{commonT("readOnly")}</span>
    </div>
  );
}

function AddParticipantDialog({ candidates, roles }: { candidates?: IdentityCandidateViewModel[]; roles: ParticipantRole[] }) {
  const t = useTranslations("classPeople");
  const commonT = useTranslations("common");
  const [query, setQuery] = useState("");
  const [selectedIdentity, setSelectedIdentity] = useState<string>();
  const [selectedRole, setSelectedRole] = useState<ParticipantRole>(roles[0] ?? "student");
  const filteredCandidates = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("id-ID");
    if (!normalized) return candidates ?? [];
    return (candidates ?? []).filter((candidate) => [candidate.displayName, candidate.email].some((value) => value.toLocaleLowerCase("id-ID").includes(normalized)));
  }, [candidates, query]);

  return (
    <Dialog>
      <DialogTrigger render={<Button className="h-11" />}><UserPlus className="size-4" aria-hidden="true" />{t("addParticipant")}</DialogTrigger>
      <DialogContent showCloseButton={false} className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader className="pr-12">
          <DialogTitle>{t("addTitle")}</DialogTitle>
          <DialogDescription>{t("addDescription")}</DialogDescription>
        </DialogHeader>
        <DialogClose render={<Button variant="ghost" size="icon" className="absolute right-2 top-2 size-11" aria-label={t("closeAdd")} />}><X className="size-4" aria-hidden="true" /></DialogClose>
        <form onSubmit={(event) => event.preventDefault()} className="grid gap-5">
          {candidates === undefined ? (
            <IntegrationNotice title={t("identityPendingTitle")} description={t("identityPendingBody")} />
          ) : (
            <fieldset className="grid gap-3">
              <legend className="text-sm font-medium">{t("identitySearchLabel")}</legend>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input type="search" className="h-11 pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("identitySearchPlaceholder")} />
              </div>
              <p aria-live="polite" className="text-xs text-muted-foreground">{t("identityResults", { count: filteredCandidates.length })}</p>
              <div className="grid max-h-52 gap-2 overflow-y-auto rounded-xl border p-2">
                {filteredCandidates.length > 0 ? filteredCandidates.map((candidate) => (
                  <button key={candidate.userId} type="button" onClick={() => setSelectedIdentity(candidate.userId)} aria-pressed={selectedIdentity === candidate.userId} aria-label={t("selectIdentity", { name: candidate.displayName })} className="min-h-14 rounded-lg border px-3 py-2 text-left transition-colors hover:bg-muted aria-pressed:border-primary aria-pressed:bg-primary/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                    <span className="block text-sm font-semibold">{candidate.displayName}</span>
                    <span className="block text-xs text-muted-foreground">{candidate.email}</span>
                  </button>
                )) : <p className="p-4 text-center text-sm text-muted-foreground">{t("noIdentityResults")}</p>}
              </div>
            </fieldset>
          )}
          <fieldset className="grid gap-3">
            <legend className="text-sm font-medium">{t("roleLabel")}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {roles.map((role) => (
                <label key={role} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 has-checked:border-primary has-checked:bg-primary/10">
                  <input type="radio" name="participant-role" value={role} checked={selectedRole === role} onChange={() => setSelectedRole(role)} className="size-4 accent-primary" />
                  <span className="text-sm font-medium">{t(`roleLabels.${role}`)}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{roles.includes("teacher") ? t("roleScopeAdmin") : t("roleScopeTeacher")}</p>
          </fieldset>
          <IntegrationNotice id="participant-command-integration" title={t("commandPendingTitle")} description={t("commandPendingBody")} />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" className="h-11" />}>{commonT("cancel")}</DialogClose>
            <Button type="submit" className="h-11" disabled aria-describedby="participant-command-integration"><UserPlus className="size-4" aria-hidden="true" />{t("submitParticipant")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ParticipantDetailsDialog({ participant, canManage }: { participant: ClassParticipantViewModel; canManage: boolean }) {
  const t = useTranslations("classPeople");
  const commonT = useTranslations("common");
  const actions = participationActionsFor(participant.state);

  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" variant="ghost" className="h-11 text-primary" aria-label={t("viewDetails", { name: participant.displayName })} />}>
        {t("detailsAction")}
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader className="pr-12">
          <DialogTitle>{t("detailsTitle")}</DialogTitle>
          <DialogDescription>{participant.displayName}{participant.email ? ` · ${participant.email}` : ""}</DialogDescription>
        </DialogHeader>
        <DialogClose render={<Button variant="ghost" size="icon" className="absolute right-2 top-2 size-11" aria-label={t("closeDetails")} />}><X className="size-4" aria-hidden="true" /></DialogClose>
        <div className="flex flex-wrap items-center gap-2">
          {participant.roles.map((role) => <ParticipantRoleBadge key={role} role={role} label={t(`roleLabels.${role}`)} />)}
          <ParticipationStateBadge state={participant.state} label={t(`stateLabels.${participant.state}`)} />
          <span className="text-xs text-muted-foreground">{t("joinedAt", { date: formatParticipantDate(participant.joinedAt) })}</span>
        </div>
        <section className="rounded-xl border p-4" aria-labelledby={`participant-history-${participant.enrollmentId}`}>
          <h3 id={`participant-history-${participant.enrollmentId}`} className="flex items-center gap-2 font-heading text-sm font-semibold"><History className="size-4 text-primary" aria-hidden="true" />{t("historyTitle")}</h3>
          {participant.history.length > 0 ? (
            <ol className="mt-4 space-y-4 border-l pl-4">
              {participant.history.map((event) => (
                <li key={event.id} className="relative">
                  <span className="absolute -left-[1.28rem] top-1.5 size-2 rounded-full bg-primary ring-4 ring-background" aria-hidden="true" />
                  <p className="text-sm font-medium">{t(`historyActions.${event.action}`)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatParticipantDate(event.occurredAt)} · {t("performedBy", { actor: event.actorLabel })}</p>
                </li>
              ))}
            </ol>
          ) : <p className="mt-3 text-sm text-muted-foreground">{t("noHistory")}</p>}
        </section>
        {canManage && actions.length > 0 ? <div className="flex flex-wrap gap-2">{actions.map((action) => <ParticipantActionDialog key={action} action={action} participant={participant} />)}</div> : null}
        <DialogFooter><DialogClose render={<Button variant="outline" className="h-11" />}>{commonT("close")}</DialogClose></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ParticipantActionDialog({ action, participant }: { action: ParticipationAction; participant: ClassParticipantViewModel }) {
  const t = useTranslations("classPeople");
  const commonT = useTranslations("common");
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button type="button" variant={action === "end" ? "destructive" : "outline"} className="h-11" />}>{t(`actions.${action}`)}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("confirmAction", { action: t(`actions.${action}`) })}</AlertDialogTitle>
          <AlertDialogDescription>{t("confirmBody", { action: t(`actions.${action}`).toLocaleLowerCase("id-ID"), name: participant.displayName })}</AlertDialogDescription>
        </AlertDialogHeader>
        <p id={`participant-${participant.enrollmentId}-${action}-disabled`} className="rounded-lg bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-900 dark:text-amber-100">{t("confirmDisabled")}</p>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-11">{commonT("cancel")}</AlertDialogCancel>
          <AlertDialogAction className="h-11" disabled aria-describedby={`participant-${participant.enrollmentId}-${action}-disabled`}>{t(`actions.${action}`)}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
