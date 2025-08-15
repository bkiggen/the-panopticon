import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id?: string;
  name?: string;
  email?: string;
}

interface SessionState {
  // State
  isAuthenticated: boolean;

  // Actions
  login: () => void;
  logout: () => void;

  // Helper getters
  getIsAuthenticated: () => boolean;
}

const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // State
      isAuthenticated: false,

      // Actions
      login: () => {
        set({
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
        });
      },
      getIsAuthenticated: () => get().isAuthenticated,
    }),
    {
      name: "session-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useSessionStore;
export type { User, SessionState };
