# Phase 1: Foundation - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up the technical foundation: initialize SQLite with `sessions`, `messages`, and `config` tables; scaffold a React + Vite frontend in `client/`; configure Express to serve the built client in production; and wire up the dev workflow so a single command starts both servers. The existing `POST /api/ai/chat` streaming endpoint must remain untouched.

</domain>

<decisions>
## Implementation Decisions

### Dev Workflow
- **D-01:** Use the `concurrently` package — `npm run dev` starts both `nodemon src/server.js` (Express on port 3000) and `vite` (React on port 5173) in a single terminal command.
- **D-02:** Configure `vite.config.js` to proxy `/api/*` requests to `http://localhost:3000`. No hardcoded backend URL in frontend code, no CORS issues in dev.

### Frontend Language & Tooling
- **D-03:** JavaScript (not TypeScript) for the React/Vite client. Consistent with the existing CommonJS backend. Works with the existing ESLint + Prettier config without needing a separate tsconfig.

### Styling
- **D-04:** Tailwind CSS as the styling approach — utility classes only, no hand-written CSS files. Add the Tailwind Vite plugin.
- **D-05:** Dark theme by default. The overall UI visual feel should match dark-mode tools like Claude / ChatGPT dark mode.

### SQLite Module
- **D-06:** Create `src/db.js` as a dedicated module that initializes `better-sqlite3`, opens `data/chat.db`, runs `CREATE TABLE IF NOT EXISTS` for all three tables, and exports the db instance. `server.js` requires it at startup — consistent with the existing service-layer separation.
- **D-07:** Schema defined as inline SQL template literals inside `src/db.js` (not a separate `.sql` file). Simple, no file I/O at startup, easy to diff in version control.

### Claude's Discretion
- Exact Tailwind color palette and dark theme tokens (within "dark, ChatGPT-like" aesthetic)
- Concurrently color/prefix configuration in terminal output
- Data directory creation strategy (`data/` directory auto-created if missing)
- Vite project template details (which starter template, React plugin version)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — INFRA-01, INFRA-02, INFRA-03 define the acceptance criteria for this phase

### Project Context
- `.planning/PROJECT.md` — Stack constraints (Node.js + Express + React + Vite + SQLite), backward-compatibility requirement for `/api/ai/chat`

### Existing Code
- `src/server.js` — Express entry point that db.js must be required into; existing middleware and route structure to preserve
- `src/services/aiChatService.js` — The streaming chat service that must remain untouched and passing

No external ADRs or design docs — requirements are fully captured in decisions above and REQUIREMENTS.md.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/utils/httpClient.js`: HTTP client abstraction (doRequest / doStreamRequest) — used by AI chat service, no changes needed for Phase 1
- `src/routes/index.js`: Route aggregator that mounts feature routers — new routes from later phases plug in here

### Established Patterns
- CommonJS modules: all new files (db.js, etc.) must use `require`/`module.exports` — no ES module syntax
- Prettier settings: semi=true, singleQuote=true, printWidth=120, 2-space indent — apply to any new JS files
- Error handling: controllers wrap service calls in try/catch, return `{ success: false, error: message }` on failure

### Integration Points
- `src/server.js`: Add `require('./db')` at top (after dotenv) to initialize DB on startup; add `express.static('client/dist')` and catch-all route for React SPA in production
- `package.json`: Add `concurrently`, `better-sqlite3` to dependencies; add `vite`, `@vitejs/plugin-react`, `tailwindcss` to devDependencies; update `scripts`

</code_context>

<specifics>
## Specific Ideas

- "Dark by default" — UI should feel like Claude or ChatGPT dark mode from the first render, not a light app with a theme toggle bolted on later

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-04-25*
