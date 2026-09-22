import { create } from "zustand";
import type { User } from "../types";
import { api } from "../api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("momentum_access_token"),
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, token) => {
    localStorage.setItem("momentum_access_token", token);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem("momentum_access_token");
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  fetchMe: async () => {
    try {
      set({ isLoading: true });
      const res = await api.get("/auth/me");
      if (res.data?.data) {
        set({ user: res.data.data, isAuthenticated: true, isLoading: false });
      }
    } catch (e) {
      // Fallback demo user for immediate seamless experience
      try {
        const demoRes = await api.get("/dashboard");
        if (demoRes.data?.data?.user) {
          set({ user: demoRes.data.data.user, isAuthenticated: true, isLoading: false });
          return;
        }
      } catch (err) {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    }
  },
}));
