# Research: LLM Chat Application

**Date**: 2026-04-26
**Spec**: [spec.md](spec.md)

## R-001: Python Web Framework

**Decision**: FastAPI

**Rationale**: FastAPI provides native async support essential for SSE streaming of LLM responses, automatic OpenAPI docs generation, built-in request validation with Pydantic, and excellent performance. It is the most popular modern Python framework for building API-first applications.

**Alternatives considered**:
- **Flask**: Simpler but lacks native async support; streaming SSE requires workarounds (flask-sse, gevent). Not ideal for long-lived LLM streaming connections.
- **Django + DRF**: Too heavyweight for an API-first chat app; ORM is powerful but overkill when SQLAlchemy is already specified.

## R-002: Database & ORM

**Decision**: PostgreSQL with SQLAlchemy (async, via asyncpg)

**Rationale**: User explicitly specified SQLAlchemy syntax for migrations. PostgreSQL provides robust JSON support, excellent concurrent performance, and is the industry standard for production web applications. Alembic (SQLAlchemy's migration tool) provides the migration workflow.

**Alternatives considered**:
- **SQLite**: Simpler zero-config, but limited concurrent write support; not ideal for multi-user auth + sessions.
- **MySQL**: Viable but PostgreSQL is more commonly paired with SQLAlchemy in modern Python stacks.

## R-003: Authentication Strategy

**Decision**: Email/password with JWT tokens (simplest method per user request)

**Rationale**: User requested "pick simplest login method." Email/password is the simplest self-contained auth method — no OAuth provider dependencies, no external accounts required. JWT tokens are stateless, widely supported, and work well with React SPA frontends.

**Implementation details**:
- Password hashing: `bcrypt` via `passlib`
- JWT creation/validation: `python-jose` with HS256
- Access token in Authorization header; refresh token for session continuity
- Token expiry: 24 hours access, 7 days refresh

**Alternatives considered**:
- **OAuth2 (Google/GitHub)**: Requires external provider setup; more complex; user said "simplest."
- **Session cookies**: Works but JWT is more natural for SPA + API architecture.

## R-004: LLM API Integration Pattern

**Decision**: OpenAI-compatible chat completions API with SSE streaming

**Rationale**: The existing Node.js code in `src/services/aiChatService.js` demonstrates the exact pattern — POST to `{base_url}/chat/completions` with Bearer token auth, stream SSE response. The Python backend will replicate this pattern using `httpx` for async HTTP streaming.

**Key learnings from existing code**:
- Base URL comes from config, stripped of trailing slashes
- Endpoint: `{base_url}/chat/completions`
- Auth header: `Authorization: Bearer {api_key}`
- Request body: `{ model, messages[], max_tokens, temperature, stream: true }`
- Response: SSE stream with `data: {json}` lines, terminated by `data: [DONE]`
- Delta content extracted from `choices[0].delta.content`

## R-005: Frontend Framework

**Decision**: React (Vite) with Tailwind CSS

**Rationale**: User explicitly specified React JS for frontend. Vite provides fast HMR and modern build tooling. Tailwind CSS provides utility-first styling for rapid UI development matching the dark theme aesthetic of ChatGPT/Gemini.

**Key libraries**:
- `react-router-dom`: Client-side routing (login page, chat page, settings)
- `react-markdown` + `react-syntax-highlighter`: Markdown rendering in chat messages
- `zustand` or React Context: Lightweight state management for auth/session state

## R-006: API Key Storage Security

**Decision**: Encrypted at rest using server-side symmetric encryption (Fernet)

**Rationale**: API keys are sensitive credentials. Storing them in plaintext in the database would be a security risk. Python's `cryptography` library provides Fernet symmetric encryption which is simple to implement and provides authenticated encryption.

**Implementation**:
- Server-side encryption key stored as environment variable
- API keys encrypted before DB write, decrypted on read
- Encryption key rotation can be added later

## R-007: Streaming Architecture (Backend → Frontend)

**Decision**: Server-Sent Events (SSE) via FastAPI StreamingResponse

**Rationale**: SSE is simpler than WebSockets for one-directional server-to-client streaming. The existing Node.js code already uses this pattern. FastAPI's `StreamingResponse` natively supports SSE. The React frontend uses the `EventSource` API or `fetch` with readable streams.

**Flow**:
1. Frontend sends POST with message + session context
2. Backend forwards to LLM API with full history
3. Backend streams SSE chunks back to frontend
4. Frontend renders tokens as they arrive
