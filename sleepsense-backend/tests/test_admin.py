"""Tests for admin endpoints — role-based access control."""
import pytest
from fastapi.testclient import TestClient
from app.models.user import User, UserStatus, UserRole
from app.core.security import get_password_hash


def _make_active(db, email, password, role=UserRole.USER):
    user = User(
        email=email,
        username=email.split("@")[0].replace(".", "_"),
        full_name="Test User",
        hashed_password=get_password_hash(password),
        is_email_verified=True,
        status=UserStatus.ACTIVE,
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _login(client, email, password):
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return resp.json().get("access_token", "")


def test_admin_dashboard_requires_admin(client, db):
    """Regular users cannot access admin dashboard."""
    _make_active(db, "user@test.com", "Pass@1234")
    token = _login(client, "user@test.com", "Pass@1234")
    resp = client.get("/api/v1/admin/dashboard",
                      headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403


def test_admin_dashboard_accessible_by_admin(client, db):
    """Admins can access the dashboard."""
    _make_active(db, "admin@test.com", "Pass@1234", role=UserRole.ADMIN)
    token = _login(client, "admin@test.com", "Pass@1234")
    resp = client.get("/api/v1/admin/dashboard",
                      headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert "total_users" in data
    assert "total_datasets" in data


def test_admin_list_users(client, db):
    """Admin can list all users."""
    _make_active(db, "admin2@test.com", "Pass@1234", role=UserRole.ADMIN)
    _make_active(db, "regular@test.com", "Pass@1234")
    token = _login(client, "admin2@test.com", "Pass@1234")
    resp = client.get("/api/v1/admin/users",
                      headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["total"] >= 2


def test_admin_suspend_user(client, db):
    """Admin can suspend a regular user."""
    _make_active(db, "admin3@test.com", "Pass@1234", role=UserRole.ADMIN)
    target = _make_active(db, "target@test.com", "Pass@1234")
    token = _login(client, "admin3@test.com", "Pass@1234")

    resp = client.put(f"/api/v1/admin/users/{target.id}/suspend",
                      headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200

    db.refresh(target)
    assert target.status == UserStatus.SUSPENDED


def test_admin_cannot_suspend_self(client, db):
    """Admin cannot suspend their own account."""
    admin = _make_active(db, "admin4@test.com", "Pass@1234", role=UserRole.ADMIN)
    token = _login(client, "admin4@test.com", "Pass@1234")

    resp = client.put(f"/api/v1/admin/users/{admin.id}/suspend",
                      headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 400


def test_admin_system_stats(client, db):
    """Admin can access system stats."""
    _make_active(db, "admin5@test.com", "Pass@1234", role=UserRole.ADMIN)
    token = _login(client, "admin5@test.com", "Pass@1234")

    resp = client.get("/api/v1/admin/system-stats",
                      headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert "total_users" in resp.json()
