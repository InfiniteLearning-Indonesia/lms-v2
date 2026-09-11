# Infinite Learning LMS v3 frontend

## Development

Run the normal frontend against the configured backend:

```bash
npm run dev
```

Until the identity-owner browser bridge is available, use the explicit read-only UI preview:

```bash
npm run dev:preview
```

Open [http://localhost:3000/login](http://localhost:3000/login) and choose **Buka Dashboard Preview**, or open [http://localhost:3000/app](http://localhost:3000/app) directly. The default preview actor is `student`.

To preview another actor:

```bash
LMS_DEV_PREVIEW_ACTOR=teacher npm run dev:preview
```

Allowed values are `student`, `teacher`, `teacherStudent`, `facilitator`, and `siteAdmin`.

For the FE02 Class administration preview, run:

```bash
LMS_DEV_PREVIEW_ACTOR=siteAdmin npm run dev:preview
```

Then open [http://localhost:3000/app/admin/classes](http://localhost:3000/app/admin/classes). Class links expose the Settings and People UI according to their preview capability.

Preview mode is accepted only when `NODE_ENV=development` and the server-only `LMS_DEV_PREVIEW=true` flag is present. It injects typed actor/Class fixtures into the existing providers and disables identity and Class network queries. The Student preview supplies UI-only task and logbook reminder fixtures for the Class overview; the Site Admin preview supplies UI-only Class/participant/identity directories for FE02. Production shows explicit integration states until the required read models are available. Preview never creates a session, enables mutations, or changes the production backend contract.

## Verification

```bash
npm run check
npm run test:e2e
```
