import { AdminMigrationsContent } from "@/features/admin/components/migrations-content";
import { getDevelopmentPreview } from "@/lib/dev-preview/server";

export default async function AdminMigrationsPage() {
  const preview = await getDevelopmentPreview();
  return <AdminMigrationsContent initialData={preview?.adminMigrations} />;
}
