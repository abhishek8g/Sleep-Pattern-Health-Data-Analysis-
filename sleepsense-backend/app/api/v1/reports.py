from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import Optional
import math

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.report import Report, ReportType
from app.models.dataset import Dataset
from app.schemas.auth import MessageResponse

router = APIRouter(prefix="/reports", tags=["Reports"])


def generate_pdf_report(dataset: Dataset, user: User) -> bytes:
    """Generate a PDF report for a dataset."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib import colors
        from reportlab.lib.units import inch
        import io

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []

        # Title
        story.append(Paragraph("SleepSense AI — Dataset Report", styles["Title"]))
        story.append(Spacer(1, 12))
        story.append(Paragraph(f"Dataset: {dataset.name}", styles["Heading1"]))
        story.append(Paragraph(f"Generated for: {user.full_name}", styles["Normal"]))
        story.append(Paragraph(f"Date: {dataset.created_at.strftime('%Y-%m-%d')}", styles["Normal"]))
        story.append(Spacer(1, 20))

        # Dataset Overview
        story.append(Paragraph("Dataset Overview", styles["Heading2"]))
        overview_data = [
            ["Property", "Value"],
            ["File Name", dataset.file_name],
            ["File Type", dataset.file_type.upper()],
            ["Total Rows", str(dataset.row_count or "N/A")],
            ["Total Columns", str(dataset.column_count or "N/A")],
            ["File Size", f"{dataset.file_size // 1024} KB"],
            ["Status", dataset.status.value.title()],
        ]
        table = Table(overview_data, colWidths=[2.5 * inch, 4 * inch])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#6366f1")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8fafc"), colors.white]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("PADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(table)
        story.append(Spacer(1, 20))

        # Summary Stats
        if dataset.summary_stats:
            story.append(Paragraph("Summary Statistics", styles["Heading2"]))
            stats = dataset.summary_stats.get("numeric_stats", {})
            for col, col_stats in list(stats.items())[:5]:
                story.append(Paragraph(f"Column: {col}", styles["Heading3"]))
                stat_data = [[k.title(), str(round(v, 4)) if v is not None else "N/A"]
                             for k, v in col_stats.items()]
                stat_table = Table([["Metric", "Value"]] + stat_data, colWidths=[2.5 * inch, 4 * inch])
                stat_table.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                    ("PADDING", (0, 0), (-1, -1), 6),
                ]))
                story.append(stat_table)
                story.append(Spacer(1, 10))

        doc.build(story)
        return buffer.getvalue()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


@router.post("/generate/{dataset_id}", response_model=dict)
def generate_report(
    dataset_id: str,
    report_type: str = "pdf",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Generate a report for a dataset."""
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id, Dataset.user_id == current_user.id
    ).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    report = Report(
        user_id=current_user.id,
        dataset_id=dataset.id,
        title=f"{dataset.name} — {report_type.upper()} Report",
        report_type=report_type,
        report_data=dataset.summary_stats,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "id": str(report.id),
        "title": report.title,
        "report_type": report.report_type.value,
        "created_at": report.created_at.isoformat(),
    }


@router.get("/download/{dataset_id}/pdf")
def download_pdf(
    dataset_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Download PDF report for a dataset."""
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id, Dataset.user_id == current_user.id
    ).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    pdf_bytes = generate_pdf_report(dataset, current_user)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={dataset.name}_report.pdf"},
    )


@router.get("/", response_model=dict)
def list_reports(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """List user reports."""
    query = db.query(Report).filter(Report.user_id == current_user.id)
    total = query.count()
    items = query.order_by(Report.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": [
            {
                "id": str(r.id),
                "title": r.title,
                "report_type": r.report_type.value,
                "dataset_id": str(r.dataset_id) if r.dataset_id else None,
                "created_at": r.created_at.isoformat(),
            }
            for r in items
        ],
        "total": total,
        "page": page,
        "pages": math.ceil(total / per_page),
    }
