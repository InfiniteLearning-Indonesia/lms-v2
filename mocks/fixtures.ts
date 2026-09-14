import type { ActorContext, ClassAccessSummary } from "@/lib/api/types";
import type { ClassOverviewViewModel } from "@/features/workspace/overview";
import type { ClassParticipantViewModel, IdentityCandidateViewModel } from "@/features/classes/model";
import type { ClassLearningViewModel } from "@/features/learning/model";

export const actors = {
  siteAdmin: { id: "actor-admin", display_name: "Site Admin", site_admin: true, account_state: "ACTIVE", site_capabilities: ["site.admin"] },
  teacher: { id: "actor-teacher", display_name: "Pengajar Demo", site_admin: false, account_state: "ACTIVE" },
  student: { id: "actor-student", display_name: "Student Demo", site_admin: false, account_state: "ACTIVE" },
  teacherStudent: { id: "actor-both", display_name: "Teacher sekaligus Student", site_admin: false, account_state: "ACTIVE" },
  facilitator: { id: "actor-facilitator", display_name: "Facilitator Demo", site_admin: false, account_state: "ACTIVE" },
  outsider: { id: "actor-outsider", display_name: "Outsider", site_admin: false, account_state: "ACTIVE" },
} satisfies Record<string, ActorContext>;

export const classes = {
  draft: { id: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", name: "Class Draft", state: "DRAFT", version: 1, contextual_roles: ["teacher"], enrollment_state: "ACTIVE", capabilities: ["class.read", "class.manage", "content.read", "content.manage", "content.publish", "files.upload", "participants.read", "participants.manage"] },
  published: { id: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", name: "Product Engineering 2026", program_label: "Software Engineering", cohort_label: "Batch 01", state: "PUBLISHED", version: 3, contextual_roles: ["student"], enrollment_state: "ACTIVE", capabilities: ["class.read", "content.read", "participants.read", "submission.read", "progress.read", "attendance.read", "logbook.read", "credentials.read"], next_actions: ["Lanjutkan materi berikutnya"] },
  closed: { id: "cccccccccccccccccccccccccccccccc", name: "Class Closed", state: "CLOSED", version: 7, contextual_roles: ["teacher"], enrollment_state: "ACTIVE", capabilities: ["class.read", "class.manage", "content.read", "participants.read", "participants.manage", "gradebook.read", "progress.read"] },
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

export const classLearning = {
  [classes.draft.id]: {
    classId: classes.draft.id,
    timeZone: "Asia/Jakarta",
    updatedAt: "2026-09-11T14:30:00+07:00",
    filePolicy: {
      maxBytes: 10_000_000,
      allowedMimeTypes: ["application/pdf", "image/png", "image/jpeg"],
      allowedExtensions: [".pdf", ".png", ".jpg", ".jpeg"],
    },
    sections: [
      {
        id: "section-orientation",
        title: "Orientasi dan fondasi",
        description: "Konteks Class, cara bekerja, dan fondasi project.",
        version: 3,
        activities: [
          {
            id: "activity-welcome",
            type: "MATERIAL",
            title: "Selamat datang di Product Engineering",
            summary: "Panduan singkat sebelum memulai rangkaian pembelajaran.",
            lifecycle: "PUBLISHED",
            revision: 2,
            availability: { state: "AVAILABLE" },
            durationMinutes: 8,
            content: [
              { type: "heading", level: 2, text: "Cara menggunakan ruang belajar" },
              { type: "paragraph", text: "Mulai dari aktivitas pertama, baca tujuan setiap sesi, lalu gunakan materi pendamping yang telah dinyatakan siap." },
              { type: "list", items: ["Ikuti urutan aktivitas pada setiap Section.", "Perhatikan status dan jadwal yang ditetapkan Pengajar.", "Gunakan hanya attachment yang berstatus siap."] },
            ],
            attachments: [{ id: "asset-program-brief", name: "program-brief.pdf", sizeBytes: 2_480_000, mimeType: "application/pdf", state: "READY" }],
          },
          {
            id: "activity-design-system",
            type: "MATERIAL",
            title: "Menyusun fondasi design system",
            summary: "Draft materi tentang token, komponen, dan pola aksesibel.",
            lifecycle: "DRAFT",
            revision: 4,
            syncState: "STALE",
            latestRevision: 5,
            availability: { state: "UNAVAILABLE", reason: "Belum dipublikasikan untuk Student." },
            durationMinutes: 25,
            content: [
              { type: "heading", level: 2, text: "Fondasi sebelum komponen" },
              { type: "paragraph", text: "Tetapkan keputusan typography, color, spacing, dan interaction state sebelum memperbanyak variasi komponen." },
              { type: "callout", tone: "info", title: "Catatan Pengajar", text: "Konten ini masih berupa draft dan belum boleh dianggap sebagai revision final." },
              { type: "link", label: "Baca referensi accessibility", url: "https://www.w3.org/WAI/standards-guidelines/wcag/" },
            ],
            attachments: [
              { id: "asset-wireframe", name: "wireframe-reference.pdf", sizeBytes: 4_820_000, mimeType: "application/pdf", state: "SCANNING", statusReason: "File sedang dipindai sebelum dapat dilampirkan." },
              { id: "asset-legacy-demo", name: "legacy-demo.html", sizeBytes: 820_000, mimeType: "text/html", state: "QUARANTINED", statusReason: "Active content tidak dapat dipublikasikan." },
              { id: "asset-rejected-script", name: "interactive-reference.svg", sizeBytes: 320_000, mimeType: "image/svg+xml", state: "REJECTED", statusReason: "File ditolak oleh policy active content." },
            ],
          },
          {
            id: "activity-project-brief",
            type: "ASSIGNMENT",
            title: "Project Brief: Learning Dashboard",
            summary: "Definisi tugas untuk menyusun pengalaman dashboard pembelajaran.",
            lifecycle: "DRAFT",
            revision: 1,
            availability: { state: "SCHEDULED", availableAt: "2026-09-15T08:00:00+07:00", reason: "Akan tersedia sesuai jadwal server." },
            dueAt: "2026-09-22T23:59:00+07:00",
            cutoffAt: "2026-09-24T23:59:00+07:00",
            content: [
              { type: "paragraph", text: "Susun satu learning dashboard yang membantu Student menemukan aktivitas dan memahami langkah berikutnya." },
            ],
            attachments: [],
          },
        ],
      },
      {
        id: "section-discovery",
        title: "Discovery dan information architecture",
        description: "Rangkaian aktivitas berikutnya sedang disiapkan.",
        version: 1,
        activities: [],
      },
    ],
  },
  [classes.published.id]: {
    classId: classes.published.id,
    timeZone: "Asia/Jakarta",
    updatedAt: "2026-09-11T15:00:00+07:00",
    sections: [
      {
        id: "section-getting-started",
        title: "Mulai di sini",
        description: "Orientasi dan fondasi cara belajar di Class.",
        version: 2,
        activities: [
          {
            id: "activity-student-welcome",
            type: "MATERIAL",
            title: "Selamat datang di Product Engineering",
            summary: "Kenali alur belajar, status aktivitas, dan material pendamping.",
            lifecycle: "PUBLISHED",
            revision: 2,
            availability: { state: "AVAILABLE" },
            durationMinutes: 8,
            content: [
              { type: "heading", level: 2, text: "Mulai dengan konteks yang jelas" },
              { type: "paragraph", text: "Setiap Section menyusun aktivitas dalam urutan yang telah ditetapkan Pengajar. Buka aktivitas untuk membaca materi atau melihat ketentuan tugas." },
              { type: "callout", tone: "info", title: "Gunakan file yang siap", text: "Attachment hanya dapat dibuka setelah pemeriksaan backend menyatakan file siap dan akses Anda diizinkan." },
            ],
            attachments: [{ id: "asset-student-guide", name: "student-learning-guide.pdf", sizeBytes: 1_240_000, mimeType: "application/pdf", state: "READY" }],
          },
          {
            id: "activity-student-foundation",
            type: "MATERIAL",
            title: "Fondasi design system",
            summary: "Pelajari token dan pola UI sebelum masuk ke layout.",
            lifecycle: "PUBLISHED",
            revision: 3,
            availability: { state: "AVAILABLE" },
            durationMinutes: 25,
            content: [
              { type: "paragraph", text: "Design system membantu keputusan visual dan interaction tetap konsisten saat produk berkembang." },
              { type: "list", items: ["Mulai dari semantic token.", "Dokumentasikan state interaktif.", "Uji keyboard dan responsive sejak awal."] },
            ],
            attachments: [],
          },
        ],
      },
      {
        id: "section-practice",
        title: "Latihan terarah",
        description: "Terapkan fondasi pada studi kasus LMS.",
        version: 4,
        activities: [
          {
            id: "activity-student-assignment",
            type: "ASSIGNMENT",
            title: "Project Brief: Learning Dashboard",
            summary: "Bangun rancangan dashboard pembelajaran yang informatif dan fokus.",
            lifecycle: "PUBLISHED",
            revision: 4,
            availability: { state: "AVAILABLE" },
            dueAt: "2026-09-18T23:59:00+07:00",
            cutoffAt: "2026-09-20T23:59:00+07:00",
            content: [
              { type: "heading", level: 2, text: "Tujuan tugas" },
              { type: "paragraph", text: "Rancang hierarchy informasi yang membantu Student memahami Class, aktivitas berikutnya, dan status pekerjaan tanpa menampilkan progress palsu." },
              { type: "link", label: "Buka referensi brief eksternal", url: "https://example.com/learning-brief" },
            ],
            attachments: [{ id: "asset-project-template", name: "project-template.pdf", sizeBytes: 3_100_000, mimeType: "application/pdf", state: "EXPIRED", statusReason: "Akses sebelumnya kedaluwarsa dan harus diminta kembali." }],
          },
          {
            id: "activity-student-locked",
            type: "MATERIAL",
            title: "Usability review dan handoff",
            summary: "Review hasil setelah tugas utama diselesaikan.",
            lifecycle: "PUBLISHED",
            revision: 1,
            availability: { state: "LOCKED", prerequisiteLabel: "Project Brief: Learning Dashboard", reason: "Selesaikan prerequisite sebelum membuka materi ini." },
            durationMinutes: 18,
            content: [{ type: "paragraph", text: "Konten terkunci dan tidak boleh ditampilkan sebelum availability backend mengizinkan." }],
            attachments: [],
          },
        ],
      },
    ],
  },
} satisfies Record<string, ClassLearningViewModel>;

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
