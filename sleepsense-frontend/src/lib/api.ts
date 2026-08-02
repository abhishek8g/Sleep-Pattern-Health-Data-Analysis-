import axios, { AxiosError, AxiosResponse } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
  timeout: 60000, // 60 seconds — Render free tier needs time to wake up
});

// ─── Request Interceptor (attach token) ──────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor (handle 401 / refresh) ─────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== "undefined"
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token } = res.data;
          localStorage.setItem("access_token", access_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch {
          // Refresh failed — clear tokens and redirect
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      } else {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; username: string; full_name: string; password: string }) =>
    api.post("/auth/register", data),
  verifyEmail: (data: { email: string; otp: string }) =>
    api.post("/auth/verify-email", data),
  resendOTP: (email: string) =>
    api.post("/auth/resend-otp", { email }),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),
  resetPassword: (data: { token: string; new_password: string }) =>
    api.post("/auth/reset-password", data),
  me: () => api.get("/auth/me"),
};

// ─── Users ────────────────────────────────────────────────────────────────
export const usersApi = {
  getProfile: () => api.get("/users/me"),
  updateProfile: (data: any) => api.put("/users/me", data),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/users/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.put("/users/me/password", data),
  deleteAccount: () => api.delete("/users/me"),
  getStats: () => api.get("/users/me/stats"),
};

// ─── Datasets ─────────────────────────────────────────────────────────────
export const datasetsApi = {
  upload: (file: File, name?: string, description?: string) => {
    const form = new FormData();
    form.append("file", file);
    if (name) form.append("name", name);
    if (description) form.append("description", description);
    return api.post("/datasets/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  list: (params?: { page?: number; per_page?: number; search?: string; status?: string }) =>
    api.get("/datasets/", { params }),
  get: (id: string) => api.get(`/datasets/${id}`),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.put(`/datasets/${id}`, data),
  delete: (id: string) => api.delete(`/datasets/${id}`),
  getEDA: (id: string) => api.get(`/datasets/${id}/eda`),
};

// ─── Predictions ──────────────────────────────────────────────────────────
export const predictionsApi = {
  create: (data: {
    dataset_id: string;
    prediction_type: string;
    target_column?: string;
    feature_columns?: string[];
  }) => api.post("/predictions/", data),
  list: (params?: { page?: number; per_page?: number; status?: string }) =>
    api.get("/predictions/", { params }),
  get: (id: string) => api.get(`/predictions/${id}`),
  explain: (id: string) => api.get(`/predictions/${id}/explain`),
};

// ─── AI ───────────────────────────────────────────────────────────────────
export const aiApi = {
  chat: (question: string, dataset_id?: string) =>
    api.post("/ai/chat", { question, dataset_id }),
  recommendations: (datasetId: string) =>
    api.get(`/ai/recommendations/${datasetId}`),
  weeklyReport: () => api.get("/ai/weekly-report"),
};

// ─── Notifications ────────────────────────────────────────────────────────
export const notificationsApi = {
  list: (params?: { page?: number; per_page?: number; unread_only?: boolean }) =>
    api.get("/notifications/", { params }),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put("/notifications/read-all"),
};

// ─── Reports ──────────────────────────────────────────────────────────────
export const reportsApi = {
  generate: (datasetId: string, type: string = "pdf") =>
    api.post(`/reports/generate/${datasetId}`, null, { params: { report_type: type } }),
  downloadPDF: (datasetId: string) =>
    api.get(`/reports/download/${datasetId}/pdf`, { responseType: "blob" }),
  list: (params?: { page?: number; per_page?: number }) =>
    api.get("/reports/", { params }),
};

// ─── Admin ────────────────────────────────────────────────────────────────
export const adminApi = {
  dashboard: () => api.get("/admin/dashboard"),
  listUsers: (params?: any) => api.get("/admin/users", { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  suspendUser: (id: string) => api.put(`/admin/users/${id}/suspend`),
  activateUser: (id: string) => api.put(`/admin/users/${id}/activate`),
  assignRole: (id: string, role: string) =>
    api.put(`/admin/users/${id}/role`, null, { params: { role } }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  activityLogs: (params?: any) => api.get("/admin/activity-logs", { params }),
  systemStats: () => api.get("/admin/system-stats"),
};
