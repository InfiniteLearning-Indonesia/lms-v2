import { AdminReportsContent } from "@/features/admin/components/reports-content";
import { getDevelopmentPreview } from "@/lib/dev-preview/server";

export default async function AdminReportsPage() {
  const preview = await getDevelopmentPreview();
  return <AdminReportsContent initialData={preview?.adminReports} />;
}
