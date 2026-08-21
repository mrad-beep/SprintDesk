import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types';

interface AuthState {
  accessToken: string | null; // memory-only, intentionally NOT persisted
  refreshToken: string | null; // simulated persisted storage
  user: AuthUser | null;
  rememberMe: boolean;
  rememberUntil: number | null;
  isInitializing: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthUser) => void;
  setRememberMe: (remember: boolean) => void;
  setInitializing: (val: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      rememberMe: false,
      rememberUntil: null,
      isInitializing: true,
      setTokens: (accessToken, refreshToken) =>
        set((state) => ({
          accessToken,
          refreshToken,
          rememberUntil: state.rememberMe
            ? Date.now() + 30 * 24 * 60 * 60 * 1000
            : state.rememberUntil,
        })),
      setUser: (user) => set({ user }),
      setRememberMe: (rememberMe) => set({ rememberMe }),
      setInitializing: (val) => set({ isInitializing: val }),
      logout: () =>
        set({ accessToken: null, refreshToken: null, user: null, rememberUntil: null }),
    }),
    {
      name: 'sprintdesk-auth',
      // Only the refresh token + minimal profile survive a refresh — this is the
      // "specified local-storage simulation" for persisted session recovery.
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        user: state.user,
        rememberMe: state.rememberMe,
        rememberUntil: state.rememberUntil,
      }),
    }
  )
);
