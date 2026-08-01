import pandas as pd
import numpy as np
import json
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
import cloudinary
import cloudinary.uploader
import io
import math

from app.models.dataset import Dataset, DatasetStatus
from app.core.config import settings

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)


def upload_file_to_cloudinary(file_bytes: bytes, filename: str, folder: str = "sleepsense/datasets") -> str:
    """Upload file to Cloudinary and return URL."""
    try:
        result = cloudinary.uploader.upload(
            file_bytes,
            folder=folder,
            public_id=filename,
            resource_type="raw",
        )
        return result["secure_url"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")


def read_file_to_dataframe(file_bytes: bytes, file_type: str) -> pd.DataFrame:
    """Parse uploaded file into DataFrame."""
    try:
        if file_type == "csv":
            return pd.read_csv(io.BytesIO(file_bytes))
        elif file_type in ["xlsx", "xls", "excel"]:
            return pd.read_excel(io.BytesIO(file_bytes))
        elif file_type == "json":
            return pd.read_json(io.BytesIO(file_bytes))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse file: {str(e)}")


def get_columns_info(df: pd.DataFrame) -> dict:
    """Extract column metadata."""
    columns_info = {}
    for col in df.columns:
        dtype = str(df[col].dtype)
        columns_info[col] = {
            "dtype": dtype,
            "is_numeric": pd.api.types.is_numeric_dtype(df[col]),
            "null_count": int(df[col].isnull().sum()),
            "null_percent": round(df[col].isnull().mean() * 100, 2),
            "unique_count": int(df[col].nunique()),
        }
        if pd.api.types.is_numeric_dtype(df[col]):
            columns_info[col].update({
                "min": float(df[col].min()) if not pd.isna(df[col].min()) else None,
                "max": float(df[col].max()) if not pd.isna(df[col].max()) else None,
                "mean": float(df[col].mean()) if not pd.isna(df[col].mean()) else None,
                "std": float(df[col].std()) if not pd.isna(df[col].std()) else None,
            })
    return columns_info


def get_summary_stats(df: pd.DataFrame) -> dict:
    """Generate summary statistics."""
    numeric_cols = df.select_dtypes(include=[np.number])
    stats = {}
    if not numeric_cols.empty:
        desc = numeric_cols.describe().to_dict()
        # Convert float values safely
        for col, values in desc.items():
            stats[col] = {k: (float(v) if not (isinstance(v, float) and math.isnan(v)) else None)
                          for k, v in values.items()}
    return {
        "shape": {"rows": int(df.shape[0]), "cols": int(df.shape[1])},
        "numeric_stats": stats,
        "missing_values": {col: int(df[col].isnull().sum()) for col in df.columns},
        "duplicate_rows": int(df.duplicated().sum()),
        "data_types": {col: str(dtype) for col, dtype in df.dtypes.items()},
    }


def clean_dataframe(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    """Automatically clean the dataset."""
    report = {
        "original_rows": int(df.shape[0]),
        "original_cols": int(df.shape[1]),
        "actions": [],
    }

    # Remove duplicates
    dup_count = int(df.duplicated().sum())
    if dup_count > 0:
        df = df.drop_duplicates()
        report["actions"].append(f"Removed {dup_count} duplicate rows")

    # Handle missing values
    for col in df.columns:
        missing = int(df[col].isnull().sum())
        if missing > 0:
            if pd.api.types.is_numeric_dtype(df[col]):
                df[col] = df[col].fillna(df[col].median())
                report["actions"].append(f"Filled {missing} missing values in '{col}' with median")
            else:
                df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else "Unknown")
                report["actions"].append(f"Filled {missing} missing values in '{col}' with mode")

    # Remove outliers from numeric columns (IQR method)
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR
        outlier_count = int(((df[col] < lower) | (df[col] > upper)).sum())
        if outlier_count > 0 and outlier_count < len(df) * 0.1:  # Max 10%
            df = df[(df[col] >= lower) & (df[col] <= upper)]
            report["actions"].append(f"Removed {outlier_count} outliers from '{col}'")

    report["cleaned_rows"] = int(df.shape[0])
    report["cleaned_cols"] = int(df.shape[1])
    report["rows_removed"] = report["original_rows"] - report["cleaned_rows"]
    return df, report


def process_dataset(db: Session, dataset: Dataset, file_bytes: bytes):
    """Full dataset processing pipeline."""
    try:
        dataset.status = DatasetStatus.PROCESSING
        db.commit()

        df = read_file_to_dataframe(file_bytes, dataset.file_type)
        dataset.row_count = int(df.shape[0])
        dataset.column_count = int(df.shape[1])
        dataset.columns_info = get_columns_info(df)
        dataset.summary_stats = get_summary_stats(df)
        dataset.preview_data = json.loads(df.head(10).to_json(orient="records"))

        # Auto clean
        cleaned_df, cleaning_report = clean_dataframe(df.copy())
        dataset.is_cleaned = True
        dataset.cleaning_report = cleaning_report

        dataset.status = DatasetStatus.READY
        db.commit()
        db.refresh(dataset)
    except Exception as e:
        dataset.status = DatasetStatus.FAILED
        db.commit()
        raise e
