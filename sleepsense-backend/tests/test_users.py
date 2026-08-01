"""Tests for user management endpoints."""
import pytest
from fastapi.testclient import TestClient
from app.models.user import User, UserStatus


def _create_active_user(client, db, user_data):
    """Helper: register, activate, login, return token."""
    client.post("/api/v1/auth/register", json=user_data)
    user = db.query(User).filter(User.email == user_data["email"]).first()
    user.is_email_verified = True
    user.status = UserStatus.ACTIVE
    db.commit()
    login = client.post("/api/v1/auth/login", json={
        "email": user_data["email"],
        "password": user_data["password"],
    })
    return login.json()["access_token"]


def test_get_profile(client, db, test_user_data):
    token = _create_active_user(client, db, test_user_data)
    resp = client.get("/api/v1/users/me",
                      headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == test_user_data["email"]


def test_update_profile(client, db, test_user_data):
    token = _create_active_user(client, db, test_user_data)
    resp = client.put(
        "/api/v1/users/me",
        json={"full_name": "Updated Name", "bio": "Hello world"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["full_name"] == "Updated Name"
    assert resp.json()["bio"] == "Hello world"


def test_change_password(client, db, test_user_data):
    token = _create_active_user(client, db, test_user_data)
    resp = client.put(
        "/api/v1/users/me/password",
        json={"current_password": test_user_data["password"],
              "new_password": "NewPass@123"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200


def test_change_password_wrong_current(client, db, test_user_data):
    token = _create_active_user(client, db, test_user_data)
    resp = client.put(
        "/api/v1/users/me/password",
        json={"current_password": "WrongPassword",
              "new_password": "NewPass@123"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 400


def test_get_user_stats(client, db, test_user_data):
    token = _create_active_user(client, db, test_user_data)
    resp = client.get("/api/v1/users/me/stats",
                      headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert "datasets_uploaded" in resp.json()
    assert "predictions_made" in resp.json()
