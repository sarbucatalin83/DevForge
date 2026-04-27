# DevLearn — Agent Context

> Read this file before making any changes to this repository.
> Hard constraints listed here are non-negotiable and supersede all other instructions.

---

## What This Project Is

DevLearn is a local-first developer learning platform. Learners practice JavaScript,
TypeScript, and React through:

- **Written quizzes** — open-ended questions, self-assessed by the learner after seeing the correct answer.
- **Coding exercises** — code written in a Monaco editor, evaluated by automated tests inside Docker containers.

It runs entirely on a developer's laptop. No cloud dependency at runtime. No account required.

---

## Architectural Decisions (locked for v1)

| Concern | Choice | Locked? |
|---------|--------|---------|
| Frontend | React 19 + Vite 6 (SPA) | Yes — not NextJS |
| Backend | Node.js 20 LTS + Express 4 | Yes — local server only |
| UI components | shadcn/ui + Tailwind CSS v4 | Yes — no other CSS frameworks |
| In-browser editor | Monaco Editor | Yes |
| Code execution | Docker containers | Yes — non-negotiable security boundary |
| Content storage | JSON files under `content/` | Yes — no database |
| Progress storage | `localStorage` | Yes — no backend for user state |
| Auth | Stub only (`AuthContext`) | Yes — not implemented in v1 |
| Content generation | Offline CLI (`scripts/generate-content.js`) using Claude API | Yes |

---

## Directory Map

```text
backend/
├── src/
│   ├── api/          → Express route handlers
│   ├── executor/     → Docker container lifecycle + code evaluation
│   ├── content/      → JSON content loader + file-path resolver + validator
│   └── config/       → executor-config.json loader + schema
└── tests/
    ├── integration/  → Supertest API tests (hit real Express app)
    └── unit/         → Pure logic tests

frontend/
├── src/
│   ├── components/
│   │   ├── quiz/     → QuizCard, AnswerReveal, SelfAssessButtons
│   │   ├── exercise/ → ExerciseEditor (Monaco), OutputPreview, TestResultsPanel
│   │   ├── progress/ → ProgressSummary, TrackProgress, ResetConfirmDialog
│   │   ├── coverage/ → CoverageTable
│   │   └── shared/   → EmptyState, ErrorBanner, ThemeToggle, FilterBar
│   ├── pages/        → QuizPage, ExercisePage, ProgressPage, CoveragePage
│   ├── hooks/        → useProgress, useContent, useCodeExecution
│   ├── context/      → AuthContext (v1 stub — always unauthenticated)
│   ├── lib/          → progressRepository, session randomisation, utils
│   └── types/        → TypeScript types shared within the frontend
└── tests/
    ├── unit/
    └── integration/

content/              → JSON content files (read-only at runtime)
scripts/              → Offline Claude API content generation CLI
executor-config.json  → Language executor registry (only file to change for new tracks)
specs/                → Feature specs, plan, research, data model, contracts
.specify/memory/      → Constitution and project memory
```

---

## Hard Constraints

These are enforced by the ratified project constitution. Violating them is a critical defect:

### 1. User code never runs on the host process
Every code submission must go through a Docker container. The container must enforce:
a hard execution timeout (default 10 s), a CPU cap, and a memory cap. The container is
removed immediately after it finishes or times out. No exceptions. No "dev mode" bypass.

### 2. No database in v1
- Content → JSON files on disk (read-only at runtime).
- Progress → `localStorage` only. No backend persistence for user state.
- No SQLite, no SQL, no ORM, no embedded DB of any kind.

### 3. No runtime API calls
The app works fully offline at runtime. The Claude API is used only in
`scripts/generate-content.js`, which authors run manually before using the app.

### 4. No auth in v1
`AuthContext` is a stub. Do not wire it to any auth service. The stub must remain so v2
can add auth without structural changes.

### 5. Content files are immutable at runtime
The app reads content files; it never writes to them. Only `scripts/generate-content.js`
creates or modifies content files.

### 6. New language tracks require zero source-code changes
Adding Go, Rust, etc. requires only: a new entry in `executor-config.json` and content
files under `content/{track}/`. No application code changes are permitted.

---

## Data Shapes

```typescript
type Track = 'javascript' | 'typescript' | 'react';
type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'senior';
type ExerciseType = 'fill-in-the-blank' | 'fix-a-bug' | 'implement-a-function' | 'refactor';
type Verdict = 'pass' | 'fail' | 'skipped';

type QuizItem = {
  id: string;
  track: Track;
  topic: string;
  difficulty: Difficulty;
  type: 'quiz';
  question: string;
  answer: string;
  explanation: string;
};

type CodingExercise = {
  id: string;
  track: Track;
  topic: string;
  difficulty: Difficulty;
  type: 'exercise';
  exerciseType: ExerciseType;
  description: string;
  files: { name: string; content: string }[];      // starter files (1–3)
  solution: { name: string; content: string }[];   // reference solution
};

type ProgressRecord = {
  itemId: string;
  verdict: Verdict;        // always the most recent; overwrites previous
  attemptCount: number;
  lastAttemptedAt: string; // ISO 8601
};
```

---

## API Surface (backend → frontend)

All routes are local-only at `http://localhost:3001`:

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/content` | List items; query params: `track`, `topic`, `difficulty`, `type` |
| `GET` | `/api/content/:id` | Single content item by ID |
| `GET` | `/api/coverage` | Counts per `track`/`topic`/`difficulty`/`type` combination |
| `POST` | `/api/execute` | Submit code → Docker execution → `{ passed, testOutput, preview, solution? }` |

Progress is managed entirely in `localStorage`. It is never sent to the backend.

---

## Ordering Rules

These come from the spec and must be respected in all session-building logic:

- **Quiz items**: randomised per session. Order must be consistent within a session and
  differ across sessions.
- **Coding exercises**: ordered by difficulty tier (Beginner → Intermediate → Advanced →
  Senior); randomised within each tier per session.

---

## Error Handling Requirements

- Every user-visible error must include a human-readable message AND at least one
  concrete remediation step.
- Malformed content files: skip silently; continue loading valid files; never crash.
- Corrupted `localStorage` progress: discard and start from a clean state; never crash.
- Code execution timeout: return a timeout message; do not reveal the reference solution.
- Missing Docker: show a clear error with installation instructions; do not attempt execution.

---

## Auth-Ready Stubs (v1 — do not remove or activate)

| Location | What it is | v2 change |
|----------|-----------|-----------|
| `frontend/src/context/AuthContext.tsx` | Always returns `{ user: null, isAuthenticated: false }` | Wire to real auth provider |
| Express `authMiddleware` in every route | Pass-through `(req, res, next) => next()` | Replace with JWT/session check |
| `userId: string` parameter in handlers | Hardcoded to `'local'` | Derived from verified token |
| `ProgressRepository` interface | `localStorage` impl | Swap for user-scoped backend impl |

---

## React 2026 Patterns Used in This Project

- **React 19 compiler** — manual `useMemo`/`useCallback` are not added without profiler evidence.
- **`use()` hook** — for async data in components where it fits naturally.
- **No server components** — this is a Vite SPA; everything is a client component.
- **Named exports** for components; default exports at page level only.
- **Co-located tests** — `Button.test.tsx` lives next to `Button.tsx`.
- **TanStack Query** — for all backend API calls (server state management).
- **No global state manager** — React context + local state is sufficient for v1.

---

## Testing Approach

| Scope | Tool | Notes |
|-------|------|-------|
| React components | Vitest + React Testing Library | Behaviour tests; no snapshot tests |
| Backend API routes | Supertest | Against the real Express app; no mocks |
| Code execution | Jest inside Docker | Do not mock the Docker executor in integration tests |
| Type safety | `tsc --noEmit` | Must pass with zero errors |

---

## Content File Layout

```text
content/
└── {track}/
    └── {topic}/
        └── {difficulty}/
            ├── quiz/
            │   └── quiz-{id}.json
            └── exercises/
                └── exercise-{id}.json
```

The path encodes the filter metadata. The JSON inside must also declare `track`, `topic`,
and `difficulty` fields for validation. A mismatch should be treated as a malformed file
and skipped silently.
