# Data Model: LLM Chat Application

**Date**: 2026-04-26
**Spec**: [spec.md](spec.md)
**Research**: [research.md](research.md)

## Entities

### User

Represents a registered account holder.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | Integer | PK, auto-increment | |
| email | String(255) | UNIQUE, NOT NULL | Login identifier |
| password_hash | String(255) | NOT NULL | bcrypt hash, never stored in plaintext |
| created_at | DateTime | NOT NULL, DEFAULT now() | Registration timestamp |
| updated_at | DateTime | NOT NULL, DEFAULT now() | Last modification timestamp |

**Relationships**:
- Has many Sessions (1:N)
- Has one ApiConfig (1:1, optional)

**Validation rules**:
- Email must be valid format (RFC 5322)
- Password must be at least 8 characters

---

### Session

A named conversation thread belonging to a user.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | Integer | PK, auto-increment | |
| user_id | Integer | FK → User.id, NOT NULL | Owner |
| name | String(255) | NOT NULL, DEFAULT 'New Chat' | Display name |
| created_at | DateTime | NOT NULL, DEFAULT now() | |
| updated_at | DateTime | NOT NULL, DEFAULT now() | Updated on new message or rename |

**Relationships**:
- Belongs to User (N:1)
- Has many Messages (1:N, ordered by created_at)

**Cascade rules**:
- ON DELETE User → CASCADE delete all user's sessions
- ON DELETE Session → CASCADE delete all session's messages

---

### Message

A single chat turn within a session.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | Integer | PK, auto-increment | |
| session_id | Integer | FK → Session.id, NOT NULL | Parent session |
| role | String(20) | NOT NULL, CHECK IN ('user', 'assistant', 'system') | LLM message role |
| content | Text | NOT NULL | Message content (supports markdown) |
| created_at | DateTime | NOT NULL, DEFAULT now() | Sent/received timestamp |

**Relationships**:
- Belongs to Session (N:1)

**Ordering**: Messages are always returned ordered by `created_at ASC` within a session.

**Context window handling**: When sending to LLM, if total message tokens exceed the model's context window, older messages are truncated from the beginning while preserving the system message (if any) and the most recent messages.

---

### ApiConfig

Per-user LLM configuration.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | Integer | PK, auto-increment | |
| user_id | Integer | FK → User.id, UNIQUE, NOT NULL | One config per user |
| api_key_encrypted | Text | NOT NULL | Fernet-encrypted API key |
| base_url | String(500) | NOT NULL, DEFAULT 'https://api.openai.com/v1' | OpenAI-compatible base URL |
| model_name | String(100) | NOT NULL, DEFAULT 'gpt-4' | Model identifier |
| created_at | DateTime | NOT NULL, DEFAULT now() | |
| updated_at | DateTime | NOT NULL, DEFAULT now() | |

**Relationships**:
- Belongs to User (1:1)

**Cascade rules**:
- ON DELETE User → CASCADE delete user's API config

**Security**:
- `api_key_encrypted` stores the Fernet-encrypted version of the plaintext API key
- The encryption key is a server-side secret (environment variable)
- API key is decrypted only when making LLM API calls, never returned to the frontend

---

## Entity Relationship Diagram

```
User (1) ──── (N) Session (1) ──── (N) Message
  │
  └──── (0..1) ApiConfig
```

## Indexes

| Table | Index | Columns | Type |
|-------|-------|---------|------|
| User | ix_user_email | email | UNIQUE |
| Session | ix_session_user_id | user_id | B-TREE |
| Message | ix_message_session_id | session_id | B-TREE |
| Message | ix_message_created_at | session_id, created_at | COMPOSITE |
| ApiConfig | ix_apiconfig_user_id | user_id | UNIQUE |

## Migration Strategy

Using Alembic (SQLAlchemy's migration tool):
- Initial migration creates all 4 tables
- Alembic `env.py` configured with async SQLAlchemy engine
- Migration files stored in `backend/alembic/versions/`
- Run via: `alembic upgrade head`
