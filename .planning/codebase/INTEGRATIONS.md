# External Integrations

**Last Updated:** 2026-04-25

## Overview

This document catalogs all external services, APIs, and integrations used by the fb-insight-agent.

## 1. Facebook Graph API

### Purpose
Access Facebook page data and perform Graph API operations.

### Implementation
- HTTP client: `axios` in `src/services/facebookService.js`
- Base endpoint: `https://graph.facebook.com/v20.0/`
- Authentication: User access token (OAuth 2.0)

### Key Endpoints Used
- `GET /{page-id}` - Retrieve page details
- `GET /{page-id}/insights` - Get page insights metrics
- `GET /me` - Verify user token validity
- `GET /oauth/access_token` - Token exchange

### Configuration
- Token passed as query parameter: `?access_token={token}`
- Token stored in memory (see concerns about persistence)

### Files
- `src/services/facebookService.js` - Facebook API client
- `src/services/fbAutomationService.js` - Token management

---

## 2. AI/LLM Integration

### Purpose
Provide AI chat capabilities for Facebook data analysis.

### Implementation
- HTTP client: `axios` in `src/services/aiChatService.js`
- External proxy: `https://proxy.simpleverse.io.vn/api/v1`

### API Details
- Endpoint: `{AI_BASE_URL}/chat/completions` (likely OpenAI-compatible)
- Model: `gpt-5.3-codex` (configurable via `AI_MODEL`)
- Authentication: API key header

### Configuration
```env
AI_BASE_URL=https://proxy.simpleverse.io.vn/api/v1
AI_MODEL=gpt-5.3-codex
AI_API_KEY=your_api_key_here
```

### Files
- `src/services/aiChatService.js` - AI chat service
- `src/controllers/aiChatController.js` - API endpoint handler
- `src/routes/aiChatRoute.js` - Route registration

---

## 3. Facebook Login Automation

### Purpose
Automated Facebook login to obtain access tokens programmatically.

### Implementation
- Browser automation: Puppeteer in `src/services/fbAutomationService.js`
- Headless Chrome navigation through Facebook login flow
- OTP handling via `otplib` for 2FA

### Flow
1. Navigate to Facebook login page
2. Enter credentials (email/phone, password)
3. Handle 2FA if enabled (TOTP-based)
4. Navigate to target page to obtain token
5. Extract token from page context

### Security Considerations
⚠️ **CRITICAL**: Credentials stored in `.env` file
- `FB_UID` - Facebook username/email
- `FB_PASS` - Facebook password
- `FB_2FA` - 2FA secret (TOTP)

### Files
- `src/services/fbAutomationService.js` - Puppeteer automation

---

## 4. Internal Service Communications

### Pattern
- Route → Controller → Service → External API
- Services are independent and self-contained
- Controllers handle HTTP request/response formatting

### Service Layer
- `src/services/facebookService.js` - Facebook Graph API
- `src/services/aiChatService.js` - AI API proxy
- `src/services/fbAutomationService.js` - Puppeteer automation

---

## 5. CORS Configuration

- Applied globally via `cors()` middleware in `src/server.js`
- Allows cross-origin requests from any origin (development default)
- Should be restricted in production

---

## 6. Environment Variables

All integrations rely on environment variables loaded by `dotenv`:

| Variable | Required | Purpose | Integration |
|----------|----------|---------|-------------|
| `PORT` | No (default: 3000) | Server port | Server |
| `AI_BASE_URL` | Yes | AI API endpoint | AI Chat |
| `AI_MODEL` | Yes | Model identifier | AI Chat |
| `AI_API_KEY` | Yes | Authentication | AI Chat |
| `FB_UID` | Conditional | Facebook login | Automation |
| `FB_PASS` | Conditional | Facebook login | Automation |
| `FB_2FA` | Conditional | 2FA secret | Automation |

---

## 7. External Service Reliability

### Considerations
- **Facebook API rate limits**: Graph API has strict rate limits
- **AI API uptime**: External proxy dependency
- **Puppeteer stability**: Browser automation can be flaky
- **Network latency**: Multiple external calls increase response time

### Recommended Improvements
1. Add retry logic for failed API calls
2. Implement circuit breakers for external services
3. Add request timeout handling
4. Cache frequently requested data
5. Add fallback mechanisms

---

## Integration Summary

| Integration | Criticality | Reliability Risk | Files |
|-------------|-------------|------------------|-------|
| Facebook Graph API | High | Medium (rate limits) | `facebookService.js` |
| AI Chat API | High | High (external proxy) | `aiChatService.js` |
| Facebook Login Automation | Medium | High (Puppeteer) | `fbAutomationService.js` |
