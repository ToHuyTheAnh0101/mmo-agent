# API Testing Guide

This guide covers how to run and test the Facebook Insight Agent API.

## Prerequisites

- Node.js ≥ 18.0.0
- npm or yarn
- Facebook account (for testing Facebook-related endpoints)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Ensure `.env` file exists with required variables:

```env
PORT=3000

# AI Config (required for /api/ai/chat)
AI_BASE_URL=https://proxy.simpleverse.io.vn/api/v1
AI_MODEL=gpt-5.3-codex
AI_API_KEY=your_api_key_here

# Facebook Config (optional - only for FB automation endpoints)
FB_UID=your_facebook_uid
FB_PASS=your_facebook_password
FB_2FA=your_2fa_secret
```

### 3. Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start at `http://localhost:3000`. You should see:
```
Agent backend listening on http://localhost:3000
Available routes: GET /health, POST /api/ai/chat, GET /api/facebook/page/:id
```

## Testing Endpoints

### Health Check

Verify the server is running:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "fb-insight-agent"
}
```

### AI Chat Endpoint

Test the AI chat functionality:

```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

### Facebook Page Info

Get information about a Facebook Page (requires valid Facebook access token):

```bash
curl http://localhost:3000/api/facebook/page/{page_id}
```

Replace `{page_id}` with an actual Facebook Page ID.

### Facebook Login (Auto Token Retrieval)

Automatically log in to Facebook and retrieve an access token:

```bash
curl -X POST http://localhost:3000/api/facebook/login
```

**Note:** Requires `FB_UID`, `FB_PASS`, and `FB_2FA` to be set in `.env`. Uses Puppeteer for browser automation.

## Using Postman / Insomnia

1. Create a new request
2. Set method and URL:
   - Health: `GET http://localhost:3000/health`
   - AI Chat: `POST http://localhost:3000/api/ai/chat`
   - FB Page: `GET http://localhost:3000/api/facebook/page/{id}`
   - FB Login: `POST http://localhost:3000/api/facebook/login`
3. For POST requests, add `Content-Type: application/json` header
4. For AI chat, add raw JSON body: `{"message": "your query"}`
5. Send request and verify response

## Running Tests

No automated tests exist yet. To add tests:

```bash
# Install a testing framework (e.g., Jest)
npm install --save-dev jest supertest

# Add test script to package.json:
# "test": "jest"
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `EADDRINUSE` | PORT already in use. Change PORT in `.env` or kill the process using `lsof -i:3000` |
| AI endpoint fails | Check `AI_API_KEY` is valid and `AI_BASE_URL` is reachable |
| FB login fails | Verify `FB_UID`, `FB_PASS`, `FB_2FA` are correct |
| CORS errors | The API has CORS enabled; check client-side configuration |

## API Response Format

All responses are JSON:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error context"
}
```
