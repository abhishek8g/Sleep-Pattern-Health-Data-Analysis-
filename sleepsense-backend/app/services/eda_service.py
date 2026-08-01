import pandas as pd
import numpy as np
import json
import math
from typing import Optional
from sqlalchemy.orm import Session

from app.models.dataset import Dataset
from app.models.eda_result import EDAResult
from app.services.dataset_service import read_file_to_dataframe
from app.services.ai_service import generate_eda_insights
import httpx
import logging

logger = logging.getLogger(__name__)


def safe_val(v):
    """Safe conversion for JSON serialization."""
    if v is None:
        return None
    if isinstance(v, (np.integer,)):
        return int(v)
    if isinstance(v, (np.floating,)):
        f = float(v)
        return None if (math.isnan(f) or math.isinf(f)) else round(f, 4)
    if isinstance(v, (np.ndarray,)):
        return v.tolist()
    return v


def compute_correlation_matrix(df: pd.DataFrame) -> dict:
    """Compute correlation matrix for numeric columns."""
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.empty:
        return {}
    corr = numeric_df.corr()
    result = {}
    for col in corr.columns:
        result[col] = {c: safe_val(corr.loc[col, c]) for c in corr.columns}
    return result


def compute_distributions(df: pd.DataFrame) -> dict:
    """Compute histogram data for numeric columns."""
    distributions = {}
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols[:10]:  # Limit to 10 columns
        try:
            counts, bin_edges = np.histogram(df[col].dropna(), bins=20)
            distributions[col] = {
                "counts": [int(c) for c in counts],
                "bin_edges": [safe_val(e) for e in bin_edges],
                "mean": safe_val(df[col].mean()),
                "median": safe_val(df[col].median()),
                "std": safe_val(df[col].std()),
                "min": safe_val(df[col].min()),
                "max": safe_val(df[col].max()),
            }
        except Exception as e:
            logger.warning(f"Distribution failed for {col}: {e}")
    return distributions


def compute_category_counts(df: pd.DataFrame) -> dict:
    """Compute value counts for categorical columns."""
    cat_data = {}
    cat_cols = df.select_dtypes(include=["object", "category"]).columns
    for col in cat_cols[:5]:
        vc = df[col].value_counts().head(10)
        cat_data[col] = {
            "labels": vc.index.tolist(),
            "values": [int(v) for v in vc.values],
        }
    return cat_data


def run_eda(db: Session, dataset: Dataset) -> EDAResult:
    """Run full EDA on a dataset and store results."""
    try:
        # Fetch file
        with httpx.Client(timeout=30) as client:
            response = client.get(dataset.file_url)
        df = read_file_to_dataframe(response.content, dataset.file_type)

        # Compute all EDA metrics
        correlation_matrix = compute_correlation_matrix(df)
        distributions = compute_distributions(df)
        category_data = compute_category_counts(df)
        missing_values = {col: int(df[col].isnull().sum()) for col in df.columns}
        outliers = {}
        for col in df.select_dtypes(include=[np.number]).columns:
            q1, q3 = df[col].quantile(0.25), df[col].quantile(0.75)
            iqr = q3 - q1
            n_outliers = int(((df[col] < q1 - 1.5 * iqr) | (df[col] > q3 + 1.5 * iqr)).sum())
            if n_outliers > 0:
                outliers[col] = n_outliers

        summary_stats = dataset.summary_stats or {}

        # AI insights
        ai_insights = ""
        try:
            ai_insights = generate_eda_insights(dataset.columns_info or {}, summary_stats)
        except Exception:
            pass

        charts_data = {
            "distributions": distributions,
            "categories": category_data,
            "scatter_pairs": _get_scatter_pairs(df),
        }

        # Upsert EDAResult
        eda = db.query(EDAResult).filter(EDAResult.dataset_id == dataset.id).first()
        if not eda:
            eda = EDAResult(dataset_id=dataset.id)
            db.add(eda)

        eda.summary_stats = summary_stats
        eda.correlation_matrix = correlation_matrix
        eda.missing_values = missing_values
        eda.outliers = outliers
        eda.distributions = distributions
        eda.charts_data = charts_data
        eda.ai_insights = ai_insights
        db.commit()
        db.refresh(eda)
        return eda

    except Exception as e:
        logger.error(f"EDA failed: {e}")
        raise e


def _get_scatter_pairs(df: pd.DataFrame) -> list:
    """Get pairs of numeric columns for scatter plots."""
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()[:5]
    pairs = []
    for i in range(len(numeric_cols)):
        for j in range(i + 1, len(numeric_cols)):
            col_x = numeric_cols[i]
            col_y = numeric_cols[j]
            sample = df[[col_x, col_y]].dropna().head(200)
            pairs.append({
                "x_col": col_x,
                "y_col": col_y,
                "x": [safe_val(v) for v in sample[col_x].tolist()],
                "y": [safe_val(v) for v in sample[col_y].tolist()],
            })
    return pairs
