---
description: "Task list for DevLearn — Local Developer Learning Platform"
---

# Tasks: DevLearn — Local Developer Learning Platform

**Input**: Design documents from `specs/001-devlearn-platform/`
**Available**: plan.md, spec.md
**Generated**: 2026-04-27

**Tech stack**: TypeScript 5.5+ (strict), React 19 + Vite 6, shadcn/ui, Tailwind CSS v4,
Monaco Editor, Node.js 20 LTS + Express 4, Docker SDK (dockerode), TanStack Query

**Tests**: Not included — no TDD requirement in the feature spec. Acceptance scenarios
from spec.md serve as manual validation criteria at each phase checkpoint.

**Organization**: Tasks are grouped by user story to enable independent delivery of each
increment. All tasks use the format: `- [ ] [TaskID] [P?] [Story?] Description — file/path`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create the full project skeleton — both processes, all configs, no features yet.

- [x] T001 Create `package.json` at repo root with a `concurrently` dev script that starts frontend and backend together (`npm run dev`)
- [x] T002 Initialize frontend Vite + React 19 + TypeScript project in `frontend/` (use `npm create vite@latest frontend -- --template react-ts`, then install React 19 explicitly)
- [x] T003 [P] Initialize backend Node.js + Express + TypeScript project in `backend/` — create `backend/package.json`, install `express`, `cors`, `ts-node-dev`, `@types/express`, `@types/node`
- [x] T004 [P] Configure `frontend/tsconfig.json` with `strict: true`, `moduleResolution: bundler`, `jsx: react-jsx`, and path alias `@/ → src/`
- [x] T005 [P] Configure `backend/tsconfig.json` with `strict: true`, `module: commonjs`, `moduleResolution: node`, `outDir: dist`, `rootDir: src`
- [x] T006 [P] Configure ESLint + Prettier in `frontend/` — create `frontend/eslint.config.js` (react-hooks, typescript-eslint) and `frontend/prettier.config.js`
- [x] T007 [P] Configure ESLint + Prettier in `backend/` — create `backend/eslint.config.js` (typescript-eslint) and `backend/prettier.config.js`
- [x] T008 Install shadcn/ui and configure Tailwind CSS v4 in `frontend/` — run shadcn init, update `frontend/src/index.css` with Tailwind directives, add Button and Dialog components
- [x] T009 [P] Install Monaco Editor in `frontend/` — add `@monaco-editor/react` to `frontend/package.json`
- [x] T010 [P] Install Docker SDK in `backend/` — add `dockerode` and `@types/dockerode` to `backend/package.json`
- [x] T011 [P] Create `executor-config.json` at repo root with entries for `javascript`, `typescript`, and `react` (fields: `image`, `extension`, `runCommand`, `testCommand`, `timeoutSeconds`, `cpuLimit`, `memoryLimit`)
- [x] T012 [P] Create `content/` directory skeleton — `content/javascript/`, `content/typescript/`, `content/react/` each with a `.gitkeep` so the structure is committed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure every user story depends on. No story work begins until
this phase is complete.

**⚠️ CRITICAL**: All T013–T029 must be complete before any Phase 3+ task starts.

- [x] T013 Create shared TypeScript types in `frontend/src/types/index.ts` — export `Track`, `Difficulty`, `ExerciseType`, `Verdict`, `QuizItem`, `CodingExercise`, `ProgressRecord`, `ContentFilter`, `ExecutionResult` as per AGENTS.md data shapes
- [x] T014 [P] Create matching TypeScript types in `backend/src/types/index.ts` — same domain types plus `ExecutorConfig` and `ContentLoadResult`
- [x] T015 [P] Create auth middleware pass-through in `backend/src/api/authMiddleware.ts` — uses module augmentation to add `userId: string` to Express Request (no `any`); sets `req.userId = 'local'`; v1 stub for future JWT replacement
- [x] T016 Set up Express app in `backend/src/app.ts` — register CORS, JSON body-parser, authMiddleware, placeholder route mounts, and a catch-all error handler that returns `{ error, remediation }` JSON
- [x] T017 [P] Create `backend/src/server.ts` entry point — start Express on port 3001; on startup ping Docker daemon and log a remediation message if unreachable (app still starts for quiz mode)
- [x] T018 [P] Implement `backend/src/config/executorConfig.ts` — load and JSON-parse `executor-config.json` from repo root; validate each entry has required fields; throw with a remediation message if malformed
- [x] T019 Implement `backend/src/content/contentLoader.ts` — walk the `content/` directory tree, load each JSON file, validate it matches the `QuizItem` or `CodingExercise` schema, skip malformed files silently, cache valid items in memory; export `getItems(filter)` and `getItemById(id)`
- [x] T020 [P] Create `frontend/src/context/AuthContext.tsx` — React context providing `{ user: null, isAuthenticated: false }` with no-op `login` and `logout` stubs; wraps the app in `main.tsx`
- [x] T021 [P] Create `frontend/src/lib/progressRepository.ts` — define `ProgressRepository` interface (`get`, `set`, `resetTrack`, `resetAll`); implement `LocalStorageProgressRepository` using keys `devlearn_progress_{itemId}`; export a singleton instance
- [x] T022 [P] Create `frontend/src/lib/session.ts` — export `shuffleArray<T>(arr: T[]): T[]`, `buildQuizSession(items: QuizItem[]): QuizItem[]` (fully randomised), `buildExerciseSession(items: CodingExercise[]): CodingExercise[]` (sorted by difficulty tier, randomised within each tier)
- [x] T023 [P] Create `frontend/src/components/shared/EmptyState.tsx` — props: `title`, `message`, optional `cliCommand`; renders message and, if provided, the CLI command in a styled `<code>` block
- [x] T024 [P] Create `frontend/src/components/shared/ErrorBanner.tsx` — props: `message`, `remediation`; dismissible banner; used for all runtime errors
- [x] T025 [P] Create `frontend/src/components/shared/ThemeToggle.tsx` — reads `prefers-color-scheme` as default, toggles `data-theme="dark"|"light"` on `<html>`, persists choice in `localStorage`
- [x] T026 [P] Create `frontend/src/components/shared/FilterBar.tsx` — controlled selectors for track, topic (passed as `availableTopics` prop), difficulty, and type; calls `onFilterChange: (filter: ContentFilter) => void` on every change
- [x] T027 Set up React Router v6 in `frontend/src/main.tsx` — routes: `/quiz` → QuizPage, `/exercises` → ExercisePage, `/progress` → ProgressPage, `/coverage` → CoveragePage; wrap tree with AuthContext and TanStack QueryClientProvider (FilterContext slot noted for Phase 7)
- [x] T028 [P] Create `frontend/src/hooks/useContent.ts` — fetch `/api/content` with `ContentFilter` params using TanStack Query (`useQuery`); return `{ items, isLoading, error }`
- [x] T029 [P] Create `frontend/src/hooks/useProgress.ts` — expose `getRecord(itemId)`, `recordVerdict(itemId, verdict)`, `resetTrack(track)`, `resetAll()` backed by the ProgressRepository singleton; invalidates local state on write

**Checkpoint**: With Phase 2 complete, both processes start, content loads, and shared UI primitives are available. User story work can now begin.

---

## Phase 3: User Story 1 — Written Quizzes (Priority: P1) 🎯 MVP

**Goal**: A learner can select a track/topic/difficulty, answer open-text quiz questions,
see the correct answer and explanation, and self-assess pass/fail. Progress is saved locally.

**Independent Test**: Open `/quiz`, select any filter with content, submit an answer, verify
the correct answer and explanation appear alongside your answer, click "I got it" or
"I missed it", navigate back to the same question and confirm the verdict is shown.

- [ ] T030 [US1] Implement `backend/src/api/content.ts` Express router — GET `/api/content` (query params: `track`, `topic`, `difficulty`, `type`; delegates to `contentLoader.getItems(filter)`); GET `/api/content/:id` (delegates to `contentLoader.getItemById`); apply `authMiddleware` to both routes
- [ ] T031 [P] [US1] Register content router in `backend/src/app.ts` under `/api/content`
- [ ] T032 [P] [US1] Create `frontend/src/components/quiz/QuizCard.tsx` — renders question text, a `<textarea>` for the learner's answer, a Submit button, and a Show Answer button; does not render the answer pane itself
- [ ] T033 [P] [US1] Create `frontend/src/components/quiz/AnswerReveal.tsx` — two-column layout: learner's submitted answer on the left, correct answer + explanation on the right; shown only after submit or Show Answer
- [ ] T034 [P] [US1] Create `frontend/src/components/quiz/SelfAssessButtons.tsx` — "I got it" (records `pass`) and "I missed it" (records `fail`) buttons; hidden until AnswerReveal is visible; calls `onAssess(verdict: 'pass' | 'fail')` prop
- [ ] T035 [US1] Implement `frontend/src/pages/QuizPage.tsx` — use `useContent` + `buildQuizSession` to build the session; drive QuizCard → AnswerReveal → SelfAssessButtons flow; on assess call `useProgress.recordVerdict`; navigate to next item; show session-complete state when all items exhausted
- [ ] T036 [P] [US1] Add Show Answer path in `QuizPage.tsx` — clicking Show Answer before submitting reveals AnswerReveal, records verdict as `'skipped'` via `useProgress.recordVerdict`, bypasses SelfAssessButtons
- [ ] T037 [P] [US1] Add `EmptyState` to `QuizPage.tsx` when `useContent` returns no items for the active filter — include the exact `node scripts/generate-content.js --track {track} --topic {topic} --difficulty {difficulty} --type quiz` command

**Checkpoint**: User Story 1 is fully functional and independently testable. Progress persists
across browser refresh. Show Answer records a skip. Verdict is visible on revisit.

---

## Phase 4: User Story 2 — Interactive Coding Exercises (Priority: P2)

**Goal**: A learner can open a coding exercise, edit multi-file code in Monaco, submit,
and receive test results plus a live sandboxed preview simultaneously. Failing submissions
reveal the reference solution.

**Independent Test**: Open `/exercises`, load any exercise, submit the starter code
(expect failure), verify failing criteria and reference solution appear alongside the
preview. Fix the code, resubmit, verify success state.

- [ ] T038 [US2] Implement `backend/src/executor/dockerExecutor.ts` — `execute(exerciseId, files, config)`: pull image if absent, create container with cpuLimit + memoryLimit from ExecutorConfig, write submitted files to a temp volume, run test command, enforce hard timeout via `Promise.race`, collect stdout/stderr, destroy container regardless of outcome; return `ExecutionResult { passed, testOutput, previewHtml, timedOut }`
- [ ] T039 [US2] Implement `backend/src/api/execute.ts` Express router — POST `/api/execute` body `{ exerciseId, files: {name, content}[] }`: validate body, load exercise to get executor config, call `dockerExecutor.execute`, include `solution` files in response **only when** `!passed && !timedOut`; apply `authMiddleware`
- [ ] T040 [P] [US2] Register execute router in `backend/src/app.ts` under `/api/execute`
- [ ] T041 [US2] Create `frontend/src/components/exercise/ExerciseEditor.tsx` — Monaco editor with a tab strip for up to 3 files; stores each file's content in local state keyed by filename; switching tabs does NOT discard unsaved changes; exposes `getFiles(): {name, content}[]` via ref or callback prop
- [ ] T042 [P] [US2] Create `frontend/src/components/exercise/OutputPreview.tsx` — `<iframe sandbox="allow-scripts" srcDoc={previewHtml}>` that renders only when `previewHtml` is non-null; empty/hidden before first submission (FR-010b, FR-010c)
- [ ] T043 [P] [US2] Create `frontend/src/components/exercise/TestResultsPanel.tsx` — shows pass/fail badge, full test output, list of failing criteria on failure; renders a reference solution diff view only when `solution` prop is provided; hidden before first submission
- [ ] T044 [P] [US2] Create `frontend/src/hooks/useCodeExecution.ts` — wraps POST `/api/execute` with TanStack Query `useMutation`; exposes `{ submit, result, isSubmitting, error }`
- [ ] T045 [US2] Implement `frontend/src/pages/ExercisePage.tsx` — use `useContent` + `buildExerciseSession` for tier-ordered session; render exercise description + ExerciseEditor side-by-side; Submit button triggers `useCodeExecution.submit`; on result render OutputPreview + TestResultsPanel; call `useProgress.recordVerdict` on pass or fail (not on timeout)
- [ ] T046 [P] [US2] Handle time-limit-exceeded in `ExercisePage.tsx` — when `result.timedOut` is true: show ErrorBanner "Time limit exceeded — your code ran too long", do NOT render OutputPreview or TestResultsPanel, do NOT call `recordVerdict`
- [ ] T047 [P] [US2] Add `EmptyState` to `ExercisePage.tsx` when no exercises match filter — include exact `node scripts/generate-content.js --track {track} --topic {topic} --difficulty {difficulty} --type exercise` CLI command

**Checkpoint**: User Story 2 is independently functional. Multi-file editing works across
tab switches. Docker isolates execution. Preview and test results appear simultaneously on
submit. Reference solution shown on failure, hidden on success and timeout.

---

## Phase 5: User Story 3 — Progress Tracking (Priority: P3)

**Goal**: A learner can view pass/fail/skip counts by track and by topic at any time, and
reset progress for a track or for everything with a confirmation step.

**Independent Test**: Complete several quiz items and exercises, open `/progress`, verify
counts match verdicts. Reset one track, confirm counts return to zero. Refresh — data is
still correct.

- [ ] T048 [P] [US3] Create `frontend/src/components/progress/ProgressSummary.tsx` — reads all `ProgressRecord`s from `useProgress`; groups by track; displays attempted, passed, skipped counts per track as a summary card row
- [ ] T049 [P] [US3] Create `frontend/src/components/progress/TrackProgress.tsx` — props: `track: Track`; reads records for that track; groups by topic; renders a table of topic / attempted / passed / skipped per topic
- [ ] T050 [P] [US3] Create `frontend/src/components/progress/ResetConfirmDialog.tsx` — shadcn `Dialog`: accepts `scope: Track | 'all'`; shows confirmation text; on confirm calls `useProgress.resetTrack(track)` or `useProgress.resetAll()`; on cancel dismisses with no change
- [ ] T051 [US3] Implement `frontend/src/pages/ProgressPage.tsx` — render `ProgressSummary` at top; render `TrackProgress` for each of the three tracks; per-track reset button opens `ResetConfirmDialog`; a global "Reset All" button opens `ResetConfirmDialog` with `scope='all'`; all data sourced from `useProgress`

**Checkpoint**: User Story 3 is independently functional. Counts are accurate after quizzes
and exercises. Reset clears the correct scope. Data survives page refresh.

---

## Phase 6: User Story 4 — Content Generation (Priority: P4)

**Goal**: A content author runs `scripts/generate-content.js` from the CLI to produce new
quiz or exercise items. Items are written to disk immediately and appear in the app without
restart. A coverage view shows gaps.

**Independent Test**: Run `node scripts/generate-content.js --track javascript --topic closures --difficulty beginner --type quiz --count 3`, open `/quiz`, apply matching filter, confirm 3 new items appear. Open `/coverage`, confirm counts reflect the new items.

- [ ] T052 [US4] Implement `scripts/generate-content.js` — CLI arg parsing (`--track`, `--topic`, `--difficulty`, `--type`, `--count`, `--replace`); call Claude API with a content-generation prompt; for each returned item: validate JSON schema, resolve file path `content/{track}/{topic}/{difficulty}/{type}/`, write to disk immediately; if an item fails validation: log and skip without stopping the batch; on any unrecoverable error: stop and report how many items were saved vs. requested (FR-018a)
- [ ] T053 [US4] Implement `backend/src/api/coverage.ts` Express router — GET `/api/coverage`: call `contentLoader.getItems({})` to get all items, group by `track/topic/difficulty/type`, return counts array `{ track, topic, difficulty, type, count }[]`; apply `authMiddleware`
- [ ] T054 [P] [US4] Register coverage router in `backend/src/app.ts` under `/api/coverage`
- [ ] T055 [P] [US4] Create `frontend/src/components/coverage/CoverageTable.tsx` — renders a table with columns track / topic / difficulty / type / count; rows with `count === 0` highlighted; read-only, no interactions
- [ ] T056 [US4] Implement `frontend/src/pages/CoveragePage.tsx` — fetch `/api/coverage` via TanStack Query; render `CoverageTable`; show `EmptyState` if content library is completely empty (with instructions to run `generate-content.js`)

**Checkpoint**: User Story 4 is independently functional. CLI tool produces valid JSON files.
Coverage page reflects current library state without an app restart.

---

## Phase 7: User Story 5 — Curriculum Navigation (Priority: P5)

**Goal**: A learner can freely switch between tracks, topics, difficulties, and modes. When
switching from quiz to exercise mode (or back), the same filter is preserved. Empty states
show the exact CLI command for the current filter combination.

**Independent Test**: Set filter to React / Hooks / Intermediate in QuizPage. Switch to
ExercisePage — verify filter is still React / Hooks / Intermediate. Select a combination
with no content — verify the EmptyState includes the exact CLI command for that combination.

- [ ] T057 [US5] Create `frontend/src/context/FilterContext.tsx` — React context holding `filter: ContentFilter` and `setFilter`; wraps the router in `frontend/src/main.tsx` so filter state is shared across all pages
- [ ] T058 [P] [US5] Create `frontend/src/hooks/useFilterState.ts` — thin hook that reads and writes from `FilterContext`; used by FilterBar and all pages instead of local state
- [ ] T059 [US5] Update `QuizPage.tsx` and `ExercisePage.tsx` to consume `useFilterState` instead of local filter state — switching between `/quiz` and `/exercises` now preserves the active track/topic/difficulty/type selection
- [ ] T060 [P] [US5] Update `EmptyState` in `QuizPage.tsx` and `ExercisePage.tsx` to interpolate the active filter values into the CLI command (`--track {filter.track} --topic {filter.topic} --difficulty {filter.difficulty} --type {filter.type}`) so the command is copy-pasteable for the exact current selection

**Checkpoint**: User Story 5 is independently functional. Filter state persists across mode
switches. Every empty state shows a directly usable CLI command.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Cross-story improvements required to meet all success criteria and ship a
production-ready v1.

- [ ] T061 Create `frontend/src/components/shared/AppLayout.tsx` — persistent header with navigation links to `/quiz`, `/exercises`, `/progress`, `/coverage`; ThemeToggle in the top-right; active route highlighted; wraps all page routes
- [ ] T062 [P] Add starter content to `content/` — generate and commit at least 5 quiz items per track (JavaScript, TypeScript, React) across at least 2 topics and 2 difficulty levels, so the app is immediately usable after `npm install` (FR-022, SC-001)
- [ ] T063 [P] Implement corrupted-localStorage recovery in `frontend/src/lib/progressRepository.ts` — wrap all `JSON.parse` calls in try/catch; on `SyntaxError` log a warning, remove the corrupted key, and return a clean default state; app must not crash (spec edge case)
- [ ] T064 [P] Audit all `ErrorBanner` and `EmptyState` usages across all pages — verify every instance includes both a `message` and a `remediation` prop with a concrete next step (SC-007)
- [ ] T065 [P] Add `backend/src/content/contentLoader.ts` hot-reload support — watch `content/` with `fs.watch`, invalidate the in-memory cache on any file-system event, so newly generated content appears in the app without a backend restart (FR-019 usability)
- [ ] T066 Run end-to-end validation against all success criteria — app startup < 5 s (SC-003), first quiz < 60 s from cold start (SC-001), code submission < 15 s (SC-002), progress survives refresh (SC-004), adding a new track requires only config + content files (SC-005), malformed content files are skipped (SC-006)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **blocks all user stories**
- **Phase 3 (US1 Quizzes)**: Depends on Phase 2 — first deliverable, targets MVP
- **Phase 4 (US2 Exercises)**: Depends on Phase 2 — can start in parallel with Phase 3
- **Phase 5 (US3 Progress)**: Depends on Phase 2 — can start in parallel with Phases 3–4
- **Phase 6 (US4 Coverage)**: Depends on Phase 2 — can start in parallel once Phase 2 is done
- **Phase 7 (US5 Navigation)**: Depends on Phases 3 and 4 (needs QuizPage + ExercisePage to exist)
- **Phase N (Polish)**: Depends on Phases 3–7 all complete

### User Story Dependencies

- **US1 (P1)**: Independent after Phase 2
- **US2 (P2)**: Independent after Phase 2
- **US3 (P3)**: Independent after Phase 2 (reads from ProgressRepository, no story dependency)
- **US4 (P4)**: Independent after Phase 2 (CLI is standalone; coverage page is standalone)
- **US5 (P5)**: Requires US1 and US2 pages to exist first

### Parallel Opportunities Within Phases

```
Phase 1: T002–T012 can all start in parallel after T001
Phase 2: T013–T029 can all run in parallel after Phase 1 completes
Phase 3: T032–T034 (components) can run in parallel; T030 (API) can run in parallel with components
Phase 4: T041–T044 (frontend) can run in parallel with T038–T040 (backend)
Phase 5: T048–T050 (components) can run in parallel; T051 (page) needs all three
Phase 6: T053–T055 can run in parallel; T056 (page) needs T055 + T053
Phase 7: T057–T058 first, then T059–T060 can run in parallel
Phase N: T061–T065 are all independent parallels; T066 is last
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational — **do not skip**
3. Complete Phase 3: User Story 1 (Quizzes)
4. **STOP and validate**: answer a quiz, verify correct answer shown, self-assess, refresh and confirm progress persists
5. This is a shippable learning tool for written practice before any other story

### Incremental Delivery

1. Phase 1 + 2 → foundation ready
2. Phase 3 → MVP: quiz mode works end-to-end
3. Phase 4 → add coding exercises (requires Docker)
4. Phase 5 → add progress dashboard
5. Phase 6 → add content generation CLI + coverage view
6. Phase 7 → polish free navigation / filter persistence
7. Phase N → production-quality hardening

### Parallel Team Strategy

With two developers after Phase 2 is complete:

- **Dev A**: Phase 3 (quizzes) → Phase 5 (progress)
- **Dev B**: Phase 4 (exercises) → Phase 6 (content generation)
- Both merge → Phase 7 (navigation) → Phase N (polish)

---

## Notes

- `[P]` = parallelizable within its phase (different files, no intra-phase dependencies)
- `[USn]` = user story label for traceability back to spec.md
- Every Docker-related task (T038–T040) must be tested with Docker running locally
- Malformed content handling (T019, T063) must be manually verified by dropping a bad JSON file into `content/`
- Auth middleware (T015) must be the first item applied in every route — never skip it even in v1
- The `executor-config.json` entries (T011) must be tested end-to-end in T038 before Phase 4 is marked done
