# LLM Chat Application - Technical Design

## 1. Overview
The LLM Chat Application is a full-stack platform that allows users to create sessions and interact with LLMs (like OpenAI GPT models). It features secure user authentication, session management, real-time message streaming via Server-Sent Events (SSE), and secure per-user API key management.

## 2. System Architecture

The system follows a classic client-server architecture with an external dependency on an LLM provider.

```mermaid
graph TD
    Client[React Frontend]
    API[FastAPI Backend]
    DB[(Database<br>SQLite/PostgreSQL)]
    LLM[External LLM API<br>OpenAI-compatible]

    Client -- HTTP/REST --> API
    Client -- SSE --> API
    API -- SQLAlchemy --> DB
    API -- HTTP/Streaming --> LLM
```

## 3. Technology Stack

- **Frontend**: React, Vite, Tailwind CSS, React Markdown.
- **Backend**: Python, FastAPI, Uvicorn (ASGI server).
- **Database**: SQLite (local development) / PostgreSQL (production), SQLAlchemy (Async ORM), Alembic (Migrations).
- **Security**: Passlib (Bcrypt) for password hashing, python-jose for JWT auth, cryptography (Fernet) for API key encryption.

## 4. Data Model

The database schema is designed to separate users, their chat sessions, the messages within those sessions, and their LLM API configurations.

```mermaid
erDiagram
    USER ||--o{ SESSION : has
    USER ||--o| API_CONFIG : configures
    SESSION ||--o{ MESSAGE : contains

    USER {
        int id PK
        string email
        string hashed_password
        datetime created_at
    }

    SESSION {
        int id PK
        int user_id FK
        string title
        datetime created_at
        datetime updated_at
    }

    MESSAGE {
        int id PK
        int session_id FK
        string role "user | assistant"
        text content
        datetime created_at
    }

    API_CONFIG {
        int id PK
        int user_id FK
        string api_key_encrypted
        string base_url
        string model_name
        datetime updated_at
    }
```

## 5. Core Workflows

### 5.1 Chat Streaming Flow
Real-time streaming is critical for a responsive chat experience. We use Server-Sent Events (SSE) to stream tokens from the LLM back to the client as they are generated.

```mermaid
sequenceDiagram
    participant U as User (Frontend)
    participant B as Backend (FastAPI)
    participant DB as Database
    participant API as LLM Provider

    U->>B: POST /api/chat/{session_id} (Message)
    B->>DB: Save User Message
    B->>DB: Load Session History & API Config
    DB-->>B: History + Decrypted API Key
    B->>API: POST /chat/completions (Stream=True)
    
    loop Streaming Tokens
        API-->>B: Token chunk
        B-->>U: SSE: data: {"type": "token", "content": "..."}
    end
    
    API-->>B: [DONE]
    B->>DB: Save complete Assistant Message
    B-->>U: SSE: data: {"type": "done", "message_id": 123}
```

### 5.2 Authentication Flow
The application uses JWT (JSON Web Tokens) for stateless authentication.

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth Router
    participant S as Auth Service
    participant DB as Database

    C->>A: POST /api/auth/login
    A->>S: authenticate_user(email, password)
    S->>DB: get user by email
    DB-->>S: User record
    S->>S: verify password hash
    S->>S: create access & refresh tokens
    S-->>A: tokens
    A-->>C: 200 OK {access_token, refresh_token}
```

## 6. Security & Data Protection

- **API Key Encryption**: User-provided LLM API keys are encrypted at rest using symmetric encryption (`cryptography.fernet`). The backend only decrypts them in-memory just before making the external HTTP request to the LLM provider.
- **Stateless Auth**: JWT is used for all protected endpoints. Expiration times are kept reasonably short to limit attack vectors.
- **Resource Isolation**: Every CRUD operation on sessions, messages, or settings strictly checks the `user_id` bound to the active JWT to prevent IDOR (Insecure Direct Object Reference) vulnerabilities.
