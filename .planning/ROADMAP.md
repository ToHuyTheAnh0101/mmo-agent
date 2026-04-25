# Roadmap: MMO Agent Hub

## Overview

Starting from an existing Node.js/Express backend with a working LLM proxy endpoint, this roadmap builds a full ChatGPT-like local chat tool in four phases. Phase 1 lays the technical foundation (SQLite, React/Vite scaffold, Express static serving). Phase 2 delivers complete session management with a sidebar UI. Phase 3 wires up the chat loop — streaming responses, history-as-context, and message persistence. Phase 4 adds the LLM settings panel so the user can configure API key, URL, and model from the browser without touching `.env`.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - SQLite init, React+Vite scaffold, Express serves client build
- [ ] **Phase 2: Session Management** - Full session CRUD with sidebar UI
- [ ] **Phase 3: Chat** - Streaming messages, history-as-context, message persistence
- [ ] **Phase 4: LLM Configuration** - Settings panel UI with SQLite-backed config and env fallback

## Phase Details

### Phase 1: Foundation
**Goal**: The project has a working SQLite database, a running React+Vite frontend, and Express serves the built client — all without breaking the existing LLM proxy endpoint
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03
**Success Criteria** (what must be TRUE):
  1. Running `npm run dev` (or equivalent) starts both the Express server and the Vite dev server without errors
  2. The SQLite database at `data/chat.db` is automatically created on first run with `sessions`, `messages`, and `config` tables present
  3. A production build of the React app is served correctly by Express at the root URL
  4. `POST /api/ai/chat` still accepts a request and returns a streaming SSE response (no regression)
**Plans**: TBD
**UI hint**: yes

### Phase 2: Session Management
**Goal**: Users can fully manage chat sessions — create, list, switch, rename, and delete — through a working sidebar UI backed by a sessions API
**Depends on**: Phase 1
**Requirements**: SESS-01, SESS-02, SESS-03, SESS-04, SESS-05
**Success Criteria** (what must be TRUE):
  1. User can click "New Session" and a new session appears in the sidebar with a default name
  2. User can see all existing sessions listed in the sidebar
  3. User can click a session in the sidebar to switch to it (selected state is visually indicated)
  4. User can rename a session by double-clicking or using an edit control, and the new name persists after page refresh
  5. User can delete a session and it disappears from the sidebar permanently
**Plans**: TBD
**UI hint**: yes

### Phase 3: Chat
**Goal**: Users can send messages in the active session and receive streaming AI responses, with full message history persisting across page refreshes and server restarts
**Depends on**: Phase 2
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04
**Success Criteria** (what must be TRUE):
  1. User can type a message and press Send; the message appears in the chat view
  2. The AI response streams token-by-token into the UI in real-time (no waiting for full response)
  3. After switching away and back to a session, all previous messages are visible in the correct order
  4. All messages survive a page refresh and a server restart (persisted in SQLite)
  5. Each LLM call includes the full session message history as context, so the AI maintains continuity across turns
**Plans**: TBD
**UI hint**: yes

### Phase 4: LLM Configuration
**Goal**: Users can configure the LLM API key, base URL, and model from a settings panel in the UI, with changes taking effect immediately and config surviving server restarts
**Depends on**: Phase 3
**Requirements**: CFG-01, CFG-02, CFG-03, CFG-04, CFG-05
**Success Criteria** (what must be TRUE):
  1. User can open a settings panel and set the API key, base URL, and model name from the browser
  2. After saving settings, the next message sent uses the new config without requiring a server restart
  3. Config values persist in SQLite — after restarting the server, the previously saved values are still active
  4. If no config is set in SQLite, the system falls back to `.env` values (existing behavior is preserved)
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/? | Not started | - |
| 2. Session Management | 0/? | Not started | - |
| 3. Chat | 0/? | Not started | - |
| 4. LLM Configuration | 0/? | Not started | - |
