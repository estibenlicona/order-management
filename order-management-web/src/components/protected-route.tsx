import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/auth-context';
import { Spinner } from '@components/ui/spinner';

export function ProtectedRoute(): JSX.Element {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (session === null) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
