import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function ProtectedRoute() {
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const location = useLocation();

  if (!refreshToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const refreshToken = useAuthStore((s) => s.refreshToken);
  if (refreshToken) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
