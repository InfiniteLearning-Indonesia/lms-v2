import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3 } from "lucide-react";

export default function StatusPage() {
  return <main className="min-h-screen bg-muted/20 p-5 sm:p-10"><div className="mx-auto max-w-3xl"><Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4" />Kembali</Link><h1 className="font-heading text-3xl font-semibold">Status layanan</h1><p className="mt-2 text-sm text-muted-foreground">Informasi operasional LMS v3.</p><div className="mt-8 grid gap-3"><Status label="Web application" status="Operational" /><Status label="API v3" status="Contract foundation" pending /></div><p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="size-3.5" />Status real-time akan aktif setelah health contract tersedia.</p></div></main>;
}
function Status({ label, status, pending }: { label: string; status: string; pending?: boolean }) { return <div className="flex items-center justify-between rounded-xl border bg-card p-5"><div className="flex items-center gap-3">{pending ? <Clock3 className="size-5 text-amber-500" /> : <CheckCircle2 className="size-5 text-emerald-600" />}<span className="font-medium">{label}</span></div><span className="text-sm text-muted-foreground">{status}</span></div>; }
