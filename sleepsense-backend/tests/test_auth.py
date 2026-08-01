"""Tests for authentication endpoints."""
import pytest
from fastapi.testclient import TestClient
from app.models.user import User, UserStatus
from app.core.security import get_password_hash


def test_register_user(client: TestClient, test_user_data: dict):
    """Test user registration creates account with pending status."""
    response = client.post("/api/v1/auth/register", json=test_user_data)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert "OTP" in data["message"] or "email" in data["message"].lower()


def test_register_duplicate_email(client: TestClient, test_user_data: dict):
    """Test that duplicate email registration is rejected."""
    client.post("/api/v1/auth/register", json=test_user_data)
    response = client.post("/api/v1/auth/register", json=test_user_data)
    assert response.status_code == 400


def test_register_duplicate_username(client: TestClient, test_user_data: dict):
    """Test that duplicate username is rejected."""
    client.post("/api/v1/auth/register", json=test_user_data)
    different_email_data = {**test_user_data, "email": "other@example.com"}
    response = client.post("/api/v1/auth/register", json=different_email_data)
    assert response.status_code == 400


def test_login_unverified_user(client: TestClient, test_user_data: dict):
    """Unverified users cannot log in."""
    client.post("/api/v1/auth/register", json=test_user_data)
    response = client.post("/api/v1/auth/login", json={
        "email": test_user_data["email"],
        "password": test_user_data["password"],
    })
    assert response.status_code == 403


def test_login_verified_user(client: TestClient, db, test_user_data: dict):
    """Verified users can log in and receive tokens."""
    client.post("/api/v1/auth/register", json=test_user_data)

    # Manually verify the user
    user = db.query(User).filter(User.email == test_user_data["email"]).first()
    user.is_email_verified = True
    user.status = UserStatus.ACTIVE
    db.commit()

    response = client.post("/api/v1/auth/login", json={
        "email": test_user_data["email"],
        "password": test_user_data["password"],
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == test_user_data["email"]


def test_login_wrong_password(client: TestClient, db, test_user_data: dict):
    """Wrong password returns 401."""
    client.post("/api/v1/auth/register", json=test_user_data)
    user = db.query(User).filter(User.email == test_user_data["email"]).first()
    user.is_email_verified = True
    user.status = UserStatus.ACTIVE
    db.commit()

    response = client.post("/api/v1/auth/login", json={
        "email": test_user_data["email"],
        "password": "WrongPassword",
    })
    assert response.status_code == 401


def test_get_me_requires_auth(client: TestClient):
    """Protected /me endpoint requires valid token."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code in (401, 403)  # No Bearer header → unauthorized


def test_get_me_with_valid_token(client: TestClient, db, test_user_data: dict):
    """Authenticated /me returns user info."""
    client.post("/api/v1/auth/register", json=test_user_data)
    user = db.query(User).filter(User.email == test_user_data["email"]).first()
    user.is_email_verified = True
    user.status = UserStatus.ACTIVE
    db.commit()

    login = client.post("/api/v1/auth/login", json={
        "email": test_user_data["email"],
        "password": test_user_data["password"],
    })
    token = login.json()["access_token"]

    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == test_user_data["email"]


def test_forgot_password_always_succeeds(client: TestClient):
    """Forgot password always returns success (security: no email enumeration)."""
    response = client.post("/api/v1/auth/forgot-password", json={"email": "notexist@example.com"})
    assert response.status_code == 200
    assert response.json()["success"] is True


def test_health_check(client: TestClient):
    """Health check endpoint returns healthy."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
