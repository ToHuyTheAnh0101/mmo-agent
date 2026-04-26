# Tasks: LLM Chat Application

**Input**: Design documents from `specs/001-llm-chat-app/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.md ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## User Story Mapping

| Story | Title | Priority | Spec Section |
|-------|-------|----------|-------------|
| US1 | Account Registration & Login | P1 | User Story 1 |
| US2 | Chat Sessions Management | P1 | User Story 2 |
| US3 | Chatting with LLM | P1 | User Story 3 |
| US4 | API Key Configuration | P2 | User Story 4 |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize both backend (Python/FastAPI) and frontend (React/Vite) projects

- [x] T001 Create project directory structure: `backend/`, `backend/app/`, `backend/app/models/`, `backend/app/schemas/`, `backend/app/routers/`, `backend/app/services/`, `backend/app/utils/`, `backend/alembic/`, `backend/tests/`, `frontend/`
- [x] T002 Initialize Python backend with FastAPI dependencies in `backend/requirements.txt` — include fastapi, uvicorn[standard], sqlalchemy[asyncio], asyncpg, alembic, passlib[bcrypt], python-jose[cryptography], cryptography, httpx, python-dotenv, pydantic-settings
- [x] T003 [P] Create backend environment config template in `backend/.env.example` with DATABASE_URL, SECRET_KEY, ENCRYPTION_KEY, AI_BASE_URL, AI_MODEL, AI_API_KEY
- [x] T004 [P] Scaffold React frontend using Vite in `frontend/` — run `npm create vite@latest frontend -- --template react`, install dependencies, install tailwindcss and @tailwindcss/vite
- [x] T005 [P] Configure Vite proxy and Tailwind CSS v4 in `frontend/vite.config.js` — proxy `/api` to `http://localhost:8000`, add react() and tailwindcss() plugins
- [x] T006 [P] Set up Tailwind CSS dark theme in `frontend/src/index.css` and `frontend/index.html` — use `@import "tailwindcss"`, `@custom-variant dark`, add `class="dark"` to html element

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database, auth framework, and API structure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create async SQLAlchemy database engine and session factory in `backend/app/database.py` — async engine with asyncpg, async session maker, Base declarative class, get_db dependency
- [x] T008 Create application settings and config in `backend/app/config.py` — Pydantic BaseSettings loading from .env: DATABASE_URL, SECRET_KEY, ENCRYPTION_KEY, default AI config
- [x] T009 Create FastAPI application entry point in `backend/app/main.py` — app factory, CORS middleware, include all routers under `/api` prefix, lifespan handler for DB init
- [x] T010 Create `backend/app/__init__.py` and all sub-package `__init__.py` files (models, schemas, routers, services, utils)
- [x] T011 Implement JWT and password security utilities in `backend/app/utils/security.py` — create_access_token, create_refresh_token, verify_password, hash_password, verify_token functions using passlib[bcrypt] and python-jose
- [x] T012 Implement Fernet encryption utility for API keys in `backend/app/utils/security.py` — encrypt_api_key, decrypt_api_key functions using cryptography.fernet
- [x] T013 Implement authentication dependency injection in `backend/app/utils/deps.py` — get_current_user dependency that extracts and validates JWT from Authorization header, returns User
- [x] T014 Configure Alembic for async SQLAlchemy in `backend/alembic.ini` and `backend/alembic/env.py` — set sqlalchemy.url, configure async engine for migrations
- [x] T015 Create User SQLAlchemy model in `backend/app/models/user.py` — id, email (unique), password_hash, created_at, updated_at; relationships to sessions and api_config
- [x] T016 Create initial Alembic migration for User table — run `alembic revision --autogenerate -m "create user table"` in `backend/`
- [x] T017 [P] Set up React Router and auth context in `frontend/src/App.jsx` — BrowserRouter, routes for /login, /register, /chat; AuthContext provider
- [x] T018 [P] Create AuthContext with token management in `frontend/src/context/AuthContext.jsx` — store/clear tokens in localStorage, provide login/logout/register functions, auto-redirect on auth state change
- [x] T019 [P] Create ProtectedRoute component in `frontend/src/components/ProtectedRoute.jsx` — redirect to /login if not authenticated
- [x] T020 [P] Create API client base with auth interceptor in `frontend/src/api/client.js` — fetch wrapper that adds Authorization header, handles 401 refresh, base URL configuration

**Checkpoint**: Foundation ready — database, auth, and API structure in place. User story implementation can now begin.

---

## Phase 3: User Story 1 — Account Registration & Login (Priority: P1) 🎯 MVP

**Goal**: Users can register with email/password and log in to access their personal dashboard

**Independent Test**: Register a new account → log out → log back in → verify you see the authenticated dashboard

### Implementation for User Story 1

- [x] T021 [US1] Create auth Pydantic schemas in `backend/app/schemas/auth.py` — RegisterRequest (email, password), LoginRequest (email, password), TokenResponse (access_token, refresh_token, token_type, id, email), RefreshRequest (refresh_token)
- [x] T022 [US1] Implement auth service in `backend/app/services/auth_service.py` — register_user (validate email, hash password, create user, return tokens), login_user (verify credentials, return tokens), refresh_token (validate refresh, issue new access)
- [x] T023 [US1] Create auth router with endpoints in `backend/app/routers/auth.py` — POST /api/auth/register (201), POST /api/auth/login (200), POST /api/auth/refresh (200); all public (no auth required)
- [x] T024 [P] [US1] Create LoginPage component in `frontend/src/pages/LoginPage.jsx` — email/password form, submit calls auth API, success redirects to /chat, error displays message, link to register
- [x] T025 [P] [US1] Create RegisterPage component in `frontend/src/pages/RegisterPage.jsx` — email/password/confirm-password form, submit calls register API, success redirects to /chat, error displays message, link to login
- [x] T026 [US1] Create auth API client functions in `frontend/src/api/auth.js` — login(email, password), register(email, password), refreshToken(refresh_token)
- [x] T027 [US1] Wire auth pages to AuthContext — integrate LoginPage and RegisterPage with useAuth() hook, handle loading states and error display

**Checkpoint**: Users can register, log in, and see an authenticated chat page shell. Story 1 independently testable.

---

## Phase 4: User Story 2 — Chat Sessions Management (Priority: P1)

**Goal**: Users can create, list, switch, rename, and delete chat sessions via a sidebar UI

**Independent Test**: Create two sessions → rename one → switch between them → delete one → verify sidebar updates correctly and data persists after page refresh

### Implementation for User Story 2

- [x] T028 [US2] Create Session SQLAlchemy model in `backend/app/models/session.py` — id, user_id (FK → User), name, created_at, updated_at; relationship to messages; cascade delete
- [x] T029 [US2] Create Message SQLAlchemy model in `backend/app/models/message.py` — id, session_id (FK → Session), role (CHECK user/assistant/system), content, created_at; cascade delete
- [x] T030 [US2] Generate Alembic migration for Session and Message tables — run `alembic revision --autogenerate -m "create session and message tables"` in `backend/`
- [x] T031 [US2] Create session Pydantic schemas in `backend/app/schemas/session.py` — SessionCreate (name optional), SessionUpdate (name), SessionResponse (id, name, created_at, updated_at, message_count)
- [x] T032 [US2] Implement session service in `backend/app/services/session_service.py` — create_session, list_user_sessions (ordered by updated_at DESC), get_session (with ownership check), rename_session, delete_session
- [x] T033 [US2] Create sessions router with endpoints in `backend/app/routers/sessions.py` — GET /api/sessions, POST /api/sessions (201), PATCH /api/sessions/:id, DELETE /api/sessions/:id (204); all require auth
- [x] T034 [P] [US2] Create sessions API client functions in `frontend/src/api/sessions.js` — listSessions(), createSession(name?), renameSession(id, name), deleteSession(id)
- [x] T035 [US2] Create SessionList sidebar component in `frontend/src/components/SessionList.jsx` — list sessions, "New Chat" button, click to select, double-click or edit icon to rename, delete button with confirmation
- [x] T036 [US2] Create ChatPage layout with sidebar in `frontend/src/pages/ChatPage.jsx` — left sidebar (SessionList), main content area (empty for now, messages in US3), session state management (active session ID)
- [x] T037 [US2] Implement useChat hook for session state in `frontend/src/hooks/useChat.js` — manage active session, session list fetch/refresh, create/rename/delete operations

**Checkpoint**: Full session CRUD working with sidebar. Switching sessions shows correct (empty) views. Data persists across refresh. Story 2 independently testable.

---

## Phase 5: User Story 3 — Chatting with LLM (Priority: P1)

**Goal**: Users can send messages and receive streaming AI responses with full session history as context

**Independent Test**: Send a message → see streaming response → send a follow-up referencing the first message → verify AI maintains context → refresh page → verify messages persisted

### Implementation for User Story 3

- [x] T038 [US3] Create message Pydantic schemas in `backend/app/schemas/message.py` — ChatRequest (message), MessageResponse (id, role, content, created_at), SSE event schemas
- [x] T039 [US3] Implement LLM service in `backend/app/services/llm_service.py` — stream_chat_completion(base_url, api_key, model, messages[]) using httpx async streaming; parse SSE data lines; yield delta content tokens; handle errors (invalid key, rate limit, network)
- [x] T040 [US3] Implement chat service in `backend/app/services/chat_service.py` — send_message(session_id, user_id, content): save user message, load session history, call LLM service with full history, stream response tokens, save complete assistant message, update session.updated_at
- [x] T041 [US3] Create chat router with SSE streaming endpoint in `backend/app/routers/chat.py` — POST /api/chat/:session_id returning StreamingResponse (text/event-stream); require auth; validate session ownership; return 422 if no API key configured
- [x] T042 [US3] Create message API client functions in `frontend/src/api/chat.js` — sendMessage(sessionId, message) using fetch with ReadableStream to consume SSE; getMessages(sessionId, limit?, before?)
- [x] T043 [US3] Create messages API client in `frontend/src/api/sessions.js` — add getSessionMessages(sessionId) function
- [x] T044 [US3] Create ChatMessage component in `frontend/src/components/ChatMessage.jsx` — render user vs assistant messages with different styling, support markdown rendering via react-markdown, code blocks with syntax highlighting
- [x] T045 [US3] Create ChatInput component in `frontend/src/components/ChatInput.jsx` — text input with send button, Enter to send (Shift+Enter for newline), disable during streaming, auto-focus
- [x] T046 [US3] Integrate chat UI into ChatPage in `frontend/src/pages/ChatPage.jsx` — message list (auto-scroll to bottom), streaming token display, ChatInput at bottom, loading indicator during LLM processing, error display for API failures
- [x] T047 [US3] Install react-markdown and react-syntax-highlighter in `frontend/` — `npm install react-markdown react-syntax-highlighter`

**Checkpoint**: Full chat loop working — send message, see streaming response, history persists, context maintained across turns. Story 3 independently testable.

---

## Phase 6: User Story 4 — API Key Configuration (Priority: P2)

**Goal**: Users can configure their own API key, base URL, and model from a settings panel; switching keys preserves all session history

**Independent Test**: Open settings → enter API key/URL/model → save → send a message → verify it works → change to a different key → verify old sessions still have all messages → send new message with new key

### Implementation for User Story 4

- [x] T048 [US4] Create ApiConfig SQLAlchemy model in `backend/app/models/api_config.py` — id, user_id (FK → User, UNIQUE), api_key_encrypted, base_url, model_name, created_at, updated_at; cascade delete
- [x] T049 [US4] Generate Alembic migration for ApiConfig table — run `alembic revision --autogenerate -m "create api_config table"` in `backend/`
- [x] T050 [US4] Create settings Pydantic schemas in `backend/app/schemas/settings.py` — SettingsUpdate (api_key, base_url, model_name), SettingsResponse (has_api_key, base_url, model_name, updated_at)
- [x] T051 [US4] Implement settings service in `backend/app/services/settings_service.py` — get_user_settings, update_user_settings (encrypt API key before saving), get_decrypted_api_key (for LLM calls)
- [x] T052 [US4] Create settings router with endpoints in `backend/app/routers/settings.py` — GET /api/settings, PUT /api/settings; require auth; never return plaintext API key
- [x] T053 [US4] Update chat service to use per-user API config in `backend/app/services/chat_service.py` — load user's ApiConfig, decrypt API key, pass to LLM service; return 422 if no config exists
- [x] T054 [P] [US4] Create settings API client functions in `frontend/src/api/settings.js` — getSettings(), updateSettings(api_key, base_url, model_name)
- [x] T055 [US4] Create SettingsModal component in `frontend/src/components/SettingsModal.jsx` — form with API key (password field), base URL, model name inputs; save/cancel buttons; show "configured" status; accessible from ChatPage header
- [x] T056 [US4] Integrate SettingsModal into ChatPage in `frontend/src/pages/ChatPage.jsx` — settings gear icon in header, open modal, handle save, show prompt to configure if no API key when trying to chat

**Checkpoint**: Users can configure and switch API keys. Sessions and messages are fully preserved across key changes. Story 4 independently testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T057 [P] Style the entire frontend with polished dark theme in `frontend/src/index.css` — consistent spacing, hover effects, transitions, focus states, responsive layout, matching ChatGPT/Claude aesthetic
- [x] T058 [P] Add loading skeletons and empty states across all pages — session list empty state, chat empty state, loading spinners during API calls
- [x] T059 Add proper error handling and user-friendly error messages across all frontend components — network errors, 401 redirects, validation errors, LLM API errors (invalid key, rate limit)
- [x] T060 [P] Add README.md with setup instructions in project root — reference quickstart.md, document both backend and frontend setup
- [x] T061 Handle long conversation context windows in `backend/app/services/chat_service.py` — truncate older messages when total tokens approach model context limit, always preserve system message and recent messages
- [x] T062 Add virtual scrolling or pagination for long message lists in `frontend/src/pages/ChatPage.jsx` — lazy-load older messages, maintain scroll position
- [x] T063 Security hardening — validate all inputs, rate limit auth endpoints, secure CORS configuration, ensure API keys never logged or returned in responses

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 Auth (Phase 3)**: Depends on Foundational — BLOCKS US2, US3, US4 (need authenticated user)
- **US2 Sessions (Phase 4)**: Depends on US1 (needs auth + user)
- **US3 Chat (Phase 5)**: Depends on US2 (needs sessions to chat in) — can technically start backend work in parallel
- **US4 Settings (Phase 6)**: Depends on US3 (chat service must exist to wire API config into)
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (DB, Auth framework, API structure)
    ↓
Phase 3: US1 — Registration & Login
    ↓
Phase 4: US2 — Session Management
    ↓
Phase 5: US3 — Chat with LLM
    ↓
Phase 6: US4 — API Key Configuration
    ↓
Phase 7: Polish
```

### Within Each User Story

- Models before services
- Services before routers/endpoints
- Backend before frontend (API must exist for frontend to consume)
- Core implementation before integration

### Parallel Opportunities

- T003, T004, T005, T006 (Setup phase) — all independent files
- T017, T018, T019, T020 (Foundational frontend) — independent React components
- T024, T025 (US1 login/register pages) — independent pages
- T034, T035 (US2 API client + component) — can overlap if API is defined
- Backend and frontend within each story can partially overlap (start frontend once API contract is defined, even before implementation)

---

## Parallel Example: User Story 2

```bash
# Launch backend model + migration tasks together:
Task: "Create Session model in backend/app/models/session.py"
Task: "Create Message model in backend/app/models/message.py"

# After models done, launch service + API client together:
Task: "Implement session service in backend/app/services/session_service.py"
Task: "Create sessions API client in frontend/src/api/sessions.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Auth)
4. **STOP and VALIDATE**: Register, login, logout all working
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Auth) → Test independently → Auth MVP!
3. Add US2 (Sessions) → Test independently → Session management working
4. Add US3 (Chat) → Test independently → Full chat loop with streaming!
5. Add US4 (Settings) → Test independently → API key management
6. Polish → Production-ready

### Recommended Execution Order

Stories are sequential in this project because each builds on the previous:
- Auth (US1) is required before sessions (US2)
- Sessions (US2) are required before chat (US3)
- Chat (US3) is required before settings (US4) integration

However, **backend work can start ahead of frontend** within each story.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Tech stack: Python 3.11 + FastAPI (backend), React + Vite + Tailwind CSS (frontend)
- Database: PostgreSQL + SQLAlchemy async + Alembic migrations
- The existing `src/` directory (Node.js) is a reference implementation — do not modify
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
