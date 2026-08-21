import { dummyJsonClient } from './client';
import type { LoginResponse } from '../types';

export interface LoginPayload {
  username: string;
  password: string;
}

// Service layer: UI/hooks never call axios or dummyjson directly.
export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await dummyJsonClient.post<LoginResponse>('/auth/login', {
      ...payload,
      expiresInMins: 1, // short-lived on purpose, to make silent refresh observable
    });
    return data;
  },

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const { data } = await dummyJsonClient.post<LoginResponse>('/auth/refresh', {
      refreshToken,
      expiresInMins: 1,
    });
    return data;
  },

  me: async (accessToken: string) => {
    const { data } = await dummyJsonClient.get<LoginResponse>('/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data;
  },
};
