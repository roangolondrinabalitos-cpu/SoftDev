# Ecommerce Auth Server (Postgres + JWT)

Minimal Node.js + Express server to replace Firebase auth for the demo app.

Prerequisites
- Node.js 18+ (or modern LTS)
- PostgreSQL (a database URI in `DATABASE_URL`)

Setup
1. Copy `.env.example` to `.env` and set values (DATABASE_URL, JWT_SECRET, PORT).
2. Install dependencies:

```powershell
cd auth-server
npm install
```

3. Create database and run migration SQL. Two options are provided below:

Option A — using `psql` (if you have it installed):

```powershell
# Example: replace with your actual DB URI
# $env:DATABASE_URL = "postgres://user:pass@localhost:5432/ecomdb"
# psql $env:DATABASE_URL -f migrations/create_users.sql
```

Option B — Node helper (no `psql` required):

```powershell
cd auth-server
# create .env from example and edit with your values
copy .env.example .env
notepad .env
# install deps (if you haven't already)
npm install
# run migration script (uses DATABASE_URL from .env)
npm run migrate
```

(If your Postgres lacks `gen_random_uuid()`, enable `pgcrypto` or replace `gen_random_uuid()` with `uuid_generate_v4()` and enable `uuid-ossp`.)

4. Start server

```powershell
npm run dev
# or
npm start
```

API Endpoints
- POST /auth/register { email, password, name? } => { user, token }
- POST /auth/login { email, password } => { user, token }
- GET /auth/me (Authorization: Bearer <token>) => { user }

Notes
- For demo purposes tokens are stored on the client in `localStorage` as `ms_token` and `ms_user` (you will wire the frontend to this).
- In production prefer httpOnly cookies and secure TLS setup.
