<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at `specs/001-devlearn-platform/plan.md`.
<!-- SPECKIT END -->

# DevLearn — Local Developer Learning Platform

Local-first developer learning app: quiz mode + interactive coding exercises for JavaScript,
TypeScript, and React. Code runs in Docker. Content lives in JSON files. No cloud, no auth,
no database in v1.

---

## Quick Commands

```bash
# Frontend — React + Vite (http://localhost:5173)
cd frontend && npm install && npm run dev

# Backend — Express (http://localhost:3001)
cd backend && npm install && npm run dev

# Run both (from repo root)
npm run dev

# Type-check everything
cd frontend && npm run typecheck
cd backend && npm run typecheck

# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# Generate content (offline — requires ANTHROPIC_API_KEY in env)
node scripts/generate-content.js --track javascript --topic closures --difficulty beginner --type quiz --count 5
```

---

## Architecture at a Glance

Two separate Node processes — no monorepo tooling in v1:

| Layer | Tech | Notes |
|-------|------|-------|
| Frontend | React 19 + Vite 6 | SPA only — no server components |
| Backend | Node.js 20 + Express 4 | Local server; never deployed to cloud |
| Content | JSON files under `content/` | Read-only at runtime |
| Progress | `localStorage` | Never sent to backend |
| Code execution | Docker containers | Isolated; never on host process |
| UI | shadcn/ui + Tailwind CSS v4 | No other CSS frameworks |
| Editor | Monaco Editor | In-browser code editor |

Full design decisions: `specs/001-devlearn-platform/plan.md`
Non-negotiable constraints: `.specify/memory/constitution.md`

---

## Non-Negotiable Rules

Violations are critical defects — do not work around these:

1. **User code NEVER runs on the host process.** Every submission goes through a Docker
   container. The container must have: a hard timeout, a CPU cap, and a memory cap.
   The container is removed immediately after execution completes or times out.

2. **No database in v1.** Content → JSON files on disk. Progress → `localStorage`.
   No SQLite, no SQL, no ORM, no embedded DB of any kind.

3. **No runtime API calls.** The app operates 100 % offline. The Claude API is used only
   in `scripts/generate-content.js`, which is run manually before the app starts.

4. **No auth code in v1.** `AuthContext` is a stub that always returns
   `{ user: null, isAuthenticated: false }`. Do not wire it to any auth service.

5. **Content files are read-only at runtime.** The app loads them; it never writes to them.

6. **New language tracks require zero source-code changes.** Add an entry to
   `executor-config.json` and drop content files in `content/{track}/`. Nothing else.

---

## Code Conventions

### TypeScript
- `strict: true` everywhere. No `any` — use `unknown` and narrow.
- Prefer `type` over `interface` for plain data shapes.
- All async code must handle errors explicitly. No unhandled promise rejections.

### React (2026 best practices)
- React 19 compiler is assumed — do not add manual `useMemo`/`useCallback` unless a
  profiler trace proves it is necessary.
- This is a Vite SPA. No server components, no `use server`, no file-based routing.
- Use the `use()` hook for async data in components where it fits.
- Named exports for all components. Default exports at page level only.
- Co-locate tests next to the component file: `Button.test.tsx` next to `Button.tsx`.
- File naming: `PascalCase.tsx` for components, `camelCase.ts` for hooks/utils/services.

### State
- Access `localStorage` only through the `ProgressRepository` interface in
  `frontend/src/lib/progressRepository.ts`. Never call `localStorage` directly elsewhere.
- No global state library in v1. React context + local state is sufficient.
- Use TanStack Query for all backend API calls (server state).

### Styling
- Tailwind CSS only, applied through shadcn/ui components or Tailwind utility classes.
- No plain `.css` files, no CSS-in-JS, no other component libraries.
- Dark/light theme driven by `data-theme` on `<html>`. Default to `prefers-color-scheme`.

### Testing
- Unit tests: Vitest + React Testing Library. Test behaviour, not implementation details.
- API tests: Supertest against the real Express app. No mocking of Express internals.
- Exercise evaluation: Jest inside Docker. Do not mock the Docker executor in integration tests.
- No snapshot tests.

### Error Handling
- Every user-visible error must include a human-readable message AND at least one
  remediation step (SC-007).
- Malformed content files must be skipped silently — the app must never crash because
  one JSON file is bad.
- Corrupted `localStorage` progress: discard and start fresh. Never crash.

---

## Content File Format

Files live at `content/{track}/{topic}/{difficulty}/quiz/` or `.../exercises/`:

```jsonc
// Quiz item
{
  "id": "abc123",
  "track": "javascript",
  "topic": "closures",
  "difficulty": "beginner",
  "type": "quiz",
  "question": "What is a closure?",
  "answer": "A function that retains access to its lexical scope...",
  "explanation": "When a function is defined inside another function..."
}
```

```jsonc
// Coding exercise
{
  "id": "def456",
  "track": "react",
  "topic": "hooks",
  "difficulty": "intermediate",
  "type": "exercise",
  "exerciseType": "fix-a-bug",
  "description": "Fix the stale closure bug in this useEffect...",
  "files": [
    { "name": "Counter.tsx", "content": "..." },
    { "name": "Counter.test.tsx", "content": "..." }
  ],
  "solution": [
    { "name": "Counter.tsx", "content": "..." }
  ]
}
```

---

## Executor Config Format

To add a new language track, append to `executor-config.json` only — no code changes:

```jsonc
{
  "javascript": {
    "image": "node:20-alpine",
    "extension": ".js",
    "runCommand": "node {file}",
    "testCommand": "jest {testFile}",
    "timeoutSeconds": 10,
    "cpuLimit": "0.5",
    "memoryLimit": "128m"
  },
  "typescript": { "..." },
  "react": { "..." }
}
```

---

## Auth-Ready Stubs (v1 — do not remove)

These exist so auth can be added in v2 without structural rewrites:

- `frontend/src/context/AuthContext.tsx` — always returns `{ user: null, isAuthenticated: false }`
  with no-op `login`/`logout` stubs.
- Every Express route has an `authMiddleware` slot that is a pass-through in v1:
  `(req, res, next) => next()`. Replace the pass-through in v2 — nothing else changes.
- Business logic receives `userId: string` (hardcoded to `'local'` in v1). Never access
  `req.session` or `req.user` directly in handlers.
- `ProgressRepository` interface allows swapping `localStorage` for a user-scoped backend
  in v2 at a single injection point.
