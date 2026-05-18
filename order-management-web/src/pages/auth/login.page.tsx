import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@contexts/auth-context';
import { authActions } from '@hooks/use-auth-actions';
import { Container } from '@components/ui/container';
import { Card, CardContent } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { FormField } from '@components/ui/form-field';
import { Alert } from '@components/ui/alert';
import { Spinner } from '@components/ui/spinner';

type Mode = 'login' | 'signup';

interface LocationState {
  from?: { pathname: string };
}

function GoogleIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function LoginPage(): JSX.Element {
  const { session, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as LocationState | null) ?? null;
  const redirectTo = state?.from?.pathname ?? '/';

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setInfo(null);
  }, [mode]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  if (session !== null) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    const result =
      mode === 'login'
        ? await authActions.signInWithPassword(email, password)
        : await authActions.signUpWithPassword(email, password, fullName.trim());
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? 'No fue posible completar la solicitud.');
      return;
    }
    if (mode === 'signup') {
      setInfo('Cuenta creada. Si tu proyecto requiere confirmación, revisa tu email.');
    } else {
      void navigate(redirectTo, { replace: true });
    }
  }

  async function handleGoogle(): Promise<void> {
    setError(null);
    setSubmitting(true);
    const result = await authActions.signInWithGoogle();
    if (!result.ok) {
      setSubmitting(false);
      setError(result.error ?? 'No fue posible iniciar sesión con Google.');
    }
    // si OK, hay redirect inmediato a Google
  }

  return (
    <Container size="sm">
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center py-12">
        <Card className="mx-auto w-full max-w-sm">
          <CardContent className="space-y-6 p-6">
            <header className="space-y-1.5 text-center">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {mode === 'login'
                  ? 'Bienvenido de nuevo.'
                  : 'Necesitamos algunos datos para empezar.'}
              </p>
            </header>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => void handleGoogle()}
              disabled={submitting}
            >
              <GoogleIcon />
              Continuar con Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-2 text-xs uppercase tracking-wider text-muted-foreground">
                  o continúa con email
                </span>
              </div>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              {mode === 'signup' && (
                <FormField label="Nombre completo" required>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tu nombre"
                    required
                    disabled={submitting}
                  />
                </FormField>
              )}

              <FormField label="Email" required>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@dominio.com"
                  autoComplete="email"
                  required
                  disabled={submitting}
                />
              </FormField>

              <FormField
                label="Contraseña"
                required
                helper={mode === 'signup' ? 'Mínimo 6 caracteres' : undefined}
              >
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  minLength={mode === 'signup' ? 6 : undefined}
                  disabled={submitting}
                />
              </FormField>

              {error !== null && <Alert variant="destructive">{error}</Alert>}
              {info !== null && <Alert variant="success">{info}</Alert>}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {mode === 'login' ? (
                <>
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:underline"
                  >
                    Crear una
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:underline"
                  >
                    Iniciar sesión
                  </button>
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </main>
    </Container>
  );
}
