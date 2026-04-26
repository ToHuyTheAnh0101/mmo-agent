# Implementation Plan: LLM Chat Application

**Branch**: `001-llm-chat-app` | **Date**: 2026-04-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-llm-chat-app/spec.md`

## Summary

Build a ChatGPT-like web application where users register with email/password, manage multiple chat sessions with independent conversation history, chat with LLMs via streaming responses, and configure their own API keys without losing session context. Backend in Python (FastAPI + SQLAlchemy + PostgreSQL), frontend in React (Vite + Tailwind CSS).

## Technical Context

**Language/Version**: Python 3.11+ (backend), JavaScript/JSX (frontend)
**Primary Dependencies**: FastAPI, SQLAlchemy (async), Alembic, httpx, passlib[bcrypt], python-jose, cryptography (backend); React 18+, Vite, Tailwind CSS, react-router-dom, react-markdown (frontend)
**Storage**: PostgreSQL 15+ via asyncpg + SQLAlchemy async engine
**Testing**: pytest + httpx (backend), Vitest (frontend)
**Target Platform**: Linux server (backend), modern web browsers (frontend)
**Project Type**: Web application (API backend + SPA frontend)
**Performance Goals**: SSE streaming response start < 3s, session CRUD < 1s, 50+ concurrent sessions per user
**Constraints**: Single-instance deployment, API keys encrypted at rest, JWT auth with refresh tokens
**Scale/Scope**: Single-user to small team; 4 data entities; 12 API endpoints; ~5 frontend pages/views

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution file contains only placeholder template content — no project-specific gates defined. All design decisions are permissible. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-llm-chat-app/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: Technical decisions
├── data-model.md        # Phase 1: Entity design
├── quickstart.md        # Phase 1: Setup guide
├── contracts/
│   └── api.md           # Phase 1: REST API contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Settings & env config
│   ├── database.py          # Async SQLAlchemy engine + session
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── session.py
│   │   ├── message.py
│   │   └── api_config.py
│   ├── schemas/             # Pydantic request/response schemas
│   │   ├── auth.py
│   │   ├── session.py
│   │   ├── message.py
│   │   └── settings.py
│   ├── routers/             # FastAPI route handlers
│   │   ├── auth.py
│   │   ├── sessions.py
│   │   ├── chat.py
│   │   └── settings.py
│   ├── services/            # Business logic
│   │   ├── auth_service.py
│   │   ├── session_service.py
│   │   ├── chat_service.py
│   │   └── llm_service.py
│   ├── utils/
│   │   ├── security.py      # JWT + password hashing + encryption
│   │   └── deps.py          # FastAPI dependency injection
│   └── __init__.py
├── alembic/
│   ├── env.py
│   └── versions/            # Migration files
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_sessions.py
│   ├── test_chat.py
│   └── test_settings.py
├── requirements.txt
├── .env.example
└── alembic.ini

frontend/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css            # Tailwind CSS entry
│   ├── api/                 # API client functions
│   │   ├── auth.js
│   │   ├── sessions.js
│   │   ├── chat.js
│   │   └── settings.js
│   ├── components/          # Reusable UI components
│   │   ├── ChatMessage.jsx
│   │   ├── ChatInput.jsx
│   │   ├── SessionList.jsx
│   │   ├── SettingsModal.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/               # Route-level components
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── ChatPage.jsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js
│   │   └── useChat.js
│   └── context/             # React context providers
│       └── AuthContext.jsx
├── index.html
├── vite.config.js
├── package.json
└── tailwind.config.js       # Only if Tailwind v3; v4 uses CSS-only config
```

**Structure Decision**: Web application layout (Option 2) selected — separate `backend/` and `frontend/` directories. The existing `src/` directory contains the Node.js reference implementation and remains untouched. The new Python backend and React frontend are fully independent.

## Complexity Tracking

> No constitution violations to justify — constitution contains only placeholder content.
