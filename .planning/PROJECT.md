# MMO Agent Hub

## What This Is

A web-based AI chat platform (ChatGPT/Gemini-style) that lets a single user run multiple persistent conversation sessions using their own LLM API key. Built on top of an existing Node.js/Express backend that already proxies OpenAI-compatible LLM calls. The core problem it solves: API keys get rotated frequently, and without a persistence layer all conversation context is lost.

## Core Value

Conversation history survives API key changes — sessions and messages are stored locally so context is never lost when switching LLM providers or keys.

## Current Milestone: v1.0 — ChatGPT-like MVP

**Goal:** Build a React-based chat UI with session management, per-session message history as LLM context, and a settings panel to configure the LLM API key/URL/model from the browser.

**Target features:**
- Session management (create, list, switch, rename, delete)
- Per-session message history sent as context on every LLM call
- Streaming AI responses rendered in real-time
- LLM config UI (API key, base URL, model) with SQLite persistence

## Requirements

### Validated

<!-- Nothing shipped yet — first milestone -->

(None yet — ship to validate)

### Active

- [ ] User can create, list, switch, rename, and delete chat sessions
- [ ] Each session maintains its own message history sent as LLM context
- [ ] AI responses stream into the UI in real-time
- [ ] User can configure LLM API key, base URL, and model from a settings panel
- [ ] LLM config persists in SQLite (survives server restarts, no `.env` edit required)
- [ ] All sessions and messages persist in SQLite

### Out of Scope

- Multi-user / authentication — single-user local tool
- Mobile app — web-first
- Real-time collaboration — single session per view
- File/image uploads — text chat only for v1

## Context

- Existing backend: Node.js + Express, `POST /api/ai/chat` already calls an OpenAI-compatible LLM proxy with streaming SSE
- AI config today: `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL` in `.env` — these become overridable from the UI
- No frontend exists yet — adding React (Vite) in a `client/` directory
- Persistence: SQLite via `better-sqlite3` — `data/chat.db` with `sessions`, `messages`, `config` tables
- Single-user local tool — no auth required

## Constraints

- **Tech stack**: Node.js + Express backend (existing), React + Vite frontend (new)
- **Storage**: SQLite (`better-sqlite3`) — no external database
- **Compatibility**: Existing `/api/ai/chat` endpoint must keep working (backward compatible)
- **Scope**: MVP — ship the core loop fast, no over-engineering

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React (Vite) for frontend | User preference; component model scales better than vanilla as UI grows | — Pending |
| SQLite for persistence | Zero-infra, file-based, survives restarts, queryable | — Pending |
| LLM config in DB, `.env` as fallback | Config from UI overrides env; env still works as bootstrap | — Pending |
| client/ directory separate from src/ | Keeps backend and frontend clearly separated | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-25 after Milestone v1.0 started*
