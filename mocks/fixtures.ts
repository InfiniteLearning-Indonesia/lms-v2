import type { ActorContext, ClassAccessSummary } from "@/lib/api/types";
import type { ClassOverviewViewModel } from "@/features/workspace/overview";

export const actors = {
  siteAdmin: { id: "actor-admin", display_name: "Site Admin", site_admin: true, account_state: "ACTIVE", site_capabilities: ["site.admin"] },
  teacher: { id: "actor-teacher", display_name: "Pengajar Demo", site_admin: false, account_state: "ACTIVE" },
  student: { id: "actor-student", display_name: "Student Demo", site_admin: false, account_state: "ACTIVE" },
  teacherStudent: { id: "actor-both", display_name: "Teacher sekaligus Student", site_admin: false, account_state: "ACTIVE" },
  facilitator: { id: "actor-facilitator", display_name: "Facilitator Demo", site_admin: false, account_state: "ACTIVE" },
  outsider: { id: "actor-outsider", display_name: "Outsider", site_admin: false, account_state: "ACTIVE" },
} satisfies Record<string, ActorContext>;

export const classes = {
  draft: { id: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", name: "Class Draft", state: "DRAFT", version: 1, contextual_roles: ["teacher"], enrollment_state: "ACTIVE", capabilities: ["class.read", "class.manage", "content.read", "participants.read"] },
  published: { id: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", name: "Product Engineering 2026", program_label: "Software Engineering", cohort_label: "Batch 01", state: "PUBLISHED", version: 3, contextual_roles: ["student"], enrollment_state: "ACTIVE", capabilities: ["class.read", "content.read", "participants.read", "submission.read", "progress.read", "attendance.read", "logbook.read", "credentials.read"], next_actions: ["Lanjutkan materi berikutnya"] },
  closed: { id: "cccccccccccccccccccccccccccccccc", name: "Class Closed", state: "CLOSED", version: 7, contextual_roles: ["teacher"], enrollment_state: "ACTIVE", capabilities: ["class.read", "gradebook.read", "progress.read"] },
  archived: { id: "dddddddddddddddddddddddddddddddd", name: "Class Archived", state: "ARCHIVED", version: 9, contextual_roles: ["student"], enrollment_state: "ENDED", capabilities: ["class.read"] },
} satisfies Record<string, ClassAccessSummary>;

export const classOverviews = {
  [classes.published.id]: {
    classId: classes.published.id,
    timeZone: "Asia/Jakarta",
    logbookReminders: [
      {
        id: "logbook-september-2026",
        periodLabel: "Logbook September 2026",
        dueAt: "2026-09-15T23:59:00+07:00",
        state: "DUE",
        description: "Catat aktivitas dan refleksi belajar untuk periode berjalan.",
      },
    ],
    upcomingAssignments: [
      {
        id: "assignment-learning-dashboard",
        title: "Project Brief: Learning Dashboard",
        activityType: "Project",
        dueAt: "2026-09-12T23:59:00+07:00",
        cutoffAt: "2026-09-14T23:59:00+07:00",
        state: "DRAFT",
      },
      {
        id: "assignment-information-architecture",
        title: "UI/UX Design: Information Architecture",
        activityType: "Assignment",
        dueAt: "2026-09-18T23:59:00+07:00",
        state: "NOT_STARTED",
      },
    ],
  },
} satisfies Record<string, ClassOverviewViewModel>;

export const errorFixtures = {
  forbidden: { code: "FORBIDDEN", message: "Capability tidak tersedia", request_id: "req-forbidden", status: 403 },
  conflict: { code: "VERSION_CONFLICT", message: "Versi resource sudah berubah", request_id: "req-conflict", current_version: 4, status: 409 },
  validation: { code: "VALIDATION_ERROR", message: "Periksa input", field_errors: { name: ["Wajib diisi"] }, status: 422 },
  rateLimit: { code: "RATE_LIMITED", message: "Terlalu banyak permintaan", retry_after_seconds: 10, status: 429 },
  unavailable: { code: "SERVICE_UNAVAILABLE", message: "Layanan belum tersedia", status: 503 },
};
