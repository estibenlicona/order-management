import { Users } from 'lucide-react';
import type { DashboardTopUsuario } from '../../../types/dashboard.types';
import { cn } from '@lib/cn';
import { getAvatarColor, getInitials } from '@lib/initials';

interface Props {
  data: DashboardTopUsuario[];
}

export function TopUsuarios({ data }: Props): JSX.Element {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Users className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-foreground">Aún no hay actividad registrada</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Cuando los usuarios cambien estados o dejen observaciones, aparecerán aquí.
        </p>
      </div>
    );
  }

  const max = Math.max(...data.map(u => u.total));

  return (
    <ol className="space-y-3">
      {data.map((u, idx) => {
        const initials = getInitials(u.usuario);
        const color = getAvatarColor(u.usuario);
        const pct = max === 0 ? 0 : Math.round((u.total / max) * 100);
        return (
          <li key={u.usuario} className="flex items-center gap-3">
            <span className="w-4 shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
              {idx + 1}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ring-1 ring-inset ring-black/5',
                color,
              )}
            >
              {initials}
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium text-foreground" title={u.usuario}>
                  {u.usuario}
                </span>
                <span className="tabular-nums text-xs font-medium text-foreground">{u.total}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
