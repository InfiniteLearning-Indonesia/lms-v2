# Frontend v3 contracts

`cp11-cp12.openapi.json` is the initial backend snapshot copied from
`api-lms-v2` (`be-v3`, commit `52cbc88`). It is intentionally marked
`PARTIAL_LOCAL`: it covers the local identity/session and Class lifecycle
slice only. Domain slices M06–M18 remain mock-only until their Go contracts are
published.

The generated TypeScript file is `lib/api/generated.ts`. Run
`npm run contract:generate` and then `npm run contract:check` to verify the
snapshot, generated output and checksum are reproducible.
