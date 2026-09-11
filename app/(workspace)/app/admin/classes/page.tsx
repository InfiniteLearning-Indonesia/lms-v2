import { AdminClassDirectory } from "@/features/classes/components/admin-class-directory";
import { getDevelopmentPreview } from "@/lib/dev-preview/server";

export default async function AdminClassesPage() {
  const preview = await getDevelopmentPreview();
  return <AdminClassDirectory initialClasses={preview?.adminClasses} />;
}
