import google.generativeai as genai
from app.core.config import settings
import logging
import json

logger = logging.getLogger(__name__)


def get_gemini_model():
    """Initialize and return Gemini model."""
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel("gemini-pro")


def ask_ai(question: str, context: str = "") -> str:
    """Ask Gemini a question with optional context."""
    try:
        model = get_gemini_model()
        prompt = f"""You are SleepSense AI, a health and sleep analysis expert.
        
Context about the user's data:
{context}

User Question: {question}

Provide a clear, helpful, and personalized response based on the context. 
Be specific, actionable, and supportive. Format using bullet points where appropriate."""

        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return "I'm unable to process your request right now. Please try again later."


def generate_health_recommendations(summary_stats: dict, prediction_results: dict = None) -> dict:
    """Generate comprehensive health recommendations using AI."""
    try:
        model = get_gemini_model()
        context = f"""
Sleep & Health Data Summary:
{json.dumps(summary_stats, indent=2)}

Prediction Results:
{json.dumps(prediction_results, indent=2) if prediction_results else "No predictions yet"}
"""
        prompt = f"""Based on this sleep and health data, generate detailed recommendations in JSON format:
{context}

Return ONLY valid JSON with this structure:
{{
  "health_recommendations": ["recommendation 1", "recommendation 2", ...],
  "lifestyle_recommendations": ["tip 1", "tip 2", ...],
  "diet_suggestions": ["suggestion 1", ...],
  "exercise_recommendations": ["exercise 1", ...],
  "sleep_improvement_tips": ["tip 1", "tip 2", ...],
  "health_score": <number 0-100>,
  "sleep_score": <number 0-100>,
  "summary": "Brief overall assessment"
}}"""
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Extract JSON from response
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        return json.loads(text)
    except Exception as e:
        logger.error(f"AI recommendations error: {e}")
        return {
            "health_recommendations": ["Maintain a consistent sleep schedule", "Aim for 7-9 hours of sleep"],
            "lifestyle_recommendations": ["Reduce screen time before bed", "Exercise regularly"],
            "diet_suggestions": ["Avoid caffeine after 2 PM", "Stay hydrated"],
            "exercise_recommendations": ["30 min moderate exercise daily", "Yoga or stretching before bed"],
            "sleep_improvement_tips": ["Keep bedroom cool and dark", "Use a sleep diary"],
            "health_score": 70,
            "sleep_score": 65,
            "summary": "Based on your data, there are opportunities to improve your sleep quality and overall health."
        }


def generate_eda_insights(columns_info: dict, summary_stats: dict) -> str:
    """Generate AI insights from EDA results."""
    try:
        model = get_gemini_model()
        prompt = f"""Analyze this sleep health dataset and provide insights:

Columns: {json.dumps(columns_info, indent=2)}
Statistics: {json.dumps(summary_stats, indent=2)}

Provide:
1. Key patterns you observe
2. Potential data quality issues
3. Most important features for sleep analysis
4. Interesting correlations to investigate
5. Actionable insights

Keep it concise, insightful, and health-focused."""
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"EDA insights error: {e}")
        return "AI insights are currently unavailable. Please review the statistical summary above."


def explain_prediction(prediction_type: str, metrics: dict, feature_importance: dict) -> str:
    """Explain a prediction result in plain language."""
    try:
        model = get_gemini_model()
        prompt = f"""Explain this sleep health prediction result to a non-technical user:

Prediction Type: {prediction_type}
Model Metrics: {json.dumps(metrics, indent=2)}
Top Features: {json.dumps(feature_importance, indent=2)}

Explain:
1. What this prediction means
2. How confident the model is
3. Which factors matter most
4. What the user can do to improve their score
Use simple, encouraging language."""
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Prediction explanation error: {e}")
        return "This prediction analyzes your sleep patterns and health metrics to provide personalized insights."


def generate_weekly_report_summary(user_data: dict) -> str:
    """Generate weekly report narrative."""
    try:
        model = get_gemini_model()
        prompt = f"""Generate a personalized weekly sleep & health report summary for this user:

{json.dumps(user_data, indent=2)}

Include:
- Overall health assessment
- Sleep quality trend
- Notable improvements or concerns
- Specific tips for next week
Keep it motivating and under 200 words."""
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Weekly report error: {e}")
        return "Your weekly health summary is ready. Review your dashboard for detailed insights."
