import { create } from "zustand";
import { Shop } from "@/types";

interface AuthState {
  user: any | null;
  shop: Shop | null;
  loading: boolean;
  setAuth: (user: any | null, shop: Shop | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  shop: null,
  loading: true, // Starts true until Firebase checks session
  setAuth: (user, shop) => set({ user, shop, loading: false }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ user: null, shop: null, loading: false }),
}));