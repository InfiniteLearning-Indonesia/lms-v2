---
type: "query"
date: "2026-07-15T07:21:22.934154+00:00"
question: "komponen apa saja yang dipakai untuk merender dasbor admin?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["DashboardPage()", "AdminDashboard()", "AdminRules()", "Tabs", "Card", "Badge", "Button", "Input"]
---

# Q: komponen apa saja yang dipakai untuk merender dasbor admin?

## Answer

Expanded from original query via vocab: [admin, dashboard, components, layout, page].

Dasbor Admin dirender menggunakan:
1. DashboardPage() (app/dashboard/page.tsx): Entry point utama yang merender AdminDashboard jika user memiliki role admin.
2. AdminDashboard() (app/dashboard/components/admin-dashboard.tsx): Komponen utama pengelola user, batch, program, import CSV, dan matriks mentor.
3. AdminRules() (app/dashboard/components/admin-rules.tsx): Sub-komponen penampil visual domain, aturan bisnis LMS, dan Mermaid ERD.
4. Shadcn UI Components: Tabs, Card, Badge, Button, Input.
5. Libraries: framer-motion (motion, AnimatePresence) dan lucide-react.

## Outcome

- Signal: useful

## Source Nodes

- DashboardPage()
- AdminDashboard()
- AdminRules()
- Tabs
- Card
- Badge
- Button
- Input