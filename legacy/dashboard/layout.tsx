import { redirect } from "next/navigation";

/** Legacy dashboard is intentionally unreachable on the v3 branch. */
export default function LegacyDashboardRedirect() {
  redirect("/app");
}
