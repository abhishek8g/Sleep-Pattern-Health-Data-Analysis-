# SleepSense AI — Deployment Guide

## Option 1: Docker Compose (Recommended for local/VPS)

```bash
# 1. Clone repo
git clone https://github.com/yourname/sleepsense-ai.git
cd sleepsense-ai

# 2. Configure environment
cp .env.example .env
# Edit .env with your real credentials

# 3. Start all services
docker-compose up --build -d

# 4. Seed the database
docker exec sleepsense_backend python seed.py

# 5. Access
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000
# API Docs:  http://localhost:8000/docs
```

---

## Option 2: Manual Setup

### Backend (FastAPI)

```bash
cd sleepsense-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with real values

# Run database migrations
alembic upgrade head

# Seed database with demo users
python seed.py

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest tests/ -v
```

### Frontend (Next.js)

```bash
cd sleepsense-frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with real values

# Start development server
npm run dev

# Build for production
npm run build
npm start

# Type check
npm run type-check

# Lint
npm run lint
```

---

## Option 3: Cloud Deployment

### Frontend → Vercel

```bash
cd sleepsense-frontend
npx vercel --prod

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL = https://your-backend.onrender.com/api/v1
# NEXT_PUBLIC_GOOGLE_CLIENT_ID = your-google-client-id
```

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository
3. Set:
   - **Root Directory**: `sleepsense-backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add all environment variables from `.env.example`
5. Create a **PostgreSQL** database on Render and copy the connection string to `DATABASE_URL`

### Database → Render PostgreSQL or Supabase

```bash
# After deployment, run migrations via Render Shell:
alembic upgrade head
python seed.py
```

---

## Required Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Secret key ≥ 32 chars for signing JWTs |
| `GEMINI_API_KEY` | Google Gemini AI API key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for file storage |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SMTP_USER` | Email address for sending |
| `SMTP_PASSWORD` | Email app password |
| `REDIS_URL` | Redis connection URL |
| `FRONTEND_URL` | Public frontend URL |

---

## Getting API Keys

### Gemini AI
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create API key → copy to `GEMINI_API_KEY`

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-backend/api/v1/auth/google/callback`

### Cloudinary
1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)
2. Copy Cloud Name, API Key, API Secret from dashboard

### PostgreSQL (local)
```bash
# Using Docker
docker run -d \
  -e POSTGRES_USER=sleepsense \
  -e POSTGRES_PASSWORD=sleepsense123 \
  -e POSTGRES_DB=sleepsense_db \
  -p 5432:5432 \
  postgres:15
```

---

## Demo Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@sleepsense.ai | Admin@123456 |
| User | demo@sleepsense.ai | Demo@123456 |

---

## Health Check

```
GET /health
→ { "status": "healthy", "app": "SleepSense AI", "version": "1.0.0" }
```

## API Documentation

```
http://localhost:8000/docs       → Swagger UI
http://localhost:8000/redoc      → ReDoc
http://localhost:8000/openapi.json → OpenAPI spec
```
