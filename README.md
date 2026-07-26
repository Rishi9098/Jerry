# Jerry — AI Chat Desktop

Jerry is a cross-platform desktop AI chat application built with **Electron**, **React**, and **TypeScript**. It connects to multiple AI providers, supports voice input/output, runs local AI agents, and includes a built-in RAG (Retrieval-Augmented Generation) pipeline backed by a local knowledge base.

---

## What I Built

### Core Chat Interface
- Multi-conversation sidebar with persistent chat history stored in **SQLite** (`better-sqlite3`)
- Markdown rendering with syntax highlighting for code blocks
- Streaming responses from all supported providers

### AI Provider Support
Jerry supports three provider modes, switchable from the settings panel:

| Provider | Description |
|----------|-------------|
| **Ollama** | Run local open-source models (Llama, Mistral, etc.) — no internet required |
| **NIM (NVIDIA)** | NVIDIA's cloud inference API for GPU-accelerated models |
| **Agent Router** | Routes requests across Claude, GPT, and other hosted models |

### AI Agent Pipeline
A multi-agent orchestration system lives in `src/main/agents/`:

- **Orchestrator** — breaks down tasks and delegates to specialists
- **Planner** — creates step-by-step execution plans
- **Coder** — writes and edits code
- **Researcher** — searches and summarises information
- **Reviewer** — validates agent outputs
- **Executor** — runs shell commands in a sandboxed workspace
- **Fixer** — detects and repairs errors in generated code
- **Tool Agent** — calls registered tools (file read/write, web fetch, etc.)

### RAG / Knowledge Base
- Local vector store (`src/main/rag/vectorStore.ts`) powered by `@xenova/transformers` for on-device embeddings
- Knowledge files in `knowledge/` are indexed at startup and bundled into the app
- Semantic search surfaces relevant context before each LLM call

### Voice
- Wake-word detection via **Picovoice Porcupine** (`useWakeWord.ts`)
- Speech-to-text transcription via **Whisper** (`nodejs-whisper`)
- Text-to-speech playback via the `say` library
- Voice UI hooks: `useVoice.ts`, `useWatchScreen.ts`

### Lumen Registrar (Sub-project)
`lumen-registrar/` is a full-stack **College ERP** system built as a side project inside this repo:
- **Frontend**: React + Vite + TypeScript + TanStack Query + React Hook Form
- **Backend**: Flask + SQLAlchemy + SQLite
- **Features**: Student admissions, profile editing, grades management, dashboard metrics, command palette (`⌘K`), CSV export
- **Automated Registrar Suite**:
  - **Academic Standing Engine**: Automatically computes honors (Dean's List / High Honors) vs. probation risks and generates official administrative letters.
  - **Degree Audit & Graduation Eligibility Engine**: Audits total earned credits toward 120-credit degree targets and classifies student readiness (*Graduation Ready*, *On Track*, *Credit Shortfall*).
  - **Official Academic Transcript Generator**: 1-click printable/downloadable official university academic transcript with term breakdowns and registrar seal authentication.
  - **At-Risk Early Warning & Intervention System**: Automated detector flagging academic deficiencies (D/F grades, GPA drop, unrecorded grades) and queuing advisor action plans.

### Workspace
`workspace/` contains exploratory prototypes — a Flask todo app, user API examples, and JavaScript/Python experiments used during development.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Electron 32 |
| Bundler | electron-vite + Vite |
| Frontend | React 18, TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Database | SQLite via better-sqlite3 |
| Embeddings | @xenova/transformers (local, no API key needed) |
| Voice STT | nodejs-whisper (Whisper) |
| Wake word | Picovoice Porcupine |
| TTS | say |
| Testing | Playwright |

---

## Prerequisites

- **Node.js** 18 or later (`node -v`)
- **npm** 9 or later (comes with Node)
- **macOS** (the DMG and tray icon are macOS-first; Linux/Windows builds are possible but untested)
- For voice features: a working microphone

---

## Installation

```bash
# 1. Clone the repo
git clone https://github.com/Rishi9098/Claude.git
cd Claude

# 2. Install dependencies
npm install

# 3. (Optional) Rebuild native modules for your Electron version
npm run postinstall
```

---

## Running in Development

```bash
npm run dev
```

This starts `electron-vite dev`, which:
1. Launches the Vite dev server for the renderer (React UI)
2. Compiles the main process TypeScript
3. Opens the Electron window with hot-reload

---

## Building for Production

```bash
# Build JS bundles only (no installer)
npm run build

# Build + package as a macOS DMG
npm run dist:mac

# Build + package for the current platform
npm run dist
```

Output goes to `dist/`. The macOS DMG supports both Apple Silicon (`arm64`) and Intel (`x64`).

---

## Configuration

On first launch Jerry opens a Settings panel. Set one of the following depending on your provider:

### Ollama (local)
1. Install Ollama from https://ollama.com
2. Pull a model: `ollama pull llama3`
3. In Jerry's settings, select **Ollama** and enter `http://localhost:11434`

### Agent Router
1. Get an API key from agentrouter.org
2. In Jerry's settings, select **Agent Router** and paste the key

### NIM (NVIDIA)
1. Get an API key from build.nvidia.com
2. In Jerry's settings, select **NIM** and paste the key

---

## Running the Lumen Registrar (sub-project)

The college ERP lives in `lumen-registrar/` and runs independently.

### Backend (Flask)

```bash
cd lumen-registrar/backend

# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with sample data
python seed.py

# Start the API server
python wsgi.py
# API runs at http://localhost:5000
```

### Frontend (React)

```bash
cd lumen-registrar/frontend

npm install
npm run dev
# UI runs at http://localhost:5173
```

---

## Project Structure

```
Jerry/
├── src/
│   ├── main/               # Electron main process (Node.js)
│   │   ├── agents/         # Multi-agent orchestration pipeline
│   │   ├── rag/            # Local vector store + RAG pipeline
│   │   ├── voice/          # STT, TTS, wake-word
│   │   ├── knowledge/      # Knowledge base manager
│   │   ├── ipcHandlers.ts  # IPC bridge between main and renderer
│   │   └── index.ts        # App entry, window + tray setup
│   ├── renderer/           # React UI (runs in Electron's browser context)
│   │   └── src/
│   │       ├── components/ # Chat, sidebar, settings, agent, model, voice UI
│   │       ├── hooks/      # useChat, useVoice, useWakeWord, etc.
│   │       ├── store/      # Zustand global state
│   │       └── lib/        # Provider clients, formatters
│   ├── preload/            # Context-isolated preload bridge
│   └── shared/             # Types shared between main + renderer
├── knowledge/              # Markdown files indexed into the RAG vector store
├── lumen-registrar/        # College ERP sub-project (Flask + React)
├── workspace/              # Development prototypes and experiments
├── tests/                  # Playwright E2E tests
├── resources/              # App icon
└── dist/                   # Built installers (git-ignored)
```

---

## Running Tests

```bash
# Run Playwright E2E tests (requires the app to be running)
npx playwright test

# View the last test report
npx playwright show-report
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd N` | New conversation |
| `Cmd ,` | Open settings |

---

## Known Limitations

- Voice features require a microphone and may need additional system permissions on macOS (System Settings → Privacy → Microphone)
- `NODE_TLS_REJECT_UNAUTHORIZED=0` is set automatically in dev mode to work around a TLS issue on macOS Sequoia with Electron's bundled OpenSSL — this is dev-only and does not affect production builds
- The Workspace and Lumen Registrar sub-projects are independent and must be started separately
