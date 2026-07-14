# Graph Report - .  (2026-07-13)

## Corpus Check
- Corpus is ~31,989 words - fits in a single context window. You may not need a graph.

## Summary
- 251 nodes · 477 edges · 15 communities (12 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14

## God Nodes (most connected - your core abstractions)
1. `cn()` - 75 edges
2. `compilerOptions` - 16 edges
3. `Button()` - 10 edges
4. `ThemeToggle()` - 9 edges
5. `Badge()` - 9 edges
6. `Alert()` - 7 edges
7. `TabsList()` - 7 edges
8. `include` - 7 edges
9. `tailwind` - 6 edges
10. `aliases` - 6 edges

## Surprising Connections (you probably didn't know these)
- `AlertAction()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert.tsx → lib/utils.ts
- `CardAction()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils.ts
- `DropdownMenuSubTrigger()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts
- `DropdownMenuSubContent()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts
- `DropdownMenuCheckboxItem()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (15 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (26): AdminDashboard(), UserListItem, AdminRules(), MentorDashboard(), MentorDashboardProps, StudentDashboard(), StudentDashboardProps, UserProfile (+18 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (27): @base-ui/react, class-variance-authority, clsx, framer-motion, lucide-react, next, next-themes, dependencies (+19 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+17 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (5): fadeUp, ThemeToggle(), Badge(), badgeVariants, Label()

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 6 - "Community 6"
Cohesion: 0.20
Nodes (15): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), DialogOverlay(), Progress() (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (12): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.24
Nodes (9): Button(), buttonVariants, Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogTitle() (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.18
Nodes (9): inclusiveSans, lexendDeca, metadata, ThemeProvider(), Toaster(), Tooltip(), TooltipContent(), TooltipProvider() (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.18
Nodes (8): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), SheetTrigger()

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (3): Checkbox(), Skeleton(), Switch()

## Knowledge Gaps
- **82 isolated node(s):** `UserListItem`, `MentorDashboardProps`, `StudentDashboardProps`, `UserProfile`, `lexendDeca` (+77 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 6` to `Community 0`, `Community 4`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 2` to `Community 3`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `UserListItem`, `MentorDashboardProps`, `StudentDashboardProps` to the rest of the system?**
  _82 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11904761904761904 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._