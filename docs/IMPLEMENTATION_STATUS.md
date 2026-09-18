# LMS v3 Frontend — Implementation Status

**Diperbarui:** 18 September 2026
**Branch:** `fe-v3`  
**Frontend baseline sebelum brief FE07:** `42b97a9`
**Backend commit saat inspeksi:** `52cbc88`  
**Status keseluruhan:** `FE07_BLOCKED_BACKEND / FE06_BLOCKED_BACKEND / FE05_BLOCKED_BACKEND / FE04_BLOCKED_BACKEND / FE03_BLOCKED_BACKEND / FE02_BLOCKED_BACKEND / FE01_BLOCKED_BACKEND`

[Master plan](FRONTEND_IMPLEMENTATION_PLAN.md) · [Brief aktif FE07](checkpoints/FE07.md) · [FE06](checkpoints/FE06.md) · [FE05](checkpoints/FE05.md) · [FE04](checkpoints/FE04.md) · [FE03](checkpoints/FE03.md) · [FE02](checkpoints/FE02.md) · [FE01](checkpoints/FE01.md) · [Backend status](../../api-lms-v2/docs/IMPLEMENTATION_STATUS.md)

## 1. Ringkasan

Fondasi FE00 sudah selesai. Frontend slice FE01 untuk actor/session, Class context dari URL, pencarian Class actor-scoped, dashboard Ringkasan, capability-driven navigation, guards, profil, dan session commands sudah dibuat serta lulus mock/browser QA. Enrollment diputuskan assigned-only: Student tidak self-enroll dan frontend tidak menyediakan katalog Class global atau enroll key. Ringkasan menyediakan satu CTA Pembelajaran serta UI daftar Tugas Mendatang dan Pengingat Logbook; data daftar hanya berasal dari typed development fixture, sedangkan production menampilkan dependency state sampai read model M07/M08/M12 tersedia. Sidebar memakai exact active state dan Progress tidak diekspos sebagai menu. UI login sementara menampilkan kontrol disabled dan tidak lagi meminta challenge yang belum dapat menyelesaikan login. Preview development server-only tersedia untuk pengembangan UI tanpa memalsukan session atau kontrak production. FE01 tetap `BLOCKED_BACKEND`: login production, refresh/new-tab session control, dan daftar Class nyata belum dapat diintegrasikan sebelum kontrak backend tersedia.

FE02 UI-first slice juga sudah siap: Site Admin memperoleh direktori Class, create form, metadata/version/lifecycle settings, participant directory, identity picker, state action, history, dan bulk dependency state. Participant management digerakkan capability dan assignable-role projection actor-scoped; role label maupun boolean global admin tidak dipakai untuk menurunkan pilihan assignment. Form Class/participant memakai React Hook Form + Zod. Typed command transport mempertahankan kontrak M05 yang ada, tetapi production tidak mengarang endpoint read/search dan tidak mengaktifkan mutation sebelum CSRF/capability/read model siap.

FE03 UI-first shell sudah siap: focused learning workspace tanpa sidebar menampilkan **Preview Student Mode** hanya kepada author, sedangkan Student tidak diberi label mode. Setiap Activity memenuhi lebar outline dan memiliki CTA Edit contextual; policy UI memisahkan manage structure, reorder, edit Activity, lifecycle, dan upload walaupun fixture sementara masih menurunkan tiga izin authoring pertama dari `content.manage`. Seluruh payload Learning harus cocok dengan Class aktif atau ditolak tanpa menampilkan data. Dialog Section mendukung nama dan deskripsi opsional; Section kosong menampilkan **Tidak Ada Activity**. Per-Section Tambah Activity meminta tipe Materi/Tugas lalu membuka route create khusus, tetapi seluruh final command tetap disabled. Ordering dipusatkan pada mode **Edit Urutan** di header Susunan pembelajaran dan tidak diduplikasi di modal/editor. Editor create/edit hanya memakai structured allowlist; HTML bebas tetap dilarang. Perubahan lokal dilindungi native unload dan link-navigation warning. Development fixture hanya masuk melalui server preview; production menampilkan dependency state dan tidak mengirim content/file request yang belum ada di OpenAPI. Private file lifecycle masih `PARTIAL_FRONTEND`: progress nyata, intent expiry, retry/cancel, dan attach/detach menunggu M06.

FE04 UI-first slice sudah siap `6/8`: Student submission workspace, Teacher inbox, rubric grade editor, import preview, dan AI suggestion review memakai typed actor-scoped fixture development. Assignment Learning mempunyai entry point Pengumpulan; deadline hanya dipresentasikan dari server state/timezone, receipt/revision tetap immutable, released grade hanya baca, dan AI hanya dapat diterapkan ke draft lokal oleh Teacher. Production fail closed serta tidak mengirim request submission/gradebook karena M08, M09, dan M13 belum tersedia; seluruh save/submit/regrade/release/import command masih disabled. D07 tetap partial dan real HTTPS journey D08 masih diblokir backend.

FE05 UI-first slice sudah siap `6/8`: Progress Student/Teacher, evidence dan policy explanation, waiver/correction, immutable transcript snapshot, certificate eligibility/lifecycle, serta public verification data-minimal memakai typed actor-scoped fixture development. Progress tetap bukan menu sidebar dan diakses kontekstual dari Pembelajaran. Browser tidak menghitung outcome dari grade atau jumlah card; seluruh override/reopen/release/issue/revoke/supersede/download command fail closed. Production tidak meminta endpoint M10 yang belum ada. Public lookup/privacy integration D06 masih partial dan real HTTPS journey D08 masih diblokir backend.

FE06 UI-first slice sudah siap `6/8`: Mentee mendapat halaman kalender kehadiran read-only tanpa rekap, izin, SP, atau kontrol input. Teacher mendapat mode Input & Kalender serta Rekap Bulanan berisi proporsi, status cards, dan detail per Mentee dari typed projection; review izin dan SP Class-local tetap khusus surface Teacher. Halaman Logbook memisahkan periode fleksibel, revision entry, scoped review, serta histori mentor/group. Seluruh authorization berasal dari capability Class, record hilang tetap `UNKNOWN`, izin pending tidak dianggap approved, dan persentase authoritative tidak dihitung ulang dari card browser. Semua command tetap disabled serta production tidak meminta endpoint M11–M12 yang belum ada.

FE07 UI-first slice sudah siap `6/8`: Admin Users, Reports/private export shell, immutable Audit, contextual durable Jobs, serta Migration/Cutover evidence memakai typed server-only development fixture. Admin navigation exact-active; production menampilkan dependency state tanpa menebak endpoint atau memicu command. Code/data/ownership, writer/fence/owner epoch, dan seluruh gate preflight sampai approval dipisahkan; `CLASS_MOVED` serta read-only state eksplisit dan browser tidak memiliki migration control plane. Invitation shell memakai React Hook Form + Zod. D06/D08 tetap diblokir M04/M13–M18 dan real HTTPS/ops journey.

Current next action: review hasil [checkpoint FE07](checkpoints/FE07.md), lalu commit checkpoint bila disetujui. Setelah itu FE08 dapat dibekukan tanpa menganggap FE01–FE07 integrated; seluruh real backend/HTTPS journey masih menunggu dependency masing-masing.

**Brief testing development berikutnya:** setiap logic/state baru wajib membawa unit/component test pada checkpoint yang sama. Setiap FE juga wajib memiliki mandatory journey Playwright; unit test dan mock E2E tidak menggantikan journey HTTPS terhadap backend nyata. FE01-T13 adalah integration journey yang masih diblokir backend, bukan unit test yang belum ditulis.

## 2. Dashboard gelombang

| FE | Fokus | Implementation | QA | Backend readiness | Next action/blocker |
|---|---|---|---|---|---|
| FE00 | Foundation/design system/contracts/tests | `COMPLETED` | `PASS` (locked install/assets/contract/unit/component/build/bundle/E2E) | OpenAPI CP11–CP12 tersedia lokal | Handoff ke FE01; implementation commit `786d458ad914` |
| FE01 | Identity/contextual workspace | `BLOCKED_BACKEND` (frontend slice ready) | `PARTIAL_QA` — check + 43 Vitest + 8 Chromium PASS | `PARTIAL_LOCAL` | T13 menunggu opaque-code bridge, CSRF refresh, actor profile, `/me/classes` + capability |
| FE02 | Class/participation | `BLOCKED_BACKEND` (frontend slice ready) | `PARTIAL_QA` — check + 60 Vitest + 11 Chromium PASS | `PARTIAL_LOCAL` | T12 menunggu listing/capability/participant reads, identity search, bulk preview, CSRF, dan real HTTPS M05 journey |
| FE03 | Content/private file | `BLOCKED_BACKEND` (frontend shell ready; D07 partial) | `PARTIAL_QA` — current regression 120 Vitest + 18 Chromium PASS | `NOT_AVAILABLE` | D07 dan T14 menunggu canonical M06–M07 OpenAPI, CSRF, real transfer/scan/access, dan HTTPS journey |
| FE04 | Submission/gradebook | `BLOCKED_BACKEND` (frontend slice ready; D07 partial) | `PARTIAL_QA` — check + 99 Vitest + 15 Chromium PASS | `NOT_AVAILABLE` | D07/T14 menunggu M08–M09/M13 contract, CSRF, durable receipt, deadline, grade/import/job journey |
| FE05 | Completion/credential | `BLOCKED_BACKEND` (frontend slice ready; D06 partial) | `PARTIAL_QA` — current regression 120 Vitest + 18 Chromium PASS | `NOT_AVAILABLE` | D06/T14 menunggu M07/M09/M10 contract, CSRF, completion/transcript/credential/public verification journey |
| FE06 | Attendance/logbook/mentoring | `BLOCKED_BACKEND` (frontend slice ready; D06 partial) | `PARTIAL_QA` — check + 134 Vitest + 20 Chromium PASS | `NOT_AVAILABLE` | D06/T14 menunggu M06/M11/M12 private proof dan real HTTPS journey |
| FE07 | Admin/reporting/jobs/cutover | `BLOCKED_BACKEND` (frontend slice ready; D06 partial) | `PARTIAL_QA` — check + 148 Vitest + 24 Chromium PASS | `NOT_AVAILABLE` | D06/T14 menunggu M04/M13–M18 contract, real private export/job/audit/migration evidence, dan HTTPS/ops journey |
| FE08 | Public UI/polish/release cleanup | `NOT_STARTED` | `NOT_RUN` | `BLOCKED_BY_PRIOR_FE` | Menunggu seluruh selected slice |

Status `PARTIAL_LOCAL` berarti backend mempunyai slice lab yang diuji secara lokal; status tersebut bukan browser integration atau deployment readiness.

## 3. Baseline verification

| Check | Hasil 9 September 2026 | Implikasi |
|---|---|---|
| Git worktree | Branch `fe-v3`; baseline `77ba1a3`; implementasi FE00 `786d458ad914` | Perubahan hanya di frontend v3 dan docs |
| TypeScript | PASS: `npm run typecheck` | Strict compile foundation |
| ESLint | PASS: `npm run lint` pada route/foundation v3; legacy dashboard di-redirect dan dikecualikan dari gate | Clean v3 boundary |
| Production build | PASS: `npm run build` memakai webpack, font brand lokal, tanpa Google Fonts request | Lexend Deca/Inclusive Sans + OFL/checksum tersimpan lokal |
| Frontend tests | PASS: Vitest 43 tests | Login disabled, preview tanpa identity/Class/session request, session/actor, pencarian Class actor-scoped, Ringkasan dengan fixture/empty/dependency/capability/timezone states, single active nav, profile, dan FE00 regression |
| E2E | PASS: Playwright Chromium 8 journey | Login visual baseline, overview desktop/375 px/landscape/dark/reduced-motion, exact active state, sidebar 360 px, dan profile keyboard; real bridge belum diuji |
| Auth transport | PASS untuk v3: same-origin cookie credentials + CSRF/idempotency; tanpa Authorization/localStorage | Backend identity bridge/CSRF refresh masih gap integrasi |
| UI authorization | URL-owned Class context dan fail-closed capability guards PASS via mock/browser | `/me/classes` dan capability production masih backend gap |
| Backend OpenAPI | 18 path pada CP11–CP12 local contract | Status `PARTIAL_LOCAL`, checksum `00b66b2ee0ed…` |

## 4. Deliverable tracking

Jumlah deliverable hanya dinaikkan setelah evidence QA dicatat pada checkpoint terkait.

| FE | Planned deliverables | Verified | Coverage status |
|---|---:|---:|---|
| FE00 | 6 | 6 | `6/6`; D01–D06 `PASS` |
| FE01 | 7 | 6 | `6/7`; D01 contract + D02–D06 mock/frontend PASS; D07 integration blocked |
| FE02 | 7 | 6 | `6/7`; D01–D06 frontend/mock PASS; D07 integration blocked |
| FE03 | 8 | 6 | `6/8`; D01–D06 frontend/mock PASS; D07 private file lifecycle partial; D08 real integration blocked |
| FE04 | 8 | 6 | `6/8`; D01–D06 frontend/mock PASS; D07 import/AI partial; D08 real integration blocked |
| FE05 | 8 | 6 | `6/8`; D01–D05 + D07 frontend/mock PASS; D06 public integration partial; D08 real integration blocked |
| FE06 | 8 | 6 | `6/8`; D01–D05 + D07 frontend/mock PASS; D06 private integration partial; D08 real integration blocked |
| FE07 | 8 | 6 | `6/8`; D01–D05 + D07 frontend/mock PASS; D06 operational integration partial; D08 real journey blocked |
| FE08 | Belum dibekukan | 0 | `N/A` |

Denominator FE01–FE08 dibekukan saat checkpoint masing-masing dibuat. Jangan menggunakan perkiraan persentase effort sebagai completion.

## 5. Backend dependency ledger

| Dependency | Status | Frontend yang terdampak | Acceptance yang diperlukan |
|---|---|---|---|
| Cookie-only session lab | Tersedia lokal | FE01 | E2E melalui same-origin HTTPS proxy |
| Real identity owner bridge | Belum tersedia | FE01, FE07 | One-time callback code, replay/expiry/issuer tests |
| CSRF after refresh/new tab | Contract gap | FE01 dan seluruh mutation | Browser-safe bootstrap/refresh contract |
| Actor display/profile | Contract gap | FE01, FE07 | Typed actor/profile response |
| Identity/invitation administration | Contract gap | FE07 | Actor-scoped directory/detail, invite purpose/expiry, account state, last-admin guard, version dan receipt |
| `/me/classes` + capability | Contract gap | FE01–FE02 | Scoped list, roles, capabilities, next actions |
| Class lifecycle commands | Tersedia sebagian lokal | FE02 | Generated contract + browser contract tests |
| Class version/conflict response | Partial contract | FE02 | `Class.version` required dan typed `409 current_version` response |
| Participant read/search/history | Contract gap | FE02 | Paginated same-Class responses |
| Upcoming assignment read model | Contract gap | FE03–FE04 | M07/M08: aktivitas, due/cutoff timezone, dan submission state actor-scoped |
| Logbook reminder read model | Contract gap | FE06 | M12: periode, due/timezone, entry, revision, dan review state actor-scoped |
| Completion/credential read model | Contract gap | FE05 | M10: evidence/rule snapshot, outcome/correction, transcript release, credential lifecycle/private download dan public verification |
| M06–M14 domain APIs | Belum tersedia | FE03–FE07 | OpenAPI + examples + errors + fixtures |
| Migration/ownership read model | Belum tersedia | FE07–FE08 | Code/data/owner status dan `CLASS_MOVED` semantics |

## 6. Evidence ledger

Run FE00 dan partial QA FE01–FE07 telah dicatat; belum ada deployment atau integrasi identity/backend production.

| Field | Nilai |
|---|---|
| Latest FE checkpoint | FE07 `BLOCKED_BACKEND 6/8` (working tree; commit pending) |
| Latest lint | PASS — `npm run lint` |
| Latest typecheck | PASS — `npm run typecheck` |
| Latest build | PASS — `npm run build` |
| Latest unit/component test | PASS — 148 tests |
| Latest E2E/contract test | PASS — contract check + 24 Chromium journeys termasuk axe serious/critical scan; FE01-T13, FE02-T12, FE03-T14, FE04-T14, FE05-T14, FE06-T14, dan FE07-T14 real journey blocked |
| Latest locked install/assets | PASS — `npm ci`; 4 font/license checksums; `next-intl@4.13.4` |
| Deployment | `NOT_DEPLOYED` |
| Migration/cutover | `NOT_EXECUTED`; legacy source dipindahkan ke `legacy/` dan tidak menjadi route v3 |

### FE00 run history — 9 September 2026

| Timestamp (WIB) | Command | Result | Source/contract evidence | Artifact/blocker |
|---|---|---|---|---|
| 19:26 | `npm run contract:check` | PASS | contract `00b66b2ee0ed…` | generated types reproducible |
| 19:26 | `npm run typecheck` | PASS | baseline tree `77ba1a3` + working tree | — |
| 19:27 | `npm test` | PASS — 4 tests | MSW transport + UI states | — |
| 19:28 | `npm run lint` | PASS | v3 scope | legacy source remains for FE08 cleanup |
| 19:31 | `npm run build` | PASS | webpack production build | system font fallback; brand font asset pending |
| 19:39 | `npm run test:e2e` | PASS — 1 test | Chromium 134 / production server | local browser download required |
| 19:42 | `npm run check` | PASS — contract/lint/typecheck/6 tests/build | source working tree | legacy route source diarsipkan; bundle scan PASS |
| 19:44 | `npm run test:e2e` | PASS — 1 test | Chromium 134 / production server | final smoke setelah legacy archive |
| 21:11 | `npm ci` | PASS — 956 packages | exact lockfile; `next-intl@4.13.4` | fresh locked install |
| 21:12 | `npm run check` | PASS — assets/contract/lint/typecheck/12 tests/build/bundle | contract `00b66b2ee0ed…`; font checksums locked | forbidden auth/mock patterns absent from client bundle |
| 21:13 | `npm run test:e2e` | PASS — 3 tests | Chromium; 1440×900 + 360×800 visual baselines | restored login structure and focus order PASS |
| 21:19 | `npm run check` | PASS — final rerun; 11 bundle patterns absent | baseline `77ba1a3f2333` + working tree; contract `00b66b2ee0ed…` | FE00 closure gate PASS |
| 21:19 | `npm run test:e2e` | PASS — 3 tests | final Chromium screenshot comparison | desktop/360 px baselines unchanged |
| 21:24 | `git commit` | PASS — `786d458ad914` | FE00 implementation source frozen | ready to push `fe-v3` |

### FE01 partial QA history — 9 September 2026

| Timestamp (WIB) | Command | Result | Source/contract evidence | Artifact/blocker |
|---|---|---|---|---|
| 23:12 | `npm run check` | PASS | source baseline `5076819b6aa7` + FE01 tree; contract `00b66b2ee0ed…` | assets, lint, typecheck, 34 Vitest, build, 11-pattern bundle scan PASS |
| 23:13 | `npm run test:e2e` | PASS — 6 Chromium | production server port 3100; mock responses via Playwright interception | login baseline, Class context/capability, profile/360 px PASS; bukan Go integration |
| 23:13 | FE01-T13 | `BLOCKED_BACKEND` | OpenAPI/backend `52cbc88` | real owner redirect/code exchange, CSRF refresh, actor profile dan `/me/classes` belum tersedia |

### FE01 partial QA history — 10 September 2026

| Timestamp (WIB) | Command | Result | Source/contract evidence | Artifact/blocker |
|---|---|---|---|---|
| 14:56 | `npm run check` | PASS | source working tree; contract `00b66b2ee0ed…` | assets, lint, typecheck, 30 Vitest, production build, dan 11-pattern bundle scan PASS |
| 14:56 | `npm run test:e2e` | PASS — 6 Chromium | production server port 3100; visual baseline diperbarui setelah inspeksi desktop/360 px | Login tidak meminta challenge, disabled keyboard order dan seluruh workspace regression PASS; bukan Go integration |
| 14:56 | FE01-T13 | `BLOCKED_BACKEND` | OpenAPI/backend `52cbc88` | real Google/identity-owner bridge, opaque-code exchange, CSRF refresh, actor profile, dan `/me/classes` belum tersedia |
| 17:02 | `npm run check` | PASS | source working tree; contract `00b66b2ee0ed…` | 33 Vitest, production build dan bundle scan PASS; preview development tidak aktif pada production build |
| 17:03 | `npm run test:e2e` | PASS — 6 Chromium | production server port 3100 | Seluruh production-mode regression dan baseline visual tetap PASS |
| 17:05 | `npm run dev:preview -- -p 3101` | PASS | development-only, output `.next-preview`, actor `student` | Login menyediakan link preview; dashboard merender fixture actor-scoped tanpa identity backend atau session mutation |
| 19:31 | `npm run check` | FAIL pada lint | source working tree + generated `.next-preview` | ESLint ikut memindai output preview dan menghasilkan error generated chunks; failure dipertahankan sebagai evidence |
| 19:33 | `npm run check` | PASS | source working tree; contract `00b66b2ee0ed…`; `.next-preview/**` dikecualikan dari lint | assets, lint, typecheck, 36 Vitest, production build, dan 11-pattern bundle scan PASS |
| 19:34 | SSR preview verification | PASS | development preview port 3101 | `/app` hanya mencari dua Class actor-scoped; Class route hanya menampilkan back link pada context control |
| 19:35 | `npm run test:e2e` | PASS — 7 Chromium | production server port 3100 | Regression PASS; sidebar Class desktop/360 px tidak memuat pencarian atau menu Workspace dan tidak overflow |
| 19:42 | `npm run check` final | PASS | source working tree; contract `00b66b2ee0ed…` | assets, lint, typecheck, 37 Vitest, production build, dan bundle scan PASS; empty assigned-list state diuji |
| 19:42 | `npm run test:e2e` final | PASS — 7 Chromium | production server port 3100 | Seluruh regression tetap PASS setelah touch target sidebar diselaraskan ke minimum 44 px |
| 20:06 | `npm run check` | PASS | source working tree; contract `00b66b2ee0ed…` | 40 Vitest, production build, dan bundle scan PASS; Ringkasan contract-backed serta active nav diuji |
| 20:07 | `npm run test:e2e` | FAIL — 6/7 Chromium | production server port 3100 | Locator Pembelajaran ambigu setelah CTA baru; accessible name dibuat spesifik sebelum rerun |
| 20:08 | targeted Playwright retry | NOT_RUN | sandbox menolak bind port 3100 (`EPERM`) | Rerun dipindahkan ke command E2E yang telah diizinkan, tanpa perubahan aplikasi |
| 20:08 | `npm run test:e2e` | PASS — 7/7 Chromium | production server port 3100 | CTA Ringkasan→Pembelajaran dan single active state PASS |
| 20:09 | `npm run check` final | PASS | source working tree; contract `00b66b2ee0ed…` | assets, lint, typecheck, 40 Vitest, production build, dan bundle scan PASS |
| 20:11 | `npm run test:e2e` | FAIL — 6/8 Chromium | production server port 3100 | Overview responsive PASS; perubahan eksperimen ThemeToggle global menggeser 63 pixel pada dua baseline Login dan dibatalkan |
| 20:28 | `npm run test:e2e` final | PASS — 8/8 Chromium | production server port 3100 | Baseline Login identik; overview desktop/375 px/landscape/dark/reduced-motion/text 125%, active route, dan overflow checks PASS |
| 20:30 | `npm run check` final source | PASS | source working tree; contract `00b66b2ee0ed…` | assets, lint, typecheck, 40 Vitest, production build, dan 11-pattern bundle scan PASS |
| 21:05 | development preview visual check | PASS | port 3101; Student fixture; desktop 1440 px dan mobile 360 px | Daftar tugas/pengingat, badge status, tenggat WIB, target tautan, hierarchy, dan overflow diperiksa; screenshot sementara tidak dijadikan baseline |
| 21:08 | `npm run check` final | PASS | source working tree; contract `00b66b2ee0ed…` | assets, lint, typecheck, 43 Vitest, production build, dan 11-pattern bundle scan PASS; overview fixture/empty/dependency/capability/timezone states tercakup |
| 21:09 | `npm run test:e2e` final | PASS — 8/8 Chromium | production server port 3100 | Production menampilkan dependency state tugas/logbook tanpa data fixture; seluruh responsive/accessibility regression tetap PASS |

### FE02 partial QA history — 11 September 2026

| Timestamp (WIB) | Command | Result | Source/contract evidence | Artifact/blocker |
|---|---|---|---|---|
| 13:41 | `npm run check` | PASS | source working tree `147139d70a77` + FE02; contract `00b66b2ee0ed…` | assets, lint, typecheck, 60 Vitest, production build, 11-pattern bundle scan PASS |
| 13:42 | `npm run test:e2e` | FAIL — 10/11 Chromium | production server port 3100 | exact locator `Buat Class` ambigu dengan close-label; test diperjelas tanpa perubahan behavior |
| 13:43 | `npm run test:e2e` final | PASS — 11/11 Chromium | production server port 3100; Playwright-intercepted actor/Class reads | Admin 375 px, Settings/People dependency dan no-mutation journey, login/workspace regression PASS |
| 13:28–13:40 | development preview visual inspection | PASS | Site Admin fixture, port 3102; desktop + 375 px | Admin/People/Settings hierarchy, responsive table-card, minimum touch target, dan overflow diperiksa; screenshot sementara tidak menjadi baseline |
| 13:49 | final `npm run check` + `npm run test:e2e` | PASS — 60/60 Vitest + 11/11 Chromium | final FE02 source tree; contract `00b66b2ee0ed…` | capability fail-closed, production build, bundle scan, dark/reduced-motion/text 125%/landscape Admin journey PASS |
| 14:19 | Admin directory action revision + `npm run check` | PASS — 60/60 Vitest | FE02 source tree; contract `00b66b2ee0ed…` | Kolom Aksi dan direct Edit/Lihat Settings tersedia; lint, typecheck, production build, bundle scan PASS |
| 14:25 | Action order/version contract follow-up | PASS — 60/60 Vitest | FE02 source tree; contract `00b66b2ee0ed…` | Edit/Lihat kiri, Buka menjadi visible CTA kanan; `Class.version` required + typed `409` dicatat sebagai backend contract gap; production build PASS |
| 14:25 | FE02-T12 | `BLOCKED_BACKEND` | OpenAPI/backend `52cbc88` | Real Class listing, strict version/conflict response, participant/identity reads, browser-safe CSRF, contextual capability, dan M05 HTTPS journey belum tersedia |
| 14:43 | FE02 final checkpoint regression | PASS — 11/11 Chromium | final action-order source; production server port 3100 | Admin/Class/Login/Workspace browser regression PASS; frontend slice layak dikomit, FE02-T12 tetap backend-blocked |

### FE03 partial QA history — 13–14 September 2026

| Timestamp (WIB) | Command | Result | Source/contract evidence | Artifact/blocker |
|---|---|---|---|---|
| 19:13 | `npm run check` | PASS | FE03 working tree; contract `00b66b2ee0ed…` | assets, lint, typecheck, 70 Vitest, production build, bundle scan PASS |
| 19:14 | `npm run test:e2e` | PASS — 13/13 Chromium | production server port 3100 | Learning dependency/no-invented-request, 360 px, landscape, dark, reduced-motion, text 125%, dan FE00–FE02 regression PASS |
| 19:17 | development visual inspection | `NOT_RUN_TOOLING` | browser discovery tidak menemukan surface tersedia | screenshot baseline tidak dibuat/diubah; inspeksi visual fixture perlu diulang saat browser tersedia |
| 19:20–19:23 | targeted FE03 refinement | PASS | typed UI schema + server-only fixtures | stale revision, Section/Activity keyboard reorder, structured editor shell, Student preview, scheduled WIB, empty/unknown states |
| 19:24 | final `npm run check` | PASS | final FE03 source tree; contract `00b66b2ee0ed…` | 74/74 Vitest, production build, bundle scan PASS |
| 19:25 | combined final Playwright | FAIL_TO_START | final FE03 source tree | sandbox menolak bind port 3100 (`EPERM`); failure bukan behavior aplikasi dan dipertahankan |
| 19:26 | `npm run test:e2e` dengan izin bind | PASS — 13/13 Chromium | final FE03 source tree; production server port 3100 | seluruh production regression PASS; FE03-T14 tetap backend-blocked |
| 19:27 | source/client-bundle scan | PASS | `.next/static` + FE03 source | tidak ada fixture production, invented FE03 transport, browser credential storage/Bearer, atau raw HTML renderer |
| 19:29–19:30 | final cutoff/file-state refinement + `npm run check` | PASS | final FE03 source tree; contract `00b66b2ee0ed…` | due/cutoff dan rejected/quarantine dibedakan; 75/75 Vitest, build, bundle scan PASS |
| 19:31 | final `npm run test:e2e` | PASS — 13/13 Chromium | final FE03 source tree; production server port 3100 | seluruh regression tetap PASS |
| 20:01–20:07 | focused Learning UX revision + full regression | PASS — 75/75 Vitest + 13/13 Chromium | FE03 working tree; contract tetap `00b66b2ee0ed…`; preview Teacher 1440 px + 375 px | sidebar/drawer tidak dirender pada Learning, menu Pembelajaran dihapus, back ke Ringkasan Class dan responsive reflow diperiksa; screenshot sementara bukan baseline |
| 20:37–20:45 | preview/editor split + full regression | PASS — 78/78 Vitest + 13/13 Chromium | FE03 working tree; contract tetap `00b66b2ee0ed…`; preview/editor Teacher 1440 px + editor 375 px | passive Preview Student Mode, contextual Edit deep link, isolated authoring, `content.manage` direct-route guard, back ke preview, dan no-mutation dependency state PASS |
| 14 Sep 14:18 | Section management UX refinement + `npm run check` | PASS — 79/79 Vitest | FE03 working tree; contract tetap `00b66b2ee0ed…` | Activity card full-width; Section Edit/Hapus/Tambah hanya dari `content.manage`; Student tanpa label mode; lint, typecheck, production build, dan bundle scan PASS |
| 14 Sep 14:19 | final production regression | PASS — 13/13 Chromium | FE03 working tree; production server port 3100 | 360 px, landscape, dark, reduced-motion, text 125%, no invented content request/mutation, dan seluruh regression PASS; visual fixture refinement `NOT_RUN_TOOLING` |
| 14 Sep 15:27 | per-Section Add Activity refinement + `npm run check` | PASS — 80/80 Vitest | FE03 working tree; contract tetap `00b66b2ee0ed…` | Capability-only CTA, Section-scoped dialog, actionable author empty state, disabled final create, lint, typecheck, production build, dan bundle scan PASS |
| 14 Sep 15:28 | final production regression | PASS — 13/13 Chromium | FE03 working tree; production server port 3100 | Tidak ada invented content request/mutation; seluruh regression tetap PASS; visual fixture refinement `NOT_RUN_TOOLING` |
| 14 Sep 15:44 | centralized ordering UX + `npm run check` | PASS — 81/81 Vitest | FE03 working tree; contract tetap `00b66b2ee0ed…` | Editor Activity tanpa posisi; mode Edit Urutan pada outline menyembunyikan action authoring, mendukung keyboard focus handoff dan cancel/reset; lint, typecheck, build, bundle scan PASS |
| 14 Sep 15:44 | final production regression | PASS — 13/13 Chromium | FE03 working tree; production server port 3100 | Tidak ada invented content request/mutation; seluruh regression FE00–FE03 tetap PASS; visual fixture refinement `NOT_RUN_TOOLING` |
| 14 Sep 16:44 | alignment hardening + final gates | PASS — 82/82 Vitest + 13/13 Chromium | FE03 working tree; contract tetap `00b66b2ee0ed…` | Foreign Class fail closed, policy seam, unsaved warning, route/status/D07 evidence reconciliation, lint, typecheck, production build, bundle scan, dan seluruh browser regression PASS |

### FE04 partial QA history — 14 September 2026

| Timestamp (WIB) | Command | Result | Source/contract evidence | Artifact/blocker |
|---|---|---|---|---|
| 17:18 | targeted FE04 tests | PASS — 38/38 | FE04 typed model, fixture, components, Learning handoff, route policy | Student/Teacher projection, foreign Class, dirty state, receipt/revision, rubric/import/AI states PASS |
| 17:19 | `npm run check` | PASS — 99/99 Vitest | FE04 working tree; contract `00b66b2ee0ed…` | assets, lint, typecheck, production build, dan 11-pattern bundle scan PASS |
| 17:20 | first `npm run test:e2e` | 14/15 PASS | production server port 3100 | Satu test salah mencari link sidebar sebelum membuka mobile drawer; bukan UI failure dan assertion dikoreksi |
| 17:21 | final `npm run test:e2e` | PASS — 15/15 Chromium | final FE04 source tree; production server port 3100 | FE04 dependency/no invented request or mutation, 360 px/no overflow, dan seluruh FE00–FE03 regression PASS |
| 17:22 | development visual inspection | `NOT_RUN_TOOLING` | browser interaktif tidak tersedia setelah discovery | Screenshot baseline tidak dibuat/diubah; fixture visual perlu ditinjau saat browser tersedia |
| 17:23–17:24 | final source gates | PASS — 99/99 Vitest + 15/15 Chromium | final FE04 source tree; contract tetap `00b66b2ee0ed…` | Dead import control dikunci; lint, typecheck, build, bundle, production safety, responsive, dan seluruh regression PASS |
| Setelah handoff | UX flow review oleh pengguna | PASS | FE04 development preview | Flow Student submission, Teacher inbox, dan gradebook diterima; backend integration status tetap blocked |

### FE05 partial QA history — 14 September 2026

| Timestamp (WIB) | Command | Result | Source/contract evidence | Artifact/blocker |
|---|---|---|---|---|
| 20:25 | targeted FE03–FE05 tests | PASS — 34/34 | typed completion/credential model, fixture, components dan Learning entry | Actor projection, evidence/waiver/correction, transcript/certificate, foreign Class dan disabled command states PASS |
| 20:28 | `npm run check` | PASS — 116/116 Vitest | FE05 working tree; contract `00b66b2ee0ed…` | assets, lint, typecheck, production build dan 11-pattern bundle scan PASS |
| 20:29 | `npm run test:e2e` | PASS — 18/18 Chromium | FE05 working tree; production server port 3100 | Progress/Credentials dependency, Learning entry, public data-minimal state, 360 px/no overflow dan FE00–FE04 regression PASS |
| 20:30 | development visual inspection | `NOT_RUN_TOOLING` | browser discovery tidak menemukan browser interaktif | Fixture Student/Teacher belum diinspeksi visual; screenshot baseline tidak dibuat atau diubah |
| 20:30 | UI/UX pre-delivery checklist | PASS source/automated | FE05 working tree | Lucide icon, text+icon states, heading/form semantics, 44 px controls, theme token, reduced-motion serta production responsive journey diperiksa |
| 20:32–20:33 | source gates sebelum fixture consistency review | PASS — 116/116 Vitest + 18/18 Chromium | FE05 working tree; contract tetap `00b66b2ee0ed…` | Hasil dipertahankan sebagai histori |
| 20:35 | fixture consistency review | PASS | FE05 working tree | Student `IN_PROGRESS` tidak memiliki issued certificate; issued example berada pada Teacher/public projection yang konsisten |
| 20:36–20:37 | final source gates | PASS — 116/116 Vitest + 18/18 Chromium | final FE05 working tree; contract tetap `00b66b2ee0ed…` | Lint, typecheck, production build, bundle scan, no invented FE05 request/mutation, mobile no-overflow dan seluruh regression PASS |
| 21:45–21:47 | FE03 authoring refinement regression | PASS — 120/120 Vitest + 18/18 Chromium | FE05 working tree + revisi FE03; contract tetap `00b66b2ee0ed…` | Optional Section description, typed create Activity route, focused shell, fail-closed command, build/bundle scan, serta desktop/mobile visual inspection PASS |

### FE06 partial QA history — 15 September 2026

| Timestamp (WIB) | Command | Result | Source/contract evidence | Artifact/blocker |
|---|---|---|---|---|
| 18:51 | targeted FE06 tests | PASS — 15/15 | typed attendance/logbook model, fixture, dan components | Class binding, capability seam, unknown/pending state, filters, disabled commands, serta backend dependency PASS |
| 18:52–18:53 | `npm run check` | PASS — 133/133 Vitest | FE06 working tree; contract `00b66b2ee0ed…` | assets, lint, typecheck, production build, dan 11-pattern bundle scan PASS |
| 18:53–18:54 | `npm run test:e2e` + semantic selector retry | PASS — 20/20 Chromium | FE06 working tree; production port 3100 | First full run 19/20 karena selector copy ambigu; diperketat menjadi heading, targeted FE06 2/2 PASS, lalu final regression dijalankan |
| 18:54–18:57 | development visual inspection | PASS | fixture Teacher/Student; 1440 px + 375 px | Attendance/Logbook hierarchy dan responsive reflow PASS; temporary screenshots tidak menjadi baseline |
| 18:58 | UI/UX pre-delivery review | PASS source/visual | FE06 working tree | Lucide, theme token, text+color states, visible labels, 44 px controls, keyboard semantics, dark/reduced-motion production journey diperiksa |
| 19:36 | final `npm run check` | PASS — 133/133 Vitest | final FE06 working tree; contract tetap `00b66b2ee0ed…` | Site Admin capability inheritance di-hardening; lint, typecheck, production build, bundle scan, dan seluruh unit/component regression PASS |
| 19:41–20:00 | Attendance reference UX revision | PASS targeted + visual | FE06 working tree; contract tetap tidak diubah | Teacher calendar/input + monthly recap 1440/375 px; Mentee calendar-only 375 px; typed summary projection, semantic tabs, card fallback, dan empty-day selection bug diperiksa |
| 20:03–20:04 | final Attendance revision gates | PASS — 133/133 Vitest + 20/20 Chromium | final FE06 revision tree; contract tetap `00b66b2ee0ed…` | assets, lint, typecheck, build, bundle scan, production fail-closed/no-request, serta seluruh frontend regression PASS |

### FE07 partial QA history — 18 September 2026

| Timestamp (WIB) | Command | Result | Source/contract evidence | Artifact/blocker |
|---|---|---|---|---|
| 10:38 | targeted FE07 tests | PASS — 21/21 termasuk regression shell | typed admin schema, server-only fixture, Users/Reports/Audit/Migrations components | Capability seam, disabled invitation/export, immutable Audit, separate readiness, dan dependency state PASS |
| 11:34–11:35 | final `npm run check` | PASS — 147/147 Vitest | final FE07 working tree; contract `00b66b2ee0ed…` | assets, contract, lint, typecheck, production build, dan 11-pattern bundle scan PASS |
| 11:35–11:36 | final `npm run test:e2e` | PASS — 22/22 Chromium | final FE07 working tree; production port 3100 | Empat route production dependency-only, no guessed business request/mutation, responsive/dark/reduced-motion, dan seluruh regression PASS |
| 11:29–11:31 | development visual + UI/UX validation | PASS | fixture Site Admin; Users/Reports/Migrations 1440 px, Audit 375 px | Exact-active nav, status text+color, card fallback, no global overflow; screenshot sementara bukan baseline |
| 11:30 | report mobile-card refinement | PASS targeted + lint/typecheck | FE07 final working tree | Tabel report desktop berubah menjadi card list pada mobile; M04/M13–M18 dan FE07-T14 tetap blocked |
| 14:09–14:12 | alignment remediation | PASS targeted + visual | FE07 working tree; contract tetap `00b66b2ee0ed…` | D05 typed evidence lengkap, assignable-role projection fail-closed, RHF+Zod pada form domain utama, token contrast diperbaiki, serta axe Chromium ditambahkan |

## 7. Cara memperbarui status

Saat sebuah pekerjaan dimulai atau selesai:

1. Update row FE terkait dan `Current next action`.
2. Catat source commit/tree, OpenAPI checksum, command test, jumlah pass/fail/skip, dan residual blocker pada checkpoint.
3. Ubah ke `READY_FOR_QA` hanya setelah seluruh coding deliverable tersedia.
4. Ubah ke `COMPLETED` hanya setelah seluruh mandatory test dan dependency integration lulus.
5. `BLOCKED_BACKEND` tidak berarti pekerjaan mock selesai atau frontend boleh dianggap integrated.
6. Failure history tidak dihapus; tambahkan run berikutnya dan tandai evidence terbaru.
