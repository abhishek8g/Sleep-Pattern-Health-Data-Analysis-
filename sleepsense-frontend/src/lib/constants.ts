/** Application-wide constants */

export const APP_NAME = "SleepSense AI";
export const APP_VERSION = "1.0.0";
export const APP_DESCRIPTION = "Sleep Pattern & Health Data Analysis Platform";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// File upload limits
export const MAX_FILE_SIZE_MB = 50;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_FILE_TYPES = ["csv", "xlsx", "xls", "json"];
export const ALLOWED_MIME_TYPES = [
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/json",
];

// Prediction types
export const PREDICTION_TYPES = [
  { value: "sleep_quality",    label: "Sleep Quality" },
  { value: "stress_level",     label: "Stress Level" },
  { value: "heart_rate_risk",  label: "Heart Rate Risk" },
  { value: "lifestyle_score",  label: "Lifestyle Score" },
] as const;

// ML models list
export const ML_MODELS = [
  "Random Forest",
  "Decision Tree",
  "Gradient Boosting",
  "XGBoost",
  "LightGBM",
  "KNN",
  "Neural Network",
  "Linear Regression",
] as const;

// Chart colors
export const CHART_COLORS = {
  primary:  "#6366f1",
  purple:   "#a855f7",
  pink:     "#ec4899",
  cyan:     "#22d3ee",
  amber:    "#f59e0b",
  green:    "#10b981",
  red:      "#ef4444",
  orange:   "#f97316",
} as const;

export const CHART_COLOR_ARRAY = Object.values(CHART_COLORS);

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// Toast durations
export const TOAST_DURATION_MS = 4000;

// Query stale times
export const STALE_TIME_SHORT  = 30 * 1000;   // 30s
export const STALE_TIME_MEDIUM = 5  * 60 * 1000;  // 5 min
export const STALE_TIME_LONG   = 30 * 60 * 1000;  // 30 min

// User roles
export const USER_ROLES = ["admin", "user"] as const;

// Sleep score thresholds
export const SLEEP_SCORE_GRADES = [
  { min: 90, label: "Excellent", color: "text-green-400" },
  { min: 75, label: "Good",      color: "text-blue-400"  },
  { min: 60, label: "Fair",      color: "text-yellow-400"},
  { min: 40, label: "Poor",      color: "text-orange-400"},
  { min: 0,  label: "Critical",  color: "text-red-400"   },
] as const;
