import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/auth.service";

interface AuthState {
  user: any | null;
  token: string | null;
  refreshToken: string | null;
  roles: string[];
  role: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  setToken: (token: string) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      roles: [],
      role: null,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(username, password);

          // Normalize roles
          const userRoles = response.user.roles || [];
          const primaryRole = userRoles.length > 0 ? userRoles[0] : null;

          // Save tokens
          localStorage.setItem("token", response.access_token);
          if (response.refresh_token) {
            localStorage.setItem("refresh_token", response.refresh_token);
          }

          set({
            user: response.user,
            token: response.access_token,
            refreshToken: response.refresh_token || null,
            roles: userRoles,
            role: primaryRole,
            isLoading: false,
          });
        } catch (error: any) {
          const message =
            error.response?.data?.detail ||
            error.message ||
            "Login failed. Please try again.";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        set({
          user: null,
          token: null,
          refreshToken: null,
          roles: [],
          role: null,
        });
        // Clear persisted data
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        sessionStorage.clear();
      },

      loadUser: async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        set({ isLoading: true });
        try {
          const user = await authService.getCurrentUser();
          const userRoles = user.roles || [];
          set({
            user,
            roles: userRoles,
            role: userRoles[0] || null,
            token,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          localStorage.removeItem("token");
        }
      },

      refreshAccessToken: async () => {
        const refreshToken =
          localStorage.getItem("refresh_token") || get().refreshToken;
        if (!refreshToken) return null;
        try {
          const newToken = await authService.refresh(refreshToken);
          if (newToken) {
            set({ token: newToken });
            localStorage.setItem("token", newToken);
            return newToken;
          }
        } catch {
          get().logout();
        }
        return null;
      },

      setToken: (token: string) => set({ token }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        roles: state.roles,
        role: state.role,
      }),
    }
  )
);

export default useAuthStore;
