import { CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ClassAccessSummary } from "@/lib/api/types";
import type { ParticipantRole, ParticipationState } from "../model";

const classStateStyles: Record<ClassAccessSummary["state"], string> = {
  DRAFT: "border-slate-400/30 bg-slate-500/10 text-slate-700 dark:text-slate-200",
  PUBLISHED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  CLOSED: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  ARCHIVED: "border-border bg-muted text-muted-foreground",
};

const participationStateStyles: Record<ParticipationState, string> = {
  ACTIVE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  SUSPENDED: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  ENDED: "border-border bg-muted text-muted-foreground",
};

export function IntegrationNotice({ id, title, description }: { id?: string; title: string; description: string }) {
  return (
    <aside id={id} role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
      <div className="flex items-start gap-3">
        <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <div>
          <p className="font-heading text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
    </aside>
  );
}

export function ClassStateBadge({ state, label }: { state: ClassAccessSummary["state"]; label: string }) {
  return <Badge variant="outline" className={classStateStyles[state]}>{label}</Badge>;
}

export function ParticipationStateBadge({ state, label }: { state: ParticipationState; label: string }) {
  return <Badge variant="outline" className={participationStateStyles[state]}>{label}</Badge>;
}

export function ParticipantRoleBadge({ role, label }: { role: ParticipantRole; label: string }) {
  return <Badge data-role={role} variant="secondary" className="border border-brand-yellow/40">{label}</Badge>;
}

export function FieldMessage({ id, error, help }: { id: string; error?: string; help?: string }) {
  return (
    <p id={id} role={error ? "alert" : undefined} className={`text-xs ${error ? "text-destructive" : "text-muted-foreground"}`}>
      {error ?? help}
    </p>
  );
}
