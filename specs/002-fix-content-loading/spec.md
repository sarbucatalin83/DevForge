# Feature Specification: Fix Content Loading Path

**Feature Branch**: `002-fix-content-loading`
**Created**: 2026-04-27
**Status**: Complete
**Input**: User description: "There is a bug, the questions for quizzes and exercises are not taken into consideration, they are generated in the data folder"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Content appears immediately after generation (Priority: P1)

A learner or author generates quiz/exercise content using the CLI tool, then opens the app and immediately sees the new questions available for study — without restarting any process.

**Why this priority**: Without a working content load path the entire learning app is non-functional. No quizzes or exercises appear regardless of how much content exists on disk.

**Independent Test**: Run the content generation CLI for any track/topic/difficulty, open the quiz page in the browser and apply the matching filter — the generated questions must appear.

**Acceptance Scenarios**:

1. **Given** content files exist in `content/{track}/{topic}/{difficulty}/{type}/`, **When** the app loads, **Then** all valid content files are found and served by the API.
2. **Given** the app is running and a new content file is written to the `content/` directory, **When** the learner refreshes the quiz or exercise page, **Then** the new item appears without restarting the backend.
3. **Given** the backend is started using `npm run dev` from any working directory, **When** the content API is called, **Then** the correct `content/` folder at the repository root is always resolved.

---

## Requirements

### Functional Requirements

- **FR-001**: The backend MUST always locate the `content/` directory relative to the source file location, not the process working directory.
- **FR-002**: Content loading MUST work regardless of which directory `npm run dev` is invoked from.
- **FR-003**: Hot-reload watching MUST target the same correctly-resolved `content/` path.

### Success Criteria

- **SC-001**: The quiz page shows content within 60 seconds of a cold start when content files exist at the repository root `content/` directory.
- **SC-002**: Starting the backend from `backend/` or from the repo root both produce identical content API responses.
- **SC-003**: No backend restart is required to see newly generated content files.

---

## Root Cause

The `contentLoader.ts` module used `process.cwd()` to resolve the path to the `content/` directory. When the backend process is started via `npm run dev --prefix backend` (as in the root dev script), the working directory is `backend/`, causing the loader to look for `backend/content/` which does not exist. The fix replaces `process.cwd()` with `__dirname`-relative path resolution, identical to the fix already applied to `executorConfig.ts`.

---

## Fix Applied

`backend/src/content/contentLoader.ts`: replaced both occurrences of

```
path.resolve(process.cwd(), 'content')
```

with

```
path.resolve(__dirname, '../../../content')
```

navigating from `backend/src/content/` up three levels to the repository root, then into `content/`.
