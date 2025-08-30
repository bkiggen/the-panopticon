import { create } from "zustand";
import { persist } from "zustand/middleware";
import { API_CONFIG } from "@/services/api/config";

interface SessionState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    isAdmin: boolean;
  } | null;
  setAuthenticated: (authenticated: boolean) => void;
  setUser: (user: SessionState["user"]) => void;
  clearSession: () => void;
}

const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      setAuthenticated: (authenticated: boolean) =>
        set({ isAuthenticated: authenticated }),

      setUser: (user: SessionState["user"]) =>
        set({ user, isAuthenticated: !!user }),

      clearSession: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: API_CONFIG.STORAGE_KEYS.SESSION,
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useSessionStore;
