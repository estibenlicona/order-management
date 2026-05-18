import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { HomePage } from '@pages/home/home.page';
import { MedicamentosPendientesPage } from '@pages/medicamentos-pendientes/medicamentos-pendientes.page';
import { PedidoDetallePage } from '@pages/medicamentos-pendientes/detalle/pedido-detalle.page';
import { StyleGuidePage } from '@pages/style-guide/style-guide.page';
import { LoginPage } from '@pages/auth/login.page';
import { AuthCallbackPage } from '@pages/auth/auth-callback.page';
import { Container } from '@components/ui/container';
import { ToastProvider } from '@components/ui/toast/toast';
import { AuthProvider } from '@contexts/auth-context';
import { ProtectedRoute } from '@components/protected-route';
import { UserMenu } from '@components/user-menu';
import { AppSidebar } from '@components/app-sidebar';

interface NavbarProps {
  onMenuClick: () => void;
}

function Navbar({ onMenuClick }: NavbarProps): JSX.Element {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <Container size="full">
        <div className="flex h-14 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Abrir menú"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>

          <NavLink
            to="/"
            end
            className="group inline-flex items-center gap-2.5"
            aria-label="Order Management — Inicio"
          >
            <span
              aria-hidden="true"
              className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-sm ring-1 ring-inset ring-white/10"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 5l6 3 6-3M2 5v6l6 3 6-3V5M2 5l6-3 6 3" />
              </svg>
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              Order
              <span className="text-muted-foreground font-normal"> Management</span>
            </span>
          </NavLink>

          <div className="ml-auto">
            <UserMenu />
          </div>
        </div>
      </Container>
    </header>
  );
}

function AppShell(): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return (): void => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMenuClick={() => setMobileOpen(true)} />
      <Container size="full">
        <div className="flex gap-8 py-6 lg:py-8">
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-20">
              <AppSidebar />
            </div>
          </aside>
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </Container>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden animate-fade-in" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative h-full w-64 max-w-[80vw] border-r border-border bg-background shadow-xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Navegación</p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="p-3">
              <AppSidebar onItemClick={() => setMobileOpen(false)} showHeading={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/medicamentos-pendientes" element={<MedicamentosPendientesPage />} />
                <Route path="/medicamentos-pendientes/:id" element={<PedidoDetallePage />} />
                <Route path="/style-guide" element={<StyleGuidePage />} />
              </Route>
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
