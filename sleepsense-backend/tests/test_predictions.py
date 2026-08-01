"""Tests for prediction endpoints."""
import pytest
from fastapi.testclient import TestClient
from app.models.user import User, UserStatus
from app.models.dataset import Dataset, DatasetStatus


def _active_user_token(client, db, user_data):
    client.post("/api/v1/auth/register", json=user_data)
    user = db.query(User).filter(User.email == user_data["email"]).first()
    user.is_email_verified = True
    user.status = UserStatus.ACTIVE
    db.commit()
    login = client.post("/api/v1/auth/login", json={
        "email": user_data["email"],
        "password": user_data["password"],
    })
    return login.json()["access_token"], str(user.id)


def _seed_ready_dataset(db, user_id: str) -> str:
    """Insert a READY dataset directly for testing."""
    dataset = Dataset(
        user_id=user_id,
        name="Test Sleep Dataset",
        file_name="test.csv",
        file_url="https://example.com/test.csv",
        file_type="csv",
        file_size=1024,
        row_count=50,
        column_count=10,
        status=DatasetStatus.READY,
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    return str(dataset.id)


def test_list_predictions_empty(client, db, test_user_data):
    token, _ = _active_user_token(client, db, test_user_data)
    resp = client.get("/api/v1/predictions/",
                      headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["total"] == 0


def test_create_prediction(client, db, test_user_data, monkeypatch):
    """Prediction job is created with PENDING status."""
    import app.api.v1.predictions as pred_route
    monkeypatch.setattr(pred_route, "run_prediction", lambda *a, **kw: None)

    token, user_id = _active_user_token(client, db, test_user_data)
    dataset_id = _seed_ready_dataset(db, user_id)

    resp = client.post("/api/v1/predictions/",
        json={"dataset_id": dataset_id, "prediction_type": "sleep_quality"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["prediction_type"] == "sleep_quality"
    assert data["status"] in ("pending", "running", "completed")


def test_create_prediction_wrong_dataset(client, db, test_user_data):
    """Prediction on non-existent dataset returns 404."""
    import uuid
    token, _ = _active_user_token(client, db, test_user_data)
    resp = client.post("/api/v1/predictions/",
        json={"dataset_id": str(uuid.uuid4()), "prediction_type": "sleep_quality"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 404


def test_get_prediction(client, db, test_user_data, monkeypatch):
    import app.api.v1.predictions as pred_route
    monkeypatch.setattr(pred_route, "run_prediction", lambda *a, **kw: None)

    token, user_id = _active_user_token(client, db, test_user_data)
    dataset_id = _seed_ready_dataset(db, user_id)

    create = client.post("/api/v1/predictions/",
        json={"dataset_id": dataset_id, "prediction_type": "stress_level"},
        headers={"Authorization": f"Bearer {token}"},
    )
    pred_id = create.json()["id"]

    get = client.get(f"/api/v1/predictions/{pred_id}",
                     headers={"Authorization": f"Bearer {token}"})
    assert get.status_code == 200
    assert get.json()["id"] == pred_id
