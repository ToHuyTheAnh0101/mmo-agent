# Architecture

**Analysis Date:** 2026-04-25

## Pattern Overview

**Overall:** Modified MVC (Model-View-Controller) with layered architecture

**Key Characteristics:**
- Clear separation of concerns using Express.js routers
- Thin controllers, service-heavy business logic
- Route-based feature segmentation
- Async/await pattern throughout
- Environment-based configuration
- Reusable utility layer for HTTP operations

## Layers

**Presentation Layer (Routes):**
- Purpose: Define API endpoints, URL parameters, HTTP method mapping
- Location: `src/routes/`
- Contains: Express Router instances
- Depends on: Controllers
- Used by: Server.js

**Controller Layer:**
- Purpose: Handle HTTP request/response lifecycle, input validation, call services, format responses
- Location: `src/controllers/`
- Contains: Request handler functions (async)
- Depends on: Services
- Used by: Routes
- Pattern: One controller file per feature area (facebookController.js, aiChatController.js)

**Service Layer:**
- Purpose: Business logic, external API integrations, data transformations
- Location: `src/services/`
- Contains: Pure JavaScript/Node.js modules with no Express dependencies
- Depends on: Utils
- Used by: Controllers
- Pattern: Service modules with exported async functions

**Infrastructure Layer (Utils):**
- Purpose: Shared utilities, HTTP client abstraction
- Location: `src/utils/`
- Contains: Reusable helper modules
- Depends on: External packages (axios)
- Used by: Services

## Data Flow

**Standard Request Flow:**

1. Client request → `server.js` (Express app with middleware)
2. Route matching → `src/routes/[feature]Route.js` (router)
3. Controller invocation → `src/controllers/[feature]Controller.js` (handler function)
4. Service execution → `src/services/[feature]Service.js` (business logic)
5. Response → Controller formats JSON → Express sends to client

**Example: GET /api/facebook/page/:id**

1. `src/server.js`: app.use('/api', routes)
2. `src/routes/index.js`: router.use('/facebook', facebookRoute)
3. `src/routes/facebookRoute.js`: router.get('/page/:id', facebookController.getPageInfo)
4. `src/controllers/facebookController.js`: getPageInfo() - validates token, calls service
5. `src/services/facebookService.js`: getPageInfo() - calls Facebook Graph API via httpClient
6. `src/utils/httpClient.js`: doRequest() - wraps axios with error handling
7. Response bubbles back up through layers

**AI Chat Flow (Streaming):**

1. POST /api/ai/chat → `src/routes/aiChatRoute.js`
2. `src/controllers/aiChatController.js`: handleChat() - wraps streaming in Promise
3. `src/services/aiChatService.js`: chatWithMergedStream() - handles SSE stream parsing
4. `src/utils/httpClient.js`: doStreamRequest() - manages streaming response
5. Controller resolves with accumulated text and usage stats

## State Management

**Strategy:** Stateless with environment-based configuration

- No session state in application
- State carried via request parameters, headers, or environment variables
- Temporary runtime state: `process.env.FB_USER_ACCESS_TOKEN` set after login (runtime-only)
- Configuration: dotenv loads from `.env` at startup

## Key Abstractions

**HTTP Client Abstraction:**
- Purpose: Centralized HTTP request handling with error normalization
- Implementation: `src/utils/httpClient.js`
- Provides: `doRequest()` for JSON APIs, `doStreamRequest()` for streaming
- Pattern: Wrapper around axios with unified error handling

**Service Modules:**
- Purpose: Isolate external API integrations and business logic
- Examples:
  - `src/services/facebookService.js` - Facebook Graph API wrapper
  - `src/services/fbAutomationService.js` - Puppeteer automation
  - `src/services/aiChatService.js` - AI streaming chat

**Feature-based Routing:**
- Purpose: Organize endpoints by domain (Facebook, AI)
- Pattern: `src/routes/[feature]Route.js` → `src/controllers/[feature]Controller.js` → `src/services/[feature]Service.js`
- Enables independent scaling of feature areas

## Entry Points

**Primary Entry Point:**
- Location: `src/server.js`
- Triggers: Node.js runtime starts server
- Responsibilities:
  - Initialize Express app
  - Configure middleware (CORS, JSON body parser)
  - Register routes (`/api`)
  - Start HTTP listener on PORT (env or default 3000)
  - Define health check endpoint (`/health`)

**Route Entry Point:**
- Location: `src/routes/index.js`
- Triggers: Mounted by server.js at `/api`
- Responsibilities:
  - Aggregate feature routers
  - Mount sub-routers: `/api/ai/*`, `/api/facebook/*`
- Exports: Express Router instance

## Error Handling

**Strategy:** Centralized per-request try/catch in controllers, utility-level HTTP errors

**Patterns:**
- Controllers wrap async service calls in try/catch
- Errors returned with appropriate HTTP status codes:
  - 400: Bad request (missing parameters)
  - 401: Unauthorized (missing auth token)
  - 500: Internal server error (service failures)
- HTTP client utility converts axios errors to normalized Error objects with context
- Service layer throws errors with descriptive messages; no silent failures

**Example:** `src/controllers/facebookController.js` - each handler has try/catch and returns `res.status(500).json({ success: false, error: error.message })`

## Cross-Cutting Concerns

**Logging:**
- Approach: Console.log for debugging and traceability
- Pattern: Prefix log messages with `[Component]` for source identification
- No structured logging framework (simple stdout)

**Authentication:**
- Approach: Token-based, passed via header (`x-fb-page-token`), query param, or env fallback
- Pattern: Each Facebook endpoint validates token presence before proceeding
- No middleware-level auth (per-endpoint validation in controllers)

**Validation:**
- Approach: Minimal, inline in controllers
- Required fields checked manually; missing fields return 400/401
- No validation library (Joi, Yup, Zod) detected

**CORS:**
- Configured globally in `server.js` with `cors()` middleware (default permissive)

**Configuration Management:**
- dotenv loads environment variables from `.env`
- Key env vars:
  - `PORT`
  - `FB_PAGE_ACCESS_TOKEN`
  - `FB_EMAIL`, `FB_PASS`, `FB_2FA` for automation
  - `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL` for AI chat

---

*Architecture analysis: 2026-04-25*
