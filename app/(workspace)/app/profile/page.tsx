import { PageHeader } from "@/components/ui-v3/page-header";
import { EmptyState } from "@/components/ui-v3/states";
export default function ProfilePage() { return <div className="space-y-8"><PageHeader title="Profil dan keamanan" description="Kelola informasi profil serta session melalui identity owner." /><EmptyState title="Profil akan tersedia setelah identity bridge aktif" description="Kontrak browser identity dan CSRF refresh masih menunggu backend." /></div>; }
