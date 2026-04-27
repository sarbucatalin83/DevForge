# DevLearn — Project Overview

## Summary

A locally-running web application for learning JavaScript, TypeScript, and React through
interactive tests and coding exercises. Designed to serve all skill levels from absolute
beginner to senior engineer. The architecture is intentionally extensible so that Go, Rust,
and other languages can be added in the future without structural changes.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React + Vite |
| UI components | shadcn/ui (Tailwind-based) |
| In-browser editor | Monaco Editor (VSCode engine) |
| Backend | Node.js + Express — local server only |
| Code execution | Docker containers, one image per language runtime |
| Content generation | Separate offline CLI script using the Claude API |
| Content storage | Structured JSON files on disk |
| User progress | Browser localStorage |

The main application has **no runtime API dependency and requires no internet connection**.
The Claude API is only used by the offline CLI script run separately to populate content.

## Non-Functional Requirements

- Runs entirely on localhost with no API key required at runtime.
- Setup requires only: `docker` installed and `npm install && npm run dev`.
- The app ships with a starter set of pre-generated content so it is immediately usable
  without running the content generation script first.
- Content JSON files are human-readable, hand-editable, and safe to commit to version control.
- The app must start in under 5 seconds after `npm run dev` on a modern laptop.
- Minimum supported viewport: 1280 px wide. Mobile is not a priority for v1.

## Out of Scope (v1)

- User accounts or multi-user support
- Cloud deployment
- Leaderboards or social features
- AI-evaluated code (unit tests are the sole correctness judge)
- Mobile / tablet layout
- Paid or subscription content
