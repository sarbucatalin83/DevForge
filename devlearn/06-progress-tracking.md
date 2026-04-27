# Feature 6 — Progress Tracking

## Description

User progress is stored entirely in browser `localStorage`. No backend database, no user
accounts, and no server-side persistence are required.

## What Is Tracked (per content item)

| Field | Description |
|-------|-------------|
| `attempted` | Whether the item has been opened at least once |
| `verdict` | Last result: `pass`, `fail`, or `skipped` |
| `attemptCount` | Total number of submission attempts |
| `lastAttemptedAt` | ISO timestamp of the most recent attempt |

## Progress Display

Progress summaries are shown at two levels of granularity:

**Track level** — e.g. "JavaScript: 42 / 180 items completed, 38 passed"

**Topic level** — e.g. "React → Hooks: 8 / 20 exercises completed, 6 passed"

The progress panel is accessible from the sidebar.

## Reset Options

- **Reset track**: clears all progress for a single track.
- **Reset all**: clears all progress across every track.

Both actions require a confirmation step before executing.

## localStorage Schema

Progress is stored under a single key `devlearn_progress` as a JSON object:

```json
{
  "<item-id>": {
    "attempted": true,
    "verdict": "pass | fail | skipped",
    "attemptCount": 3,
    "lastAttemptedAt": "2026-04-26T10:00:00Z"
  }
}
```

Item IDs are stable, derived from the content file path and the item's position index,
so progress persists correctly if content files are regenerated with `--replace`.
