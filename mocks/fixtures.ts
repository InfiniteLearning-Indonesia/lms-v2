import type { ActorContext, ClassAccessSummary } from "@/lib/api/types";
import type { ClassOverviewViewModel } from "@/features/workspace/overview";
import type { ClassParticipantViewModel, IdentityCandidateViewModel } from "@/features/classes/model";

export const actors = {
  siteAdmin: { id: "actor-admin", display_name: "Site Admin", site_admin: true, account_state: "ACTIVE", site_capabilities: ["site.admin"] },
  teacher: { id: "actor-teacher", display_name: "Pengajar Demo", site_admin: false, account_state: "ACTIVE" },
  student: { id: "actor-student", display_name: "Student Demo", site_admin: false, account_state: "ACTIVE" },
  teacherStudent: { id: "actor-both", display_name: "Teacher sekaligus Student", site_admin: false, account_state: "ACTIVE" },
  facilitator: { id: "actor-facilitator", display_name: "Facilitator Demo", site_admin: false, account_state: "ACTIVE" },
  outsider: { id: "actor-outsider", display_name: "Outsider", site_admin: false, account_state: "ACTIVE" },
} satisfies Record<string, ActorContext>;

export const classes = {
  draft: { id: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", name: "Class Draft", state: "DRAFT", version: 1, contextual_roles: ["teacher"], enrollment_state: "ACTIVE", capabilities: ["class.read", "class.manage", "content.read", "participants.read", "participants.manage"] },
  published: { id: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", name: "Product Engineering 2026", program_label: "Software Engineering", cohort_label: "Batch 01", state: "PUBLISHED", version: 3, contextual_roles: ["student"], enrollment_state: "ACTIVE", capabilities: ["class.read", "content.read", "participants.read", "submission.read", "progress.read", "attendance.read", "logbook.read", "credentials.read"], next_actions: ["Lanjutkan materi berikutnya"] },
  closed: { id: "cccccccccccccccccccccccccccccccc", name: "Class Closed", state: "CLOSED", version: 7, contextual_roles: ["teacher"], enrollment_state: "ACTIVE", capabilities: ["class.read", "class.manage", "participants.read", "participants.manage", "gradebook.read", "progress.read"] },
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

export const classParticipants = {
  [classes.published.id]: [
    {
      enrollmentId: "enrollment-peja",
      userId: "11111111111111111111111111111111",
      displayName: "Hafara Putri (Peja)",
      email: "hafara.putri@example.test",
      roles: ["teacher"],
      state: "ACTIVE",
      joinedAt: "2026-08-01T09:00:00+07:00",
      history: [{ id: "history-peja-added", action: "ADDED", occurredAt: "2026-08-01T09:00:00+07:00", actorLabel: "Site Admin" }],
    },
    {
      enrollmentId: "enrollment-riyan",
      userId: "22222222222222222222222222222222",
      displayName: "Student Riyan",
      email: "riyan@example.test",
      roles: ["student"],
      state: "ACTIVE",
      joinedAt: "2026-08-02T10:30:00+07:00",
      history: [{ id: "history-riyan-added", action: "ADDED", occurredAt: "2026-08-02T10:30:00+07:00", actorLabel: "Site Admin" }],
    },
    {
      enrollmentId: "enrollment-dinda",
      userId: "33333333333333333333333333333333",
      displayName: "Dinda Maharani",
      email: "dinda@example.test",
      roles: ["student"],
      state: "SUSPENDED",
      joinedAt: "2026-08-02T10:35:00+07:00",
      history: [
        { id: "history-dinda-added", action: "ADDED", occurredAt: "2026-08-02T10:35:00+07:00", actorLabel: "Site Admin" },
        { id: "history-dinda-suspended", action: "SUSPENDED", occurredAt: "2026-09-08T14:15:00+07:00", actorLabel: "Hafara Putri" },
      ],
    },
    {
      enrollmentId: "enrollment-bima",
      userId: "44444444444444444444444444444444",
      displayName: "Bima Pratama",
      email: "bima@example.test",
      roles: ["student"],
      state: "ENDED",
      joinedAt: "2026-08-03T08:00:00+07:00",
      history: [
        { id: "history-bima-added", action: "ADDED", occurredAt: "2026-08-03T08:00:00+07:00", actorLabel: "Site Admin" },
        { id: "history-bima-ended", action: "ENDED", occurredAt: "2026-09-01T16:00:00+07:00", actorLabel: "Site Admin" },
      ],
    },
  ],
  [classes.draft.id]: [
    {
      enrollmentId: "enrollment-teacher-demo",
      userId: "55555555555555555555555555555555",
      displayName: "Pengajar Demo",
      email: "pengajar@example.test",
      roles: ["teacher"],
      state: "ACTIVE",
      joinedAt: "2026-09-01T09:00:00+07:00",
      history: [{ id: "history-teacher-demo-added", action: "ADDED", occurredAt: "2026-09-01T09:00:00+07:00", actorLabel: "Site Admin" }],
    },
    {
      enrollmentId: "enrollment-nabila",
      userId: "66666666666666666666666666666666",
      displayName: "Nabila Sari",
      email: "nabila@example.test",
      roles: ["student"],
      state: "ACTIVE",
      joinedAt: "2026-09-02T10:00:00+07:00",
      history: [{ id: "history-nabila-added", action: "ADDED", occurredAt: "2026-09-02T10:00:00+07:00", actorLabel: "Pengajar Demo" }],
    },
  ],
} satisfies Record<string, ClassParticipantViewModel[]>;

export const identityCandidates = [
  { userId: "77777777777777777777777777777777", displayName: "Alya Rahman", email: "alya@example.test" },
  { userId: "88888888888888888888888888888888", displayName: "Farhan Aditya", email: "farhan@example.test" },
  { userId: "99999999999999999999999999999999", displayName: "Nadia Putri", email: "nadia@example.test" },
] satisfies IdentityCandidateViewModel[];

export const errorFixtures = {
  forbidden: { code: "FORBIDDEN", message: "Capability tidak tersedia", request_id: "req-forbidden", status: 403 },
  conflict: { code: "VERSION_CONFLICT", message: "Versi resource sudah berubah", request_id: "req-conflict", current_version: 4, status: 409 },
  validation: { code: "VALIDATION_ERROR", message: "Periksa input", field_errors: { name: ["Wajib diisi"] }, status: 422 },
  rateLimit: { code: "RATE_LIMITED", message: "Terlalu banyak permintaan", retry_after_seconds: 10, status: 429 },
  unavailable: { code: "SERVICE_UNAVAILABLE", message: "Layanan belum tersedia", status: 503 },
};
