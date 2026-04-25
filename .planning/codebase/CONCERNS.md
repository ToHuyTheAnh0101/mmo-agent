# Codebase Concerns

**Analysis Date:** 2026-04-25

## Tech Debt

### Massive Puppeteer Overhead

- **Issue:** Each login spawns a full Chromium browser instance (~100MB+ memory), never reused
- **Files:** `src/services/fbAutomationService.js` (334 lines in single function)
- **Impact:** High memory consumption, slow startup, poor scalability
- **Fix approach:** Implement browser pool/instance reuse, or migrate to lighter-weight approach (Facebook Graph API only, no UI automation)

### Single Responsibility Violation

- **Issue:** `loginAndGetToken()` is 334 lines mixing browser setup, navigation, 2FA handling, checkpoint resolution, token extraction
- **Files:** `src/services/fbAutomationService.js:9-330`
- **Impact:** Difficult to test, debug, or modify; high cognitive load
- **Fix approach:** Split into: `setupBrowser()`, `handleLogin()`, `handle2FA()`, `handleCheckpoint()`, `extractToken()`

### Runtime Environment Pollution

- **Issue:** Writing Facebook token to `process.env.FB_USER_ACCESS_TOKEN` at runtime
- **Files:** `src/controllers/facebookController.js:80`
- **Impact:** Global mutable state, potential cross-request contamination in serverless/worker scenarios, no cleanup
- **Fix approach:** Use request-scoped context, database/cache storage with TTL, or stateless design (return token to client)

### Fragile Facebook UI Automation

- **Issue:** Puppeteer relies on CSS selectors that Facebook changes frequently; uses hardcoded `setTimeout()` delays
- **Files:** `src/services/fbAutomationService.js:64,200,222-265`
- **Impact:** Automation breaks silently or hangs; unpredictable behavior on network/UI changes
- **Fix approach:** Use Facebook's official APIs exclusively; if UI automation is unavoidable, implement explicit waits with conditions and timeouts

## Security Considerations

### Plaintext Credentials in .env

- **Risk:** Facebook credentials (FB_UID, FB_PASS, FB_2FA) and AI API key stored in .env file
- **Files:** `.env` (tracked in .gitignore but present locally)
- **Current mitigation:** .env is gitignored
- **Recommendations:**
  - Add .env.example template with placeholder values
  - Implement startup validation to detect placeholder values
  - Use secret management (AWS Secrets Manager, HashiCorp Vault) in production
  - Rotate credentials regularly

### Unvalidated Input Passed to Puppeteer

- **Risk:** User-supplied credentials from `req.body` passed directly to `loginAndGetToken()` without validation
- **Files:** `src/controllers/facebookController.js:58-77`
- **Current mitigation:** None
- **Recommendations:** Input validation (length, character set, format); rate limiting to prevent credential stuffing attacks

### CORS Enabled Globally

- **Risk:** `app.use(cors())` allows all origins by default
- **Files:** `src/server.js:9`
- **Impact:** Any website can call your API endpoints
- **Recommendations:** Configure CORS with specific allowed origins: `cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') })`

### No Rate Limiting

- **Risk:** Endpoints `/api/facebook/login` and `/api/ai/chat` are publicly accessible without throttling
- **Files:** `src/routes/facebookRoute.js:9`, `src/routes/aiChatRoute.js:6`
- **Impact:** Abuse leading to Facebook account lockouts, API cost overruns, DoS
- **Recommendations:** Implement rate limiting (e.g., `express-rate-limit`) per IP/user; particularly on login endpoint

### Token Exposure in Responses

- **Risk:** Facebook access token returned in response body to `/api/facebook/login`
- **Files:** `src/controllers/facebookController.js:82-86`
- **Impact:** Token logged in server logs, browser history, intercepted in transit if HTTPS not enforced
- **Recommendations:** Set `secure: true, httpOnly: true` if using cookies; require HTTPS; implement short-lived tokens; consider not returning tokens at all (server-side caching)

## Performance Bottlenecks

### Synchronous Delays in Async Code

- **Issue:** Multiple `setTimeout()` with arbitrary delays (2-5 seconds) blocking event loop
- **Files:** `src/services/fbAutomationService.js:64,132,200,222`
- **Problem:** Unpredictable latency, wasted CPU cycles, poor throughput
- **Improvement:** Replace with explicit waits: `await page.waitForNavigation()`, `await page.waitForSelector()`, `await page.waitForFunction()`

### No Browser Reuse

- **Issue:** `puppeteer.launch()` called on every login, `browser.close()` called on completion
- **Files:** `src/services/fbAutomationService.js:12,328`
- **Problem:** ~3-5 second startup overhead per request; high memory churn
- **Improvement:** Maintain browser pool; reuse pages; implement keep-alive strategy

### Facebook Selector Polling Loops

- **Issue:** 8-iteration loop with 1-second sleeps searching for buttons
- **Files:** `src/services/fbAutomationService.js:222-265`
- **Problem:** Worst-case 8+ seconds added latency
- **Improvement:** Single explicit wait for known element with timeout; use Facebook-specific navigation detection

### Unbounded HTTP Client

- **Issue:** `axios.create()` with default connection limit (no pool configuration)
- **Files:** `src/utils/httpClient.js:4-9`
- **Problem:** Potential connection exhaustion under load
- **Improvement:** Configure `maxConnections`, `maxTotalSockets`, enable keep-alive

### Puppeteer Node Modules Size

- **Stats:** `node_modules` = 88MB; puppeteer downloads ~100MB+ Chromium on install
- **Impact:** Slow CI/CD, large Docker images, slow cold starts
- **Improvement:** Use `puppeteer-core` + external Chrome; or eliminate puppeteer entirely if possible

## Fragile Areas

### Facebook Automation Selector Chaos

- **Files:** `src/services/fbAutomationService.js:41-45,58,141-154,180-191,230-248`
- **Why fragile:** Facebook UI class names and data-testid attributes change without notice; multiple selector fallbacks indicate known brittleness
- **Safe modification:** Never modify selector strategy without manual testing on live Facebook; add screenshot debugging already present but scattered
- **Test coverage:** None (integration test would require live FB account)

### 2FA Generation Multi-Version Support

- **Files:** `src/services/fbAutomationService.js:99-130`
- **Why fragile:** Complex branching to support multiple `otplib` API versions; fallback logic with try/catch chains
- **Risk:** Silent failure if otplib API changes; `token2fa` could be empty/invalid
- **Safe modification:** Pin otplib version and use single API; add unit test for secret→token conversion

### Hardcoded Facebook Graph Version

- **Files:** `src/services/facebookService.js:3`
- **Why fragile:** Facebook deprecates Graph API versions every 2 years; v21.0 will break without notice
- **Risk:** Service calls fail when version expires
- **Safe modification:** Make version configurable via env var; monitor Facebook deprecation schedule

### Mixed Language Comments

- **Files:** Throughout codebase
- **Why fragile:** Vietnamese comments mixed with English code hinder onboarding for non-Vietnamese developers; inconsistent documentation
- **Impact:** Knowledge silo; difficulty collaborating internationally
- **Safe modification:** Standardize on English for all code/comments

### Missing Input Validation

- **Files:** `src/controllers/facebookController.js:4-19` (GET endpoints), `src/services/facebookService.js` (all functions)
- **Why fragile:** No validation of `pageId`, `token`, `metrics`, `period`, `limit` parameters
- **Risk:** Injection attacks (though encodeURIComponent used in URLs), malformed requests, resource exhaustion
- **Safe modification:** Add validation middleware; use Joi/zod for request schema validation

## Scaling Limits

### Single-Process Express Server

- **Current:** `app.listen()` single instance; no clustering
- **Files:** `src/server.js:20-23`
- **Capacity limit:** Single CPU core; ~100-200 concurrent requests max (depending on workload)
- **Scaling path:** Add Node.js cluster mode (`cluster` module); or deploy multiple instances behind load balancer

### No Request Timeout Configuration

- **Current:** Only axios has 30s timeout; Express has no timeout
- **Files:** `src/utils/httpClient.js:5`, `src/server.js` (no timeout)
- **Capacity limit:** Clients can hold connections indefinitely; slowloris attack vector
- **Scaling path:** Set `server.timeout(30000)`, `server.headersTimeout(35000)`

### Puppeteer Cannot Scale Horizontally

- **Current:** Each login spawns full Chromium; resource-heavy
- **Files:** `src/services/fbAutomationService.js`
- **Capacity limit:** ~1-2 concurrent logins per GB RAM; not horizontally scalable due to account state
- **Scaling path:** Dedicated worker queue (Bull/Redis) with limited concurrency; separate login service

## Dependencies at Risk

### Express v5 (Beta)

- **Risk:** `express@^5.2.1` is pre-release (currently beta.3); API may change before stable
- **Files:** `package.json:17`
- **Impact:** Breaking changes in next minor version; potential runtime errors
- **Migration plan:** Pin to `express@^4.18.2` until v5 stable; or accept risk and lock to specific beta version

### Puppeteer 24.x

- **Risk:** Puppeteer versions tied to Chrome versions; Chrome auto-updates can break automation
- **Files:** `package.json:19`
- **Impact:** Unexpected breakage when Chrome updates; need to pin Chrome version
- **Migration plan:** Use `puppeteer@^23.x` with pinned Chromium; or migrate to `puppeteer-core` + system Chrome with known version

### No Production-Ready Process Manager

- **Risk:** `nodemon` in devDependencies only; no PM2, systemd, or Docker for production
- **Files:** `package.json:25`, no Dockerfile present
- **Impact:** No restart on crash, no log rotation, no graceful shutdown
- **Migration plan:** Add Dockerfile; or document PM2 deployment; implement SIGTERM handler

## Missing Critical Features

### No Request Logging

- **Problem:** No request ID, no structured logs, no request/response capture
- **Files:** Entire codebase
- **Impact:** Impossible to trace requests through services; debugging production issues is guesswork
- **Required:** Winston/Pino logger with correlation IDs; request logging middleware

### No Health Checks Beyond /health

- **Problem:** `/health` only checks server is alive; no liveness/readiness distinction, no dependency checks
- **Files:** `src/server.js:13-15`
- **Impact:** Load balancer cannot detect degraded state (e.g., Facebook API down)
- **Required:** `/health/live` (process alive), `/health/ready` (dependencies reachable)

### No Structured Error Handling

- **Problem:** Errors thrown as generic `Error` with message only; no error codes, no typed errors
- **Files:** All controllers (`res.status(500).json({ success: false, error: error.message })`)
- **Impact:** Client cannot programmatically distinguish error types; debugging requires message parsing
- **Required:** Define error classes (`ValidationError`, `ExternalAPIError`, `AuthError`) with codes and actionable messages

### No Input Sanitization

- **Problem:** `req.body`, `req.params`, `req.query` used without validation or sanitization
- **Files:** `src/controllers/facebookController.js:6,8,23,25,43`
- **Impact:** Potential NoSQL/command injection if used in shell/spawn; memory exhaustion via large payloads; type confusion
- **Required:** Validation middleware (express-validator, Joi, or zod)

### No Observability

- **Problem:** No metrics, tracing, or monitoring instrumentation
- **Files:** Entire codebase
- **Impact:** Cannot measure latency, error rates, throughput; blind to performance degradation
- **Required:** Prometheus metrics; OpenTelemetry tracing; structured logging

### No Graceful Shutdown

- **Problem:** `server.listen()` with no `SIGTERM`/`SIGINT` handlers
- **Files:** `src/server.js:20-23`
- **Impact:** In-flight requests dropped; browser processes orphaned on container stop
- **Required:** `process.on('SIGTERM', ...)` to stop accepting new requests, finish in-flight, close browsers

## Test Coverage Gaps

### Zero Unit Tests

- **What's not tested:** All business logic in `services/` (facebookService, aiChatService, fbAutomationService)
- **Files:** `src/services/*.js` (total 545 lines)
- **Risk:** Code changes break existing functionality without detection; refactoring impossible with confidence
- **Priority:** High - Core functionality with external dependencies needs mocking

### Zero Integration Tests

- **What's not tested:** API endpoints, route handlers, middleware
- **Files:** `src/controllers/*.js`, `src/routes/*.js`
- **Risk:** Contract violations, missing error handling, incorrect status codes
- **Priority:** High - API surface needs regression protection

### No E2E Tests

- **What's not tested:** Complete request→response flows; Facebook login flow
- **Impact:** Integration issues only discovered in production
- **Priority:** Medium - Requires test Facebook account and infrastructure

### No Test Configuration

- **What's missing:** No Jest/Vitest config, no test script in package.json, no test directory
- **Files:** `package.json` (no test script), no `jest.config.js` or `vitest.config.js`
- **Impact:** No testing infrastructure in place
- **Priority:** High - Foundation needed before tests can be written

### Unmockable Dependencies

- **Issue:** Puppeteer and axios used directly without abstraction layers
- **Files:** `src/services/fbAutomationService.js:1`, `src/utils/httpClient.js:1`
- **Impact:** Unit tests would require real browser or network calls; tests would be slow/brittle
- **Fix approach:** Create wrapper interfaces (`IBrowser`, `IHttpClient`) and inject dependencies for testability

---

*Concerns audit: 2026-04-25*
