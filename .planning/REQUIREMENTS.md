# Requirements: MMO Agent Hub

**Defined:** 2026-04-25
**Core Value:** Conversation history survives API key changes — sessions and messages are stored locally so context is never lost when switching LLM providers or keys.

## v1 Requirements

### Session Management

- [ ] **SESS-01**: User can create a new chat session
- [ ] **SESS-02**: User can view a list of all sessions in a sidebar
- [ ] **SESS-03**: User can switch between sessions
- [ ] **SESS-04**: User can rename a session
- [ ] **SESS-05**: User can delete a session

### Chat

- [ ] **CHAT-01**: User can type and send a message in the active session
- [ ] **CHAT-02**: AI response streams token-by-token into the UI in real-time
- [ ] **CHAT-03**: Full session message history is sent as context to LLM on every new message
- [ ] **CHAT-04**: Messages persist in SQLite (survive page refresh and server restarts)

### LLM Configuration

- [ ] **CFG-01**: User can set LLM API key from a settings panel in the UI
- [ ] **CFG-02**: User can set LLM base URL from a settings panel in the UI
- [ ] **CFG-03**: User can set LLM model name from a settings panel in the UI
- [ ] **CFG-04**: Config changes take effect on next message send (no server restart)
- [ ] **CFG-05**: Config persists in SQLite across server restarts (`.env` values as fallback)

### Infrastructure

- [ ] **INFRA-01**: React + Vite frontend runs in dev mode; Express serves built assets in prod
- [ ] **INFRA-02**: SQLite database auto-initializes with `sessions`, `messages`, `config` tables on first run
- [ ] **INFRA-03**: Existing `POST /api/ai/chat` endpoint remains backward-compatible

## v2 Requirements

### Enhanced Chat

- **CHAT-05**: User can edit a previously sent message (re-runs from that point)
- **CHAT-06**: User can regenerate the last AI response
- **CHAT-07**: User can copy individual messages to clipboard

### Session Enhancements

- **SESS-06**: User can search across all sessions by message content
- **SESS-07**: User can export a session as markdown or plain text

### LLM Configuration

- **CFG-06**: User can save and switch between multiple named LLM profiles
- **CFG-07**: User can test API connection from settings panel

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-user / authentication | Single-user local tool — no auth needed for v1 |
| File / image uploads | Text chat only; adds storage complexity |
| Mobile app | Web-first |
| Real-time collaboration | Single-user scope |
| Telegram bot integration | Separate subsystem; not needed for core chat MVP |
| Facebook automation features | Existing, unrelated to this milestone |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| SESS-01 | Phase 2 | Pending |
| SESS-02 | Phase 2 | Pending |
| SESS-03 | Phase 2 | Pending |
| SESS-04 | Phase 2 | Pending |
| SESS-05 | Phase 2 | Pending |
| CHAT-01 | Phase 3 | Pending |
| CHAT-02 | Phase 3 | Pending |
| CHAT-03 | Phase 3 | Pending |
| CHAT-04 | Phase 3 | Pending |
| CFG-01 | Phase 4 | Pending |
| CFG-02 | Phase 4 | Pending |
| CFG-03 | Phase 4 | Pending |
| CFG-04 | Phase 4 | Pending |
| CFG-05 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-25*
*Last updated: 2026-04-25 after roadmap creation*
