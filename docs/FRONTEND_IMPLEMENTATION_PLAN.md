# Frontend Implementation Plan — LMS v3

**Versi:** 1.0  
**Tanggal:** 9 September 2026  
**Repository:** `lms-v2`  
**Branch implementasi:** `fe-v3`  
**Status:** `PLANNED`  
**Backend target:** `api-lms-v2`, branch `be-v3`

Dokumen ini adalah rencana canonical implementasi frontend LMS v3. Keputusan domain dan keamanan tetap mengikuti [ImplementationPlan.MD](../../ImplementationPlan.MD), sedangkan kesiapan backend aktual mengikuti [dashboard backend](../../api-lms-v2/docs/IMPLEMENTATION_STATUS.md). Status pekerjaan frontend dicatat di [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).

## 1. Tujuan dan keputusan tetap

Frontend lama diganti penuh di branch `fe-v3`. Branch/deployment lama tetap menjadi jalur legacy sampai cutover; build v3 tidak menyediakan fallback runtime ke API legacy.

Keputusan implementasi yang sudah dikunci:

1. LMS berpusat pada **Class**, bukan Program atau Batch aktif.
2. Satu user memakai satu workspace kontekstual dan dapat menjadi Pengajar di Class A serta Student di Class B.
3. UI menentukan menu dan aksi dari capability Class yang dikirim backend, bukan dari global role, specialization, atau switcher yang dipercaya sebagai authorization.
4. Istilah UI utama adalah **Pengajar/Teacher**. Personal Mentor adalah relasi pembimbing opsional yang berbeda.
5. Branding Infinite Learning dipertahankan; information architecture, layout, flow, dan komponen kerja dibangun ulang.
6. Bahasa rilis pertama adalah Bahasa Indonesia. Seluruh copy memakai message catalog agar locale lain dapat ditambahkan tanpa membongkar komponen.
7. Browser hanya memanggil API v3 melalui same-origin proxy `/api/v3/*`.
8. Tidak ada auth token di localStorage, sessionStorage, URL, atau Authorization header.
9. Pengembangan bersifat contract-first menggunakan OpenAPI, generated types, typed mock fixtures, dan MSW.
10. M04–M18 masuk cakupan frontend. Fitur opsional M19 seperti quiz engine, SCORM/LTI/xAPI, dan advanced analytics ditunda.

## 2. Baseline yang akan diganti

Baseline yang diperiksa pada branch `fe-v3`:

- Shell saat ini memilih satu dashboard global Admin/Facilitator/Mentor/Student dan belum mendukung role per Class.
- Sekitar 27.885 baris TypeScript/TSX/CSS tersebar dalam sejumlah komponen besar; beberapa dashboard berukuran lebih dari 1.000 baris.
- Terdapat sekitar 113 kombinasi lokasi/pola pemanggilan endpoint langsung dari komponen.
- `lib/config.ts` memasang global `window.fetch` interceptor dan mengambil Bearer token dari localStorage.
- Belum ada unit, component, contract, atau browser test frontend.
- TypeScript strict lulus pada baseline, tetapi ESLint menghasilkan 358 error dan 191 warning.
- Production build baseline memerlukan akses Google Fonts dan gagal pada environment tanpa network.
- OpenAPI backend saat ini baru mencakup session lokal dan sebagian Class lifecycle; endpoint domain akademik lain belum siap.

Angka baseline adalah bukti kondisi awal, bukan target untuk diperbaiki satu per satu. Implementasi v3 mengganti boundary lama dengan arsitektur baru dan harus mencapai quality gate pada Bagian 8.

## 3. Information architecture

### 3.1 Route publik

| Route | Fungsi |
|---|---|
| `/` | Landing page Infinite Learning LMS |
| `/login` | Memulai challenge dan login melalui identity owner |
| `/auth/callback` | Menyelesaikan one-time authorization exchange |
| `/status` | Status layanan dan informasi gangguan |
| `/certificate/verify/[code]` | Verifikasi credential publik dengan data minimum |

### 3.2 Workspace terautentikasi

| Route | Fungsi |
|---|---|
| `/app` | Ringkasan akun, pencarian Class yang diikuti actor, next actions, dan pekerjaan terbaru |
| `/app/profile` | Profil, session, dan keamanan akun |
| `/app/admin/users` | Provisioning dan administrasi identity |
| `/app/admin/classes` | Daftar, pencarian, dan pembuatan Class |
| `/app/admin/reports` | Reporting dan export terotorisasi |
| `/app/admin/audit` | Audit log terfilter dan terpaginated |
| `/app/admin/migrations` | Status code/data/ownership dan evidence cutover, read-only |

### 3.3 Workspace Class

Seluruh route berada di bawah `/app/classes/[classId]`. `classId` di URL adalah sumber context; pemilihan Class tidak hanya disimpan sebagai state browser.

| Child route | Fungsi |
|---|---|
| `/` | Overview, lifecycle, announcement, next actions |
| `/learning` | Section, materi, assignment, availability |
| `/people` | Enrollment, Teacher/Student, group, personal mentor |
| `/submissions` | Inbox, revision, receipt, dan review submission |
| `/gradebook` | Rubric, grade, release, import, AI suggestion |
| `/progress` | Activity/Class completion dan policy evidence |
| `/attendance` | Meeting, attendance, izin/sakit, SP |
| `/logbook` | Periode, entry revision, feedback, acceptance |
| `/credentials` | Transcript dan certificate |
| `/settings` | Metadata, policy, publish/close/archive commands |

Menu hanya muncul bila capability response mengizinkan. Menghilangkan menu bukan security boundary; backend tetap wajib menolak request tanpa hak.

Keputusan UX 10 September 2026: Ringkasan Class menampilkan konteks contract-backed, informasi partisipasi, satu menu menuju Pembelajaran, serta UI daftar Tugas Mendatang dan Pengingat Logbook; shortcut card Orang/Pengumpulan tidak diduplikasi. Daftar memakai UI-facing adapter dan fixture hanya pada development preview. Production menampilkan dependency state sampai read model M07/M08/M12 tersedia, sehingga frontend tidak mengarang endpoint, deadline, atau status. Progress tidak diekspos di sidebar. Direct route `/progress` tetap berada di policy guard sampai milestone completion menentukan nasib route tersebut, sehingga URL lama tidak menjadi akses tanpa capability.

## 4. Arsitektur aplikasi

### 4.1 Struktur kode

Gunakan Next.js 16 App Router dengan route groups `(public)`, `(auth)`, dan `(workspace)`. Server Components menangani layout, metadata, dan authenticated initial reads. Client Components dibatasi pada form, dialog, editor, tabel interaktif, upload, serta query/mutation yang membutuhkan browser state.

Kode domain ditempatkan di `features/<domain>/` dengan pola konsisten:

```text
features/<domain>/
  api/          query keys, query/mutation options, adapters
  components/   komponen domain
  schemas/      Zod form/view schemas
  types/        type tambahan yang tidak dihasilkan OpenAPI
  tests/        unit/component tests terkolokasi
```

Boundary bersama:

- `lib/api/`: generated OpenAPI types, `openapi-fetch` client, error normalization, idempotency, CSRF, dan server/client transports.
- `lib/auth/`: session bootstrap, actor context, logout/rotation, dan route guards.
- `lib/i18n/`: locale configuration serta message catalog `id`.
- `components/ui/`: primitive visual yang bebas aturan domain.
- `components/workspace/`: shell, sidebar, Class switcher, breadcrumbs, dan capability navigation.
- `contracts/`: snapshot OpenAPI, metadata backend commit/checksum, dan fixtures tervalidasi.

Tidak boleh ada pemanggilan API bisnis langsung dari page atau visual component. ESLint harus membatasi penggunaan global `fetch` di luar transport layer.

### 4.2 Data dan form

- Gunakan TanStack Query untuk remote/server state dan React state untuk state visual lokal.
- Query key selalu memuat actor scope dan `classId` bila datanya Class-owned.
- Pergantian Class membatalkan request in-flight serta membersihkan cache data sensitif dari Class sebelumnya.
- Gunakan React Hook Form + Zod untuk form dan mapping structured `field_errors`.
- Authoritative mutation tidak menampilkan sukses secara optimistis. UI menunggu `CommandReceipt` atau status job.
- Idempotency key dibuat sekali per user intent dan dipakai kembali saat retry request yang hasil commit-nya belum diketahui.
- Version/ETag selalu dikirim kembali pada edit, publish, role assignment, grade, dan policy mutation.
- `409 VERSION_CONFLICT` membuka conflict state yang menampilkan versi terbaru; tidak melakukan silent overwrite.

### 4.3 Desain, responsive, dan aksesibilitas

- Pertahankan logo, brand purple `#8A3DFF`, brand yellow `#FFCD29`, Lexend Deca, dan Inclusive Sans.
- Self-host font yang lisensinya telah diverifikasi melalui `next/font/local`; build tidak boleh mengunduh font.
- Student workflow mobile-first mulai lebar 360 px. Tabel Admin/Gradebook menggunakan desktop density dengan mobile card/detail fallback.
- Semua loading, empty, error, offline, unavailable, archived, read-only, conflict, queued, partial, dan failed states memiliki komponen eksplisit.
- Target aksesibilitas adalah WCAG 2.2 AA: keyboard penuh, focus visible, semantic headings/forms/tables/dialogs, contrast, reduced motion, dan live region yang tidak berisik.
- Rich content memakai format terstruktur dan renderer allowlist. Raw HTML tidak dirender melalui `dangerouslySetInnerHTML`.

## 5. Kontrak API frontend

### 5.1 Transport dan session

`next.config.ts` meneruskan `/api/v3/:path*` ke `${LMS_API_ORIGIN}/v3/:path*`. `LMS_API_ORIGIN` bersifat server-only; hapus `NEXT_PUBLIC_API_URL`. Mock API hanya aktif pada development/test dan harus gagal diaktifkan pada production build.

Alur session target:

1. Frontend meminta challenge melalui same-origin API.
2. Browser diarahkan ke hardened identity owner dengan nonce dan callback yang telah di-allowlist.
3. Callback hanya menerima opaque one-time authorization code, bukan session ID atau signed assertion dalam URL.
4. Frontend menukar code; backend menetapkan opaque Secure/HttpOnly/SameSite cookie dan mengembalikan CSRF token.
5. CSRF dikirim pada unsafe method. Backend harus menyediakan browser-safe CSRF bootstrap/refresh untuk page refresh dan tab baru.
6. `401` membersihkan actor/query state dan mengarahkan ke login; `403` tidak dianggap session expiry.
7. Rotation, logout, revoke-all, dan account disable memperbarui seluruh tab tanpa menyimpan auth credential di JavaScript storage.

Identity bridge produksi dan CSRF refresh belum tersedia pada kontrak backend sekarang. FE01 hanya dapat berstatus terintegrasi setelah kedua contract tersebut tersedia dan lulus browser test.

### 5.2 Tipe canonical

Frontend bergantung pada tipe OpenAPI berikut:

- `ActorContext`: ID, display profile, account state, site capabilities, dan session metadata.
- `ClassAccessSummary`: Class summary, enrollment state, contextual roles, capability strings, dan next actions.
- `Page<T>`: item, cursor berikutnya, stable sort, dan filter metadata.
- `ResourceVersion`: integer version atau ETag.
- `CommandReceipt`: operation ID, status, affected resource, resulting version, dan replay indicator.
- `Job`: queued/running/succeeded/partial/failed, progress, result, error, retryability, dan status URL.
- `ApiError`: `code`, `request_id`, optional `field_errors`, current version, retry-after, dan typed details.

Copy error diterjemahkan dari `code`; response backend tidak boleh menjadi raw HTML UI.

### 5.3 Kontrak backend minimum per domain

| Frontend | Backend handoff wajib |
|---|---|
| FE01 | Browser identity bridge, actor/profile, CSRF refresh, rotate/logout/revoke |
| FE02 | `/me/classes`, Class read/list/create/edit/lifecycle, participant list/search/commands, capabilities/version |
| FE03 | Section/activity revision, availability reason, file intent/upload/scan/access |
| FE04 | Submission draft/revision/receipt, grading/rubric/release, import preview/commit, AI jobs |
| FE05 | Completion evidence/policy, transcript snapshot, credential issue/revoke/verify |
| FE06 | Meeting/attendance, permission evidence/review, SP case, logbook revision/review, mentor/group history |
| FE07 | Paginated reports/audit, jobs, migration code/data/ownership status, Class moved/read-only semantics |

Snapshot OpenAPI di repo frontend wajib menyimpan backend commit dan checksum. Generated type harus reproducible. Fixture dan MSW handler divalidasi terhadap snapshot yang sama. Status `MOCK_ONLY` tidak boleh dipromosikan menjadi `INTEGRATED` tanpa contract test ke binary Go yang sebenarnya.

## 6. Gelombang implementasi FE00–FE08

| FE | Fokus | Dependency backend | Exit ringkas |
|---|---|---|---|
| FE00 | Fondasi, design system, contract tooling, test/CI | OpenAPI awal | Shell dan tooling baru build/test bersih |
| FE01 | Identity dan contextual workspace | M04 + real browser bridge | Login/session/workspace lulus E2E tanpa token browser |
| FE02 | Class dan participation | M05 | Create→participant→publish/lifecycle lulus |
| FE03 | Content dan file | M06–M07 | Teacher publish, Student access, private file flow lulus |
| FE04 | Submission dan gradebook | M08–M09 + M13 jobs | Submit→revision→grade→release lulus |
| FE05 | Completion dan credential | M10 | Completion→transcript→certificate lulus |
| FE06 | Attendance, izin, SP, logbook, mentoring | M11–M12 | LMS-specific workflows lulus per Class |
| FE07 | Admin, reporting, jobs, migration/cutover | M13–M18 | Operational/pilot states terlihat dan aman |
| FE08 | Landing/status, polish, cleanup, release gate | Semua slice terpilih | Full build tanpa legacy runtime dependency |

### FE00 — Fondasi

Bangun struktur baru, same-origin API client, generated contract, mock infrastructure, providers, design tokens, workspace shell, i18n, reusable state components, testing, dan CI. Rincian eksekusi pertama ada di [checkpoints/FE00.md](checkpoints/FE00.md).

### FE01 — Identity dan workspace

Implement login/challenge/callback, session bootstrap, rotation/logout, actor provider, pencarian Class actor-scoped, dashboard Ringkasan dengan UI task/logbook yang integration-ready, capability-driven navigation dengan exact active state, route guards, profile, serta unauthorized/forbidden states. UI task/logbook hanya memakai development fixture sampai kontrak M07/M08/M12 tersedia dan harus menampilkan dependency state pada production. Jangan menghidupkan kembali localStorage token untuk melewati blocker backend.

### FE02 — Class dan participation

Implement Class list/create nama-first, metadata opsional, edit dengan version conflict, publish/close/reopen/archive, Add Teacher/Student, suspend/reactivate/end, participant history, dan bulk preview setelah kontrak tersedia.

Enrollment v3 tetap assigned-only: Admin menambahkan Teacher atau Student, sedangkan Teacher hanya menambahkan Student bila contextual capability participant management mengizinkan. Student tidak self-enroll; tidak ada katalog Class global, enroll key, atau aksi join di frontend. Pencarian pada Workspace hanya memfilter Class actor-scoped dari `/me/classes` dan tidak mengubah authorization maupun logic identity owner.

### FE03 — Content dan file

Implement section/activity builder, draft/publish/withdraw, ordering, availability/prerequisite explanation, revision awareness, rich-text editor/renderer, private file upload, progress, scan/quarantine, serta learner content view.

### FE04 — Submission dan gradebook

Implement assignment detail, server draft, submit/resubmit, immutable timeline, durable receipt, due/cutoff timezone, teacher inbox, rubric grading, draft/final/released states, AI suggestion approval/override, dan grade import preview/commit.

### FE05 — Completion dan credential

Implement activity/Class progress, policy explanation, waived evidence, transcript snapshot, certificate eligibility/download/verification, revoke, supersede, serta correction state.

### FE06 — Operasional pembelajaran

Implement Class meeting calendar, bulk attendance, private permission evidence, approval/rejection, disciplinary case/SP, configurable logbook period, draft/revision/review, group, dan personal mentor history.

### FE07 — Admin dan cutover

Implement user/invitation administration, audit, export/report, async job center, migration evidence dashboard, ownership state, maintenance/read-only window, `CLASS_MOVED`, dan safe retry guidance.

### FE08 — Penyelesaian

Rombak landing/status, selesaikan responsive/accessibility/performance/security headers, jalankan production smoke, hapus komponen dan konfigurasi API legacy dari branch `fe-v3`, lalu buat release evidence.

## 7. Aturan eksekusi dan tracking

1. Kerjakan FE secara berurutan kecuali dependency backend memungkinkan dua slice independen.
2. Sebelum coding sebuah FE, buat `docs/checkpoints/FExx.md` dari pola FE00 dan bekukan deliverable, test, dependency, serta stop condition.
3. Update [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) pada awal, setelah QA, dan ketika blocker berubah.
4. Status yang valid: `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED_BACKEND`, `READY_FOR_QA`, `PARTIAL_QA`, `COMPLETED`.
5. `COMPLETED` memerlukan seluruh mandatory deliverable dan test lulus pada source/contract hash yang dicatat.
6. Satu commit sebaiknya menutup satu deliverable atau satu checkpoint logis; jangan mencampur refactor tak terkait.
7. Mock success, merge, dan UI demo bukan bukti integrasi backend atau release readiness.
8. Jangan mengubah `api-lms-v2` dari pekerjaan frontend. Contract gap dicatat sebagai backend dependency yang eksplisit.

### 7.1 Brief testing wajib untuk development berikutnya

Testing adalah bagian mandatory dari implementasi, bukan pekerjaan opsional setelah UI selesai:

1. Setiap logic, state, adapter, policy, atau interaction baru wajib disertai unit/component test pada checkpoint yang sama. Perubahan tanpa test yang proporsional belum layak dianggap selesai atau dikomit sebagai checkpoint final sebuah FE.
2. Untuk UI yang dibuat sebelum backend tersedia, test minimum mencakup fixture valid, successful empty state, loading/dependency state, error atau capability denial, navigasi/keyboard, dan formatting domain seperti timezone bila relevan. Fixture hanya membuktikan presentasi frontend.
3. Setiap FE wajib mempunyai mandatory journey Playwright yang menguji alur pengguna lintas halaman pada production build. Setelah backend contract tersedia, journey yang menyentuh data atau session wajib dijalankan terhadap backend/identity owner nyata melalui HTTPS.
4. Unit/component test dan mock E2E tidak dapat menggantikan mandatory journey terintegrasi. Checkpoint boleh dikomit dengan status `BLOCKED_BACKEND` bila seluruh gate lokal lulus dan blocker dicatat, tetapi milestone tidak boleh `COMPLETED` sampai journey nyata tersebut lulus.
5. Saat backend tersedia, tambahkan contract/integration test tanpa menghapus test fixture, empty, negative, capability, dan regression yang sudah ada.

## 8. Quality gate dan acceptance akhir

Setiap FE wajib menjalankan gate yang relevan:

- ESLint tanpa error; warning baru tidak diperbolehkan.
- TypeScript strict tanpa error dan tanpa `any` pada public/domain boundary.
- Unit/component tests untuk schema, policy presentation, query keys, error mapping, form, serta state component.
- Contract drift check dan validasi fixture terhadap OpenAPI.
- Playwright E2E terhadap production build untuk async Server Component/user flow.
- Auth negative tests: URL/Bearer/localStorage token, expired/revoked session, missing CSRF, replay, dan multi-tab logout.
- Context matrix: Site Admin, Teacher, Student, Teacher+Student, Facilitator, outsider, foreign Class/resource, serta stale capability.
- Lifecycle matrix: DRAFT/PUBLISHED/CLOSED/ARCHIVED dan ACTIVE/SUSPENDED/ENDED.
- Mutation resilience: double-click, timeout retry, idempotency replay, `409`, `413`, `422`, `429`, job partial/failure, serta backend unavailable.
- XSS/unsafe URL/embed, private file/MIME/size/scan, dan no-secret-in-log/storage tests.
- WCAG 2.2 AA automated checks ditambah keyboard dan screen-reader smoke.
- Responsive checks pada mobile 360 px, tablet, dan desktop.

Journey release wajib:

1. Login → pilih Class dengan contextual capability.
2. Admin create Class → assign Teacher/Student → publish.
3. Teacher publish activity → Student submit → Teacher grade/release.
4. Completion → transcript/certificate sesuai policy.
5. Meeting attendance → permission review/SP bila berlaku.
6. Logbook draft→submit→revision-required/accepted.
7. Old/stale tab saat fence menerima read-only/`CLASS_MOVED` dan safe retry, bukan silent data loss.

Frontend baru siap cutover hanya bila mock production-disabled, tidak ada panggilan legacy, browser identity bridge lulus, seluruh selected Class workflow terintegrasi dengan Go, dan M17 readiness mempunyai evidence nyata.
