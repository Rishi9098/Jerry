# Product Specification: Lumen Registrar

> Generated from brief: "Build a Student Management web application for a college ERP system. Features: student admissions form (name, email, phone, date of birth, course, year of enrollment), student profiles page (view/edit all details), grades management (add/view grades per subject per student). Tech stack: React frontend, Flask backend, SQLite database. The UI should be clean and professional. Authentication is not required for this version."

## Vision

Lumen Registrar is the daily workbench for a college registrar's office: the place where admissions staff enroll students, advisors review profiles, and faculty record grades. It should feel like a focused, trustworthy administrative instrument — fast to scan, calm to use, and unambiguous about the data it holds. The product wins not by being flashy but by being *legible*: a registrar should be able to find a student, fix a typo, and post a grade in seconds without second-guessing what they're looking at.

## Design Direction

This is an internal admin/ERP tool, not a marketing site. The aesthetic target is "institutional software done with taste" — the disciplined data-density of Linear or the Stripe Dashboard, the editorial clarity of a well-set academic transcript, and the quiet authority of a university brand. No gradient hero blobs, no stock illustrations, no decorative animation. Every pixel should earn its place by aiding comprehension.

- **Color palette** (define as tokens; OKLCH preferred):
  - Surface base: `#F7F8FA` (app background), card surface `#FFFFFF`
  - Ink (text): primary `#1A2332`, secondary `#5B6473`, tertiary/muted `#8A93A3`
  - Primary brand (deep academic indigo): `#2D3A8C`, hover `#243072`, subtle tint `#EBEDF8`
  - Accent (registrar teal, used sparingly for active/selected): `#0E8C8C`
  - Semantic: success `#1E8E5A`, warning `#B5811E`, danger `#C0392B`, info `#2D6BB5`
  - Grade-scale colors (A green `#1E8E5A` → F red `#C0392B`) used only as small badges/chips, never as large fills
  - Borders/dividers: `#E3E7EE` hairlines
- **Typography**: Two families, deliberate pairing.
  - UI / body / data: **Inter** (or system fallback) — tabular numerals enabled (`font-feature-settings: "tnum"`) for all IDs, dates, GPAs, and grade columns so figures align in tables.
  - Display / page titles / brand: **Source Serif 4** (or another humanist serif) for H1 page titles and the wordmark only — gives the academic-records feel without compromising scanability.
  - Scale: H1 28px serif, H2 20px, section label 12px uppercase tracked, body 14px, table cell 13–14px, caption 12px. Strong scale contrast between section labels and content.
- **Layout philosophy**: Persistent left sidebar nav + top contextual bar + dense content canvas. This is a *dense dashboard*, not an airy single-page. Comfortable but information-rich: data tables with sensible row height (44–48px), forms in a constrained reading-width column (max ~640px) with two-column field grouping where logical. A right-hand detail/inspector panel pattern for student profiles.
- **Visual identity** (anti-AI-slop differentiators):
  - A real, consistent **8px spacing system** with intentional rhythm — section gaps larger than field gaps, not uniform padding everywhere.
  - **Tabular, transcript-style grade tables** with hairline rows, sticky headers, and a subtle left accent bar on the active/selected row.
  - **Status and grade chips** as a small, coherent badge system (rounded 6px, 11px uppercase, semantic color tint background + saturated text).
  - **Empty states with personality but restraint** — a single line-art mark, a clear sentence, and a primary action. No giant illustrations.
  - **Keyboard-first affordances** visibly surfaced (e.g. `⌘K` command palette hint, `/` to focus search).
  - Hairline borders + a single soft elevation level for cards/panels (no shadow soup, no glassmorphism).
- **Inspiration**: Linear (density, keyboard ergonomics, calm palette), Stripe Dashboard (data tables, status chips, form rigor), Notion (inspector panel + inline edit), and a physical university transcript/registrar form (the serif title + tabular figures cue).

## Features (prioritized)

### Must-Have (Sprint 1–2)

1. **App shell & navigation**: Left sidebar (Dashboard, Students, Grades, Courses, Degree Audit, At-Risk Alerts), top bar with global search and breadcrumb. Active route is visually unmistakable.
2. **Student admissions form**: Create a student with name, email, phone, date of birth, course, year of enrollment.
3. **Students list (data table)**: Paginated, sortable table of all students showing name, ID, course, year, email, status.
4. **Search & filter students**: Debounced text search (name/email/ID) plus filter by course and enrollment year.
5. **Student profile — view**: Profile page showing all details in a clear, grouped read layout (identity, contact, academic standing) plus a grades summary section.
6. **Student profile — edit**: Edit all student details inline or via an edit mode/panel.
7. **Grades management — add/edit/delete**: Add, edit, or delete grades per course and term with automated credit-weighted GPA recalculation.
8. **Automated Registrar Suite (Sprint 3–4)**:
   - **Academic Standing Engine**: Evaluates GPAs to assign standings (*High Honors*, *Dean's List*, *Good Standing*, *Academic Warning*, *Academic Probation*) and generates official administrative letters.
   - **Degree Audit & Graduation Eligibility Engine**: Audits earned credits toward 120-credit degree targets and classifies student readiness (*Graduation Ready*, *On Track*, *Credit Shortfall*, *GPA Deficit*).
   - **Official Academic Transcript PDF Generator**: 1-click printable/downloadable official university academic transcript with term breakdowns and registrar seal authentication.
   - **At-Risk Early Warning & Intervention System**: Automated detector flagging academic deficiencies (D/F grades, GPA drop, unrecorded grades) and queuing advisor action plans.

### Should-Have (Sprint 3–4)

11. **Dashboard overview**: Landing page with at-a-glance metrics — total students, students per course (small bar/distribution), enrollment-by-year, recent admissions, recent grade activity. Acceptance: real counts from the API, one tasteful chart treated as part of the design system (not a default chart-lib look), links into filtered lists.
12. **Bulk-friendly students table**: Multi-column sort, page-size control, and CSV export of the current (filtered) view. Acceptance: export reflects active filters; sort is stable; page size persists.
13. **Command palette (⌘K)**: Quick navigation + jump-to-student by name/ID + quick actions (New student, Add grade). Acceptance: keyboard-only operable, fuzzy match, ESC to close, accessible focus trap.
14. **Course management (lightweight)**: CRUD for the list of courses/programs so the admissions "course" field is a real foreign-key dropdown, not free text. Acceptance: courses seeded; admissions/edit use a select bound to courses; deleting a referenced course is guarded.
15. **Grade analytics on profile**: Per-student GPA trend by term and subject-level breakdown. Acceptance: computed server-side or client-side consistently; matches the grade table; degrades gracefully with sparse data.

### Nice-to-Have (Sprint 5+)

16. **Soft delete / archive students** with an "Archived" filter and restore. Acceptance: archived excluded from default list; restore works; counts adjust.
17. **Inline editable table cells** for quick grade corrections without opening a form. Acceptance: click-to-edit, Enter to save, Esc to cancel, validation inline.
18. **Print / PDF transcript** for a student (print stylesheet that renders a clean, registrar-grade transcript). Acceptance: `@media print` layout hides chrome, shows institution header + tabular grades + GPA.
19. **Dark theme** with a deliberately designed dark palette (not an auto-inverted one). Acceptance: tokens drive both themes; contrast passes WCAG AA in both.
20. **Activity log / audit trail** of admissions and grade changes. Acceptance: timestamped entries surfaced on the profile.

## Technical Stack

- **Frontend**: React (Vite) with TypeScript. Styling via CSS Modules or a tokenized CSS layer using CSS custom properties (design tokens in a single `tokens.css`); no heavyweight component kit passed off as finished design. React Router for routing, URL-as-state for filters/sort/pagination. TanStack Query (or SWR) for server state with stale-while-revalidate + optimistic grade/profile updates. React Hook Form + Zod (or equivalent) for form + schema validation. A lightweight chart approach (e.g. visx/Recharts/hand-rolled SVG) styled to match the design system.
- **Backend**: Flask with a clean app factory, Blueprints per resource (`students`, `grades`, `courses`), SQLAlchemy ORM, Marshmallow or Pydantic for request validation/serialization. Consistent JSON response envelope (`{ data, error, meta }`), proper HTTP status codes, CORS configured for the dev frontend origin, pagination/sort/filter query params on list endpoints.
- **Database**: SQLite via SQLAlchemy. Tables: `students`, `courses`, `grades` (FK to student and subject/course), with migrations (Flask-Migrate/Alembic) and a seed script (sample courses + a handful of students/grades so the app never demos empty).
- **Key libraries**: Vite, React, TypeScript, React Router, TanStack Query, React Hook Form, Zod; Flask, Flask-SQLAlchemy, Flask-Migrate, Flask-CORS, Marshmallow/Pydantic. Testing: Vitest + React Testing Library + Playwright (frontend), pytest (backend).

## API Surface (reference)

- `GET /api/students?search=&course=&year=&sort=&page=&page_size=` → paginated list (`meta` with total/page)
- `POST /api/students` → create (validated)
- `GET /api/students/:id` → profile incl. grade summary
- `PUT /api/students/:id` → update
- `DELETE /api/students/:id` → delete/archive
- `GET /api/students/:id/grades` → grade list + computed GPA
- `POST /api/students/:id/grades` → add grade
- `PUT /api/grades/:id` / `DELETE /api/grades/:id` → edit/remove
- `GET /api/courses` / `POST` / `PUT` / `DELETE` → course CRUD
- `GET /api/stats` → dashboard metrics
- All endpoints: input validation, clear error messages, no sensitive data leakage in errors.

## Evaluation Criteria

This is a CRUD-heavy admin/ERP tool. "Good" means **trustworthy, legible, fast, and correct** far more than "visually exciting." The rubric below is weighted accordingly: Functionality and Craft carry the most weight, Design quality matters as professional polish, and Originality is reframed as *thoughtful product judgment* rather than novelty.

### Functionality & Correctness (weight: 0.35)

The app must actually work end-to-end against the real Flask/SQLite backend.

- Admissions form creates a persisted student with all six required fields; validation rejects bad input on both client and server.
- Students list shows real data, supports search + filter by course/year + sort + pagination, with URL-reflected state.
- Profile view renders every field; edit persists changes and re-renders correctly; dirty-state guard works.
- Grades: add, view (transcript table), edit, delete all work; GPA/average recomputes correctly after every mutation.
- Critical flows pass: enroll → appears in list → open profile → edit → add grade → grade shows in summary → delete grade → summary updates → delete/archive student.
- Edge cases handled: empty DB, no search results, invalid IDs (404), duplicate email handling, concurrent-ish edits roll back cleanly.

### Craft & Polish (weight: 0.30)

The details that separate "works" from "feels solid."

- Every async surface has loading (skeletons, not bare spinners), empty, and error states.
- Forms: inline validation, disabled-until-valid submit, focus management, keyboard submit, helpful error copy.
- Tables: sticky headers, tabular numerals, sensible row height, sortable affordances, hover/active/selected states that look designed.
- Optimistic updates with visible rollback on failure; toasts for success/error.
- Accessibility: semantic HTML, labeled inputs, keyboard navigability, visible focus rings, AA contrast.
- No console errors, no layout shift on load, responsive down to 768px without overflow.

### Design Quality (weight: 0.20)

Professional, intentional, institution-grade UI — not an unstyled or default-template look.

- Coherent design-token system (color, type, spacing) applied consistently; no hardcoded one-off styles scattered around.
- Clear information hierarchy via scale contrast and intentional spacing rhythm (not uniform padding).
- The serif-title + tabular-figure registrar identity is present and consistent.
- A coherent status/grade chip system; one tasteful, on-brand chart (if dashboard built) rather than a default chart-lib look.
- Avoids banned AI-slop patterns: gradient hero blobs, stock illustrations, generic uniform card grids, shadow soup, decorative-only animation.

### Product Judgment / Originality (weight: 0.15)

Reframed for an admin tool: did the builder make smart, opinionated choices that a real registrar would appreciate?

- Thoughtful touches: command palette, computed age/GPA, CSV export, transcript print view, course as FK dropdown, seed data so it never demos empty, shareable filtered URLs.
- Sensible data model and API design (envelope, status codes, pagination/sort/filter).
- Demonstrates a point of view about the registrar workflow rather than a generic form-over-table dump.

## Sprint Plan

### Sprint 1: Foundation & Admissions
- Goals: Stand up the full stack and the create + read core.
- Features: #1 app shell/nav, #2 admissions form, #3 students list, #10 loading/empty/error states (initial pass); backend students model + `POST`/`GET` endpoints + seed script.
- Definition of done: Can create a student via the form and see them in a real, styled, paginated table backed by SQLite; validation works client + server; design tokens established.

### Sprint 2: Profiles & Grades Core
- Goals: Complete the read/edit profile and the full grades CRUD.
- Features: #4 search/filter, #5 profile view, #6 profile edit, #7 add grade, #8 view grades, #9 edit/delete grade; GPA computation; grades + courses models.
- Definition of done: Full critical path (enroll → profile → edit → add/view/edit/delete grades with recomputed GPA) works end-to-end; URL-as-state for filters; optimistic updates with rollback.

### Sprint 3: Dashboard & Power Features
- Goals: Add the overview surface and ergonomics that make it feel like real software.
- Features: #11 dashboard, #12 bulk table + CSV export, #13 command palette, #14 course management.
- Definition of done: Dashboard shows real metrics with one on-brand chart; ⌘K navigates and jumps to students; course field is a real FK dropdown; CSV export respects filters.

### Sprint 4: Analytics & Hardening
- Goals: Deepen grade insight and harden quality.
- Features: #15 grade analytics on profile; accessibility audit; responsive pass; test coverage (pytest + Vitest + Playwright critical flow); performance check.
- Definition of done: Profile shows GPA trend; AA accessibility verified; 80%+ test coverage on logic; critical-flow E2E green; no console errors; responsive to 768px.

### Sprint 5+: Delight & Records
- Goals: Registrar-grade extras.
- Features: #16 archive/restore, #17 inline-editable grade cells, #18 print/PDF transcript, #19 designed dark theme, #20 activity log.
- Definition of done: Each shipped feature meets its acceptance criteria with both themes passing contrast and the print transcript rendering cleanly.
