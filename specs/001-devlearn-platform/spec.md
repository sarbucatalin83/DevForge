# Feature Specification: DevLearn — Local Developer Learning Platform

**Feature Branch**: `001-devlearn-platform`
**Created**: 2026-04-27
**Status**: Draft
**Input**: User description: "@devlearn/00-overview.md" (full feature context from devlearn/)

---

## Clarifications

### Session 2026-04-27

- Q: Should coding exercises support a single file or multiple files per exercise? → A: Multi-file — exercises can include 2–3 related files (component + test + optional CSS module), enabling realistic React component exercises.
- Q: When a learner re-attempts an item, how is the verdict stored? → A: Latest verdict always overwrites — only the most recent result is kept; attempt count still increments.
- Q: In what order are quiz questions presented when multiple items match a filter? → A: Randomised per session — shuffled on each new session, consistent within it, to prevent answer-order memorisation.
- Q: What happens when the content generation tool fails partway through a batch? → A: Save partial results — each item is written to disk as it is generated; failure stops the run but keeps all items produced so far.
- Q: In what order are coding exercises presented? → A: Sequential by difficulty tier (Beginner → Intermediate → Advanced → Senior), randomised within each tier per session.
- Q: Should the editor show a live output preview, and if so for which tracks and when? → A: All tracks (JavaScript, TypeScript, React). Preview renders on Submit alongside unit test results — not on every keystroke. Both preview and unit tests are part of the feedback; unit tests remain the sole pass/fail judge.

---

## User Scenarios & Testing

### User Story 1 — Practice Conceptual Knowledge via Written Quizzes (Priority: P1)

A learner opens the app, selects a learning track (JavaScript, TypeScript, or React),
chooses a topic and difficulty level, and is presented with open-ended questions about
the subject. After typing an answer and submitting, the learner sees the correct answer
and an explanation side by side with their own answer, then self-assesses whether they
got it right or missed it. If stuck before submitting, the learner can reveal the answer
directly. Every attempt — pass, fail, or skipped — is a learning moment because the
correct answer and explanation are always shown.

**Why this priority**: Conceptual understanding is the foundation of every programming
skill. This mode requires no external tooling beyond the app itself and delivers immediate
learning value to users at any level.

**Independent Test**: Can be fully tested by navigating to any quiz question, submitting
an answer, and verifying the correct answer and explanation appear. Delivers standalone
value as a flashcard study tool.

**Acceptance Scenarios**:

1. **Given** a learner has selected a track, topic, and difficulty, **When** they type an answer and click Submit, **Then** the correct answer and explanation are displayed alongside their answer, and pass/fail self-assessment buttons appear.
2. **Given** a learner is viewing a question, **When** they click Show Answer before submitting, **Then** the correct answer and explanation are revealed immediately and the item is recorded as skipped.
3. **Given** a learner submits an answer, **When** the result is shown, **Then** clicking "I got it" records a pass and clicking "I missed it" records a fail in their local progress.
4. **Given** a learner has completed questions, **When** they navigate back to the same question, **Then** their previous verdict is visible.

---

### User Story 2 — Practice Coding Skills via Interactive Exercises (Priority: P2)

A learner selects a coding exercise, reads the task description, and writes or modifies
code in the built-in editor to complete the task. The exercise type may require filling
in missing code, fixing a defect, implementing a function from a description, or
refactoring poorly structured code. After submitting, the learner receives two forms of
feedback simultaneously: a live output preview (showing rendered output or console
results for their code) and automated test results. The test results are the sole
pass/fail judge; the preview is a visual learning aid. On failure, the reference correct
solution is also revealed for comparison.

**Why this priority**: Hands-on coding is where conceptual knowledge becomes practical
skill. This mode covers the most important learning gap that quizzes alone cannot fill.

**Independent Test**: Can be fully tested by opening any coding exercise, submitting
code, and verifying that the pass/fail result appears along with the reference solution
on failure.

**Acceptance Scenarios**:

1. **Given** a learner opens a coding exercise, **When** the exercise loads, **Then** starter code is pre-loaded into the editor and the task description is visible alongside it.
2. **Given** a learner submits code that satisfies all test criteria, **When** results appear, **Then** a success state is shown with the full test output and a live output preview of the submitted code.
3. **Given** a learner submits code that fails one or more test criteria, **When** results appear, **Then** the failing criteria are listed, a live output preview is shown, and the reference solution is revealed for comparison.
4. **Given** a learner's submitted code runs longer than the allowed time limit, **When** the time limit is exceeded, **Then** a "Time limit exceeded" message is shown and neither a preview nor the reference solution is revealed.
5. **Given** a learner has not yet submitted, **When** they are editing code, **Then** the output preview area is empty — no preview is shown until Submit is clicked.

---

### User Story 3 — Track Learning Progress Across Topics (Priority: P3)

A learner can view a summary of their progress at any time, broken down by track and by
topic within each track. The summary shows how many items they have attempted and how
many they have passed, giving them a clear picture of their strengths and gaps. They can
also reset their progress for a specific track or for all tracks at once.

**Why this priority**: Without visible progress, learners lose motivation and cannot
identify where to focus next. Progress tracking is the feedback loop that sustains
long-term learning.

**Independent Test**: Can be fully tested by completing a few quiz items and exercises,
then opening the progress view and verifying counts and verdicts are correctly reflected.

**Acceptance Scenarios**:

1. **Given** a learner has answered items in a track, **When** they open the progress view, **Then** they see item counts and pass counts at both the track level and the topic level.
2. **Given** a learner wants to start fresh, **When** they reset progress for a track and confirm the action, **Then** all progress for that track is cleared and counts return to zero.
3. **Given** a learner closes and reopens the app, **When** they view their progress, **Then** all previously recorded verdicts are still present.

---

### User Story 4 — Generate New Learning Content (Priority: P4)

A content author runs the content generation tool from the command line to produce new
quiz questions or coding exercises for a chosen track, topic, difficulty, and exercise
type. The generated content is stored locally and immediately available in the app
without a restart. The author can also view a read-only content coverage summary inside
the app to identify which combinations of track, topic, and difficulty have little or no
content.

**Why this priority**: The quality and completeness of the content library directly
determines the learning value of the app. Authors need a reliable way to fill gaps and
expand coverage over time.

**Independent Test**: Can be fully tested by running the generation tool for a specific
combination, then opening the app and verifying the new items appear in the correct
filter results.

**Acceptance Scenarios**:

1. **Given** an author runs the generation tool with valid arguments, **When** the tool completes, **Then** new content items appear in the app for the specified track, topic, difficulty, and type.
4. **Given** the generation tool fails partway through a batch, **When** the error occurs, **Then** all items generated before the failure are saved and accessible in the app, and the tool reports how many were saved versus the requested count.
2. **Given** an author opens the content coverage page, **When** it loads, **Then** item counts per track, topic, difficulty, and type are displayed so coverage gaps are visible at a glance.
3. **Given** an author re-runs the generation tool for an existing combination without the replace flag, **When** it completes, **Then** new items are added alongside existing ones and no existing content is modified.

---

### User Story 5 — Navigate the Curriculum Freely (Priority: P5)

A learner can browse and filter the full content library at any time without following a
prescribed order. They can switch between tracks, topics, difficulties, and exercise types
freely. When no content exists for a selected filter combination, the app shows a clear
empty state with instructions for generating content.

**Why this priority**: Forcing a linear path frustrates both beginners who need remedial
review and seniors who want to jump directly to advanced topics.

**Independent Test**: Can be fully tested by selecting various filter combinations and
verifying that matching content is shown, or that an informative empty state appears when
no content matches.

**Acceptance Scenarios**:

1. **Given** a learner selects a track, topic, and difficulty that has content, **When** the filter is applied, **Then** only matching items are shown.
2. **Given** a learner selects a combination for which no content exists, **When** the filter is applied, **Then** an empty state is displayed with the exact command to generate content for that combination.
3. **Given** a learner is in quiz mode, **When** they switch to coding exercise mode, **Then** the same track, topic, and difficulty filter is preserved and matching exercises are shown.

---

### Edge Cases

- What happens when there is no content at all on a fresh install?
  → Every view must show an actionable empty state with generation instructions, not a crash or generic error.
- What happens if the code execution environment is unavailable when a learner submits code?
  → The submission is not recorded as attempted; a clear error with setup steps is shown.
- What happens if a content file is malformed or missing required fields?
  → The malformed item is skipped silently; all valid items continue to load normally.
- What happens if the learner's locally stored progress data is corrupted?
  → The corrupted data is discarded and a clean state is started; the app does not crash.
- What happens when submitted code exceeds the execution time limit?
  → A time-limit message is returned; the reference solution is not revealed.

---

## Requirements

### Functional Requirements

- **FR-001**: The system MUST provide three independent learning tracks: JavaScript, TypeScript, and React.
- **FR-002**: Learners MUST be able to filter content by track, topic, and difficulty level (Beginner / Intermediate / Advanced / Senior) in any combination.
- **FR-003**: The system MUST support free navigation — learners can access any content item at any time with no enforced order.
- **FR-003a**: When a quiz session starts, the system MUST randomise the order of matching questions for that session. The order MUST remain consistent within the session but differ across sessions to prevent answer-order memorisation.
- **FR-003b**: Coding exercises MUST be presented ordered by difficulty tier (Beginner → Intermediate → Advanced → Senior). Within each tier the order MUST be randomised per session.
- **FR-004**: The system MUST provide a written quiz mode where learners answer open-text questions about programming concepts.
- **FR-005**: After a quiz answer is submitted, the system MUST always display the correct answer and a stored explanation alongside the learner's answer.
- **FR-006**: A "Show Answer" option MUST be available before submitting a quiz answer, revealing the correct answer and explanation and recording the item as skipped.
- **FR-007**: Learners MUST self-assess their quiz answer as pass or fail after the correct answer is revealed.
- **FR-008**: The system MUST provide a coding exercise mode with an in-browser code editor that supports up to 3 files per exercise (e.g. component file, parent/consumer file, optional CSS module).
- **FR-008a**: Learners MUST be able to switch between the files of a multi-file exercise within the editor without losing unsaved changes to other files.
- **FR-009**: Coding exercises MUST support four task types: fill-in-the-blank, fix-a-bug, implement-a-function, and refactor.
- **FR-010**: Submitted code MUST be automatically evaluated against predefined test criteria in an isolated execution environment.
- **FR-010a**: On submission, the system MUST render a live output preview of the submitted code in a sandboxed environment alongside the test results. The preview applies to all tracks: JavaScript and TypeScript exercises show console or DOM output; React exercises show the rendered component.
- **FR-010b**: The output preview MUST only update on Submit — it MUST NOT auto-update while the learner is typing.
- **FR-010c**: The output preview pane MUST be sandboxed so that preview execution cannot affect the host application or access resources outside the exercise scope.
- **FR-011**: When a code submission passes all criteria, the system MUST display a success state with the full test output and the live output preview.
- **FR-012**: When a code submission fails, the system MUST display which criteria failed, show the live output preview, and reveal the reference correct solution.
- **FR-013**: When submitted code exceeds the execution time limit, the system MUST return a time-limit message without revealing the reference solution or a preview.
- **FR-014**: The system MUST record progress locally per content item: attempted status, verdict (pass / fail / skipped — always the most recent result, overwriting any prior verdict), attempt count, and last attempted date.
- **FR-015**: Learners MUST be able to view a progress summary at the track level and the topic level at any time.
- **FR-016**: Learners MUST be able to reset progress for an individual track or all tracks, with a confirmation step before data is deleted.
- **FR-017**: The system MUST provide a read-only content coverage view showing item counts per track, topic, difficulty, and exercise type.
- **FR-018**: A standalone content generation tool MUST allow authors to produce quiz questions and coding exercises by specifying track, topic, difficulty, type, and count.
- **FR-018a**: The content generation tool MUST write each successfully generated item to disk immediately as it is produced. A failure MUST stop the run and report how many items were saved, but MUST NOT discard items already written.
- **FR-019**: Generated content MUST be stored as portable, human-readable files that can be hand-edited and version-controlled.
- **FR-020**: Adding a new language track MUST require only new content files and a single configuration entry — no changes to the application source code.
- **FR-021**: The system MUST operate fully without internet access at runtime.
- **FR-022**: The system MUST ship with a starter set of pre-generated content so it is immediately usable after installation.
- **FR-023**: The system MUST display clear, actionable error messages when a required dependency is unavailable, including specific remediation steps.
- **FR-024**: Dark and light colour themes MUST be supported, defaulting to the system preference.

### Key Entities

- **Track**: A named programming language or framework curriculum (JavaScript, TypeScript, React). Extensible via configuration without code changes.
- **Topic**: A subject area within a track (e.g. Closures, Promises, Hooks). Defined by the content library; no fixed global list enforced by the app.
- **Difficulty Level**: One of four ordered levels — Beginner, Intermediate, Advanced, Senior — applied uniformly to quiz items and coding exercises.
- **Quiz Item**: A single conceptual question with a correct answer and an explanation. Belongs to one track, topic, and difficulty.
- **Coding Exercise**: A task containing a description, one to three starter code files, automated test criteria, reference solution files, and an exercise type. Belongs to one track, topic, and difficulty. Single-file exercises are the norm for JavaScript and TypeScript; React exercises may use up to three files. All exercises produce a live output preview on submission in addition to test results.
- **Output Preview**: A sandboxed rendering of the learner's submitted code, shown alongside test results on every submission. Displays console/DOM output for JavaScript and TypeScript exercises, and the rendered component for React exercises. Updated only on Submit; never shown before the first submission.
- **Progress Record**: A local record of a learner's interaction with a single content item. Stores the most recent verdict (overwriting any previous), total attempt count, and last attempted date. No full attempt history is retained. Stored per device; no account required.
- **Content Coverage**: An aggregated view of item counts across every track / topic / difficulty / type combination in the local content library.
- **Executor Configuration**: A per-language registry entry defining how submitted code is executed and tested for a given track. Managed via a configuration file with no code changes required.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: A learner can go from app launch to answering their first quiz question in under 60 seconds with no prior setup beyond having the execution environment installed.
- **SC-002**: Code submissions return a pass or fail result and a live output preview in under 15 seconds for any supported language track.
- **SC-003**: The app starts and displays content in under 5 seconds after the development server is launched on a modern laptop.
- **SC-004**: Progress data persists completely across browser sessions and app restarts without any manual save action by the learner.
- **SC-005**: Adding a new language track produces zero changes to the application source code — only a content directory and a single configuration entry are required.
- **SC-006**: 100% of malformed content items are skipped gracefully; the app continues functioning for all valid items without a crash or error screen.
- **SC-007**: Every error state surfaces a human-readable message and at least one concrete remediation step.
- **SC-008**: The content generation tool produces a correctly structured batch of items for any valid track / topic / difficulty / type combination without manual post-processing.

---

## Assumptions

- The learner uses the app on a personal machine where they have permission to install the required execution environment.
- A single user operates the app on one machine; no cross-device syncing is expected in v1.
- Content quality is the responsibility of the generation tool and its prompts; the app presents content without validating its educational accuracy.
- The "skipped" verdict (Show Answer before submit) counts as attempted but is excluded from pass-rate calculations.
- Item IDs are stable when content is regenerated using the replace flag, but not across full content rebuilds.
- The app is operated on a screen of at least 1280 px wide; no mobile or touch-optimised experience is in scope for v1.
- Progress stored locally is not backed up; a learner who clears browser storage or switches browsers loses their progress — acceptable for v1.
- The content generation tool is operated by the same person who uses the app; no multi-author workflow or permissions model is required.
