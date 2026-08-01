import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send email via SMTP."""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.FROM_EMAIL
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.FROM_EMAIL, to_email, msg.as_string())
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


def send_verification_email(to_email: str, full_name: str, otp: str) -> bool:
    subject = "Verify Your SleepSense AI Account"
    html_body = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:40px;border-radius:12px;">
      <div style="text-align:center;margin-bottom:32px;">
        <h1 style="color:#818cf8;font-size:28px;margin:0;">SleepSense AI</h1>
        <p style="color:#94a3b8;margin-top:8px;">Sleep Pattern & Health Analysis</p>
      </div>
      <h2 style="color:#e2e8f0;">Verify your email address</h2>
      <p>Hi {full_name}, welcome to SleepSense AI! Use the OTP below to verify your account:</p>
      <div style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:24px;text-align:center;margin:24px 0;">
        <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#818cf8;">{otp}</span>
      </div>
      <p style="color:#94a3b8;font-size:14px;">This OTP expires in 10 minutes. If you didn't request this, ignore this email.</p>
    </div>
    """
    return send_email(to_email, subject, html_body)


def send_reset_password_email(to_email: str, full_name: str, reset_link: str) -> bool:
    subject = "Reset Your SleepSense AI Password"
    html_body = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:40px;border-radius:12px;">
      <div style="text-align:center;margin-bottom:32px;">
        <h1 style="color:#818cf8;font-size:28px;margin:0;">SleepSense AI</h1>
      </div>
      <h2 style="color:#e2e8f0;">Reset your password</h2>
      <p>Hi {full_name}, click the button below to reset your password:</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="{reset_link}" style="background:#6366f1;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">Reset Password</a>
      </div>
      <p style="color:#94a3b8;font-size:14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>
    """
    return send_email(to_email, subject, html_body)


def send_weekly_report_email(to_email: str, full_name: str, report_html: str) -> bool:
    subject = "Your Weekly SleepSense AI Health Report"
    html_body = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:40px;border-radius:12px;">
      <div style="text-align:center;margin-bottom:32px;">
        <h1 style="color:#818cf8;font-size:28px;margin:0;">SleepSense AI</h1>
        <p style="color:#94a3b8;">Weekly Health Report</p>
      </div>
      <p>Hi {full_name}, here's your weekly sleep & health summary:</p>
      {report_html}
      <p style="color:#94a3b8;font-size:14px;margin-top:32px;">
        <a href="{settings.FRONTEND_URL}/dashboard" style="color:#818cf8;">View full dashboard →</a>
      </p>
    </div>
    """
    return send_email(to_email, subject, html_body)
