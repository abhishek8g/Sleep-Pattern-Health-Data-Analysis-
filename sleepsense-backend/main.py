"""
SleepSense AI — FastAPI Backend
Sleep Pattern & Health Data Analysis Platform
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import Base, engine

# ── Import ALL models so SQLAlchemy can resolve relationships ─────────────
from app.models import user, dataset, prediction, report, notification  # noqa
from app.models import activity_log, eda_result, feedback               # noqa
from app.api.v1 import (
    auth, users, datasets, predictions,
    ai, notifications, reports, admin,
    feedback, google_auth,
)
from app.middleware.logging_middleware import ActivityLoggingMiddleware

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup / shutdown."""
    logger.info("🚀 Starting SleepSense AI API v%s [%s]", settings.APP_VERSION, settings.ENVIRONMENT)
    # Create all DB tables (idempotent)
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables ready")
    yield
    logger.info("🛑 Shutting down SleepSense AI API")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="SleepSense AI API",
    description=(
        "## Sleep Pattern & Health Data Analysis Platform\n\n"
        "Production-ready REST API powering:\n"
        "- **JWT Authentication** with refresh tokens + Google OAuth\n"
        "- **Dataset Upload** with auto cleaning (CSV / Excel / JSON)\n"
        "- **8+ ML Models** — Random Forest, XGBoost, LightGBM, Neural Network …\n"
        "- **Gemini AI** chat, health recommendations, weekly reports\n"
        "- **Admin Panel** with user management, activity logs, system stats\n"
    ),
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Custom Middleware ─────────────────────────────────────────────────────────
app.add_middleware(ActivityLoggingMiddleware)

# ── Routers ──────────────────────────────────────────────────────────────────
V1 = "/api/v1"

app.include_router(auth.router,          prefix=V1)
app.include_router(google_auth.router,   prefix=V1)
app.include_router(users.router,         prefix=V1)
app.include_router(datasets.router,      prefix=V1)
app.include_router(predictions.router,   prefix=V1)
app.include_router(ai.router,            prefix=V1)
app.include_router(notifications.router, prefix=V1)
app.include_router(reports.router,       prefix=V1)
app.include_router(admin.router,         prefix=V1)
app.include_router(feedback.router,      prefix=V1)

# ── Root / Health ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"], summary="Health check")
def health_check():
    """Returns 200 when the API is running."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
    }
