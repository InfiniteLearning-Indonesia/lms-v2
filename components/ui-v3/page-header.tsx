import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between"><div>{eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>}<h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}</div>{actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}</header>;
}
