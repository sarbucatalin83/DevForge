# Implementation Plan: DevLearn — Local Developer Learning Platform

**Branch**: `001-devlearn-platform` | **Date**: 2026-04-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-devlearn-platform/spec.md`

---

## Summary

A local-first developer learning platform with a React 19 + Vite SPA frontend and a
Node.js/Express local backend. Learners practice JavaScript, TypeScript, and React via
written quizzes (self-assessed) and interactive coding exercises (Docker-executed). Content
is stored as plain JSON files on disk; learner progress is stored in `localStorage`.
The Claude API is used exclusively in an offline CLI content-generation script. No auth,
no cloud, no database in v1 — architecture is designed so that auth and per-user progress
persistence can be layered on cleanly in v2 without structural rewrites.

---

## Technical Context

**Language/Version**: TypeScript 5.5+ throughout; Node.js 20 LTS (backend); React 19 (frontend)  
**Primary Dependencies**: React 19, Vite 6, shadcn/ui, Tailwind CSS v4, Monaco Editor, Express 4, Docker SDK for Node  
**Storage**: JSON files on disk (content — read-only at runtime); `localStorage` (learner progress) — both mandated by constitution  
**Testing**: Vitest + React Testing Library (frontend); Jest inside Docker (exercise evaluation); Supertest (API integration)  
**Target Platform**: Desktop browser at 1280 px+ viewport; local `npm run dev` server; no cloud  
**Project Type**: Web application — React + Vite SPA frontend, Node.js/Express local server backend  
**Performance Goals**: <15 s code execution round-trip (SC-002); <5 s app startup (SC-003); <60 s to first quiz from cold start (SC-001)  
**Constraints**: Offline-capable at runtime, single device, single user, no mobile layout, no auth in v1  
**Scale/Scope**: Single user per device; starter content ships with the app (FR-022)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase-0 Gate

| Principle | Status | Verification |
|-----------|--------|-------------|
| I. Runtime Independence | ✅ PASS | App runs on `npm run dev` + Docker only; Claude API used only in offline CLI script |
| II. Pluggable Execution Engine | ✅ PASS | `executor-config.json` registry; Docker containers; no source-code changes for new languages |
| III. Content as Data | ✅ PASS | JSON files only; no DB for content; app never modifies content files at runtime |
| IV. Security by Isolation | ✅ PASS | All user-submitted code runs in Docker containers; no host-process execution ever |
| V. Self-Assessment Over Automation | ✅ PASS | Quiz answers are self-rated; correct answer + explanation always shown; no API evaluation |
| VI. Simplicity Ceiling | ✅ PASS | `localStorage` for progress; no auth, no cloud DB, no multi-user in v1 |
| Technology Constraints | ✅ PASS | TypeScript 5.5+ (strict), React 19 + Vite, shadcn/ui, Monaco, Express, Jest — no substitutions |

### ⚠️ GATE VIOLATION — USER INPUT CONFLICT

> **BLOCKED: Phase 0 research cannot begin until this conflict is resolved.**

The user input included: **"use SQLite to save data locally"**

This directly conflicts with the ratified DevLearn Constitution at multiple points:

| Conflict | Constitution Text | Location |
|---------|-------------------|----------|
| SQLite for content | "No database (SQL, embedded, or otherwise) MAY be introduced in v1 for content storage." | Principle III |
| SQLite for progress | "Progress MUST be stored in `localStorage`; no backend persistence layer is permitted for user state in v1." | Principle VI |
| SQLite as a dependency | "No ORM, no SQL database, no Redis MAY be introduced in v1." | Technology Constraints |

**Required resolution — choose one:**

1. **Drop the SQLite requirement** and proceed with the constitutionally mandated approach:
   - Content: JSON files on disk (already the plan)
   - Progress: `localStorage` (already the plan)
   - _This is the recommended path._ `localStorage` is sufficient for a single-user, single-device v1.

2. **Amend the constitution** via `/speckit-constitution` before continuing.
   - Specify which data (content? progress? both?) SQLite would replace.
   - The constitution's Governance section requires explicit documentation before work begins.

---

### User Input Alignment (non-conflicting)

The following user inputs are already fully aligned with the constitution and plan:

| User Input | Alignment |
|-----------|-----------|
| Do not use NextJS | ✅ Constitution mandates React + Vite; NextJS was never in scope |
| Best practices for React in 2026 | ✅ Phase 0 research target — will be consolidated in `research.md` |
| Do not implement auth now | ✅ Constitution Principle VI explicitly prohibits auth in v1 |
| Plan for future auth | ✅ Architectural consideration only — see Auth-Ready Architecture section below |

---

## Auth-Ready Architecture (v1 design, v2 implementation)

No auth code will be introduced in v1. The following patterns are chosen to ensure auth
can be layered on cleanly without structural rewrites:

### Frontend
- A single `AuthContext` provider wraps the app from day one. In v1 it returns
  `{ user: null, isAuthenticated: false }` and exposes no-op `login`/`logout` stubs.
  When auth is added, only this context's internals change; consuming components are untouched.
- The `localStorage` progress adapter is encapsulated behind a `ProgressRepository` interface.
  In v2, a user-scoped backend implementation can be swapped in at a single injection point.

### Backend
- Every Express route is defined with an explicit auth middleware slot:
  `router.get('/path', authMiddleware, handler)`. In v1, `authMiddleware` is a pass-through
  (`(req, res, next) => next()`). In v2, a real JWT/session check replaces it at one location.
- No `req.user` or session assumptions leak into business logic — handlers receive an
  explicit `userId` parameter (in v1: always `'local'`).

---

## Project Structure

### Documentation (this feature)

```text
specs/001-devlearn-platform/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command) — BLOCKED pending gate resolution
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/              # Express route handlers (quiz, exercises, progress, coverage)
│   ├── executor/         # Docker code execution engine + container lifecycle
│   ├── content/          # JSON content loader, validator, and cache
│   └── config/           # executor-config.json schema + loader
└── tests/
    ├── integration/       # Supertest API tests
    └── unit/              # Pure logic unit tests

frontend/
├── src/
│   ├── components/        # shadcn/ui + custom React components
│   │   ├── quiz/          # QuizCard, AnswerReveal, SelfAssessButtons
│   │   ├── exercise/      # ExerciseEditor (Monaco), OutputPreview, TestResultsPanel
│   │   ├── progress/      # ProgressSummary, TrackProgress, ResetConfirmDialog
│   │   ├── coverage/      # CoverageTable
│   │   └── shared/        # EmptyState, ErrorBanner, ThemeToggle, FilterBar
│   ├── pages/             # Route-level page components
│   │   ├── QuizPage.tsx
│   │   ├── ExercisePage.tsx
│   │   ├── ProgressPage.tsx
│   │   └── CoveragePage.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useProgress.ts     # localStorage progress read/write
│   │   ├── useContent.ts      # Content fetching + filtering
│   │   └── useCodeExecution.ts
│   ├── context/
│   │   └── AuthContext.tsx    # Auth-ready stub (v1: always unauthenticated)
│   ├── lib/
│   │   ├── progressRepository.ts  # ProgressRepository interface + localStorage impl
│   │   ├── session.ts             # Session randomisation (quiz order, exercise order)
│   │   └── utils.ts
│   └── types/             # Shared TypeScript types (content, progress, executor)
└── tests/
    ├── unit/
    └── integration/

scripts/
└── generate-content.js    # Offline Claude API content generation CLI

content/
├── javascript/
│   └── {topic}/{difficulty}/
│       ├── quiz/          # quiz-{id}.json
│       └── exercises/     # exercise-{id}.json
├── typescript/
│   └── (same pattern)
└── react/
    └── (same pattern)

executor-config.json       # Language executor registry — only file to edit for new languages
```

**Structure Decision**: Web application (Option 2). Frontend is a standalone React + Vite SPA
served by Vite's dev server. Backend is a separate Node.js/Express process. No monorepo tooling
in v1 — two `package.json` files, one per project. Types are duplicated intentionally (YAGNI;
a shared package would be premature).

---

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified.*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| _(none — gate violation is unresolved; no complexity justified yet)_ | — | — |

---

## Phase 0 Status

> **⏸️ PAUSED — Gate violation must be resolved first.**

Phase 0 research (React 2026 best practices, Monaco Editor integration patterns, Docker SDK
patterns for Node.js, sandboxed preview iframe approach, session randomisation) will be
executed once the SQLite gate conflict above is resolved by the user.

---

## Phase 1 Status

> **⏸️ NOT STARTED — Awaits Phase 0 completion.**

Artifacts to be generated: `research.md`, `data-model.md`, `contracts/`, `quickstart.md`.
