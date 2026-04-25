# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-25
**Phase:** 01-foundation
**Areas discussed:** Dev workflow, Frontend language, Styling approach, SQLite module placement

---

## Dev Workflow

| Option | Description | Selected |
|--------|-------------|----------|
| concurrently | Add concurrently package, one `npm run dev` starts both nodemon and vite | ✓ |
| Separate terminals | Keep `npm run dev` for Express, add `npm run client` for Vite. No extra dep. | |

**User's choice:** concurrently

| Option | Description | Selected |
|--------|-------------|----------|
| Vite proxy config | vite.config.js proxies /api/* to Express on :3000 — no hardcoded URLs | ✓ |
| Direct URL + CORS | React calls http://localhost:3000/api/* directly, CORS already enabled | |

**User's choice:** Vite proxy config

---

## Frontend Language

| Option | Description | Selected |
|--------|-------------|----------|
| JavaScript (consistent with backend) | Vite JS template, no tsconfig, works with existing ESLint/Prettier | ✓ |
| TypeScript | Static types, separate tsconfig, catches prop/state errors at compile time | |

**User's choice:** JavaScript

---

## Styling Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Tailwind CSS | Utility-first classes, Vite plugin, fastest way to build chat UI | ✓ |
| Plain CSS / CSS modules | Scoped .module.css per component, no extra dependency | |

**User's choice:** Tailwind CSS

| Option | Description | Selected |
|--------|-------------|----------|
| Dark by default | Dark background like Claude/ChatGPT dark mode | ✓ |
| Light / system default | Light background, simpler, no dark mode complexity | |

**User's choice:** Dark by default

---

## SQLite Module Placement

| Option | Description | Selected |
|--------|-------------|----------|
| src/db.js module | Dedicated module, exported db instance, server.js requires it | ✓ |
| Inline in server.js | DB setup inside server.js alongside Express setup | |

**User's choice:** src/db.js dedicated module

| Option | Description | Selected |
|--------|-------------|----------|
| Inline SQL strings in db.js | CREATE TABLE IF NOT EXISTS as template literals in db.js | ✓ |
| Separate schema.sql file | SQL in separate file, read with fs.readFileSync at startup | |

**User's choice:** Inline SQL strings in db.js

---

## Claude's Discretion

- Exact Tailwind color palette and dark theme tokens
- Concurrently terminal output configuration
- Data directory creation strategy
- Vite project template details

## Deferred Ideas

None.
