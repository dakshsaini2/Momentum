import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("momentum_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // In development mode, fallback to seed demo user only if explicitly set
    const demoUserId = localStorage.getItem("momentum_demo_userId");
    if (demoUserId) {
      config.headers["x-demo-user-id"] = demoUserId;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional auto-logout on unauthorized
    }
    return Promise.reject(error);
  }
);
