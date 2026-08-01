"""Seed database with initial demo data."""
# Import ALL models first so SQLAlchemy can resolve relationships
from app.core.database import SessionLocal, Base, engine
from app.models.user import User, UserRole, UserStatus
from app.models.dataset import Dataset          # noqa: F401
from app.models.prediction import Prediction    # noqa: F401
from app.models.report import Report            # noqa: F401
from app.models.notification import Notification, NotificationType
from app.models.activity_log import ActivityLog # noqa: F401
from app.models.eda_result import EDAResult     # noqa: F401
from app.models.feedback import Feedback        # noqa: F401
from app.core.security import get_password_hash

# Create all tables
Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()
    try:
        # ── Admin user ──────────────────────────────────────────────────
        admin_email = "admin@sleepsense.ai"
        if not db.query(User).filter(User.email == admin_email).first():
            admin = User(
                email=admin_email,
                username="admin",
                full_name="SleepSense Admin",
                hashed_password=get_password_hash("Admin@123456"),
                role=UserRole.ADMIN,
                status=UserStatus.ACTIVE,
                is_email_verified=True,
            )
            db.add(admin)
            print(f"✅ Admin created  → {admin_email}  /  Admin@123456")

        # ── Demo user ───────────────────────────────────────────────────
        demo_email = "demo@sleepsense.ai"
        if not db.query(User).filter(User.email == demo_email).first():
            demo = User(
                email=demo_email,
                username="demouser",
                full_name="Demo User",
                hashed_password=get_password_hash("Demo@123456"),
                role=UserRole.USER,
                status=UserStatus.ACTIVE,
                is_email_verified=True,
            )
            db.add(demo)
            db.flush()  # get the id assigned

            notif = Notification(
                user_id=demo.id,
                title="Welcome to SleepSense AI! 🌙",
                message=(
                    "Your account is ready. Upload your first sleep dataset "
                    "to get started with AI-powered health analysis."
                ),
                notification_type=NotificationType.SYSTEM,
            )
            db.add(notif)
            print(f"✅ Demo user created → {demo_email}  /  Demo@123456")

        db.commit()
        print("\n✅ Database seeded successfully!")
        print("─" * 50)
        print("  Frontend : http://localhost:3000")
        print("  Backend  : http://localhost:8000")
        print("  API Docs : http://localhost:8000/docs")
        print("─" * 50)

    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
