import { AlertCircle, CheckCircle2, LockKeyhole, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingState({ label = "Memuat…" }: { label?: string }) {
  return <div role="status" aria-live="polite" className="flex min-h-32 items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground"><span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />{label}</div>;
}

export function EmptyState({ title = "Belum ada data", description }: { title?: string; description?: string }) {
  return <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center"><CheckCircle2 className="mx-auto mb-3 size-6 text-muted-foreground" /><h2 className="font-heading text-base font-semibold">{title}</h2>{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}</div>;
}

export function ErrorState({ title = "Terjadi kendala", description = "Coba lagi beberapa saat lagi.", onRetry }: { title?: string; description?: string; onRetry?: () => void }) {
  return <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-6"><AlertCircle className="mb-3 size-6 text-destructive" /><h2 className="font-heading font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p>{onRetry && <Button className="mt-4" variant="outline" onClick={onRetry}><RefreshCw className="mr-2 size-4" />Coba lagi</Button>}</div>;
}

export function ForbiddenState({ title = "Akses tidak tersedia", description = "Anda tidak memiliki capability untuk melihat bagian ini." }: { title?: string; description?: string }) {
  return <div role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6"><LockKeyhole className="mb-3 size-6 text-amber-600" /><h2 className="font-heading font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>;
}
