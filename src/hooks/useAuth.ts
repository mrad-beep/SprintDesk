import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi, type LoginPayload } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { useToast } from './useToast';

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        image: data.image,
      });
      showToast(`Welcome back, ${data.firstName}!`, 'success');
      navigate('/dashboard', { replace: true });
    },
    onError: () => {
      showToast('Invalid username or password.', 'error');
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return () => {
    logout();
    queryClient.clear();
    navigate('/login', { replace: true });
  };
}

// Runs once on app boot: if a refresh token survived a page reload, silently
// exchange it for a new access token so the session persists without asking
// the user to log in again. Session validation is exposed as a query so the
// full-screen loading state is just isLoading on this hook.
export function useSessionBootstrap() {
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const rememberUntil = useAuthStore((s) => s.rememberUntil);
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const setInitializing = useAuthStore((s) => s.setInitializing);
  const logout = useAuthStore((s) => s.logout);

  return useQuery({
    queryKey: ['session-bootstrap'],
    queryFn: async () => {
      const expired = rememberUntil !== null && Date.now() > rememberUntil;
      if (!refreshToken || expired) {
        if (expired) logout();
        setInitializing(false);
        return null;
      }
      try {
        const data = await authApi.refresh(refreshToken);
        setTokens(data.accessToken, data.refreshToken);
        setUser({
          id: data.id,
          username: data.username,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          image: data.image,
        });
        return data;
      } catch {
        logout();
        return null;
      } finally {
        setInitializing(false);
      }
    },
    staleTime: Infinity,
    retry: false,
  });
}
