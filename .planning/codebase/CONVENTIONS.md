# Coding Conventions

**Analysis Date:** 2026-04-25

## Naming Patterns

**Files:**
- Use lowerCamelCase for service files: `src/services/facebookService.js`, `src/services/aiChatService.js`, `src/services/fbAutomationService.js`
- Use lowercase for utilities and entry points: `src/utils/httpClient.js`, `src/server.js`
- Routes and controllers follow lowerCamelCase: `src/controllers/facebookController.js`, `src/routes/facebookRoute.js`

**Directories:**
- All lowercase: `src/`, `src/routes/`, `src/controllers/`, `src/services/`, `src/utils/`

**Variables & Functions:**
- camelCase for all variables, functions, and methods: `getPageInfo`, `chatWithMergedStream`, `loginAndGetToken`, `humanType`
- Destructured parameters use camelCase: `const { doRequest } = require(...)`

**Constants:**
- UPPER_SNAKE_CASE for module-level constants: `DEFAULT_GRAPH_VERSION`, `DEFAULT_GRAPH_URL`

**Classes/Constructors:**
- Not used (functional programming style)

## Code Style

**Formatting Tool:** Prettier
- Config file: `.prettierrc`
- Settings:
  - `semi: true` - All statements end with semicolons
  - `singleQuote: true` - Single quotes for strings
  - `trailingComma: es5` - Trailing commas in ES5-compatible locations (objects, arrays, etc.)
  - `printWidth: 120` - Wrap lines at 120 characters
  - `tabWidth: 2` - Indentation is 2 spaces

**Linting:** ESLint
- Config file: `.eslintrc.js`
- Extends: `eslint:recommended`, `plugin:prettier/recommended` (ensures ESLint and Prettier work together)
- Parser options: ECMAScript 2021, sourceType: module
- Key rules:
  - `no-console: off` - `console.log()` and `console.error()` allowed
  - `no-unused-vars: warn` - Warn on unused variables, with `argsIgnorePattern: '^_'` (parameters starting with underscore are ignored)

**Module System:** CommonJS (require/module.exports)
- All files use `const X = require('...')` syntax
- Exports at bottom: `module.exports = { ... }`

## Import Organization

**Pattern:**
- Imports at top of file
- Standard order:
  1. Third-party libraries (e.g., `const express = require('express')`)
  2. Internal modules (e.g., `const fbService = require('../services/facebookService')`)
- Grouped logically with blank lines between groups (observed in `src/services/facebookService.js`)

**Path Resolution:**
- Relative paths: `../` for parent directories, `./` for same directory
- No path aliases configured

## Error Handling

**Pattern:**
- Controllers wrap business logic in try-catch blocks
- Errors are caught and returned with appropriate HTTP status codes
- Consistent JSON response format:
  ```javascript
  { success: false, error: 'Error message' }
  ```
- Services propagate errors upward by throwing Error objects

**HTTP Status Codes:**
- `401` - Missing or invalid authentication token (e.g., `res.status(401).json({ success: false, error: 'Missing FB Page Access Token' })`)
- `400` - Bad request, missing required parameters (e.g., `res.status(400).json({ success: false, error: 'Thiếu thông tin: Email/UID, Password' })`)
- `500` - Server error, unhandled exceptions (e.g., `res.status(500).json({ success: false, error: error.message })`)

**Service Layer:**
- No try-catch in services; errors bubble to controllers
- `httpClient.js` (`doRequest`) catches axios errors and re-throws with formatted messages

## Logging

**Approach:** Console logging with descriptive prefixes
- `console.log('[Automation] ...')` - Informational messages from automation service
- `console.error('[Automation Error] ...')` - Error messages from automation service
- `console.log('[Automation Warning] ...')` - Warning/retry messages
- `console.log('[Health] ...')` - Health check messages (in server.js)

**No structured logging framework** - Simple text output to stdout/stderr.

## Comments

**Language:** Primarily Vietnamese with some English
- Function-level JSDoc-style comments in Vietnamese: `/** Hàm hỗ trợ xử lý gọi API Facebook */`
- Inline Vietnamese comments explaining complex logic, e.g., `// Lấy token từ header hoặc query params...`
- English technical comments: `// axios dùng 'data' thay vì 'body'`

**When to Comment:**
- Complex algorithms (e.g., 2FA flow in `fbAutomationService.js`)
- Non-obvious implementation details
- External API integration specifics

## Function Design

**Style:** Functional, single-responsibility
- Functions are small and focused (e.g., `normalizeSseLine`, `buildChatPayload` in `aiChatService.js`)
- Services export multiple related functions (e.g., `facebookService.js` exports 6 Facebook API functions)
- Async/await pattern used consistently for asynchronous operations

**Parameters:**
- Default parameters used: `function fetchFbApi(url, method = 'GET', data = null)`
- Optional parameters via destructuring with defaults: `payload?.model || process.env.AI_MODEL || 'gpt-5.3-codex'`
- Underscore-prefixed parameters allowed unused: `argsIgnorePattern: '^_'`

**Return Values:**
- Services return raw data (Promise resolves to API response)
- Controllers wrap responses: `{ success: true, data }` or `{ success: false, error }`

## Module Design

**Pattern:** Feature-based modules with explicit exports
- No barrel files (index.js in each directory only for route aggregation)
- Services export named functions: `module.exports = { exchangeCodeForToken, getLongLivedToken, ... }`
- Controllers export handler functions: `module.exports = { getPageInfo, getPageInsights, ... }`
- Utilities export both instances and functions: `module.exports = { apiClient, doRequest, doStreamRequest }`

**Layer Separation:**
- Controllers: Request/response handling, validation, status codes
- Services: Business logic, external API calls
- Utils: Shared utilities (HTTP client)

## Environment Variables

**Access Pattern:** Direct `process.env` access
- No abstraction layer
- Used throughout with fallbacks: `process.env.FB_PAGE_ACCESS_TOKEN`, `process.env.AI_BASE_URL`, `process.env.AI_API_KEY`
- Common pattern: `req.headers['x-fb-page-token'] || req.query.token || process.env.FB_PAGE_ACCESS_TOKEN`
- Validation in controllers with descriptive error messages

## Whitespace & Structure

- Two-space indentation
- No empty lines between consecutive imports from same module
- Blank lines separate logical blocks within functions
- Functions separated by single blank line at module level

---

*Convention analysis: 2026-04-25*
