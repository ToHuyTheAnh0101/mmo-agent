# LLM Chat Application

A full-stack LLM chat application featuring secure user authentication, session management, real-time message streaming, and per-user API key management. Built with FastAPI (Python) and React (Vite).

## Prerequisites (Linux)

- **Python**: 3.11+
- **Node.js**: 18+
- **PostgreSQL**: 15+

---

## Local Environment Setup Guide (Linux)

### 1. Database Setup (PostgreSQL)

You need to create a PostgreSQL database and configure the connection credentials. 

Install PostgreSQL (if you haven't already on Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

Create a new database and user (or use the default `postgres` user). Here is how to set the password for the `postgres` user and create the database `mmo_chat`:

```bash
# Create a new user called 'mmochat_user' with password 'admin'
sudo -u postgres psql -c "CREATE USER mmochat_user WITH PASSWORD 'admin';"

# Create the database and assign ownership to the new user
sudo -u postgres createdb -O mmochat_user mmo_chat
```

### 2. Backend Setup

The backend is built with FastAPI and uses SQLAlchemy with asyncpg.

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

**Configure `.env`:**
Edit the `.env` file you just created and update the `DATABASE_URL` with the password you set in step 1. Also, set secure random strings for `SECRET_KEY` and `ENCRYPTION_KEY`.

```env
DATABASE_URL=postgresql+asyncpg://mmochat_user:admin@localhost:5432/mmo_chat
SECRET_KEY=your_random_secret_key
ENCRYPTION_KEY=your_fernet_encryption_key
```

**How to generate secure keys:**
- For `SECRET_KEY`, run:
  ```bash
  openssl rand -hex 32
  ```
- For `ENCRYPTION_KEY`, run:
  ```bash
  python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
  ```

**Run Database Migrations:**
Initialize your database schema:
```bash
alembic revision --autogenerate -m "initial_schema"
alembic upgrade head
```

**Start the Backend Server:**
```bash
uvicorn app.main:app --reload --port 8000
```
The API will be available at `http://localhost:8000`, and the interactive API documentation at `http://localhost:8000/docs`.

### 3. Frontend Setup

The frontend is a React application powered by Vite.

Open a new terminal window:
```bash
# Navigate to the frontend directory
cd backend/../frontend # or just cd ../frontend from the backend dir

# Install dependencies
npm install

# Start the development server
npm run dev
```
The frontend will be available at `http://localhost:5173`.

---

## Key Workflows

### Register & Chat
1. Open http://localhost:5173
2. Click **Register** and create an account (using an email and password).
3. Click **New Chat** in the sidebar.
4. Go to **Settings** (gear icon) and enter your LLM API key, base URL, and model.
5. Type a message and press Send to start streaming responses!

### Switch API Provider
1. Go to **Settings**.
2. Change your API key, base URL, or model.
3. Click **Save**. All your existing sessions and messages are preserved.
4. Continue chatting with the new provider seamlessly.

---

## Testing

To run the test suites for both backend and frontend:

**Backend:**
```bash
cd backend
source venv/bin/activate
pytest
```

**Frontend:**
```bash
cd frontend
npm test
```
