# S.K. Boafo & Company — People & HR Dashboard

HR and people-operations dashboard for **S.K. Boafo & Company** (Gye Nyame Chambers). Staff manage leave, attendance, training, files, messages, and announcements; HR officers also run employees, recruitment, onboarding, exit clearance, and projects.

Legal casework stays in the firm’s existing legal system — this app does not replace cases, clients, court calendar, billing, or legal documents.

## Features

| Section | Route | What it covers |
| --- | --- | --- |
| Dashboard | `/` | HR overview: attendance rate, leave by type, headcount, quick stats |
| Leave Approvals | `/approvals` | Approve / decline leave requests |
| My Leave | `/leave` | Personal leave requests |
| Leave Register | `/hr/leave` | Firm-wide leave (HR) |
| Attendance | `/attendance`, `/hr/attendance` | Personal and firm attendance |
| Performance | `/my-performance`, `/team-performance` | Individual and team reviews |
| Files / Messages | `/files`, `/messages` | Personal files and messaging |
| Announcements | `/announcements` | Firm notices |
| Training | `/training`, `/hr/training` | Courses and HR training management |
| Employees | `/hr/employees` | Employee directory (HR) |
| Recruitment | `/hr/recruitment` | Job postings and applicants |
| Onboarding | `/hr/onboarding` | New-hire checklists |
| Exit clearance | `/hr/exit-clearance` | Leavers checklist |
| Projects | `/projects` | HR officer only |
| Staff & Team | `/staff` | People roster (managing partner / admin) |
| Settings | `/settings` | Preferences |

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- [Convex](https://convex.dev) + Convex Auth

## Getting started

Requires Node.js and [pnpm](https://pnpm.io) (this repo pins `pnpm@10.33.0`).

```bash
pnpm install
pnpm exec convex dev   # or link an existing Convex deployment
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated visits start at `/login`.

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
app/            # routes (HR dashboard, leave, training, …)
convex/         # schema, auth, seed, domain modules
components/     # AppShell, Sidebar, Header, Modal, Icons
docs/           # Product PRD and collaborator notes
```

Firm colours used in the UI are navy `#0B2349` and gold `#C9A227`.

For product scope, roles, and planned work, see [docs/PRD.md](docs/PRD.md).
