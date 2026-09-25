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
    localStorage.removeItem("momentum_refresh_token");
    localStorage.removeItem("momentum_demo_userId");
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    window.location.href = "/login";
  },

  fetchMe: async () => {
    try {
      set({ isLoading: true });
      const res = await api.get("/auth/me");
      if (res.data?.data) {
        set({ user: res.data.data, isAuthenticated: true, isLoading: false });
      }
    } catch (e) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
