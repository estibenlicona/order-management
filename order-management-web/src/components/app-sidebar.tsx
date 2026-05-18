import { Link, useLocation } from 'react-router-dom';
import { Home, ListChecks, Upload, type LucideIcon } from 'lucide-react';
import { cn } from '@lib/cn';

interface SidebarItem {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
  isActive: (path: string, search: string) => boolean;
}

const ITEMS: SidebarItem[] = [
  {
    to: '/',
    label: 'Dashboard',
    description: 'Resumen general',
    icon: Home,
    isActive: (path) => path === '/',
  },
  {
    to: '/medicamentos-pendientes',
    label: 'Pendientes',
    description: 'Listado y trazabilidad',
    icon: ListChecks,
    isActive: (path, search) =>
      path.startsWith('/medicamentos-pendientes') &&
      new URLSearchParams(search).get('tab') !== 'agregar',
  },
  {
    to: '/medicamentos-pendientes?tab=agregar',
    label: 'Cargar CSV',
    description: 'Importar registros',
    icon: Upload,
    isActive: (path, search) =>
      path === '/medicamentos-pendientes' &&
      new URLSearchParams(search).get('tab') === 'agregar',
  },
];

interface SidebarProps {
  onItemClick?: () => void;
  showHeading?: boolean;
}

export function AppSidebar({ onItemClick, showHeading = true }: SidebarProps): JSX.Element {
  const location = useLocation();

  return (
    <nav className="space-y-1" aria-label="Navegación principal">
      {showHeading && (
        <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Navegación
        </p>
      )}
      {ITEMS.map(item => {
        const Icon = item.icon;
        const active = item.isActive(location.pathname, location.search);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onItemClick}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              active
                ? 'bg-background text-foreground shadow-xs ring-1 ring-inset ring-border'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4 shrink-0',
                active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
              )}
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <span className="flex-1 min-w-0">
              <span className="block truncate">{item.label}</span>
              <span className="block truncate text-[11px] font-normal text-muted-foreground">
                {item.description}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
