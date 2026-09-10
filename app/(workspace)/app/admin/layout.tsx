import { SiteCapabilityGuard } from "@/lib/auth/site-capability-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <SiteCapabilityGuard capability="site.admin">{children}</SiteCapabilityGuard>;
}
