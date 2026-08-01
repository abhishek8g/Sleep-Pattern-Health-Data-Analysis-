# SleepSense AI — Quick Setup Guide

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Python | 3.11+ | [python.org](https://python.org) |
| PostgreSQL | 15+ | [postgresql.org](https://postgresql.org) |
| Redis | 7+ | [redis.io](https://redis.io) |
| Docker | 24+ | [docker.com](https://docker.com) (optional) |

---

## Fastest Start (Docker)

```bash
git clone https://github.com/yourname/sleepsense-ai.git
cd sleepsense-ai
cp .env.example .env
docker-compose up --build
```

Visit: http://localhost:3000  
Login: `admin@sleepsense.ai` / `Admin@123456`

---

## Step-by-Step Manual Setup

### 1. PostgreSQL

```sql
CREATE USER sleepsense WITH PASSWORD 'sleepsense123';
CREATE DATABASE sleepsense_db OWNER sleepsense;
```

### 2. Backend

```bash
cd sleepsense-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL and JWT_SECRET_KEY
alembic upgrade head
python seed.py
uvicorn main:app --reload
```

### 3. Frontend

```bash
cd sleepsense-frontend
npm install
cp .env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
npm run dev
```

---

## Project Structure

```
sleepsense-ai/
├── sleepsense-frontend/          # Next.js 14 App Router
│   └── src/
│       ├── app/                  # Pages (App Router)
│       │   ├── (auth)/           # Login, Register, Verify, Reset
│       │   └── (dashboard)/      # Protected dashboard pages
│       ├── components/           # Reusable React components
│       │   ├── ui/               # Button, Badge, Input, Modal, Skeleton
│       │   ├── layout/           # Sidebar, TopNavbar, DashboardLayout
│       │   ├── dashboard/        # Dashboard overview, charts, cards
│       │   ├── datasets/         # Upload, list, EDA modal
│       │   ├── predictions/      # ML results, model comparison
│       │   ├── ai/               # Gemini AI chat interface
│       │   ├── analytics/        # Charts and health analytics
│       │   ├── admin/            # Admin dashboard, user management
│       │   └── ...
│       ├── hooks/                # useAuth, useDebounce, usePagination
│       ├── lib/                  # api.ts (Axios client), utils.ts
│       ├── store/                # Zustand auth store
│       ├── types/                # TypeScript interfaces
│       └── styles/               # globals.css (Tailwind)
│
├── sleepsense-backend/           # FastAPI Python Backend
│   ├── app/
│   │   ├── api/v1/               # Route handlers (auth, users, datasets, ...)
│   │   ├── core/                 # Config, database, security
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── services/             # Business logic
│   │   │   ├── auth_service.py   # Registration, login, OTP, tokens
│   │   │   ├── dataset_service.py # Upload, parse, clean data
│   │   │   ├── ml_service.py     # Train 8 ML models, evaluate
│   │   │   ├── eda_service.py    # EDA: correlations, distributions
│   │   │   ├── ai_service.py     # Gemini AI integration
│   │   │   └── email_service.py  # SMTP email sending
│   │   └── middleware/           # Activity logging
│   ├── alembic/                  # Database migrations
│   ├── tests/                    # Pytest test suite
│   └── sample_data/              # Sample sleep health CSV
│
├── nginx/                        # Nginx reverse proxy config
├── .github/workflows/ci.yml      # GitHub Actions CI/CD
├── docker-compose.yml            # Multi-container setup
├── DEPLOYMENT.md                 # Full deployment guide
└── README.md
```

---

## API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register new account |
| POST | `/api/v1/auth/verify-email` | Verify OTP |
| POST | `/api/v1/auth/login` | Login → tokens |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/forgot-password` | Send reset email |
| POST | `/api/v1/auth/reset-password` | Reset with token |

### Datasets
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/datasets/upload` | Upload CSV/Excel/JSON |
| GET | `/api/v1/datasets/` | List with pagination |
| GET | `/api/v1/datasets/{id}` | Get single dataset |
| GET | `/api/v1/datasets/{id}/eda` | Get/trigger EDA |
| DELETE | `/api/v1/datasets/{id}` | Delete dataset |

### Predictions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/predictions/` | Start ML prediction job |
| GET | `/api/v1/predictions/` | List predictions |
| GET | `/api/v1/predictions/{id}` | Get result |
| GET | `/api/v1/predictions/{id}/explain` | AI explanation |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/ai/chat` | Ask Gemini AI |
| GET | `/api/v1/ai/recommendations/{id}` | Health recommendations |
| GET | `/api/v1/ai/weekly-report` | Weekly AI report |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/admin/dashboard` | Platform stats |
| GET | `/api/v1/admin/users` | All users (paginated) |
| PUT | `/api/v1/admin/users/{id}/suspend` | Suspend user |
| PUT | `/api/v1/admin/users/{id}/role` | Assign role |
| DELETE | `/api/v1/admin/users/{id}` | Delete user |
| GET | `/api/v1/admin/activity-logs` | Activity logs |

---

## ML Models Trained

| Model | Type |
|---|---|
| Linear Regression | Regression |
| Random Forest | Both |
| Decision Tree | Classification |
| Gradient Boosting | Both |
| XGBoost | Both |
| LightGBM | Both |
| KNN | Classification |
| Neural Network (MLP) | Classification |

All models are trained, compared, and the best is auto-selected based on accuracy/R².

---

## Features Checklist

- [x] JWT Auth + Refresh Tokens
- [x] Email OTP Verification
- [x] Forgot/Reset Password
- [x] Google OAuth (configured)
- [x] User Profile + Avatar Upload
- [x] Dark/Light Mode
- [x] Dataset Upload (CSV, Excel, JSON)
- [x] Auto Data Cleaning
- [x] EDA with Charts
- [x] 8+ ML Models
- [x] Model Comparison & Auto-select
- [x] Gemini AI Chat
- [x] AI Health Recommendations
- [x] PDF Report Generation
- [x] Notifications System
- [x] Admin Dashboard
- [x] User Management (suspend/activate/delete)
- [x] Activity Logs
- [x] Docker + Docker Compose
- [x] GitHub Actions CI/CD
- [x] Nginx Reverse Proxy
- [x] Pytest Test Suite
- [x] TypeScript Throughout
- [x] Responsive Mobile-First UI
- [x] Loading Skeletons
- [x] Error Boundaries
- [x] 404 Page
