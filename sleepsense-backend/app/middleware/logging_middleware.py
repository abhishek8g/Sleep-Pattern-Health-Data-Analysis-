from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.activity_log import ActivityLog
import logging
import time

logger = logging.getLogger(__name__)


class ActivityLoggingMiddleware(BaseHTTPMiddleware):
    """Log all API requests to the activity log."""

    SKIP_PATHS = ["/health", "/docs", "/openapi.json", "/redoc", "/favicon.ico",
                  "/api/v1/auth/login", "/api/v1/auth/register"]

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time

        # Only log non-trivial routes
        path = request.url.path
        if any(path.startswith(skip) for skip in self.SKIP_PATHS):
            return response

        # Log to DB for API calls
        if path.startswith("/api/"):
            try:
                db: Session = SessionLocal()
                log = ActivityLog(
                    action=f"{request.method} {path}",
                    description=f"Status: {response.status_code} | Duration: {process_time:.3f}s",
                    ip_address=request.client.host if request.client else None,
                    user_agent=request.headers.get("user-agent", "")[:200],
                    resource_type="api",
                )
                db.add(log)
                db.commit()
                db.close()
            except Exception as e:
                logger.warning(f"Activity logging failed: {e}")

        return response
