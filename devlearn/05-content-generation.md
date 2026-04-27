# Feature 5 — Content Generation CLI Script

## Description

Content generation is fully decoupled from the main app. It is a standalone Node.js CLI
script (`scripts/generate-content.js`) that calls the Claude API to produce Q&A pairs and
coding exercise bundles, storing them as JSON files in the local content directory.

The main application has no dependency on this script and no knowledge of the Claude API.

## Prerequisites

- `ANTHROPIC_API_KEY` set in a `.env` file at the project root.
- Node.js installed on the host (the script runs on the host, not in Docker).

## CLI Usage

```bash
node scripts/generate-content.js \
  --track javascript \
  --topic closures \
  --difficulty intermediate \
  --type quiz \
  --count 20
```

### Arguments

| Argument | Values | Description |
|----------|--------|-------------|
| `--track` | `javascript`, `typescript`, `react` | Target learning track |
| `--topic` | any string | Topic within the track (e.g. `promises`, `hooks`) |
| `--difficulty` | `beginner`, `intermediate`, `advanced`, `senior` | Difficulty level |
| `--type` | `quiz`, `fill-blank`, `fix-bug`, `implement`, `refactor` | Content type |
| `--count` | integer | Number of items to generate |
| `--replace` | flag | Overwrite the latest file instead of appending a new timestamped one |

## Output

- Quiz items written to:
  `content/<track>/<topic>/<difficulty>-quiz-<timestamp>.json`
- Exercise bundles written to:
  `content/<track>/<topic>/<difficulty>-<type>-<timestamp>.json`

Re-running without `--replace` appends a new timestamped file; existing files are never
modified.

## Curriculum Sources

The script prompts Claude to generate content grounded in the following authoritative
sources. The sources selected for each track are listed in `08-content-sources.md`.
The generation prompt instructs Claude to:
- Cover the topic thoroughly at the specified difficulty level.
- Draw concepts, terminology, and patterns from the selected sources.
- Ensure questions span both trivial fundamentals and nuanced edge cases.

## Content Browser (in-app, read-only)

A **Content** page inside the main app lists all generated files grouped by track and
topic, showing item counts per difficulty and type. This lets the user spot coverage gaps
at a glance.

- No generation is triggered from this page — it is purely informational.
- Links to the CLI command needed to fill any visible gap.
