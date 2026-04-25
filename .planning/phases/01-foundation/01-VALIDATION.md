---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-25
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — smoke tests only (no test framework in project) |
| **Config file** | `tests/smoke.sh` (Wave 0 creates this) |
| **Quick run command** | `node -e "const db=require('./src/db'); console.log(db.prepare('SELECT name FROM sqlite_master WHERE type=\"table\"').all())"` |
| **Full suite command** | `bash tests/smoke.sh` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node -e "require('./src/db')"` (smoke test: DB init) after src/db.js is created
- **After every plan wave:** Run `bash tests/smoke.sh` (all 6 INFRA checks)
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-db-01 | db | 1 | INFRA-02 | — | DB file at data/chat.db, no user input in schema | smoke | `ls -la data/chat.db` | ❌ W0 | ⬜ pending |
| 1-db-02 | db | 1 | INFRA-02 | — | 3 tables present (sessions, messages, config) | smoke | `node -e "const db=require('./src/db'); console.log(db.prepare('SELECT name FROM sqlite_master WHERE type=\\"table\\"').all())"` | ❌ W0 | ⬜ pending |
| 1-client-01 | client | 1 | INFRA-01 | — | Vite dev server starts on :5173 | smoke | `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173` → 200 | ❌ W0 | ⬜ pending |
| 1-server-01 | server | 1 | INFRA-01 | — | Express starts on :3000 | smoke | `curl -s http://localhost:3000/health` → {"status":"ok"} | ❌ W0 | ⬜ pending |
| 1-server-02 | server | 1 | INFRA-01 | — | Express serves client/dist in production | smoke | `NODE_ENV=production node src/server.js` then `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → 200 | ❌ W0 | ⬜ pending |
| 1-compat-01 | server | 1 | INFRA-03 | — | POST /api/ai/chat still responds (not 404) | smoke | `curl -s -X POST http://localhost:3000/api/ai/chat -H 'Content-Type: application/json' -d '{"message":"hi"}' \| head -c 50` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/smoke.sh` — shell script running all 6 curl/node checks above (covers INFRA-01, INFRA-02, INFRA-03)

*No test framework installation needed — smoke tests use Node.js and curl, both available.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Tailwind dark theme renders correctly | INFRA-01 | Visual check required | Open http://localhost:5173 in browser, verify dark background, no flash of light theme |
| `npm run dev` starts both servers | INFRA-01 | Interactive process | Run `npm run dev`, verify both nodemon and vite output appear in terminal |
| Production build served at root URL | INFRA-01 | Requires build + server restart | Run `npm run build`, then `NODE_ENV=production npm start`, visit http://localhost:3000 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
