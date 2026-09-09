import { PageHeader } from "@/components/ui-v3/page-header";
import { EmptyState } from "@/components/ui-v3/states";
export function AdminPlaceholder({ title, description }: { title: string; description: string }) { return <div className="space-y-8"><PageHeader eyebrow="Site administration" title={title} description={description} /><EmptyState title="Admin contract belum tersedia" description="Endpoint admin, report, audit, dan migration akan masuk pada FE07." /></div>; }
