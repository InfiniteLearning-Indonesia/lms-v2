import type { ActorContext, ClassAccessSummary } from "@/lib/api/types";

export const actors = {
  siteAdmin: { id: "actor-admin", display_name: "Site Admin", site_admin: true, account_state: "ACTIVE" },
  teacher: { id: "actor-teacher", display_name: "Pengajar Demo", site_admin: false, account_state: "ACTIVE" },
  student: { id: "actor-student", display_name: "Student Demo", site_admin: false, account_state: "ACTIVE" },
  teacherStudent: { id: "actor-both", display_name: "Teacher sekaligus Student", site_admin: false, account_state: "ACTIVE" },
  facilitator: { id: "actor-facilitator", display_name: "Facilitator Demo", site_admin: false, account_state: "ACTIVE" },
  outsider: { id: "actor-outsider", display_name: "Outsider", site_admin: false, account_state: "ACTIVE" },
} satisfies Record<string, ActorContext>;

export const classes = {
  draft: { id: "class-draft", name: "Class Draft", state: "DRAFT", version: 1 },
  published: { id: "class-published", name: "Class Published", state: "PUBLISHED", version: 3 },
  closed: { id: "class-closed", name: "Class Closed", state: "CLOSED", version: 7 },
  archived: { id: "class-archived", name: "Class Archived", state: "ARCHIVED", version: 9 },
} satisfies Record<string, ClassAccessSummary>;

export const errorFixtures = {
  forbidden: { code: "FORBIDDEN", message: "Capability tidak tersedia", request_id: "req-forbidden", status: 403 },
  conflict: { code: "VERSION_CONFLICT", message: "Versi resource sudah berubah", request_id: "req-conflict", current_version: 4, status: 409 },
  validation: { code: "VALIDATION_ERROR", message: "Periksa input", field_errors: { name: ["Wajib diisi"] }, status: 422 },
  rateLimit: { code: "RATE_LIMITED", message: "Terlalu banyak permintaan", retry_after_seconds: 10, status: 429 },
  unavailable: { code: "SERVICE_UNAVAILABLE", message: "Layanan belum tersedia", status: 503 },
};
