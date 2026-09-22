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
    // In development mode, fallback to seed demo user
    config.headers["x-demo-user-id"] = localStorage.getItem("momentum_demo_userId") || "clx_seed_user_id";
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
