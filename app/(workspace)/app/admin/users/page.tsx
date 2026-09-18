import { AdminUsersContent } from "@/features/admin/components/users-content";
import { getDevelopmentPreview } from "@/lib/dev-preview/server";

export default async function AdminUsersPage() {
  const preview = await getDevelopmentPreview();
  return <AdminUsersContent initialData={preview?.adminUsers} />;
}
