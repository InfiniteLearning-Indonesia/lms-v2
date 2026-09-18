import { AdminAuditContent } from "@/features/admin/components/audit-content";
import { getDevelopmentPreview } from "@/lib/dev-preview/server";

export default async function AdminAuditPage() {
  const preview = await getDevelopmentPreview();
  return <AdminAuditContent initialData={preview?.adminAudit} />;
}
