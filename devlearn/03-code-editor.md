# Feature 3 — Code Editor Exercise Mode

## Description

An in-browser coding environment powered by the Monaco editor. Users write or edit code
to complete a task, then submit it for automated evaluation via Docker-based unit tests.

## Exercise Types

All four types must be supported:

| Type | Description |
|------|-------------|
| `fill-blank` | Starter code with clearly marked gaps; user fills in the missing parts |
| `fix-bug` | Broken code is provided; user identifies and fixes the defect |
| `implement` | A function signature and plain-language description are given; user writes the body |
| `refactor` | Working but low-quality code is provided; user restructures it to meet a stated goal |

## Content Format

Each exercise is a JSON bundle with the following fields:

```json
{
  "id": "string",
  "track": "javascript | typescript | react",
  "topic": "string",
  "difficulty": "beginner | intermediate | advanced | senior",
  "type": "fill-blank | fix-bug | implement | refactor",
  "description": "string — plain-language task shown to the user",
  "starterCode": "string — code pre-loaded into the Monaco editor",
  "unitTests": "string — Jest test suite executed against the submission",
  "solution": "string — reference correct solution, hidden until after evaluation"
}
```

## Exercise Flow

1. User reads the task description (left panel).
2. User edits the starter code in the Monaco editor (right panel).
3. User clicks **Submit**.
4. The backend sends the user's code and the unit test suite to the appropriate Docker
   container.
5. The container runs the tests and returns results.
6. **Pass** (all tests green): show a success state with the full test output.
7. **Fail** (one or more tests red): show which tests failed and reveal the reference
   solution side by side with the user's code.

## No Hints

There is no hint system. The only feedback path is: submit → result → optional solution
reveal on failure.

## Layout

- **Two-panel layout**: left panel shows the task description, right panel is the Monaco
  editor.
- Test results appear below the editor or in a slide-in drawer.
- On failure, solution diff is shown inline beneath the results.

## Monaco Editor Configuration

- Language mode set automatically based on the exercise track (javascript, typescript).
- Syntax highlighting and basic IntelliSense enabled.
- No AI autocomplete (Copilot-style) to avoid giving away answers.
