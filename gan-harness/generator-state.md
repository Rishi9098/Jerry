# Generator State — Lumen Registrar ERP & Automation Suite

## System Overview
**Lumen Registrar** is a full-stack college registrar workbench built with React, Vite, TypeScript, Flask, SQLAlchemy, and SQLite.

### Backend Services
- **Flask App Factory**: Standardized JSON envelope (`{data, error, meta}`), CORS, custom error handlers.
- **Blueprints**:
  - `students`: Roster management, student profile CRUD, academic standing letter generator.
  - `grades`: Transcript grade entry, edit, and deletion with credit weighting.
  - `courses`: Academic course catalog.
  - `stats`: Overall dashboard metrics, cohort GPA, enrollment distributions.
  - `degree_audit`: Real-time degree completion audit against 120-credit degree targets and graduation readiness.
  - `at_risk`: Early warning detector flagging deficient grades (`D`/`F`), low cumulative GPA (`< 2.30`), and advisor action queue.
- **Database Seeder**: Populates 8 degree programs, 16 students, and 48 course grades (`seed.py`).

### Frontend UI & Features
- **Design System**: Built on native CSS design tokens (`tokens.css`, `global.css`, `automation.css`) featuring tabular figures, serif headings, and card panels.
- **Dashboard**: Metric cards, distribution charts, recent admissions, and recent grade activity.
- **Student Roster & Search**: Search by name/ID/email, course/year filters, pagination, CSV exports, and `⌘K` command palette.
- **Student Profiles & Transcripts**: Grouped detail view, transcript ledger, and modal dialogs for printing Official Academic Transcripts & Administrative Standing Letters.
- **Degree Audit View (`/degree-audit`)**: Degree audit dashboard with completion progress bars and eligibility chips.
- **At-Risk Early Warning View (`/at-risk`)**: Advisor intervention action queue for flagged academic records.

---

## Production Build Status
- **TypeScript**: Clean compilation (`tsc -b`).
- **Vite Production Build**: `npm run build` succeeds (`✓ built in 952ms`).
- **API Server**: Flask backend running on `http://127.0.0.1:5050`.
- **Frontend Dev Server**: Vite React app running on `http://localhost:5173`.
