# Handoff Frontend LMS v3 untuk OpenCode

**Diperbarui:** 17 September 2026  
**Repository:** `lms-v2`  
**Branch:** `fe-v3`  
**HEAD:** `f04a94d` — `checkpoint(fe06): add attendance and logbook UI shell`  
**Upstream saat handoff:** `origin/fe-v3` berada pada commit yang sama  
**Worktree saat dokumen dibuat:** bersih sebelum penambahan dokumen ini

Dokumen ini adalah ringkasan operasional agar pekerjaan dapat dilanjutkan di OpenCode tanpa mengandalkan riwayat chat. Dokumen canonical tetap:

- [Frontend Implementation Plan](FRONTEND_IMPLEMENTATION_PLAN.md)
- [Implementation Status](IMPLEMENTATION_STATUS.md)
- [Checkpoint FE01–FE06](checkpoints/)
- [Backend status](../../api-lms-v2/docs/IMPLEMENTATION_STATUS.md)

## 1. Posisi saat ini

FE00–FE06 telah memiliki implementasi frontend/UI-first dan commit checkpoint. Hanya FE00 yang berstatus `COMPLETED`; FE01–FE06 tetap `BLOCKED_BACKEND` karena mandatory journey HTTPS terhadap backend/identity owner nyata belum dapat dijalankan.

| Checkpoint | Fokus | Posisi | Commit |
|---|---|---|---|
| FE00 | Foundation, design system, transport, contract tooling, test | `COMPLETED 6/6` | `786d458` |
| FE01 | Identity, session, contextual workspace | `BLOCKED_BACKEND 6/7` | `147139d` |
| FE02 | Class dan participation | `BLOCKED_BACKEND 6/7` | `dc964f5` |
| FE03 | Learning content dan private file shell | `BLOCKED_BACKEND 6/8` | `0fe7521` |
| FE04 | Submission dan gradebook | `BLOCKED_BACKEND 6/8` | `64d74c6` |
| FE05 | Completion dan credential | `BLOCKED_BACKEND 6/8` | `391eb35` |
| FE06 | Attendance, izin/SP, logbook, mentoring | `BLOCKED_BACKEND 6/8` | `f04a94d` |
| FE07 | Admin, reporting, jobs, migration/cutover | `NOT_STARTED` | — |
| FE08 | Public UI, polish, cleanup, release gate | `NOT_STARTED` | — |

Angka terbaru setelah FE06 adalah **134 Vitest** dan **20 Playwright Chromium**. Beberapa angka historis di `IMPLEMENTATION_STATUS.md` menunjukkan jumlah test pada saat checkpoint sebelumnya dan tidak boleh dibaca sebagai regresi terkini.

## 2. Keputusan product dan kontrak yang sudah dikunci

1. LMS berpusat pada **Class**, bukan Program/Batch aktif.
2. User bersifat global dan dapat memiliki role kontekstual berbeda pada setiap Class.
3. Authorization UI berasal dari **contextual capability backend**, bukan string role, specialization, atau label Site Admin.
4. Class mendukung **multi-Teacher**. Kebiasaan satu Teacher per Class bukan invariant frontend/backend.
5. Enrollment bersifat **assigned-only**. Student tidak self-enroll; tidak ada katalog Class global, enroll key, atau tombol join.
6. Pencarian pada Workspace hanya memfilter Class yang sudah tersedia untuk actor dari `/me/classes`.
7. Frontend tetap provider-neutral. Google SSO dijalankan identity owner; frontend tidak memakai Google SDK/token secara langsung.
8. Tombol login tetap terlihat tetapi disabled sampai browser identity bridge dapat menyelesaikan flow nyata. UI tidak mengirim challenge palsu.
9. Browser hanya memanggil API v3 melalui same-origin `/api/v3/*` dengan cookie session. Tidak ada token di URL, local/session storage, atau Authorization header.
10. Development fixture hanya boleh aktif melalui explicit server-only preview. Production harus fail closed dan tidak boleh mengarang endpoint atau success response.
11. Final mutation tidak boleh diaktifkan sebelum OpenAPI, capability, CSRF, version/idempotency, typed error, dan durable receipt tersedia.
12. Raw HTML bebas tidak dirender. Rich content memakai struktur/allowlist; jangan menggunakan `dangerouslySetInnerHTML` sebagai shortcut.
13. Setiap logic/state baru wajib memiliki unit/component test, dan setiap FE wajib memiliki mandatory Playwright journey. Mock E2E tidak menggantikan real HTTPS integration journey.
14. Jangan mengubah repository `api-lms-v2` dari pekerjaan frontend kecuali user memberikan scope baru secara eksplisit.

## 3. Implementasi yang sudah tersedia

### FE01 — Identity dan Workspace

- Login sementara disabled dan tidak mengirim challenge yang belum usable.
- Actor/session provider, route guard, unauthorized/forbidden/unavailable state, profile, dan session command shell.
- Class context mengikuti `classId` pada URL.
- Workspace menampilkan seluruh Class actor-scoped dan search lokal atas daftar tersebut.
- Sidebar memakai exact active route; tidak ada multi-active-tab.
- Saat berada dalam Class, selector/search Class dan menu Workspace diganti menjadi **Back to Workspace**.
- Ringkasan Class menampilkan konteks, satu entry ke Pembelajaran, Pengingat Logbook, serta Tugas Mendatang.
- Progress tidak ditampilkan sebagai menu sidebar.

### FE02 — Class dan Participation

- Site Admin preview mempunyai direktori Class, search/filter, create shell, settings metadata/version/lifecycle, serta action Edit/Lihat dan Buka.
- Participant directory, identity picker, role scope, lifecycle participation, history, dan bulk dependency state.
- Admin dapat memilih Teacher/Student; Teacher hanya dapat menambahkan Student bila capability mengizinkan.
- Student tidak dapat self-enroll.
- Version/conflict semantics terlihat di UI, tetapi final command masih fail closed.

### FE03 — Learning Content

- Halaman Pembelajaran memakai focused workspace tanpa sidebar.
- Teacher melihat informasi **Preview Student Mode**; Student tidak melihat label tersebut.
- Activity card memenuhi lebar container dan mempunyai CTA edit kontekstual.
- Section dapat mempunyai nama serta deskripsi opsional; empty Section menampilkan **Tidak Ada Activity**.
- Teacher UI mempunyai create/edit/delete Section shell dan **+ Tambah Activity** per Section.
- Pemilihan Materi/Tugas mengarah ke route create khusus.
- Editor create/edit Activity memakai structured rich text.
- Ordering hanya dilakukan lewat **Edit Urutan** pada header Susunan Pembelajaran; ordering tidak berada di editor Activity atau modal Section.
- Dialog edit Section dapat mengatur urutan Activity di dalam Section secara lokal.
- Semua final create/save/publish/delete/reorder/upload command masih disabled sampai M06–M07 siap.

### FE04 — Submission dan Gradebook

- Student submission workspace dengan draft lokal, deadline/cutoff presentation, attachment shell, revision timeline, dan receipt presentation.
- Teacher submission inbox, detail revision, rubric grade editor, regrade/release state.
- Import preview dan AI suggestion state tersedia.
- AI tidak authoritative; hasil hanya dapat diterapkan Teacher ke draft lokal setelah human review.
- Production tidak meminta endpoint M08/M09/M13 yang belum canonical.

### FE05 — Completion dan Credential

- Progress Student dan Teacher dengan actor-scoped projection, evidence, waiver, missing/reopened/correction explanation.
- Outcome tidak dihitung ulang dari grade atau jumlah card browser.
- Transcript snapshot immutable dan versioned.
- Certificate eligibility, pending/issued/revoked/superseded, private download state, dan public verification data-minimal.
- Progress diakses kontekstual dari Learning dan tetap bukan menu sidebar.
- Lifecycle/download/public lookup nyata menunggu M07/M09/M10.

### FE06 — Attendance dan Logbook

- Mentee hanya melihat kalender kehadiran read-only miliknya.
- Teacher mempunyai dua mode: **Input & Kalender Kehadiran** dan **Rekap Kehadiran Bulanan**.
- Klik tanggal Teacher yang memiliki meeting membuka modal roster meeting-scoped.
- Modal menampilkan nama/email Student, status saat ini, dropdown status lokal, status hari, dan aksi asynchronous.
- Modal hanya tersedia dengan `attendance.manage`; Escape/close mengembalikan fokus dan membuang draft lokal.
- Save attendance dan asynchronous-day command tetap disabled sampai M11 tersedia.
- Tanggal tanpa authoritative meeting tidak dibuat interaktif dan tidak menghasilkan attendance palsu.
- Missing attendance record tetap `UNKNOWN`, tidak otomatis menjadi `ABSENT`.
- Rekap bulanan berasal dari typed projection, bukan dihitung ulang dari UI cards.
- Review izin dan SP hanya muncul pada Teacher surface; izin pending tidak otomatis approved dan SP tetap Class-local.
- Logbook mendukung periode fleksibel, entry/revision/feedback, Teacher review inbox, serta read-only mentor/group history.
- Detail keputusan ada di [FE06 checkpoint](checkpoints/FE06.md).

## 4. Baseline flow aplikasi

Bagian ini adalah baseline alur yang harus dipertahankan saat UI direvisi atau backend mulai diintegrasikan. Route boleh mengalami polishing, tetapi ownership, authorization, dan urutan authority tidak boleh berubah tanpa pembaruan implementation plan.

### 4.1 Identity dan pembentukan context

Flow production target:

```text
/login
  → frontend meminta challenge melalui same-origin API
  → browser diarahkan ke identity owner yang di-allowlist
  → identity owner menjalankan Google SSO
  → callback frontend menerima opaque one-time code
  → backend menukar code dan menetapkan Secure/HttpOnly/SameSite cookie
  → CSRF bootstrap/refresh tersedia
  → /auth/me mengembalikan actor context
  → /me/classes mengembalikan Class actor-scoped + contextual capability
  → /app atau /app/classes/[classId]
```

Current state: flow berhenti pada `/login`. Tombol login disabled dan tidak meminta challenge karena identity-owner browser bridge belum tersedia. Development memakai explicit preview server-only, bukan session atau login palsu.

`classId` pada URL adalah sumber context Class. Pemilihan Class tidak boleh hanya disimpan dalam React state/local storage. Saat Class berubah, data Class sebelumnya tidak boleh bocor atau tetap dianggap current.

### 4.2 Baseline Student

```text
Login/session
  → Workspace /app
  → search hanya pada Class yang sudah diikuti
  → buka Ringkasan Class
  → lihat informasi Class, Tugas Mendatang, dan Pengingat Logbook
  → masuk Pembelajaran
  → buka Activity published/available
  → bila Activity adalah Tugas: buka Pengumpulan dan kelola draft/submit/revision
  → lihat Progress secara kontekstual dari Pembelajaran
  → lihat Transcript/Certificate pada Kredensial
  → lihat kalender pribadi pada Kehadiran
  → isi/revisi Logbook untuk periode yang aktif
```

Aturan Student:

- Tidak dapat mencari Class global, self-enroll, atau memakai enroll key.
- Tidak melihat Preview Student Mode, authoring control, Teacher roster, rekap cohort, review izin, SP management, Teacher logbook inbox, atau data Student lain.
- Activity/assignment/attendance/logbook/progress/credential hanya tampil dari actor-scoped projection.
- Route atau menu yang tidak mempunyai capability harus fail closed.

### 4.3 Baseline Teacher

```text
Login/session
  → Workspace /app
  → pilih Class yang dikelola
  → Ringkasan Class
  → Pembelajaran dalam focused workspace
      → preview Student surface
      → create/edit Section dan Activity
      → atur urutan dari Edit Urutan
      → publish/withdraw setelah backend tersedia
  → Pengumpulan
      → cari dan tinjau submission Student
  → Nilai
      → isi rubric/draft grade
      → human-review AI suggestion
      → release setelah backend tersedia
  → Kehadiran
      → pilih tanggal yang mempunyai meeting
      → modal roster meeting-scoped
      → pilih status Student
      → simpan setelah M11 tersedia
      → buka rekap bulanan
      → review izin dan SP sesuai capability
  → Logbook
      → pilih periode/entry Student
      → beri feedback atau minta revisi/accept setelah M12 tersedia
      → baca histori mentor/group
  → Kredensial/Progress sesuai capability
```

Aturan Teacher:

- Satu Class dapat mempunyai lebih dari satu Teacher.
- Teacher tidak otomatis boleh menjalankan semua command; setiap control tetap mengikuti contextual capability.
- Teacher hanya dapat menambahkan Student bila participant-management capability tersedia. Assignment Teacher lain tetap domain Admin/policy backend.
- Preview Student adalah mode informasi/presentasi, bukan impersonation dan bukan authorization bypass.

### 4.4 Baseline Site Admin

Flow Class management yang sudah disiapkan FE02:

```text
Login/session dengan site capability
  → /app/admin/classes
  → cari/filter Class
  → buat Draft Class nama-first
  → buka Settings
  → edit metadata dengan version
  → tambah Teacher/Student melalui identity-owner-backed search
  → publish/close/reopen/archive sesuai lifecycle
  → buka People untuk participant state dan history
```

User identity bersifat global; participant adalah assignment identity ke Class, bukan pembuatan akun baru di dalam Class. Final create/edit/participant/lifecycle commands tetap menunggu read model, CSRF, capability, version, dan receipt backend.

Area Admin lain—Users/Invitation, Reports, Audit, Jobs, Migration/Cutover—adalah scope FE07 dan belum boleh dianggap sudah dibangun hanya karena route placeholder tersedia.

### 4.5 Baseline read dan mutation

```text
URL + actor session
  → backend memvalidasi actor dan ownership
  → actor-scoped typed projection
  → frontend memvalidasi schema dan ancestry Class
  → capability menentukan menu/control
  → user mengubah draft visual lokal
  → final command membawa CSRF + idempotency key + version/ETag
  → backend mengembalikan typed result/durable receipt
  → frontend refetch projection authoritative
```

Frontend tidak boleh mengubah local draft menjadi authoritative success sebelum receipt. `409` harus menjadi conflict state; retry memakai idempotency intent yang sama bila hasil commit belum diketahui. GET/render tidak boleh melakukan repair atau mutation tersembunyi.

### 4.6 Development preview versus production

| Area | Development preview | Production saat backend belum siap |
|---|---|---|
| Identity | Actor dipilih melalui server-only `LMS_DEV_PREVIEW_ACTOR` | Login disabled/dependency state |
| Class list/context | Typed fixture actor-scoped | Read/dependency state; tidak mengarang `/me/classes` |
| Domain data | Typed fixture FE01–FE06 | Explicit dependency/empty state |
| Local form interaction | Boleh untuk mengevaluasi UX | Boleh bila tidak mengklaim tersimpan |
| Final mutation | Disabled, tidak mengirim request | Disabled, tidak mengirim request |
| Success/receipt | Tidak dipalsukan | Hanya dari backend authoritative |

### 4.7 Baseline mandatory release journey

Urutan release yang nantinya wajib dibuktikan melalui backend nyata dan HTTPS:

1. Login → actor/session → pilih Class dengan contextual capability.
2. Admin membuat Class → assign Teacher/Student → publish.
3. Teacher membuat/publish Activity → Student membuka dan submit → Teacher grade/release.
4. Completion evidence → outcome → transcript → certificate sesuai policy.
5. Meeting → attendance → izin/review → SP/correction bila berlaku.
6. Logbook draft → submit → revision-required atau accepted.
7. Tab lama/stale saat fence atau migration menerima read-only/`CLASS_MOVED` dan safe retry, bukan silent data loss.

## 5. Backend blocker yang masih aktif

| FE | Dependency utama yang belum tersedia |
|---|---|
| FE01 | Identity-owner redirect, opaque one-time code exchange, CSRF refresh/new-tab, actor profile, `/me/classes` + capability |
| FE02 | Class listing/read model, participant reads/search/history, identity search, bulk preview, strict version conflict, browser-safe CSRF |
| FE03 | M06–M07 section/activity revision, private file intent/transfer/scan/access, CSRF dan receipt |
| FE04 | M08–M09/M13 submission, deadline, rubric/grade/release, import/job semantics dan durable receipt |
| FE05 | M07/M09/M10 completion evidence/policy, transcript release, credential lifecycle/download/public lookup |
| FE06 | M06/M11/M12 meeting/attendance correction, private proof, permit/SP, logbook period/entry/review, mentor/group history |
| FE07 | M13–M18 admin/reporting/audit/job/migration/cutover read models dan commands |

Sebelum integrasi, re-read status dan OpenAPI backend terbaru. Backend commit yang dicatat pada inspeksi checkpoint adalah `52cbc88`, tetapi jangan menganggapnya masih current tanpa verifikasi.

## 6. Preview development

Install dan jalankan dari directory `lms-v2`:

```bash
npm ci
npm run dev:preview
```

Default actor adalah Student. Actor lain:

```bash
LMS_DEV_PREVIEW_ACTOR=teacher npm run dev:preview
LMS_DEV_PREVIEW_ACTOR=siteAdmin npm run dev:preview
```

Allowed actor: `student`, `teacher`, `teacherStudent`, `facilitator`, `siteAdmin`.

Route penting:

- Student workspace: `/app`
- Student Class fixture: `/app/classes/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb`
- Teacher Class fixture: `/app/classes/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`
- Teacher Learning: `/app/classes/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/learning`
- Teacher Attendance: `/app/classes/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/attendance`
- Teacher Logbook: `/app/classes/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/logbook`
- Site Admin Classes: `/app/admin/classes`

Preview tidak membuat session, tidak mengaktifkan mutation, dan tidak mengubah kontrak production.

## 7. Quality gate terakhir

Pada source commit `f04a94d`:

```text
npm run check     PASS
- assets:check    PASS
- contract:check  PASS, checksum 00b66b2ee0ed…
- lint            PASS
- typecheck       PASS
- Vitest          134/134 PASS
- production build PASS
- bundle scan     PASS, 11 forbidden patterns absent

npm run test:e2e  20/20 Chromium PASS
```

FE06 juga telah diperiksa visual pada desktop 1440 px dan mobile 375 px tanpa global horizontal overflow. Attendance modal diperiksa dengan keyboard/focus semantics dan reduced-motion-compatible dialog primitive.

Setelah perubahan apa pun, minimum jalankan:

```bash
npm run check
npm run test:e2e
git diff --check
```

## 8. Langkah berikutnya

### Jika melanjutkan UI-first

Checkpoint berikutnya adalah **FE07**, tetapi brief-nya belum dibekukan. Sebelum menulis kode:

1. Re-read `FRONTEND_IMPLEMENTATION_PLAN.md`, status frontend, dan backend M13–M18 terbaru.
2. Buat `docs/checkpoints/FE07.md`.
3. Bekukan scope, deliverable, capability matrix, mandatory tests, backend dependencies, dan stop condition.
4. Tentukan mana yang aman dibuat sebagai read-only/dependency UI: user/invitation administration, audit, report/export, async jobs, migration evidence, ownership, maintenance/read-only, `CLASS_MOVED`, dan safe retry.
5. Jangan membuat endpoint/payload fixture yang dipresentasikan sebagai kontrak canonical.
6. Gunakan `.agents/skills/ui-ux-pro-max/SKILL.md` untuk pekerjaan UI/UX dan ikuti instruksinya sebelum implementasi.

### Jika backend sudah siap

Jangan langsung membuka semua mutation. Integrasikan satu checkpoint berdasarkan contract nyata dan jalankan mandatory journey checkpoint terkait:

- FE01-T13 untuk identity/session/workspace.
- FE02-T12 untuk create Class dan participation.
- FE03-T14 untuk content/private file.
- FE04-T14 untuk submit/grade/release.
- FE05-T14 untuk completion/transcript/certificate.
- FE06-T14 untuk attendance/permit/SP/logbook/review.

Pertahankan fixture, empty, denial, negative, accessibility, dan production fail-closed tests saat menambahkan integration tests.

## 9. Instruksi aman untuk agent berikutnya

- Baca file checkpoint yang relevan sampai selesai sebelum coding.
- Periksa `git status`; jangan menimpa perubahan user atau pekerjaan checkpoint lain.
- Gunakan `rg` untuk pencarian dan `apply_patch` untuk edit manual.
- Jangan mengaktifkan button final hanya agar demo terlihat berfungsi.
- Jangan membuat role label sebagai authorization shortcut.
- Jangan menyimpan auth/file proof/signed URL di browser storage.
- Jangan menganggap fixture sebagai bukti backend integration.
- Jangan menandai FE01–FE06 `COMPLETED` sebelum real HTTPS journey lulus.
- Jangan commit/push/deploy kecuali user meminta.

## 10. Prompt awal yang dapat dipakai di OpenCode

```text
Kerjakan dari repository lms-v2 branch fe-v3. Baca docs/OPENCODE_HANDOFF.md,
docs/FRONTEND_IMPLEMENTATION_PLAN.md, docs/IMPLEMENTATION_STATUS.md, dan checkpoint
aktif sebelum bertindak. Posisi terakhir adalah commit f04a94d: FE00 selesai, FE01–FE06
frontend/UI-first sudah committed tetapi tetap BLOCKED_BACKEND, FE07 belum dimulai.
Pertahankan capability-based authorization, assigned-only enrollment, production
fail-closed, no browser token, no invented endpoint/mutation, serta mandatory unit dan
Playwright tests. Tanyakan atau buat brief FE07 terlebih dahulu sebelum implementasi,
kecuali tugas saya secara eksplisit meminta revisi checkpoint sebelumnya.
```
