import type { ActorContext, ClassAccessSummary } from "@/lib/api/types";
import type { ClassOverviewViewModel } from "@/features/workspace/overview";
import type { ClassParticipantViewModel, IdentityCandidateViewModel } from "@/features/classes/model";
import type { ClassLearningViewModel } from "@/features/learning/model";
import type { ClassSubmissionViewModel } from "@/features/submission/model";
import type { ClassGradebookViewModel } from "@/features/gradebook/model";

export const actors = {
  siteAdmin: { id: "actor-admin", display_name: "Site Admin", site_admin: true, account_state: "ACTIVE", site_capabilities: ["site.admin"] },
  teacher: { id: "actor-teacher", display_name: "Pengajar Demo", site_admin: false, account_state: "ACTIVE" },
  student: { id: "actor-student", display_name: "Student Demo", site_admin: false, account_state: "ACTIVE" },
  teacherStudent: { id: "actor-both", display_name: "Teacher sekaligus Student", site_admin: false, account_state: "ACTIVE" },
  facilitator: { id: "actor-facilitator", display_name: "Facilitator Demo", site_admin: false, account_state: "ACTIVE" },
  outsider: { id: "actor-outsider", display_name: "Outsider", site_admin: false, account_state: "ACTIVE" },
} satisfies Record<string, ActorContext>;

export const classes = {
  draft: { id: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", name: "Class Draft", state: "DRAFT", version: 1, contextual_roles: ["teacher"], enrollment_state: "ACTIVE", capabilities: ["class.read", "class.manage", "content.read", "content.manage", "content.publish", "files.upload", "participants.read", "participants.manage", "submission.read", "gradebook.read"] },
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

export const classSubmissions = {
  student: {
    [classes.published.id]: {
      classId: classes.published.id,
      timeZone: "Asia/Jakarta",
      updatedAt: "2026-09-14T09:15:00+07:00",
      learnerAssignments: [
        {
          assignmentId: "assignment-learning-dashboard",
          activityId: "activity-student-assignment",
          title: "Project Brief: Learning Dashboard",
          summary: "Susun rancangan dashboard pembelajaran yang informatif dan fokus untuk Student.",
          dueAt: "2026-09-18T23:59:00+07:00",
          cutoffAt: "2026-09-20T23:59:00+07:00",
          deadlineState: "DUE_SOON",
          state: "DRAFT",
          currentRevision: 0,
          draftText: "Saya akan memulai dari hierarchy informasi, lalu memvalidasi alur tugas utama pada tampilan mobile.",
          savedAt: "2026-09-14T09:15:00+07:00",
          attachments: [],
          timeline: [{ id: "timeline-draft-1", type: "DRAFT_SAVED", occurredAt: "2026-09-14T09:15:00+07:00", label: "Draft server terakhir" }],
        },
        {
          assignmentId: "assignment-information-architecture",
          activityId: "activity-information-architecture",
          title: "UI/UX Design: Information Architecture",
          summary: "Dokumentasikan struktur navigasi dan alasan hierarchy yang dipilih.",
          dueAt: "2026-09-24T23:59:00+07:00",
          cutoffAt: "2026-09-26T23:59:00+07:00",
          deadlineState: "UPCOMING",
          state: "RETURNED",
          currentRevision: 1,
          draftText: "Revisi akan memperjelas pemisahan antara navigasi Class dan ruang kerja Activity.",
          savedAt: "2026-09-13T20:05:00+07:00",
          teacherFeedback: "Tambahkan alasan mengapa aksi utama ditempatkan dekat konteks tugas, lalu sertakan alur keyboard.",
          receipt: {
            code: "RCPT-PE26-IA-0001",
            submittedAt: "2026-09-12T15:20:00+07:00",
            serverRecordedAt: "2026-09-12T15:20:03+07:00",
          },
          attachments: [{ id: "submission-ia-v1", name: "information-architecture-v1.pdf", sizeBytes: 2_340_000, state: "READY" }],
          timeline: [
            { id: "timeline-ia-draft", type: "DRAFT_SAVED", occurredAt: "2026-09-12T14:10:00+07:00" },
            { id: "timeline-ia-submit", type: "SUBMITTED", occurredAt: "2026-09-12T15:20:03+07:00", label: "Revision 1" },
            { id: "timeline-ia-return", type: "RETURNED", occurredAt: "2026-09-13T16:30:00+07:00", label: "Perlu revisi" },
          ],
        },
      ],
    },
  },
  teacher: {
    [classes.draft.id]: {
      classId: classes.draft.id,
      timeZone: "Asia/Jakarta",
      updatedAt: "2026-09-14T10:45:00+07:00",
      teacherInbox: [
        {
          submissionId: "submission-nabila-dashboard",
          assignmentId: "assignment-dashboard-draft-class",
          assignmentTitle: "Project Brief: Learning Dashboard",
          studentId: "66666666666666666666666666666666",
          studentName: "Nabila Sari",
          studentEmail: "nabila@example.test",
          state: "SUBMITTED",
          deadlineState: "UPCOMING",
          currentRevision: 2,
          submittedAt: "2026-09-14T10:30:00+07:00",
          excerpt: "Rancangan memprioritaskan konteks Class, pekerjaan terdekat, dan satu CTA utama menuju pembelajaran.",
          receipt: { code: "RCPT-DRAFT-NABILA-0002", submittedAt: "2026-09-14T10:30:00+07:00", serverRecordedAt: "2026-09-14T10:30:02+07:00" },
          attachments: [{ id: "nabila-dashboard-v2", name: "learning-dashboard-v2.pdf", sizeBytes: 4_120_000, state: "READY" }],
          timeline: [
            { id: "nabila-v1", type: "SUBMITTED", occurredAt: "2026-09-12T18:00:00+07:00", label: "Revision 1" },
            { id: "nabila-returned", type: "RETURNED", occurredAt: "2026-09-13T09:00:00+07:00" },
            { id: "nabila-v2", type: "RESUBMITTED", occurredAt: "2026-09-14T10:30:02+07:00", label: "Revision 2" },
          ],
        },
        {
          submissionId: "submission-arya-dashboard",
          assignmentId: "assignment-dashboard-draft-class",
          assignmentTitle: "Project Brief: Learning Dashboard",
          studentId: "student-arya",
          studentName: "Arya Wijaya",
          studentEmail: "arya@example.test",
          state: "RETURNED",
          deadlineState: "DUE_SOON",
          currentRevision: 1,
          submittedAt: "2026-09-13T17:45:00+07:00",
          excerpt: "Dashboard membagi informasi menjadi ringkasan, aktivitas, dan progres.",
          receipt: { code: "RCPT-DRAFT-ARYA-0001", submittedAt: "2026-09-13T17:45:00+07:00", serverRecordedAt: "2026-09-13T17:45:04+07:00" },
          attachments: [],
          timeline: [
            { id: "arya-submit", type: "SUBMITTED", occurredAt: "2026-09-13T17:45:04+07:00", label: "Revision 1" },
            { id: "arya-return", type: "RETURNED", occurredAt: "2026-09-14T08:20:00+07:00", label: "Hierarchy perlu diperjelas" },
          ],
        },
        {
          submissionId: "submission-salsa-dashboard",
          assignmentId: "assignment-dashboard-draft-class",
          assignmentTitle: "Project Brief: Learning Dashboard",
          studentId: "student-salsa",
          studentName: "Salsa Ramadhani",
          studentEmail: "salsa@example.test",
          state: "GRADED",
          deadlineState: "UPCOMING",
          currentRevision: 1,
          submittedAt: "2026-09-12T12:00:00+07:00",
          excerpt: "Solusi menggunakan hierarchy berbasis kebutuhan Student dan progressive disclosure.",
          receipt: { code: "RCPT-DRAFT-SALSA-0001", submittedAt: "2026-09-12T12:00:00+07:00", serverRecordedAt: "2026-09-12T12:00:02+07:00" },
          attachments: [{ id: "salsa-dashboard-v1", name: "dashboard-salsa.pdf", sizeBytes: 3_800_000, state: "READY" }],
          timeline: [
            { id: "salsa-submit", type: "SUBMITTED", occurredAt: "2026-09-12T12:00:02+07:00" },
            { id: "salsa-graded", type: "GRADED", occurredAt: "2026-09-13T14:00:00+07:00", label: "Nilai masih draft" },
          ],
        },
      ],
    },
  },
} satisfies Record<"student" | "teacher", Record<string, ClassSubmissionViewModel>>;

export const classGradebooks = {
  teacher: {
    [classes.draft.id]: {
      classId: classes.draft.id,
      timeZone: "Asia/Jakarta",
      updatedAt: "2026-09-14T11:00:00+07:00",
      assignments: [
        {
          assignmentId: "assignment-dashboard-draft-class",
          title: "Project Brief: Learning Dashboard",
          rubricVersion: 2,
          maxPoints: 100,
          criteria: [
            { id: "criterion-hierarchy", title: "Hierarchy informasi", description: "Prioritas konteks dan aksi utama mudah dipahami.", maxPoints: 35 },
            { id: "criterion-flow", title: "Alur penggunaan", description: "Alur Student konsisten pada desktop, mobile, dan keyboard.", maxPoints: 35 },
            { id: "criterion-evidence", title: "Argumentasi desain", description: "Keputusan disertai alasan dan evidence yang dapat ditinjau.", maxPoints: 30 },
          ],
          entries: [
            {
              submissionId: "submission-nabila-dashboard",
              assignmentId: "assignment-dashboard-draft-class",
              studentId: "66666666666666666666666666666666",
              studentName: "Nabila Sari",
              submissionRevision: 2,
              gradeVersion: 0,
              state: "UNGRADED",
              criterionScores: { "criterion-hierarchy": 0, "criterion-flow": 0, "criterion-evidence": 0 },
              aiSuggestion: {
                state: "READY",
                summary: "Saran menilai hierarchy sudah kuat, tetapi evidence pengujian keyboard masih perlu diperjelas.",
                criterionScores: { "criterion-hierarchy": 30, "criterion-flow": 27, "criterion-evidence": 22 },
                modelLabel: "Assessment assistant preview",
                generatedAt: "2026-09-14T10:40:00+07:00",
                provenanceLabel: "Rubric v2 · Submission revision 2",
              },
            },
            {
              submissionId: "submission-arya-dashboard",
              assignmentId: "assignment-dashboard-draft-class",
              studentId: "student-arya",
              studentName: "Arya Wijaya",
              submissionRevision: 1,
              gradeVersion: 1,
              state: "DRAFT",
              criterionScores: { "criterion-hierarchy": 24, "criterion-flow": 25, "criterion-evidence": 20 },
              feedback: "Perjelas hubungan antara status pekerjaan dan tindakan berikutnya.",
              aiSuggestion: { state: "FAILED", failureReason: "Provider tidak tersedia. Tidak ada nilai fallback yang dibuat." },
            },
            {
              submissionId: "submission-salsa-dashboard",
              assignmentId: "assignment-dashboard-draft-class",
              studentId: "student-salsa",
              studentName: "Salsa Ramadhani",
              submissionRevision: 1,
              gradeVersion: 2,
              state: "RELEASED",
              criterionScores: { "criterion-hierarchy": 32, "criterion-flow": 31, "criterion-evidence": 27 },
              feedback: "Hierarchy jelas dan keputusan desain dijelaskan dengan baik.",
              releasedAt: "2026-09-14T09:00:00+07:00",
            },
          ],
        },
      ],
      importPreview: {
        previewId: "grade-import-preview-01",
        fileName: "nilai-learning-dashboard.csv",
        policyVersion: 2,
        expiresAt: "2026-09-14T12:00:00+07:00",
        validRows: 18,
        invalidRows: 2,
        unchangedRows: 4,
        issues: ["Baris 7: score melebihi batas criterion.", "Baris 14: Student tidak ditemukan pada Class ini."],
      },
    },
  },
} satisfies Record<"teacher", Record<string, ClassGradebookViewModel>>;

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
