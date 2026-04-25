# Phase 1: Foundation - Research

**Researched:** 2026-04-25
**Domain:** React+Vite scaffold, SQLite initialization, Express static serving, dev workflow wiring
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Use the `concurrently` package — `npm run dev` starts both `nodemon src/server.js` (Express on port 3000) and `vite` (React on port 5173) in a single terminal command.
- **D-02:** Configure `vite.config.js` to proxy `/api/*` requests to `http://localhost:3000`. No hardcoded backend URL in frontend code, no CORS issues in dev.
- **D-03:** JavaScript (not TypeScript) for the React/Vite client. Consistent with the existing CommonJS backend. Works with the existing ESLint + Prettier config without needing a separate tsconfig.
- **D-04:** Tailwind CSS as the styling approach — utility classes only, no hand-written CSS files. Add the Tailwind Vite plugin.
- **D-05:** Dark theme by default. The overall UI visual feel should match dark-mode tools like Claude / ChatGPT dark mode.
- **D-06:** Create `src/db.js` as a dedicated module that initializes `better-sqlite3`, opens `data/chat.db`, runs `CREATE TABLE IF NOT EXISTS` for all three tables, and exports the db instance. `server.js` requires it at startup — consistent with the existing service-layer separation.
- **D-07:** Schema defined as inline SQL template literals inside `src/db.js` (not a separate `.sql` file). Simple, no file I/O at startup, easy to diff in version control.

### Claude's Discretion

- Exact Tailwind color palette and dark theme tokens (within "dark, ChatGPT-like" aesthetic)
- Concurrently color/prefix configuration in terminal output
- Data directory creation strategy (`data/` directory auto-created if missing)
- Vite project template details (which starter template, React plugin version)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | React + Vite frontend runs in dev mode; Express serves built assets in prod | Covered by: Vite scaffold commands, vite.config.js proxy, Express static serving pattern, concurrently scripts |
| INFRA-02 | SQLite database auto-initializes with `sessions`, `messages`, `config` tables on first run | Covered by: better-sqlite3 init pattern, schema SQL, data/ mkdir strategy |
| INFRA-03 | Existing `POST /api/ai/chat` endpoint remains backward-compatible | Covered by: proxy no-rewrite verification, Express route ordering, no-touch rule for aiChatService.js |
</phase_requirements>

---

## Summary

Phase 1 wires together three independent concerns: a React+Vite frontend scaffold in `client/`, a SQLite database module in `src/db.js`, and Express static serving for production. In dev mode, `concurrently` runs nodemon and Vite side-by-side; Vite's dev proxy forwards all `/api/*` requests to Express on port 3000, so the frontend never needs a hardcoded backend URL.

The primary risk in this phase is the combination of two mature but version-sensitive areas: Tailwind CSS v4 changed its setup API completely (no `tailwind.config.js`, uses `@tailwindcss/vite` plugin, CSS `@import "tailwindcss"` directive), and Express 5 changed wildcard route syntax (`/{*splat}` replaces the old `app.get('*')`). Both require the exact patterns documented below — using the v3/v4 patterns will silently fail.

The `better-sqlite3` native module requires compilation from source on Node 24 (ABI 137) due to a gap in prebuilt binaries. The build toolchain (`python3`, `gcc`, `make`, `node-gyp`) is confirmed present on this machine, so installation will succeed but may take 30-60 seconds.

**Primary recommendation:** Scaffold `client/` first with `npm create vite@latest client -- --template react`, then install Tailwind v4 into the client, then create `src/db.js`, then modify `src/server.js` last. This order means each step can be validated independently before touching the existing backend.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| React UI scaffold | Browser / Client | — | Static HTML+JS+CSS, served from client/dist in prod |
| Vite dev server + HMR | Frontend Server (dev-only) | — | Vite process serves assets; proxies /api/* to Express |
| API proxy (dev) | Frontend Server (dev-only) | — | Vite server.proxy config; transparent to React code |
| SQLite initialization | API / Backend | — | Server-side only; better-sqlite3 is a Node.js module |
| Express static serving | API / Backend | — | express.static('client/dist') + catch-all SPA route |
| Route namespace isolation | API / Backend | — | /api/* routes mounted before static middleware |
| Dev workflow orchestration | Build tooling | — | concurrently in package.json scripts, not runtime code |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vite | ^8.0.10 | Frontend build tool + dev server | Current major; proxy config unchanged from v7; React template available |
| @vitejs/plugin-react | ^6.0.1 | React Fast Refresh + JSX transform (uses Oxc) | Official Vite React plugin; no Babel needed in v6 |
| tailwindcss | ^4.2.4 | Utility-first CSS framework | v4 is current; new @tailwindcss/vite plugin eliminates PostCSS config |
| @tailwindcss/vite | ^4.2.4 | Tailwind v4 Vite integration | Replaces PostCSS pipeline; single plugin call in vite.config.js |
| better-sqlite3 | ^12.9.0 | SQLite3 driver (synchronous API) | v12.x adds Node 24 support; synchronous API matches CommonJS service layer |
| concurrently | ^9.2.1 | Run multiple npm scripts in one terminal | Cross-platform; `--kill-others-on-fail` flag prevents orphaned processes |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react | ^19.x (scaffolded) | UI library | Created by npm create vite react template |
| react-dom | ^19.x (scaffolded) | React DOM renderer | Created by npm create vite react template |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @vitejs/plugin-react | @vitejs/plugin-react-swc | SWC is faster but adds more deps; Oxc-based v6 is fast enough for this project size |
| better-sqlite3 | node-sqlite3 | better-sqlite3 has synchronous API matching existing service layer; node-sqlite3 is async-only |
| concurrently | npm-run-all2 | Both work; concurrently has better terminal output coloring and wider adoption |

**Installation (root package.json — runtime deps):**
```bash
npm install better-sqlite3 concurrently
```

**Installation (client/ — frontend devDeps, runs after scaffold):**
```bash
cd client && npm install tailwindcss @tailwindcss/vite
```

**Version verification (confirmed 2026-04-25):**
```
better-sqlite3  12.9.0  (npm view better-sqlite3 version)
vite            8.0.10  (npm view vite version)
@vitejs/plugin-react  6.0.1  (npm view @vitejs/plugin-react version)
tailwindcss     4.2.4   (npm view tailwindcss version)
@tailwindcss/vite  4.2.4  (npm view @tailwindcss/vite version)
concurrently    9.2.1   (npm view concurrently version)
```
[VERIFIED: npm registry — all versions confirmed 2026-04-25]

---

## Architecture Patterns

### System Architecture Diagram

```
DEV MODE
─────────────────────────────────────────────────────────────────
Browser
  │  http://localhost:5173/*          (React UI, HMR)
  │  http://localhost:5173/api/*      (API calls from React)
  ▼
Vite Dev Server :5173
  ├── /api/*  ──proxy──►  Express :3000/api/*  ──►  routes/aiChatRoute
  └── /*       ──serve──►  React SPA (in-memory, HMR)
                                           │
                                    better-sqlite3
                                    data/chat.db

PROD MODE
─────────────────────────────────────────────────────────────────
Browser
  │  http://localhost:3000/*
  ▼
Express :3000
  ├── /health          ──►  health check handler
  ├── /api/*           ──►  routes/ (aiChat, facebook, future)
  ├── /assets/*        ──►  express.static('client/dist')
  └── /{*splat}        ──►  client/dist/index.html  (SPA fallback)
                                     │
                              better-sqlite3
                              data/chat.db
```

### Recommended Project Structure

```
project-root/
├── src/
│   ├── server.js          # Express entry — add db require + static serving
│   ├── db.js              # NEW: better-sqlite3 init, exports db instance
│   ├── routes/            # Unchanged
│   ├── controllers/       # Unchanged
│   ├── services/          # Unchanged (aiChatService.js MUST NOT be touched)
│   └── utils/             # Unchanged
├── client/                # NEW: Vite React app (separate package.json)
│   ├── package.json       # type: "module", vite/react deps
│   ├── vite.config.js     # proxy + tailwind + react plugins
│   ├── index.html         # Entry HTML with dark class on <html>
│   └── src/
│       ├── main.jsx       # React root mount
│       ├── App.jsx        # Root component, dark background
│       └── index.css      # @import "tailwindcss" + @custom-variant dark
├── data/                  # CREATED at runtime by src/db.js (gitignored)
│   └── chat.db
├── package.json           # Root: add concurrently, better-sqlite3, update scripts
└── .env                   # Existing: AI_BASE_URL, AI_API_KEY, AI_MODEL
```

---

### Pattern 1: React+Vite Scaffold in `client/`

**What:** Use `npm create vite@latest` to scaffold a React JS project into the `client/` subdirectory.
**When to use:** Run once from project root; generates `client/` with its own `package.json` (type: "module"), `vite.config.js`, `index.html`, and `src/`.

```bash
# Source: Context7 /vitejs/vite — github.com/vitejs/vite/packages/create-vite/README.md
# Run from project root. npm 7+ requires the extra -- before --template
npm create vite@latest client -- --template react

cd client
npm install
```

The `react` template (not `react-ts`) generates JS files: `src/main.jsx`, `src/App.jsx`, `src/App.css`, `src/index.css`, `public/vite.svg`. The generated `vite.config.js` already imports `@vitejs/plugin-react` — we modify it to add the proxy and Tailwind plugin.

---

### Pattern 2: vite.config.js (Final, with all plugins)

**What:** Single config file combining react plugin, Tailwind plugin, and API proxy.
**When to use:** Replace the scaffolded `client/vite.config.js` immediately after scaffold.

```javascript
// client/vite.config.js
// Source: Context7 /vitejs/vite — proxy docs + tailwindcss.com/docs/installation
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // NO rewrite: /api/* stays as /api/* — Express mounts routes at /api
      },
    },
  },
});
```

**Critical detail — no `rewrite` for `/api` proxy:** Express already mounts routes at `/api` (see `app.use('/api', routes)`). If `rewrite` were added to strip `/api`, requests would hit `http://localhost:3000/ai/chat` instead of `http://localhost:3000/api/ai/chat` and 404. [VERIFIED: cross-checked against src/server.js line 18]

**Critical detail — WSL file watching:** This project runs on WSL2 (confirmed from OS: `Linux 6.6.87.2-microsoft-standard-WSL2`). Vite's default file watcher uses inotify which works correctly on WSL2 for files on the Linux filesystem. No `usePolling` needed unless `client/` is mounted on a Windows drive path (e.g., `/mnt/c/...`). Since the project is under `/home/lehiep/`, the default watcher is sufficient. [ASSUMED — based on training knowledge of WSL2 behavior; verify if HMR feels sluggish]

---

### Pattern 3: Tailwind CSS v4 Setup (in `client/`)

**What:** Install `tailwindcss` + `@tailwindcss/vite` into client; configure CSS entry file.
**When to use:** After scaffold and vite.config.js is updated.

```bash
# Source: tailwindcss.com/docs/installation
cd client
npm install tailwindcss @tailwindcss/vite
```

**`client/src/index.css`** — replace entire file contents:
```css
/* Source: tailwindcss.com/docs/installation + tailwindcss.com/docs/dark-mode */
@import "tailwindcss";

/* Enable class-based dark mode (D-05: dark by default) */
@custom-variant dark (&:where(.dark, .dark *));

/* Dark theme base tokens matching Claude/ChatGPT aesthetic */
@layer base {
  html {
    @apply bg-gray-950 text-gray-100;
  }
}
```

**`client/index.html`** — add `class="dark"` to `<html>` tag:
```html
<!doctype html>
<html lang="en" class="dark">
  <head>
    <!-- ...existing meta tags... -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Key Tailwind v4 changes from v3:**
- No `tailwind.config.js` needed — all config lives in CSS via `@theme`
- No `@tailwind base/components/utilities` directives — replaced by `@import "tailwindcss"`
- Dark mode class strategy requires `@custom-variant dark (&:where(.dark, .dark *))` — without this, `dark:` prefixed classes are compiled but the variant condition never fires
- The `@tailwindcss/vite` plugin handles all PostCSS processing internally — no `postcss.config.js` needed
[VERIFIED: tailwindcss.com/docs/installation, tailwindcss.com/docs/dark-mode]

---

### Pattern 4: `src/db.js` — SQLite Module

**What:** CommonJS module that creates `data/` directory if missing, initializes better-sqlite3, enables WAL mode, creates all tables, exports the db instance.
**When to use:** Created once; required in `src/server.js` at startup.

```javascript
// src/db.js
// Source: Context7 /wiselibs/better-sqlite3 — README + performance docs
'use strict';

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Auto-create data/ directory if it doesn't exist (D-discretion)
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'chat.db');
const db = new Database(dbPath);

// WAL mode: better concurrent read performance for web apps
// Source: github.com/wiselibs/better-sqlite3/blob/master/docs/performance.md
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// INFRA-02: sessions table — used by Phase 2 (SESS-01..05)
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL DEFAULT 'New Chat',
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

// INFRA-02: messages table — used by Phase 3 (CHAT-01..04)
// ON DELETE CASCADE ensures messages are removed when session is deleted
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    role       TEXT    NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content    TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

// INFRA-02: config table — used by Phase 4 (CFG-01..05)
// Key-value store; Phase 4 seeds: ai_base_url, ai_api_key, ai_model
db.exec(`
  CREATE TABLE IF NOT EXISTS config (
    key        TEXT PRIMARY KEY,
    value      TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

module.exports = db;
```

**`src/server.js` — require db at startup** (add after `dotenv.config()`):
```javascript
// Add as line 2 in src/server.js, after require('dotenv').config()
require('./db'); // initializes DB and creates tables on first run
```

---

### Pattern 5: Express Static Serving + SPA Catch-All (Express 5)

**What:** Serve the Vite build output as static files; redirect all non-API, non-file requests to `index.html` for React Router.
**When to use:** Add to `src/server.js` AFTER all `app.use('/api', ...)` mounts, BEFORE `app.listen`.

```javascript
// src/server.js additions — production static serving
// Source: Context7 /expressjs/express + github.com/expressjs/express/issues/6711
const path = require('path');

// ONLY serve static files in production to avoid conflict with Vite dev server
if (process.env.NODE_ENV === 'production') {
  // Serve Vite build output
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

  // SPA catch-all: return index.html for any unmatched route
  // Express 5 wildcard syntax: /{*splat} (app.get('*') no longer works in Express 5)
  // Source: github.com/expressjs/express/issues/6711 — confirmed /{*splat} works
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}
```

**Express 5 breaking change — critical:** The old `app.get('*', ...)` syntax raises a `TypeError` in Express 5 due to stricter path-to-regexp parsing. The correct catch-all syntax is `'/{*splat}'`. This was verified by running the Express 5.2.1 module directly:
```
/{*splat} — confirmed working in Express 5.2.1 [VERIFIED: runtime test on express@5.2.1]
```

**Why `NODE_ENV === 'production'` guard:** In dev mode, the Vite dev server handles the frontend. Without the guard, `express.static` would serve stale files from `client/dist` (if it exists) instead of letting Vite serve live files on port 5173.

**Route ordering constraint:** `app.use('/api', routes)` MUST remain before the static/catch-all block. Express evaluates middleware in order; if static serving came first, a request for `/api/ai/chat` could potentially match a static file with that path. [VERIFIED: src/server.js confirmed — api routes are already mounted before listen]

---

### Pattern 6: Package.json Scripts Update

**What:** Replace the current `dev` script with a concurrently-based one; add `build` script.

```json
{
  "scripts": {
    "start": "NODE_ENV=production node src/server.js",
    "dev": "concurrently --kill-others-on-fail --names \"API,WEB\" -c \"cyan,magenta\" \"nodemon src/server.js\" \"npm run client:dev\"",
    "client:dev": "cd client && npm run dev",
    "client:build": "cd client && npm run build",
    "build": "npm run client:build",
    "lint": "eslint \"src/**/*.js\"",
    "lint:fix": "eslint \"src/**/*.js\" --fix",
    "format": "prettier --write \"src/**/*.js\""
  }
}
```

**`--kill-others-on-fail`** kills the other process only when one exits with a non-zero code (error). This is preferable to `--kill-others` which kills on ANY exit (including clean Ctrl+C of one process killing the other).
[VERIFIED: Context7 /open-cli-tools/concurrently — terminating docs]

**`NODE_ENV=production` in start script** enables the static serving block added to `server.js`. In dev mode (`npm run dev`), `NODE_ENV` is not set (or set to `development`), so the static block is skipped and Vite handles the frontend.

---

### Anti-Patterns to Avoid

- **Using `app.get('*', ...)` in Express 5:** Throws `TypeError: Missing parameter name` — use `'/{*splat}'` instead.
- **Adding `rewrite` to Vite proxy for `/api`:** Strips the `/api` prefix before forwarding to Express, causing 404s since Express routes are mounted at `/api`.
- **Tailwind v3 directives in v4 project:** `@tailwind base`, `@tailwind components`, `@tailwind utilities` do not exist in v4 — use `@import "tailwindcss"`.
- **Omitting `@custom-variant dark` declaration:** Without it, `dark:bg-gray-900` classes are generated but the selector condition never matches, so dark mode does nothing.
- **Requiring `better-sqlite3` without creating `data/` first:** better-sqlite3 does NOT auto-create intermediate directories; `new Database('data/chat.db')` fails with `SQLITE_CANTOPEN` if `data/` doesn't exist.
- **Putting static serving before API routes:** Express serves middleware in order; static middleware before `/api` routes can shadow API paths if a file happens to match.
- **Using `process.cwd()` for path resolution in server.js:** Process cwd depends on where the server is started from; `path.join(__dirname, '..', 'client', 'dist')` is reliable since `__dirname` = `src/`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Parallel dev processes | Custom shell scripts, & backgrounding | `concurrently` | Cross-platform (Windows compatible), colored output, clean process management, `--kill-others-on-fail` |
| Tailwind CSS dark theme | Custom CSS variables + JS toggle | Tailwind v4 `@custom-variant dark` + `class="dark"` | Handles specificity, generates all `dark:` variants at build time |
| SQLite directory creation | Custom recursive mkdir | `fs.mkdirSync(path, { recursive: true })` | Node built-in, idempotent, throws only on real errors |
| SPA routing fallback | Custom Express middleware checking file existence | `express.static` + `app.get('/{*splat}', sendFile)` | Express.static handles cache headers, content-type, range requests automatically |

**Key insight:** The Vite proxy completely eliminates the need for CORS configuration in development. All `fetch('/api/...')` calls in React code work in both dev (proxied through Vite to Express) and production (served by Express directly) without changing any URL.

---

## Common Pitfalls

### Pitfall 1: better-sqlite3 Native Build on Node 24
**What goes wrong:** `npm install better-sqlite3` triggers compilation from source (no prebuilt binary for Node 24 ABI 137), showing a long `node-gyp` build log. Developers may think it's hung or broken.
**Why it happens:** better-sqlite3 v12.x has prebuilt binaries for Node 20/22 but the prebuilt binary for Node 24 (N-API/ABI 137) has had gaps. [VERIFIED: github.com/WiseLibs/better-sqlite3/issues/1384 — issue closed, but build from source is the reliable path]
**How to avoid:** Expect a 30-60 second install. Build toolchain is confirmed present (python3, gcc, make, node-gyp). Install completes successfully; just takes longer than pure-JS packages.
**Warning signs:** If install fails, check `npm install better-sqlite3 --verbose` — most failures are missing `python3` or `make`. Both confirmed available on this machine.

### Pitfall 2: Express 5 Wildcard Route Syntax
**What goes wrong:** Copying any Express 4 SPA catch-all example (e.g., `app.get('*', ...)` or `app.get('/*', ...)`) throws `TypeError: Missing parameter name at 1`.
**Why it happens:** Express 5 uses stricter path-to-regexp v8 which requires named parameters in wildcards.
**How to avoid:** Always use `app.get('/{*splat}', ...)` in Express 5. [VERIFIED: runtime test on express@5.2.1 in this project]
**Warning signs:** Server starts but any non-API route in production returns 500 with path-to-regexp error in logs.

### Pitfall 3: Tailwind v4 Dark Mode Not Firing
**What goes wrong:** `dark:bg-gray-900` classes appear in the HTML but dark styling never applies, even with `class="dark"` on `<html>`.
**Why it happens:** Tailwind v4 doesn't include the class-based dark variant by default — you must explicitly declare `@custom-variant dark (&:where(.dark, .dark *))` in your CSS.
**How to avoid:** Add the `@custom-variant dark` declaration immediately after `@import "tailwindcss"` in `index.css`. [VERIFIED: tailwindcss.com/docs/dark-mode]
**Warning signs:** Browser dev tools show `dark:*` classes present in DOM but no matching CSS rules in computed styles.

### Pitfall 4: Vite Build Output vs Express Static Path Mismatch
**What goes wrong:** Production `npm start` serves a blank page or 404 for all assets.
**Why it happens:** `vite build` runs from inside `client/` (default `outDir: 'dist'`), producing `client/dist/`. Express must point to `path.join(__dirname, '..', 'client', 'dist')` from `src/server.js`. If `__dirname` is misunderstood, the path is wrong.
**How to avoid:** Always use `path.join(__dirname, '..', 'client', 'dist')` — `__dirname` in `src/server.js` is `/project/src`, so `..` resolves to project root, then `client/dist`. [VERIFIED: Node.js runtime path test]
**Warning signs:** `express.static` logs or 404 responses for `/assets/index-*.js` in production.

### Pitfall 5: Concurrent Servers Port Conflict
**What goes wrong:** Running `npm run dev` twice leaves orphaned nodemon or Vite processes; second run fails with `EADDRINUSE`.
**Why it happens:** `--kill-others-on-fail` only kills on error exit, not on Ctrl+C of the other process.
**How to avoid:** Always Ctrl+C the `concurrently` parent process to kill both children. If orphaned, `lsof -ti:3000 | xargs kill` and `lsof -ti:5173 | xargs kill`.
**Warning signs:** `Error: listen EADDRINUSE: address already in use :::3000`.

---

## Code Examples

### Complete `src/db.js`
```javascript
// Source: Context7 /wiselibs/better-sqlite3 README + performance docs
'use strict';

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'chat.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL DEFAULT 'New Chat',
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    role       TEXT    NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content    TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS config (
    key        TEXT PRIMARY KEY,
    value      TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

module.exports = db;
```

### SQLite Schema Design Rationale
- `sessions.updated_at` — updated by Phase 2 queries when a message is added; enables "recent chats" ordering
- `messages.role CHECK(role IN ('user', 'assistant', 'system'))` — enforces LLM message format at DB level; prevents bad data from Phase 3 writes
- `messages.session_id REFERENCES sessions(id) ON DELETE CASCADE` — deleting a session (Phase 2 SESS-05) automatically removes its messages; no orphan cleanup needed
- `config` key-value pattern — `ai_base_url`, `ai_api_key`, `ai_model` stored as separate rows; Phase 4 reads all three with one `SELECT * FROM config`
- `TEXT` for timestamps (SQLite datetime strings) — simpler than REAL/INTEGER epoch; readable in DB browser tools; SQLite datetime() function produces ISO 8601

### Verify DB Initialization (manual test)
```bash
node -e "const db = require('./src/db'); console.log(db.prepare('SELECT name FROM sqlite_master WHERE type=\"table\"').all())"
# Expected output: [ { name: 'sessions' }, { name: 'messages' }, { name: 'config' } ]
```

### Verify AI Endpoint (INFRA-03 check)
```bash
curl -s -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"ping"}' | head -c 100
# Expected: SSE stream starting with "data:" or error JSON (not 404/500 routing error)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3: `tailwind.config.js` + PostCSS | Tailwind v4: `@import "tailwindcss"` + `@tailwindcss/vite` plugin | Tailwind v4.0 (Jan 2025) | No config file; `@custom-variant` replaces `darkMode: 'class'` config key |
| Express 4: `app.get('*', ...)` catch-all | Express 5: `app.get('/{*splat}', ...)` | Express 5.0 (Sep 2024) | Existing v4 catch-all patterns throw TypeError in v5 |
| `@vitejs/plugin-react` v4-v5 used Babel | v6 uses Oxc transformer | Vite 8 / plugin-react v6 (2025) | Faster transforms; `reactCompilerPreset` via `@rolldown/plugin-babel` for compiler users |
| `concurrently` `npm:script-name` shorthand | Still valid in v9 | — | `npm:dev-server` syntax still works as alternative to quoting full commands |

**Deprecated/outdated:**
- `@tailwind base` / `@tailwind components` / `@tailwind utilities` directives: Removed in v4. Use `@import "tailwindcss"`.
- `darkMode: 'class'` in `tailwind.config.js`: Config file doesn't exist in v4. Use `@custom-variant dark`.
- `app.get('*', handler)` in Express 5: Throws. Use `app.get('/{*splat}', handler)`.
- `better-sqlite3` v11.x: Does not include Node 24 prebuilt binaries. Use v12.x.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | WSL2 inotify file watching works for Vite HMR without `usePolling` since project is on Linux filesystem at `/home/lehiep/` | Pattern 2 (vite.config.js) | HMR feels sluggish or doesn't trigger; fix: add `server: { watch: { usePolling: true } }` to vite.config.js |

**One assumption total.** All other claims verified via npm registry, runtime tests, or official documentation.

---

## Open Questions

1. **Does `client/dist/` need to be gitignored?**
   - What we know: Build artifacts are typically gitignored; `client/dist/` is generated by `vite build`
   - What's unclear: Whether the project already has a `.gitignore` with a `dist` entry
   - Recommendation: Add `client/dist/` and `data/` to `.gitignore` if not already present; planner should include this as a task

2. **Should `NODE_ENV=production` be set in `.env` for the start script?**
   - What we know: The `start` script in the updated `package.json` uses `NODE_ENV=production node src/server.js`
   - What's unclear: Cross-platform compatibility — `NODE_ENV=production` syntax doesn't work on Windows CMD (only bash/zsh). The project is confirmed running on WSL2/Linux so this is fine, but if Windows deployment is needed, `cross-env` would be required.
   - Recommendation: WSL2-only confirmed; `NODE_ENV=production` prefix is sufficient.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All | ✓ | v24.13.0 | — |
| npm | Package management | ✓ | 11.13.0 | — |
| python3 | better-sqlite3 native build | ✓ | 3.12.3 | — |
| gcc | better-sqlite3 native build | ✓ | 13.3.0 | — |
| make | better-sqlite3 native build | ✓ | 4.3 | — |
| node-gyp | better-sqlite3 native build | ✓ | (system) | — |
| .env with AI vars | INFRA-03 (existing endpoint) | ✓ | — | — |
| client/ directory | Vite scaffold target | ✗ (expected) | — | Created by scaffold |
| data/ directory | SQLite db file | ✗ (expected) | — | Auto-created by src/db.js |

**Missing dependencies with no fallback:** None — all blocking dependencies confirmed present.

**Missing dependencies with fallback:** None — the two missing directories (`client/`, `data/`) are intentionally absent pre-scaffold/pre-first-run.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None currently — no test infrastructure exists |
| Config file | None — Wave 0 gap |
| Quick run command | `node -e "require('./src/db')"` (smoke test: DB init) |
| Full suite command | Manual: curl + browser check (see below) |

No automated test framework is present in this project (`tests/`, `__tests__/`, `*.test.*` files absent; no jest/vitest config). Phase 1 validation is smoke-test based — the three INFRA requirements have clear observable outcomes that can be verified with a small number of manual or scripted checks.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | Notes |
|--------|----------|-----------|-------------------|-------|
| INFRA-01 (dev) | Vite dev server starts on :5173 | smoke | `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173` → 200 | Run after `npm run dev` |
| INFRA-01 (dev) | Express starts on :3000 | smoke | `curl -s http://localhost:3000/health` → `{"status":"ok"}` | Run after `npm run dev` |
| INFRA-01 (prod) | Express serves client/dist | smoke | `NODE_ENV=production node src/server.js` then `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → 200 | Requires `npm run build` first |
| INFRA-02 | DB file created at data/chat.db | smoke | `ls -la data/chat.db` → file exists after first `node src/server.js` | |
| INFRA-02 | All 3 tables exist | smoke | `node -e "const db=require('./src/db'); console.log(db.prepare('SELECT name FROM sqlite_master WHERE type=\"table\"').all())"` → 3 tables | |
| INFRA-03 | POST /api/ai/chat still responds | smoke | `curl -s -X POST http://localhost:3000/api/ai/chat -H 'Content-Type: application/json' -d '{"message":"hi"}' \| head -c 50` → SSE data or expected error (not 404) | |

### Sampling Rate
- **Per task commit:** Run the INFRA-02 DB table check after `src/db.js` is created
- **Per wave merge:** Run all 6 smoke checks above in sequence
- **Phase gate:** All 6 checks pass before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tests/smoke.sh` — shell script running all 6 curl/node checks above (covers all INFRA reqs)

*(No test framework installation needed for Phase 1 — smoke tests use Node.js and curl, both available. A proper test framework setup is deferred to a later phase when there is application logic to unit test.)*

---

## Security Domain

> Phase 1 is infrastructure-only (no auth, no user input handling, no secrets management added). Security domain minimal.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Not in scope — single-user local tool |
| V3 Session Management | No | DB sessions are chat sessions, not auth sessions |
| V4 Access Control | No | Single-user, no roles |
| V5 Input Validation | Partial | SQLite `CHECK(role IN (...))` constraint; no user-facing input in Phase 1 |
| V6 Cryptography | No | No secrets handled in Phase 1 |

### Known Threat Patterns for Phase 1 Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| SQLite injection via schema | Tampering | Schema uses template literals with no user input; safe at initialization time |
| .env file exposure | Information Disclosure | .env already present, not added to git; `data/chat.db` should be gitignored |
| Express catch-all serving sensitive files | Information Disclosure | `express.static` only serves `client/dist/` (build artifacts, no secrets); API routes take precedence |

---

## Sources

### Primary (HIGH confidence)
- Context7 `/vitejs/vite` — proxy config, react plugin, create-vite scaffold commands, build output, vite.config.js structure
- Context7 `/wiselibs/better-sqlite3` — initialization pattern, WAL mode pragma, CommonJS require syntax
- Context7 `/open-cli-tools/concurrently` — kill-others-on-fail flag, named prefixes, color options
- Context7 `/expressjs/express` — express.static pattern, route ordering
- `https://tailwindcss.com/docs/installation` — Tailwind v4 @tailwindcss/vite plugin setup, @import "tailwindcss" directive
- `https://tailwindcss.com/docs/dark-mode` — @custom-variant dark declaration for class-based dark mode
- npm registry (live query 2026-04-25) — all package versions verified

### Secondary (MEDIUM confidence)
- `https://github.com/expressjs/express/issues/6711` — Express 5 wildcard route `/{*splat}` syntax (cross-verified with runtime test)
- `https://github.com/WiseLibs/better-sqlite3/issues/1384` — Node 24 prebuilt binary gap confirmed; v12.x resolves; build from source confirmed on this machine

### Tertiary (LOW confidence — not used for decisions)
- WebSearch results on concurrently + Vite + nodemon patterns (confirmed by Context7 primary sources)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions confirmed via live npm registry queries
- Architecture: HIGH — verified against actual source files (server.js, routes/index.js, package.json)
- Pitfalls: HIGH — Express 5 wildcard verified by runtime test; Tailwind v4 dark mode verified by official docs; better-sqlite3 Node 24 issue verified by GitHub issue tracking
- Validation: HIGH — smoke tests use available tools (node, curl), no framework installation required

**Research date:** 2026-04-25
**Valid until:** 2026-07-25 (90 days — Vite 8 and Tailwind 4 are stable releases; Express 5 is stable; better-sqlite3 v12 node 24 support is confirmed)
