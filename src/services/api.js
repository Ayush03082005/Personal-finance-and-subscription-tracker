import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL || "";
const baseURL = rawApiUrl ? `${rawApiUrl.replace(/\/+$/, "")}/api` : "/api";

const API = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach Authorization Bearer token from localStorage if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("fintrack_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (data) => API.post("/auth/login", data),
  register: (data) => API.post("/auth/register", data),
  demoLogin: () => API.post("/auth/demo"),
  logout: () => API.post("/auth/logout"),
  getMe: () => API.get("/auth/me"),
  updateProfile: (data) => API.put("/auth/profile", data),
};

// Subscriptions API
export const subscriptionAPI = {
  getAll: (params) => API.get("/subscriptions", { params }),
  getUpcoming: (params) => API.get("/subscriptions/upcoming", { params }),
  getById: (id) => API.get(`/subscriptions/${id}`),
  create: (data) => API.post("/subscriptions", data),
  update: (id, data) => API.put(`/subscriptions/${id}`, data),
  toggleStatus: (id, status) => API.patch(`/subscriptions/${id}/status`, { status }),
  logPayment: (id) => API.post(`/subscriptions/${id}/log-payment`),
  delete: (id) => API.delete(`/subscriptions/${id}`),
};

// Transactions API
export const transactionAPI = {
  getAll: (params) => API.get("/transactions", { params }),
  getById: (id) => API.get(`/transactions/${id}`),
  create: (data) => API.post("/transactions", data),
  update: (id, data) => API.put(`/transactions/${id}`, data),
  delete: (id) => API.delete(`/transactions/${id}`),
  getExportUrl: () => `${baseURL}/transactions/export/csv`,
};

// Budgets API
export const budgetAPI = {
  getAll: () => API.get("/budgets"),
  create: (data) => API.post("/budgets", data),
  update: (id, data) => API.put(`/budgets/${id}`, data),
  delete: (id) => API.delete(`/budgets/${id}`),
};

// Goals API
export const goalAPI = {
  getAll: () => API.get("/goals"),
  create: (data) => API.post("/goals", data),
  update: (id, data) => API.put(`/goals/${id}`, data),
  deposit: (id, data) => API.post(`/goals/${id}/deposit`, data),
  delete: (id) => API.delete(`/goals/${id}`),
};

// Analytics & Insights API
export const analyticsAPI = {
  getSummary: () => API.get("/analytics/summary"),
  getInsights: () => API.get("/analytics/insights"),
  getCashflow: () => API.get("/analytics/cashflow"),
};

// Demo Data Seeder API
export const demoAPI = {
  resetData: () => API.post("/demo/reset"),
};

export default API;
