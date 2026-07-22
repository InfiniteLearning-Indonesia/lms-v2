# Graph Report - frontend  (2026-07-22)

## Corpus Check
- 62 files · ~123,755 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 364 nodes · 756 edges · 23 communities (17 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `597f7aa8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- mentor-dashboard.tsx
- compilerOptions
- dependencies
- devDependencies
- theme-toggle.tsx
- components.json
- cn
- chart.tsx
- utils.ts
- layout.tsx
- 3. Komponen Desain & Spesifikasi
- 🚀 Tutorial Graphify — Tim Frontend (LMS V2)
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- Frontend Design
- Web Interface Guidelines
- Q: komponen apa saja yang dipakai untuk merender dasbor admin?
- README.md
- AGENTS.md
- graphify.md
- graphify.md

## God Nodes (most connected - your core abstractions)
1. `cn()` - 104 edges
2. `compilerOptions` - 16 edges
3. `Button()` - 14 edges
4. `Alert()` - 12 edges
5. `ThemeToggle()` - 11 edges
6. `AlertTitle()` - 11 edges
7. `AlertDescription()` - 11 edges
8. `Badge()` - 10 edges
9. `Card()` - 10 edges
10. `CardHeader()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `AlertDialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert-dialog.tsx → lib/utils.ts
- `AlertDialogHeader()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert-dialog.tsx → lib/utils.ts
- `AlertDialogMedia()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert-dialog.tsx → lib/utils.ts
- `AlertDialogTitle()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert-dialog.tsx → lib/utils.ts
- `AlertDialogDescription()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert-dialog.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (23 total, 6 thin omitted)

### Community 0 - "mentor-dashboard.tsx"
Cohesion: 0.13
Nodes (34): AdminAttendance(), AdminDashboard(), AdminDashboardProps, UserListItem, MentorAttendance(), MentorDashboardProps, MentorLogbook(), StudentDashboardProps (+26 more)

### Community 1 - "compilerOptions"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 2 - "dependencies"
Cohesion: 0.08
Nodes (25): @base-ui/react, class-variance-authority, clsx, framer-motion, lucide-react, next, next-themes, dependencies (+17 more)

### Community 3 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+17 more)

### Community 4 - "theme-toggle.tsx"
Cohesion: 0.11
Nodes (11): Criterion, Level, Rubric, MentorDashboard(), StudentDashboard(), UserProfile, fadeUp, Navbar() (+3 more)

### Community 5 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 6 - "cn"
Cohesion: 0.06
Nodes (55): AlertAction(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), CardAction() (+47 more)

### Community 7 - "chart.tsx"
Cohesion: 0.17
Nodes (14): CalendarDayButton(), ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload() (+6 more)

### Community 8 - "utils.ts"
Cohesion: 0.16
Nodes (14): StudentAttendance(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader() (+6 more)

### Community 9 - "layout.tsx"
Cohesion: 0.24
Nodes (6): inclusiveSans, lexendDeca, metadata, ThemeProvider(), Toaster(), TooltipProvider()

### Community 10 - "3. Komponen Desain & Spesifikasi"
Cohesion: 0.13
Nodes (14): 1. Filosofi Desain, 2. Panduan Gaya (Style Guide), 3. Komponen Desain & Spesifikasi, 4. Struktur & Aturan Tata Letak Halaman, A. Landing Page, A. Tipografi, A. Tombol (Buttons), B. Bidang Isian Form (Inputs & Labels) (+6 more)

### Community 11 - "🚀 Tutorial Graphify — Tim Frontend (LMS V2)"
Cohesion: 0.22
Nodes (8): 🔍 Cara Bertanya & Kueri Grafik, 🔄 Cara Melanjutkan & Memperbarui Grafik, 🛠️ Langkah Instalasi (Satu Kali Saja), Metode 1: Lewat Chat Google Antigravity (Rekomendasi), Metode 2: Lewat Terminal CLI (Headless / Offline), 📋 Persyaratan Awal (Prerequisites), 🚀 Tutorial Graphify — Tim Frontend (LMS V2), 📊 Visualisasi Interaktif

### Community 15 - "Frontend Design"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 16 - "Web Interface Guidelines"
Cohesion: 0.40
Nodes (4): Guidelines Source, How It Works, Usage, Web Interface Guidelines

### Community 17 - "Q: komponen apa saja yang dipakai untuk merender dasbor admin?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: komponen apa saja yang dipakai untuk merender dasbor admin?, Source Nodes

### Community 18 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **126 isolated node(s):** `Level`, `Criterion`, `Rubric`, `UserListItem`, `AdminDashboardProps` (+121 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `mentor-dashboard.tsx`, `utils.ts`, `chart.tsx`?**
  _High betweenness centrality (0.241) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`, `chart.tsx`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **Why does `react` connect `chart.tsx` to `dependencies`?**
  _High betweenness centrality (0.159) - this node is a cross-community bridge._
- **What connects `Level`, `Criterion`, `Rubric` to the rest of the system?**
  _126 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `mentor-dashboard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12928022361984626 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._