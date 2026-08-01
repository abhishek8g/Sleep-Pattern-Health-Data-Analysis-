# SleepSense AI – Sleep Pattern & Health Data Analysis Platform

A production-ready, enterprise-level full-stack web application for analyzing sleep and health datasets.

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI
- Framer Motion
- React Query (TanStack Query)
- Recharts / Chart.js
- React Hook Form + Zod

### Backend
- Python FastAPI
- PostgreSQL
- Prisma ORM (via Prisma Client Python / SQLAlchemy)
- JWT Authentication
- Google OAuth
- Gemini AI API

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Docker & Docker Compose

### Quick Start with Docker

```bash
git clone https://github.com/yourusername/sleepsense-ai
cd sleepsense-ai
cp .env.example .env
# Edit .env with your credentials
docker-compose up --build
```

### Manual Setup

#### Backend
```bash
cd sleepsense-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env
alembic upgrade head
python seed.py
uvicorn main:app --reload
```

#### Frontend
```bash
cd sleepsense-frontend
npm install
cp .env.example .env.local
# Edit .env.local
npm run dev
```

## Project Structure

```
sleepsense-ai/
├── sleepsense-frontend/        # Next.js Frontend
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   ├── components/        # Reusable components
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # Utilities
│   │   ├── store/             # State management
│   │   ├── types/             # TypeScript types
│   │   └── styles/            # Global styles
│   └── public/
├── sleepsense-backend/         # FastAPI Backend
│   ├── app/
│   │   ├── api/               # Route handlers
│   │   ├── core/              # Config, security
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   ├── repositories/      # Data access layer
│   │   └── middleware/        # Custom middleware
│   ├── alembic/               # Database migrations
│   └── tests/                 # Test suite
├── docker-compose.yml
└── README.md
```

## Features

- 🔐 JWT + Google OAuth Authentication
- 📊 Sleep Data Analysis with ML Models
- 🤖 AI-powered Insights via Gemini API
- 📈 Interactive Charts & Visualizations
- 🔮 Sleep Quality Predictions
- 📄 PDF/Excel/CSV Report Generation
- 👥 Admin Panel with User Management
- 🌙 Dark/Light Mode
- 📱 Mobile-First Responsive Design
- 🐳 Docker Ready

## API Documentation

Once running, visit: `http://localhost:8000/docs`

## License

MIT
