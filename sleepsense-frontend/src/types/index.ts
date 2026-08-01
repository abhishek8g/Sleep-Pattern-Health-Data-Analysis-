// ─── Auth ─────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "user";
export type UserStatus = "active" | "suspended" | "pending";

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  status: UserStatus;
  is_email_verified: boolean;
  bio: string | null;
  phone: string | null;
  timezone: string;
  language: string;
  theme: string;
  email_notifications: boolean;
  push_notifications: boolean;
  last_login: string | null;
  login_count: number;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// ─── Dataset ──────────────────────────────────────────────────────────────

export type DatasetStatus = "uploading" | "processing" | "ready" | "failed";

export interface ColumnInfo {
  dtype: string;
  is_numeric: boolean;
  null_count: number;
  null_percent: number;
  unique_count: number;
  min?: number;
  max?: number;
  mean?: number;
  std?: number;
}

export interface Dataset {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  row_count: number | null;
  column_count: number | null;
  status: DatasetStatus;
  columns_info: Record<string, ColumnInfo> | null;
  summary_stats: Record<string, any> | null;
  preview_data: Record<string, any>[] | null;
  is_cleaned: boolean;
  cleaning_report: Record<string, any> | null;
  created_at: string;
  updated_at: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// ─── Prediction ───────────────────────────────────────────────────────────

export type PredictionType =
  | "sleep_quality"
  | "stress_level"
  | "heart_rate_risk"
  | "lifestyle_score";

export type PredictionStatus = "pending" | "running" | "completed" | "failed";

export interface ModelMetrics {
  accuracy?: number | null;
  precision?: number | null;
  recall?: number | null;
  f1_score?: number | null;
  mae?: number | null;
  mse?: number | null;
  rmse?: number | null;
  r2?: number | null;
}

export interface Prediction {
  id: string;
  user_id: string;
  dataset_id: string | null;
  prediction_type: PredictionType;
  status: PredictionStatus;
  model_name: string | null;
  model_results: Record<string, ModelMetrics> | null;
  best_model: string | null;
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1_score: number | null;
  mae: number | null;
  mse: number | null;
  rmse: number | null;
  r2_score: number | null;
  confidence_score: number | null;
  feature_importance: Record<string, number> | null;
  predictions_data: any[] | null;
  error_message: string | null;
  created_at: string;
  updated_at: string | null;
}

// ─── Notification ─────────────────────────────────────────────────────────

export type NotificationType =
  | "prediction_completed"
  | "dataset_processed"
  | "weekly_summary"
  | "system"
  | "achievement";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface PaginatedNotifications {
  items: Notification[];
  total: number;
  unread_count: number;
}

// ─── EDA ──────────────────────────────────────────────────────────────────

export interface EDAResult {
  id: string;
  dataset_id: string;
  summary_stats: Record<string, any>;
  correlation_matrix: Record<string, Record<string, number>>;
  missing_values: Record<string, number>;
  outliers: Record<string, number>;
  distributions: Record<string, {
    counts: number[];
    bin_edges: number[];
    mean: number;
    median: number;
    std: number;
    min: number;
    max: number;
  }>;
  charts_data: {
    distributions: Record<string, any>;
    categories: Record<string, { labels: string[]; values: number[] }>;
    scatter_pairs: Array<{ x_col: string; y_col: string; x: number[]; y: number[] }>;
  };
  ai_insights: string | null;
  created_at: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────

export interface AdminDashboard {
  total_users: number;
  active_users: number;
  total_datasets: number;
  total_predictions: number;
  new_users_30_days: number;
  daily_registrations: Array<{ date: string; count: number }>;
  top_users: Array<{ id: string; name: string; email: string; datasets: number }>;
}

// ─── AI ───────────────────────────────────────────────────────────────────

export interface HealthRecommendations {
  health_recommendations: string[];
  lifestyle_recommendations: string[];
  diet_suggestions: string[];
  exercise_recommendations: string[];
  sleep_improvement_tips: string[];
  health_score: number;
  sleep_score: number;
  summary: string;
}
