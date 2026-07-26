# Lumen Registrar — College ERP & Student Management System

**Lumen Registrar** is an institutional-grade, full-stack administrative workbench for college registrar offices. Built with **React 18**, **TypeScript**, **Flask**, and **SQLite**, it provides admissions tracking, profile management, academic transcripts, degree auditing, early warning interventions, and automated standing evaluations.

---

## 🌟 Key Features

### 🏢 Student Admissions & Roster Management
- **Admissions Form**: Real-time per-field validation (email format, DOB checks, enrollment bounds, course mapping).
- **Roster Table**: Paginated, multi-column sortable table with debounced text search (by name, email, or student ID) and program/year filtering.
- **CSV Data Export**: One-click export of filtered student roster records.
- **Command Palette (`⌘K`)**: Keyboard-first navigation to jump to any student profile or perform quick registrar actions.

### 📚 Academic Records & Grades Ledger
- **Student Profiles**: Comprehensive view displaying personal details, academic standing, and earned credit metrics.
- **Interactive Transcript**: Add, edit, or delete grades per course and term.
- **Automatic GPA Recalculation**: Credit-weighted 4.0 GPA calculation updated dynamically after every grade change.

---

## 🚀 4-Part Automated Registrar Suite

| Automation Module | Description & Capabilities |
| :--- | :--- |
| 🎓 **Academic Standing Engine** | Evaluates student GPAs to assign standings (*High Honors*, *Dean's List*, *Good Standing*, *Academic Warning*, *Academic Probation*) and generates downloadable/printable official administrative letters. |
| 📊 **Degree Audit & Eligibility Check** | Audits credit completion toward the 120-credit degree target, major GPA requirements, and classifies readiness (*Graduation Ready*, *On Track*, *Credit Shortfall*, *GPA Deficit*). |
| 📄 **Official Transcript PDF Generator** | Instant 1-click printable official university academic transcript with term breakdowns, cumulative GPA calculations, and registrar seal authentication (`@media print` ready). |
| 🚨 **At-Risk Early Warning System** | Automated background detector identifying deficient grades (`D`/`F`), low cumulative GPA (`< 2.30`), or unrecorded grades, creating an advisor intervention queue. |

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, TanStack Query, React Hook Form, Zod |
| **Styling** | Custom Design System Tokens (CSS Custom Properties), CSS Modules |
| **Backend** | Flask (Python 3), Flask-SQLAlchemy, Flask-CORS |
| **Database** | SQLite |
| **Testing** | Playwright (E2E) |

---

## 🚦 Quick Start & Installation

### 1. Backend Setup (Flask API)

```bash
cd lumen-registrar/backend

# Create and activate a Python virtual environment
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with sample courses, students, and grades
python seed.py

# Start the API server
python wsgi.py
# API runs at http://127.0.0.1:5050
```

### 2. Frontend Setup (React UI)

```bash
cd lumen-registrar/frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
# App runs at http://localhost:5173
```

---

## 🛰️ API Surface Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/stats` | `GET` | Overall dashboard metrics (cohort GPA, program breakdown, recent activity) |
| `/api/students` | `GET`, `POST` | List students (search, filter, sort, paginate) or enroll new student |
| `/api/students/:id` | `GET`, `PUT`, `DELETE` | Retrieve, edit, or archive a student profile |
| `/api/students/:id/letter` | `GET` | Generate official administrative standing letter data |
| `/api/students/evaluate-standings` | `POST` | Batch evaluate academic standings across active roster |
| `/api/degree-audit/summary` | `GET` | Program-wide degree audit metrics & graduation eligibility summary |
| `/api/at-risk` | `GET` | At-risk early warning queue and recommended advisor interventions |
| `/api/courses` | `GET`, `POST` | Course catalog CRUD |
| `/api/grades` | `POST`, `PUT`, `DELETE` | Grade ledger mutations & transcript updates |

---

## 📂 Project Structure

```
lumen-registrar/
├── backend/
│   ├── app/
│   │   ├── blueprints/
│   │   │   ├── at_risk.py         # At-risk early warning blueprint
│   │   │   ├── degree_audit.py    # Degree audit blueprint
│   │   │   ├── students.py        # Student CRUD & letter generator
│   │   │   ├── grades.py          # Grade ledger endpoints
│   │   │   ├── courses.py         # Course catalog endpoints
│   │   │   └── stats.py           # Dashboard stats endpoint
│   │   ├── models.py              # SQLAlchemy ORM models (Student, Course, Grade)
│   │   └── validation.py          # Input schemas & validators
│   ├── seed.py                    # Database seeder script
│   ├── wsgi.py                    # Server entry point (port 5050)
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/            # UI components (Transcripts, Letters, Modals, Shell)
    │   ├── features/              # Feature modules (Dashboard, Students, Grades)
    │   ├── pages/                 # Page routes (Dashboard, Roster, Degree Audit, At-Risk, Profile)
    │   ├── styles/                # Design tokens & styles (tokens.css, global.css, automation.css)
    │   ├── lib/                   # API clients, hooks, & type definitions
    │   ├── App.tsx                # App routes & layout
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```
