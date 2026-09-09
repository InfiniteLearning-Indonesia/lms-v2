import { PageHeader } from "@/components/ui-v3/page-header";
import { EmptyState } from "@/components/ui-v3/states";

export function WorkspacePlaceholder({ title, description }: { title: string; description: string }) {
  return <div className="space-y-8"><PageHeader eyebrow="Class workspace" title={title} description={description} /><EmptyState title="Contract domain belum tersedia" description="Foundation FE00 siap dengan mock boundary. Workflow ini akan diaktifkan pada checkpoint berikutnya setelah kontrak backend tersedia." /></div>;
}
