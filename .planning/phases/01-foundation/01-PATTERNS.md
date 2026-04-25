# Phase 1: Foundation - Pattern Map

**Mapped:** 2026-04-25
**Files analyzed:** 10 (4 new backend/config + 5 new frontend + 1 new test script)
**Analogs found:** 7 / 10

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/db.js` | service/utility | CRUD (init) | `src/utils/httpClient.js` | role-match |
| `src/server.js` | config (modify) | request-response | `src/server.js` itself | exact (self) |
| `package.json` | config (modify) | — | `package.json` itself | exact (self) |
| `client/vite.config.js` | config | — | none in codebase | no analog |
| `client/index.html` | config | — | none in codebase | no analog |
| `client/src/index.css` | config | — | none in codebase | no analog |
| `client/src/App.jsx` | component | request-response | none in codebase | no analog |
| `client/src/main.jsx` | config (entry) | — | none in codebase | no analog |
| `.gitignore` | config (modify) | — | `.gitignore` itself | exact (self) |
| `tests/smoke.sh` | test (utility) | request-response | none in codebase | no analog |

---

## Pattern Assignments

### `src/db.js` (service/utility, CRUD init)

**Analog:** `src/utils/httpClient.js`

**Imports pattern** (httpClient.js lines 1):
```javascript
const axios = require('axios');
```
Apply the same CommonJS `require` top-of-file pattern. `src/db.js` opens with:
```javascript
'use strict';
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
```

**Core module pattern** (httpClient.js lines 1-9 — instance creation and configuration):
```javascript
const apiClient = axios.create({
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});
```
Mirror this "create-and-configure-before-export" approach. For db.js:
```javascript
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, 'chat.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
```

**Error handling pattern** (httpClient.js lines 13-29 — try/catch, typed error branches):
```javascript
async function doRequest(config) {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      const errorMsg = error.response.data?.error?.message || ...;
      throw new Error(`API Error (${error.response.status}): ${errorMsg}`);
    } else if (error.request) {
      throw new Error(`No response from server: ${error.message}`);
    } else {
      throw new Error(`Request setup error: ${error.message}`);
    }
  }
}
```
`src/db.js` initialization runs synchronously (better-sqlite3 is sync) so no try/catch is needed at module level — initialization errors propagate naturally and crash the process on startup, which is the correct behavior for a missing DB setup.

**Export pattern** (httpClient.js lines 53-57):
```javascript
module.exports = {
  apiClient,
  doRequest,
  doStreamRequest,
};
```
`src/db.js` exports a single instance (not an object of functions):
```javascript
module.exports = db;
```
This matches the "export the constructed artifact" pattern used in httpClient when only one thing is needed.

---

### `src/server.js` (modify — Express entry point)

**Analog:** `src/server.js` (self — adding to existing file)

**Current file structure** (lines 1-23 — full file, small):
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'fb-insight-agent' });
});

// API Routes
app.use('/api', routes);

app.listen(port, () => {
  console.log(`Agent backend listening on http://localhost:${port}`);
  console.log('Available routes: GET /health, POST /api/ai/chat, GET /api/facebook/page/:id');
});
```

**Two additions required:**

Addition 1 — DB initialization (insert at line 2, after `require('dotenv').config()`):
```javascript
require('./db'); // initializes SQLite and creates tables on first run
```

Addition 2 — Production static serving (insert after `app.use('/api', routes)` at line 18, before `app.listen`):
```javascript
const path = require('path');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
  // Express 5 catch-all syntax: /{*splat} — app.get('*') throws TypeError in Express 5
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}
```

**Route ordering constraint:** The existing `app.use('/api', routes)` line (line 18) MUST stay before the static block. Do not reorder.

---

### `package.json` (modify — scripts and dependencies)

**Analog:** `package.json` (self — adding to existing file)

**Current scripts block** (lines 6-11):
```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "lint": "eslint \"src/**/*.js\"",
  "lint:fix": "eslint \"src/**/*.js\" --fix",
  "format": "prettier --write \"src/**/*.js\""
}
```

**Replace with:**
```json
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
```

**Current dependencies block** (lines 13-20):
```json
"dependencies": {
  "axios": "^1.15.2",
  "cors": "^2.8.6",
  "dotenv": "^17.4.2",
  "express": "^5.2.1",
  "otplib": "^13.4.0",
  "puppeteer": "^24.42.0"
}
```
Add `"better-sqlite3": "^12.9.0"` and `"concurrently": "^9.2.1"` to dependencies (not devDependencies — concurrently is used in the start/dev scripts that may run in CI/prod environments).

Note: `vite`, `@vitejs/plugin-react`, `tailwindcss`, and `@tailwindcss/vite` belong in `client/package.json` (the scaffolded Vite project), NOT in the root `package.json`.

---

### `client/vite.config.js` (new — Vite config)

**No codebase analog** — this is the first Vite config in the project.

Use the pattern from RESEARCH.md Pattern 2 verbatim:
```javascript
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
        // NO rewrite: /api/* must stay as /api/* — Express mounts at /api
      },
    },
  },
});
```

This file uses ES module syntax (`import`/`export`) because `client/package.json` (scaffolded by Vite) has `"type": "module"`. The root `package.json` does NOT have `"type": "module"` (CommonJS), so this ES module file must stay inside `client/`.

---

### `client/index.html` (new — HTML entry)

**No codebase analog** — first HTML file in the project.

Critical requirement: `class="dark"` on the `<html>` element (D-05, enables Tailwind dark: variant via the `@custom-variant dark` declaration in index.css):
```html
<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MMO Agent</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

The scaffolded `index.html` from `npm create vite@latest` will have `<html lang="en">` — the planner must add `class="dark"` before the scaffold output is considered complete.

---

### `client/src/index.css` (new — Tailwind CSS entry)

**No codebase analog** — first CSS file with Tailwind in the project.

Replace scaffolded contents entirely (RESEARCH.md Pattern 3). Tailwind v4 uses `@import "tailwindcss"` — the old `@tailwind base/components/utilities` directives do not exist in v4:
```css
@import "tailwindcss";

/* Enable class-based dark mode (D-05) */
/* Without this declaration, dark: prefixed classes compile but never fire */
@custom-variant dark (&:where(.dark, .dark *));

@layer base {
  html {
    @apply bg-gray-950 text-gray-100;
  }
}
```

---

### `client/src/App.jsx` (new — React root component)

**No codebase analog** — first React component in the project.

This is a minimal placeholder shell. Pattern intent: dark background fills the viewport, visually confirming dark theme is active. No existing component analog in codebase to copy from — derive from RESEARCH.md D-05 (dark, ChatGPT-like aesthetic):
```jsx
function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
      <p className="text-gray-400 text-sm">MMO Agent — Phase 1 scaffold</p>
    </div>
  );
}

export default App;
```

No imports needed beyond the implicit React 19 JSX transform (no `import React from 'react'` required).

---

### `client/src/main.jsx` (new — React DOM entry)

**No codebase analog** — first React DOM mount in the project.

Standard React 19 + Vite entry pattern. CSS import goes here so Vite includes it in the build:
```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

---

### `.gitignore` (modify — add two entries)

**Analog:** `.gitignore` (self — appending to existing file)

**Current contents:** node_modules/, dist/, build/, .env variants, logs, editor/OS files (lines 1-24).

Note: The existing `dist/` entry (line 6) is a root-level glob and does NOT cover `client/dist/` by default in all git implementations. Add explicit entries to be unambiguous:

Append to end of existing `.gitignore`:
```
# SQLite database (auto-created by src/db.js)
data/

# Vite build output
client/dist/
```

---

### `tests/smoke.sh` (new — shell smoke test)

**No codebase analog** — no existing test files in the project.

Six checks corresponding to the INFRA-01/02/03 requirements from RESEARCH.md Validation Architecture section. Pattern: sequential curl/node one-liners, each with an expected output comment, exit-on-first-failure behavior:

```bash
#!/usr/bin/env bash
# tests/smoke.sh — Phase 1 smoke checks (INFRA-01, INFRA-02, INFRA-03)
# Run after: npm run dev (background) or node src/server.js (background)
set -e

BASE_URL="http://localhost:3000"

echo "=== INFRA-01: Express health check ==="
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
[ "$STATUS" = "200" ] && echo "PASS: /health → 200" || (echo "FAIL: /health → $STATUS" && exit 1)

echo "=== INFRA-02: DB file exists ==="
[ -f "data/chat.db" ] && echo "PASS: data/chat.db exists" || (echo "FAIL: data/chat.db not found" && exit 1)

echo "=== INFRA-02: All 3 tables exist ==="
TABLE_COUNT=$(node -e "const db=require('./src/db'); console.log(db.prepare('SELECT count(*) as n FROM sqlite_master WHERE type=\"table\"').get().n)")
[ "$TABLE_COUNT" = "3" ] && echo "PASS: 3 tables found" || (echo "FAIL: expected 3 tables, got $TABLE_COUNT" && exit 1)

echo "=== INFRA-03: POST /api/ai/chat responds (not 404) ==="
AI_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/ai/chat" \
  -H 'Content-Type: application/json' -d '{"message":"ping"}')
[ "$AI_STATUS" != "404" ] && echo "PASS: /api/ai/chat → $AI_STATUS (not 404)" || (echo "FAIL: /api/ai/chat → 404" && exit 1)

echo "=== All smoke checks passed ==="
```

Note: INFRA-01 Vite check (`curl http://localhost:5173`) is omitted from this script because Vite runs as a separate process only in dev mode. The script tests Express-side requirements that are always verifiable when the backend is running.

---

## Shared Patterns

### CommonJS Module Structure
**Source:** `src/utils/httpClient.js` (all lines)
**Apply to:** `src/db.js`

Pattern: `'use strict'` declaration + `require()` imports at top + construct/configure artifact + `module.exports` at bottom. No async at module initialization level. All new backend files follow this CommonJS structure — no `import`/`export` in `src/`.

```javascript
// Top of every new src/ file:
'use strict';
const dependency = require('dependency-name');
// ... local requires ...

// Construction and configuration ...

module.exports = exportedValue; // or { named, exports }
```

### Error Response Format
**Source:** `src/controllers/facebookController.js` (lines 16, 30, 42) and `src/controllers/aiChatController.js` (line 8)
**Apply to:** Any future controllers in Phase 2+

All existing controllers return errors as:
```javascript
res.status(500).json({ success: false, error: error.message });
// or for 401:
res.status(401).json({ success: false, error: 'Missing FB Page Access Token' });
```
Success responses use `res.json({ success: true, data })`. The `src/db.js` module does not return HTTP responses — but Phase 2+ session/message controllers MUST follow this same `{ success: false, error: message }` / `{ success: true, data }` pattern.

### Try/Catch in Controllers
**Source:** `src/controllers/aiChatController.js` (lines 3-10)
**Apply to:** All future controller functions

```javascript
async function handleChat(req, res) {
  try {
    const result = await service(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

Pattern: every exported handler is `async`, wraps the service call in `try/catch`, and returns `{ success: false, error: error.message }` on catch. No global error middleware — per-handler catch is the established pattern.

### Path Resolution in src/ Files
**Source:** Pattern implied by `src/server.js` (uses relative `require('./routes')`)
**Apply to:** `src/db.js`

Files in `src/` use `__dirname` for filesystem paths to be independent of process working directory:
```javascript
path.join(__dirname, '..', 'data') // resolves to project-root/data/ from src/db.js
path.join(__dirname, '..', 'client', 'dist') // resolves to project-root/client/dist/ from src/server.js
```
Never use `process.cwd()` — it depends on where the process is started from.

---

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `client/vite.config.js` | config | — | No frontend/Vite config exists yet |
| `client/index.html` | config | — | No HTML entry files exist in the project |
| `client/src/index.css` | config | — | No CSS files exist; no Tailwind in project |
| `client/src/App.jsx` | component | — | No React components exist yet |
| `client/src/main.jsx` | config/entry | — | No React DOM mount exists yet |
| `tests/smoke.sh` | test | request-response | No test files of any kind exist in this project |

All 6 no-analog files belong to the `client/` scaffold or test layer. Use RESEARCH.md Patterns 2, 3, and Validation Architecture section respectively for these files.

---

## Metadata

**Analog search scope:** `src/` (all files), `package.json`, `.gitignore`
**Files scanned:** 8 (server.js, routes/index.js, controllers/aiChatController.js, controllers/facebookController.js, utils/httpClient.js, services/ directory listing, package.json, .gitignore)
**Pattern extraction date:** 2026-04-25

**Key version constraints extracted from codebase:**
- Express version: `^5.2.1` — wildcard catch-all MUST use `/{*splat}` syntax (NOT `*` or `/*`)
- No `"type": "module"` in root `package.json` — all `src/` files MUST use CommonJS (`require`/`module.exports`)
- Prettier config (from package.json devDependencies): semi=true, singleQuote=true, printWidth=120, 2-space indent — enforced via eslint-plugin-prettier
