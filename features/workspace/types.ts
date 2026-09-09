import type { ActorContext, ClassAccessSummary } from "@/lib/api/types";

export const demoActor: ActorContext = { id: "actor-demo", display_name: "Pengguna LMS", site_admin: false, account_state: "ACTIVE", site_capabilities: [] };

export const demoClasses: ClassAccessSummary[] = [
  { id: "class-demo", name: "Product Engineering Cohort 2026", program_label: "Software Engineering", cohort_label: "Batch 01", state: "PUBLISHED", version: 1, contextual_roles: ["student"], capabilities: ["class.read", "content.read", "submission.create"] },
];
