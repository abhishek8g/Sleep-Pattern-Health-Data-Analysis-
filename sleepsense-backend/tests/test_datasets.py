"""Tests for dataset endpoints."""
import io
import pytest
from fastapi.testclient import TestClient
from app.models.user import User, UserStatus


def _token(client, db, user_data):
    client.post("/api/v1/auth/register", json=user_data)
    user = db.query(User).filter(User.email == user_data["email"]).first()
    user.is_email_verified = True
    user.status = UserStatus.ACTIVE
    db.commit()
    return client.post("/api/v1/auth/login", json={
        "email": user_data["email"], "password": user_data["password"],
    }).json()["access_token"]


def _csv() -> bytes:
    return (
        b"sleep_duration,sleep_quality,stress_level,heart_rate\n"
        b"7.5,8,3,72\n6.0,5,7,88\n8.0,9,2,65\n"
    )


def _patch_upload(monkeypatch):
    """Patch upload and processing at the route import level."""
    import app.api.v1.datasets as route
    monkeypatch.setattr(route, "upload_file_to_cloudinary",
                        lambda *a, **kw: "https://example.com/test.csv")
    monkeypatch.setattr(route, "process_dataset", lambda *a, **kw: None)


def test_list_datasets_empty(client, db, test_user_data):
    token = _token(client, db, test_user_data)
    resp = client.get("/api/v1/datasets/", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["total"] == 0


def test_upload_dataset(client, db, test_user_data, monkeypatch):
    _patch_upload(monkeypatch)
    token = _token(client, db, test_user_data)
    resp = client.post(
        "/api/v1/datasets/upload",
        files={"file": ("test.csv", io.BytesIO(_csv()), "text/csv")},
        data={"name": "Test Dataset"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201, resp.text
    assert resp.json()["file_type"] == "csv"
    assert resp.json()["file_name"] == "test.csv"


def test_list_datasets_after_upload(client, db, test_user_data, monkeypatch):
    _patch_upload(monkeypatch)
    token = _token(client, db, test_user_data)
    client.post(
        "/api/v1/datasets/upload",
        files={"file": ("test.csv", io.BytesIO(_csv()), "text/csv")},
        headers={"Authorization": f"Bearer {token}"},
    )
    resp = client.get("/api/v1/datasets/", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["total"] == 1


def test_delete_dataset(client, db, test_user_data, monkeypatch):
    _patch_upload(monkeypatch)
    token = _token(client, db, test_user_data)
    upload = client.post(
        "/api/v1/datasets/upload",
        files={"file": ("test.csv", io.BytesIO(_csv()), "text/csv")},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert upload.status_code == 201, upload.text
    dataset_id = upload.json()["id"]

    del_resp = client.delete(f"/api/v1/datasets/{dataset_id}",
                             headers={"Authorization": f"Bearer {token}"})
    assert del_resp.status_code == 200

    list_resp = client.get("/api/v1/datasets/",
                           headers={"Authorization": f"Bearer {token}"})
    assert list_resp.json()["total"] == 0
