import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, isLoading } = useAuth();

  if (isLoading) return <p>Cargando sesión...</p>;
  if (!token) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
