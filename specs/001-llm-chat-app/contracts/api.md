# API Contracts: LLM Chat Application

**Date**: 2026-04-26
**Base URL**: `http://localhost:8000/api`

All endpoints return JSON. Authentication via JWT Bearer token in `Authorization` header unless marked as public.

---

## Authentication

### POST /api/auth/register *(public)*

Register a new user account.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (201)**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

**Errors**:
- `400`: Invalid email format or password too short (< 8 chars)
- `409`: Email already registered

---

### POST /api/auth/login *(public)*

Authenticate with existing credentials.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200)**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

**Errors**:
- `401`: Invalid email or password

---

### POST /api/auth/refresh *(public)*

Refresh an expired access token.

**Request**:
```json
{
  "refresh_token": "eyJ..."
}
```

**Response (200)**:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

**Errors**:
- `401`: Invalid or expired refresh token

---

## Sessions

### GET /api/sessions

List all sessions for the authenticated user, ordered by `updated_at DESC`.

**Response (200)**:
```json
[
  {
    "id": 1,
    "name": "New Chat",
    "created_at": "2026-04-26T00:00:00Z",
    "updated_at": "2026-04-26T01:00:00Z",
    "message_count": 12
  }
]
```

---

### POST /api/sessions

Create a new session.

**Request**:
```json
{
  "name": "My Chat"
}
```
*(`name` is optional, defaults to "New Chat")*

**Response (201)**:
```json
{
  "id": 2,
  "name": "My Chat",
  "created_at": "2026-04-26T00:00:00Z",
  "updated_at": "2026-04-26T00:00:00Z",
  "message_count": 0
}
```

---

### PATCH /api/sessions/:id

Rename a session.

**Request**:
```json
{
  "name": "Renamed Chat"
}
```

**Response (200)**:
```json
{
  "id": 1,
  "name": "Renamed Chat",
  "updated_at": "2026-04-26T02:00:00Z"
}
```

**Errors**:
- `404`: Session not found or doesn't belong to user

---

### DELETE /api/sessions/:id

Delete a session and all its messages.

**Response (204)**: No content

**Errors**:
- `404`: Session not found or doesn't belong to user

---

## Messages

### GET /api/sessions/:id/messages

Get all messages in a session, ordered by `created_at ASC`.

**Query params**:
- `limit` (optional, default: 100): Max messages to return
- `before` (optional): Return messages before this message ID (for pagination)

**Response (200)**:
```json
[
  {
    "id": 1,
    "role": "user",
    "content": "Hello!",
    "created_at": "2026-04-26T00:00:00Z"
  },
  {
    "id": 2,
    "role": "assistant",
    "content": "Hi! How can I help you?",
    "created_at": "2026-04-26T00:00:01Z"
  }
]
```

**Errors**:
- `404`: Session not found or doesn't belong to user

---

## Chat

### POST /api/chat/:session_id

Send a message and receive a streaming LLM response.

**Request**:
```json
{
  "message": "Hello, how are you?"
}
```

**Response**: `text/event-stream` (SSE)

```
data: {"type": "token", "content": "I"}

data: {"type": "token", "content": "'m"}

data: {"type": "token", "content": " doing"}

data: {"type": "token", "content": " great"}

data: {"type": "done", "message_id": 4, "usage": {"prompt_tokens": 50, "completion_tokens": 20}}

```

**Behavior**:
1. User message is saved to the session
2. Full session history is sent to the LLM as context
3. LLM response streams back via SSE
4. Complete assistant response is saved to the session

**Errors**:
- `400`: Empty message
- `404`: Session not found or doesn't belong to user
- `422`: No API key configured (user must set up API key first)
- `502`: LLM API error (invalid key, rate limit, network error)

---

## Settings

### GET /api/settings

Get current user's API configuration.

**Response (200)**:
```json
{
  "has_api_key": true,
  "base_url": "https://proxy.simpleverse.io.vn/api/v1",
  "model_name": "gpt-5.3-codex"
}
```

*Note: `api_key` is never returned — only `has_api_key` boolean.*

---

### PUT /api/settings

Create or update API configuration.

**Request**:
```json
{
  "api_key": "sk-...",
  "base_url": "https://api.openai.com/v1",
  "model_name": "gpt-4"
}
```

**Response (200)**:
```json
{
  "has_api_key": true,
  "base_url": "https://api.openai.com/v1",
  "model_name": "gpt-4",
  "updated_at": "2026-04-26T00:00:00Z"
}
```

**Errors**:
- `400`: Invalid base URL format

---

## Common Error Format

All errors follow this format:

```json
{
  "detail": "Human-readable error message"
}
```

## Authentication Flow

```
[Register/Login] → receive access_token + refresh_token
    ↓
[All API calls] → Authorization: Bearer {access_token}
    ↓
[Token expired] → POST /api/auth/refresh with refresh_token → new access_token
    ↓
[Refresh expired] → redirect to login
```
