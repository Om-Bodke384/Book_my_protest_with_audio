import { create } from "zustand";
import { AuthUser, Role } from "../types";

interface AuthState {
  user: AuthUser | null;
  role: Role | null;
  accessToken: string | null;
  setSession: (user: AuthUser, role: Role, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  clear: () => void;
}

// Access token lives only in memory — never localStorage — to limit XSS blast radius.
// Refresh token is an httpOnly cookie set by the backend.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  accessToken: null,
  setSession: (user, role, accessToken) => set({ user, role, accessToken }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clear: () => set({ user: null, role: null, accessToken: null }),
}));
