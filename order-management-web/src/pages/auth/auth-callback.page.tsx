import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/auth-context';
import { Spinner } from '@components/ui/spinner';

export function AuthCallbackPage(): JSX.Element {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (session !== null) {
      void navigate('/', { replace: true });
    } else {
      void navigate('/login', { replace: true });
    }
  }, [loading, session, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
      <Spinner size="lg" />
      Iniciando sesión...
    </div>
  );
}
