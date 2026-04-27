# Feature 4 — Docker Execution Engine

## Description

All user-submitted code is executed inside isolated Docker containers. The execution
engine is pluggable: adding a new language requires only a config file entry — no
application code changes.

## Architecture

- The Node.js backend maintains an **executor registry** loaded from a config file
  (e.g. `executors.json`).
- On submission, the backend looks up the executor for the exercise's track, writes the
  user's code and the unit test file to a temp directory, and spawns a Docker container
  with those files mounted.
- The container runs the tests, exits, and the backend captures stdout/stderr and the
  exit code.
- The container is removed immediately after execution regardless of outcome.

## Executor Config Schema

```json
{
  "executors": [
    {
      "track": "javascript",
      "image": "node:20-alpine",
      "fileExtension": ".js",
      "testCommand": "npx jest --no-coverage",
      "timeout": 10
    },
    {
      "track": "typescript",
      "image": "node:20-alpine",
      "fileExtension": ".ts",
      "testCommand": "npx ts-jest",
      "timeout": 10
    }
  ]
}
```

Adding Go or Rust requires only a new entry in this file — no code changes.

## Security & Resource Constraints (NON-NEGOTIABLE)

Every container MUST enforce all of the following:

| Constraint | Value |
|------------|-------|
| Execution timeout | 10 s (configurable per executor) |
| CPU cap | 0.5 cores |
| Memory cap | 128 MB |
| Network access | Disabled (`--network none`) |
| Container removal | Immediate after exit (`--rm`) |
| Run as root | Prohibited — containers run as non-root user |

These constraints cannot be relaxed for any reason.

## Initial Executors

| Track | Docker Image | Test Runner |
|-------|-------------|------------|
| JavaScript | `node:20-alpine` | Jest |
| TypeScript | `node:20-alpine` | Jest + ts-jest |

## Planned Executors (future, same pattern)

| Track | Docker Image | Test Runner |
|-------|-------------|------------|
| Go | `golang:1.22-alpine` | `go test` |
| Rust | `rust:1.75-alpine` | `cargo test` |

## Error States

- If Docker is not running: return a clear error to the frontend with setup instructions.
- If a container times out: return a "Time limit exceeded" result — do not reveal the solution.
- If the image is not pulled: surface the missing image name and the `docker pull` command.
