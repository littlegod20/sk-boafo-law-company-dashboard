# S.K. Boafo & Company — Practice Dashboard

Legal practice management dashboard for **S.K. Boafo & Company** (Gye Nyame Chambers). Staff can review caseload, clients, court dates, approvals, billing, documents, and team activity from one workspace.

This is a front-end prototype. Data and sign-in are local demo content stored in the browser — there is no backend yet.

## Features

| Section | Route | What it covers |
| --- | --- | --- |
| Dashboard | `/` | Caseload KPIs, recent matters, deadlines, practice-area mix, and attorney summary |
| Case Management | `/cases` | Matter list, status, and opening a new case |
| Clients | `/clients` | Client records |
| Court Calendar | `/calendar` | Hearings and filing dates |
| Approvals | `/approvals` | Approval queue with preview, approve, and reject |
| Billing & Invoices | `/billing` | Invoices and outstanding balances (GHS) |
| Documents | `/documents` | Document repository |
| Staff & Team | `/staff` | Attorneys and team members |
| Announcements | `/announcements` | Firm notices |
| Settings | `/settings` | Firm information and preferences |

The sidebar also supports a role switcher (Managing Partner, Partner, Associate, Paralegal, Admin) and a collapsible profile menu with sign-out.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4

## Getting started

Requires Node.js and [pnpm](https://pnpm.io) (this repo pins `pnpm@10.33.0`).

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated visits are expected to start at `/login`.

Other scripts:

```bash
pnpm build   # production build
pnpm start   # serve the production build
pnpm lint    # ESLint
```

## Deploy (Cloudflare Pages)

`NEXT_PUBLIC_*` values are inlined at **build time**. In Cloudflare Pages → Settings → Environment variables (Production), set:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_CONVEX_URL` | your Convex URL, e.g. `https://….convex.cloud` |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | your Convex site URL, e.g. `https://….convex.site` |

Then **redeploy** (a new build is required — changing env alone does not update an existing deployment).

Also set Convex backend `SITE_URL` to your live Pages URL (e.g. `https://your-project.pages.dev`):

```bash
pnpm exec convex env set SITE_URL=https://your-project.pages.dev
```

## Demo sign-in

Click a row on the login screen to autofill, or use credentials from the seed (e.g. `sk.boafo@skboafo.gh` / `Chambers2026`). Auth is handled by Convex Auth cookies — not `localStorage`.

## Project layout

```
app/            # routes (dashboard, cases, clients, calendar, …)
components/     # AppShell, Sidebar, Header, Modal, Icons
```

Firm colours used in the UI are navy `#0B2349` and gold `#C9A227`.
