# v3 feature boundaries

Each domain owns its API adapters, components, Zod schemas, additional types,
and colocated tests. The FE00 workspace/admin placeholders establish the
composition boundary; future checkpoints add the domain folders below without
putting business fetches into pages or `components/ui`:

`identity` · `classes` · `learning` · `submission` · `gradebook` · `completion` ·
`attendance` · `logbook` · `admin`.
