import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  login as loginRequest,
  refreshToken as refreshTokenRequest,
  type AuthResponse,
} from "../api/authApi";

interface AuthState {
  userId: string | null;
  token: string | null;
  refreshToken: string | null;

  isAuthenticated: boolean;

  setAuth: (auth: AuthResponse) => void;

  login: (username: string, password: string) => Promise<void>;

  refreshAccessToken: () => Promise<string>;

  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userId: null,
      token: null,
      refreshToken: null,

      isAuthenticated: false,

      setAuth: (auth) => {
        set({
          userId: auth.userId,
          token: auth.token,
          refreshToken: auth.refreshToken,
          isAuthenticated: true,
        });
      },

      login: async (username, password) => {
        const auth = await loginRequest(username, password);

        set({
          userId: auth.userId,
          token: auth.token,
          refreshToken: auth.refreshToken,
          isAuthenticated: true,
        });
      },

      refreshAccessToken: async () => {
        const { userId, refreshToken } = get();

        if (!userId || !refreshToken) {
          throw new Error("No refresh token is available.");
        }

        const auth = await refreshTokenRequest({
          userId,
          refreshToken,
        });

        set({
          userId: auth.userId,
          token: auth.token,
          refreshToken: auth.refreshToken,
          isAuthenticated: true,
        });

        return auth.token;
      },

      logout: () => {
        set({
          userId: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "chat-time-auth",
    },
  ),
);
