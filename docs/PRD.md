# Product Requirements Document — S.K. Boafo People & HR Platform

**Audience:** collaborators building and reviewing this product  
**Status:** Post HR scope cut (expenses + legal modules removed)  
**Product:** Internal people / HR dashboard for S.K. Boafo & Company (Gye Nyame Chambers)

---

## 1. Purpose

Give the firm a single place for **people operations**: leave, attendance, performance, training, files, messaging, announcements, recruitment, onboarding, and exit clearance.

**Legal casework is out of this product.** Matters, clients, court calendar, billing, and legal document CMS remain in the firm’s existing legal system. A future link-out to that system is acceptable; rebuilding it here is not.

---

## 2. Out of scope

| Item | Reason |
| --- | --- |
| Expenses / expense claims | Handled via third-party payroll / finance tools |
| Cases, clients, court calendar, billing, legal documents | Existing legal CMS — do not rebuild |
| Projects & Insights for non-HR roles | HR officer only |
| Native App Store / Play Store apps | Web-first (responsive OK) |
| Full payroll / payslips | External systems |

---

## 3. Roles (after scope cut)

| Role | Sees |
| --- | --- |
| **managing_partner** | Dashboard, Staff & Team, Approvals (leave), personal modules (leave, performance, attendance, files, messages, announcements, training) |
| **partner** | Dashboard, Approvals, personal modules |
| **associate** | Dashboard, personal modules |
| **paralegal** | Dashboard, personal modules |
| **admin** | Dashboard, Staff & Team, Approvals, personal modules |
| **hr_officer** | Full HR nav: personal modules + Approvals + Leave register, Employees, Attendance (HR), Recruitment, Onboarding, Exit clearance, Training (HR), **Projects**, **Insights** |

Approvers for leave: managing partner and HR officer (backend), plus Approvals UI for managing_partner / partner / admin / hr_officer via nav.

---

## 4. In-scope modules

| Module | Routes | Notes |
| --- | --- | --- |
| Home dashboard | `/` | HR-oriented KPIs: pending leave, attendance snapshot, training, announcements, team |
| Leave (staff) | `/leave` | Request and track own leave |
| Leave approvals | `/approvals` | Leave-only queue (no legal/document/invoice mocks) |
| Leave register | `/hr/leave` | Firm-wide leave (HR) |
| Performance | `/my-performance`, `/team-performance` | Reviews / KPIs (some field names still legal-flavoured — cleanup later) |
| Attendance | `/attendance`, `/hr/attendance` | Personal + firm snapshot (mock attendance data OK until device/API feed) |
| Files | `/files` | Personal / shared files (distinct from removed legal Documents) |
| Messages | `/messages` | Internal messaging |
| Announcements | `/announcements` | Firm notices; optional email delivery is planned, not required yet |
| Training | `/training`, `/hr/training` | Catalogue, enrollments, quizzes |
| Employees | `/hr/employees` | HR people directory |
| Recruitment | `/hr/recruitment` | Jobs + applicants (+ CV view planned) |
| Onboarding | `/hr/onboarding` | Checklists; intern self-serve link planned |
| Exit clearance | `/hr/exit-clearance` | Leavers checklist |
| Projects / Insights | `/projects`, `/insights` | **hr_officer only** |
| Staff & Team | `/staff` | Roster for managing_partner / admin (separate from `/hr/employees`) |
| Settings | `/settings` | Preferences |

---

## 5. Planned enhancements (workshop — not built in this cut)

Documented for collaborators; do **not** treat as shipped:

1. **Attendance thresholds** — alerts for late arrivals and missing check-out beyond configured limits.
2. **Intern intake link** — self-serve onboarding URL for interns.
3. **Recruitment CV open** — open / preview applicant CVs from the recruitment UI.
4. **Training completion & time** — completion tracking and time-spent analytics.
5. **Announcement emails** — optional email blast when announcements are published.
6. **Company email-only accounts** — restrict sign-up / accounts to `@skboafo.gh` (or firm domain).
7. **Temp password + force change** — first-login password reset flow.
8. **Training window** — mid-October firm training / rollout window (ops, not a feature flag).

---

## 6. Tech

| Layer | Choice |
| --- | --- |
| App | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Backend | Convex (schema, queries/mutations, seed) |
| Auth | Convex Auth (Password provider); session cookies — not `localStorage` |
| Deploy | Cloudflare Pages |

**Environment**

| Variable | Where | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_CONVEX_URL` | Pages build-time | Required or the client cannot connect |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Pages build-time | Convex HTTP / auth site URL |
| `SITE_URL` | Convex env | Live Pages origin for auth redirects |

Redeploy after changing `NEXT_PUBLIC_*` values.

---

## 7. Demo accounts

Seeded users (see login demo list / `convex/seed.ts`). Typical passwords on the login screen:

| Email | Role | Demo password (UI) |
| --- | --- | --- |
| `sk.boafo@skboafo.gh` | Managing Partner | `SKBoafo@2026` |
| `k.asare@skboafo.gh` | Partner | `Demo@2026!` |
| `k.frimpong@skboafo.gh` | Partner | `Demo@2026!` |
| `k.mensah@skboafo.gh` | Associate | `Demo@2026!` |
| `a.asante@skboafo.gh` | Associate | `Demo@2026!` |
| `a.darko@skboafo.gh` | Paralegal | `Demo@2026!` |
| `a.twum@skboafo.gh` | Paralegal | `Demo@2026!` |
| `n.acheampong@skboafo.gh` | Admin | `Demo@2026!` |
| `y.bonsu@skboafo.gh` | HR Officer | `Demo@2026!` |

After wiping data, re-run seed + `seedPasswords` (see Convex seed return message).

---

## 8. Explicit non-goals for the scope cut

- Attendance threshold alerts, intern self-serve, email announcements, training analytics (this PRD only until scheduled).
- Deep rename of performance KPI fields (`billableHours` / `casesHandled`) unless they break the build.
- UI linking into the external legal system (future).
