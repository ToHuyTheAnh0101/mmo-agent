# Codebase Structure

**Analysis Date:** 2026-04-25

## Directory Layout

```
[project-root]/
├── .claude/                 # Claude Code agent configuration
├── .planning/               # GSD planning artifacts
│   └── codebase/            # Architecture/structure documentation
├── docs/                    # Project documentation (markdown)
├── node_modules/            # npm dependencies (generated)
├── src/                     # Application source code
│   ├── server.js            # Entry point: Express app setup
│   ├── routes/              # Express routers (API endpoint definitions)
│   │   ├── index.js         # Main router aggregator
│   │   ├── facebookRoute.js # Facebook API routes
│   │   └── aiChatRoute.js   # AI chat API routes
│   ├── controllers/         # Request handlers
│   │   ├── facebookController.js
│   │   └── aiChatController.js
│   ├── services/            # Business logic
│   │   ├── facebookService.js
│   │   ├── fbAutomationService.js
│   │   └── aiChatService.js
│   └── utils/               # Shared utilities
│       └── httpClient.js    # HTTP client abstraction (axios wrapper)
├── .env                     # Environment configuration (local, gitignored)
├── .eslintrc.js             # ESLint configuration
├── .prettierrc              # Prettier configuration
├── package.json             # Dependencies and scripts
├── package-lock.json        # Locked dependency versions
├── README.md                # Project documentation
└── .gitignore               # Git ignore rules
```

## Directory Purposes

**src/:**
- Purpose: All application source code
- Contains: JavaScript modules (CommonJS syntax)
- Key files: `server.js`, feature subdirectories
- Entry point: `server.js`

**src/routes/:**
- Purpose: API endpoint definitions using Express Router
- Contains: Feature-specific route files
- Pattern: One file per feature domain
- Key files: `index.js` (aggregates all routes), `facebookRoute.js`, `aiChatRoute.js`

**src/controllers/:**
- Purpose: HTTP request handlers (controller layer)
- Contains: Functions that receive req/res, call services, return responses
- Pattern: One file per feature domain matching routes
- Key files: `facebookController.js`, `aiChatController.js`

**src/services/:**
- Purpose: Business logic and external integrations (service layer)
- Contains: Pure Node.js modules with no Express dependencies
- Pattern: One file per business capability
- Key files:
  - `facebookService.js` - Facebook Graph API operations
  - `fbAutomationService.js` - Puppeteer-based Facebook automation
  - `aiChatService.js` - AI chat streaming integration

**src/utils/:**
- Purpose: Shared utilities and infrastructure code
- Contains: Reusable modules used across services
- Key files: `httpClient.js` (axios wrapper with doRequest/doStreamRequest)

**.planning/codebase/:**
- Purpose: GSD codebase analysis documents
- Contains: Architecture and structure documentation (ARCHITECTURE.md, STRUCTURE.md)
- Generated: Yes (by gsd-map-codebase)
- Committed: Yes

## Key File Locations

**Entry Points:**
- `src/server.js` - Application startup, Express initialization, route registration
- `src/routes/index.js` - Route aggregation, feature router mounting

**Configuration:**
- `package.json` - Dependencies, npm scripts
- `.eslintrc.js` - Linting rules (ES2021, Prettier integration)
- `.prettierrc` - Code formatting (semi: true, singleQuote: true, printWidth: 120)
- `.env` - Environment variables (FB tokens, AI config, PORT)

**Core Logic:**
- `src/services/facebookService.js` - Facebook API interactions
- `src/services/fbAutomationService.js` - Browser automation with Puppeteer
- `src/services/aiChatService.js` - Streaming AI chat

**Utilities:**
- `src/utils/httpClient.js` - Centralized HTTP client

**Testing:**
- No test files detected (no `*.test.js`, `*.spec.js`, `__tests__/` directory)
- Test configuration: Not present

## Naming Conventions

**Files:**
- Lowercase with camelCase for multi-word names
- Feature name first, then layer suffix:
  - `facebookRoute.js` (router)
  - `facebookController.js` (controller)
  - `facebookService.js` (service)
- Utility files: descriptive lowercase (httpClient.js)
- Entry point: `server.js` (standard name)

**Directories:**
- All lowercase: `routes`, `controllers`, `services`, `utils`
- Matches common Express/MVC patterns

**Functions:**
- camelCase (e.g., `getPageInfo`, `chatWithMergedStream`, `doRequest`)
- Descriptive verb-noun combinations for actions

**Variables:**
- camelCase for regular variables
- UPPER_SNAKE_CASE for constants (e.g., `DEFAULT_GRAPH_VERSION`, `DEFAULT_GRAPH_URL`)
- Prefix underscores for unused parameters (handled by ESLint rule)

## Where to Add New Code

**New API Endpoint (Feature):**
1. Define routes in `src/routes/[feature]Route.js` (or create new route file)
2. Create/update controller in `src/controllers/[feature]Controller.js`
3. Implement business logic in `src/services/[feature]Service.js`
4. Register router in `src/routes/index.js`
5. Add any shared utils to `src/utils/` if needed

**New Utility Function:**
- Add to existing `src/utils/httpClient.js` if HTTP-related
- Otherwise, create new file in `src/utils/` (e.g., `logger.js`, `validator.js`)
- Export and require as needed

**Service Enhancement:**
- Add new functions to existing service files in `src/services/`
- Keep services pure (no Express dependencies)
- Use `httpClient` for external API calls

**Configuration Change:**
- Update `.env` for environment variables
- Update `package.json` to add dependencies or scripts
- ESLint/Prettier config files for code quality rules

## Special Directories

**node_modules/:**
- Purpose: npm dependencies
- Generated: Yes (npm install)
- Committed: No (gitignored)

**.planning/:**
- Purpose: GSD planning artifacts
- Generated: Yes (by gsd commands)
- Committed: Yes (for reference)

**.claude/:**
- Purpose: Claude Code agent configuration
- Generated: Yes (by setup)
- Committed: Yes

**docs/:**
- Purpose: Project documentation (markdown files)
- Generated: No (manual)
- Committed: Yes

---

*Structure analysis: 2026-04-25*
