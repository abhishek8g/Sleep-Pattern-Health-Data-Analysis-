import pandas as pd
import numpy as np
from typing import Optional, List
from sqlalchemy.orm import Session
import json
import math

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    mean_absolute_error, mean_squared_error, r2_score
)

try:
    import xgboost as xgb
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

try:
    import lightgbm as lgb
    HAS_LGB = True
except ImportError:
    HAS_LGB = False

try:
    import shap
    HAS_SHAP = True
except ImportError:
    HAS_SHAP = False

from app.models.prediction import Prediction, PredictionStatus
from app.models.dataset import Dataset
from app.services.dataset_service import read_file_to_dataframe
import httpx
import io

import logging
logger = logging.getLogger(__name__)


def safe_float(val):
    """Convert to float, return None if NaN/Inf."""
    try:
        f = float(val)
        return None if (math.isnan(f) or math.isinf(f)) else round(f, 4)
    except Exception:
        return None


def prepare_features(df: pd.DataFrame, target_col: str):
    """Encode and scale features."""
    df = df.copy()
    label_encoders = {}

    # Drop non-numeric columns that can't be easily encoded
    for col in df.columns:
        if df[col].dtype == "object":
            try:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))
                label_encoders[col] = le
            except Exception:
                df = df.drop(columns=[col])

    df = df.dropna()

    if target_col not in df.columns:
        # Try to find a similar column
        matches = [c for c in df.columns if target_col.replace("_", " ").lower() in c.lower()]
        if matches:
            target_col = matches[0]
        else:
            # Use last column as target
            target_col = df.columns[-1]

    X = df.drop(columns=[target_col])
    y = df[target_col]
    return X, y, label_encoders


def train_classification_models(X_train, X_test, y_train, y_test) -> dict:
    """Train multiple classifiers and return metrics."""
    models = {
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
        "Decision Tree": DecisionTreeClassifier(random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(random_state=42),
        "KNN": KNeighborsClassifier(n_neighbors=5),
        "Neural Network": MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=200, random_state=42),
    }
    if HAS_XGB:
        models["XGBoost"] = xgb.XGBClassifier(use_label_encoder=False, eval_metric="logloss", random_state=42)
    if HAS_LGB:
        models["LightGBM"] = lgb.LGBMClassifier(random_state=42, verbose=-1)

    results = {}
    for name, model in models.items():
        try:
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            avg = "weighted" if len(np.unique(y_test)) > 2 else "binary"
            results[name] = {
                "accuracy": safe_float(accuracy_score(y_test, y_pred)),
                "precision": safe_float(precision_score(y_test, y_pred, average=avg, zero_division=0)),
                "recall": safe_float(recall_score(y_test, y_pred, average=avg, zero_division=0)),
                "f1_score": safe_float(f1_score(y_test, y_pred, average=avg, zero_division=0)),
                "mae": None, "mse": None, "rmse": None, "r2": None,
            }
        except Exception as e:
            logger.warning(f"Model {name} failed: {e}")
            results[name] = {"error": str(e)}
    return results


def train_regression_models(X_train, X_test, y_train, y_test) -> dict:
    """Train multiple regressors and return metrics."""
    models = {
        "Linear Regression": LinearRegression(),
        "Random Forest": RandomForestRegressor(n_estimators=100, random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(random_state=42),
    }
    if HAS_XGB:
        models["XGBoost"] = xgb.XGBRegressor(random_state=42)
    if HAS_LGB:
        models["LightGBM"] = lgb.LGBMRegressor(random_state=42, verbose=-1)

    results = {}
    for name, model in models.items():
        try:
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            results[name] = {
                "accuracy": None, "precision": None, "recall": None, "f1_score": None,
                "mae": safe_float(mean_absolute_error(y_test, y_pred)),
                "mse": safe_float(mse),
                "rmse": safe_float(np.sqrt(mse)),
                "r2": safe_float(r2_score(y_test, y_pred)),
            }
        except Exception as e:
            logger.warning(f"Model {name} failed: {e}")
            results[name] = {"error": str(e)}
    return results


def select_best_model(results: dict, task: str) -> tuple[str, dict]:
    """Pick the best performing model."""
    best_name = None
    best_score = -1
    for name, metrics in results.items():
        if "error" in metrics:
            continue
        score = metrics.get("accuracy") or metrics.get("r2") or 0
        if score and score > best_score:
            best_score = score
            best_name = name
    return best_name, results.get(best_name, {})


def run_prediction(
    db: Session,
    prediction: Prediction,
    dataset: Dataset,
    target_column: str,
    feature_columns: Optional[List[str]] = None,
):
    """Full ML pipeline: load data, train, evaluate, save."""
    try:
        prediction.status = PredictionStatus.RUNNING
        db.commit()

        # Fetch file from URL
        with httpx.Client(timeout=30) as client:
            response = client.get(dataset.file_url)
        file_bytes = response.content

        df = read_file_to_dataframe(file_bytes, dataset.file_type)

        if feature_columns:
            cols = feature_columns + [target_column]
            df = df[[c for c in cols if c in df.columns]]

        is_classification = df[target_column].nunique() <= 15 or df[target_column].dtype == "object"
        X, y, _ = prepare_features(df, target_column)

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

        if is_classification:
            results = train_classification_models(X_train, X_test, y_train, y_test)
        else:
            results = train_regression_models(X_train, X_test, y_train, y_test)

        best_name, best_metrics = select_best_model(results, "classification" if is_classification else "regression")

        # Feature importance from Random Forest
        feature_importance = {}
        try:
            rf = RandomForestClassifier(n_estimators=50, random_state=42) if is_classification else RandomForestRegressor(n_estimators=50, random_state=42)
            rf.fit(X_train, y_train)
            feature_importance = dict(zip(X.columns.tolist(), [safe_float(v) for v in rf.feature_importances_]))
        except Exception:
            pass

        prediction.model_results = results
        prediction.best_model = best_name
        prediction.model_name = best_name
        prediction.accuracy = best_metrics.get("accuracy")
        prediction.precision = best_metrics.get("precision")
        prediction.recall = best_metrics.get("recall")
        prediction.f1_score = best_metrics.get("f1_score")
        prediction.mae = best_metrics.get("mae")
        prediction.mse = best_metrics.get("mse")
        prediction.rmse = best_metrics.get("rmse")
        prediction.r2_score = best_metrics.get("r2")
        prediction.confidence_score = best_metrics.get("accuracy") or best_metrics.get("r2") or 0.0
        prediction.feature_importance = feature_importance
        prediction.status = PredictionStatus.COMPLETED
        db.commit()
        db.refresh(prediction)

    except Exception as e:
        prediction.status = PredictionStatus.FAILED
        prediction.error_message = str(e)
        db.commit()
        logger.error(f"Prediction failed: {e}")
        raise e
