# Quickstart: LLM Chat Application

**Date**: 2026-04-26
**Feature**: [spec.md](spec.md)

## Prerequisites

- Python 3.11+
- Node.js 18+ (for frontend)
- PostgreSQL 15+ (or Docker)

## Project Setup

### 1. Clone and navigate

```bash
cd mmo-agent
```

### 2. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database URL and secret key

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (proxies API to localhost:8000)
npm run dev
```

### 4. Access the app

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (FastAPI auto-generated)

## Environment Variables

### Backend (`backend/.env`)

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/mmo_agent

# JWT Secret (generate with: openssl rand -hex 32)
SECRET_KEY=your-secret-key-here

# Encryption key for API keys (generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
ENCRYPTION_KEY=your-fernet-key-here

# Optional: Default AI config (fallback when user hasn't configured)
AI_BASE_URL=https://proxy.simpleverse.io.vn/api/v1
AI_MODEL=gpt-5.3-codex
AI_API_KEY=  # Leave empty — users provide their own
```

## Key Workflows

### Register & Chat

1. Open http://localhost:5173
2. Click "Register" → Enter email + password
3. Click "New Chat" in sidebar
4. Go to Settings → Enter your API key, base URL, model
5. Type a message and press Send

### Switch API Key

1. Go to Settings
2. Change API key / base URL / model
3. Save → All existing sessions preserved
4. Continue chatting with the new provider

## Development

```bash
# Run both frontend + backend
# Terminal 1:
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2:
cd frontend && npm run dev
```

## Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```
