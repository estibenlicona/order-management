import { ArrowRightLeft } from 'lucide-react';
import { cn } from '@lib/cn';
import { formatAbsolute, formatRelative } from '@lib/format-relative';
import { getAvatarColor, getInitials } from '@lib/initials';
import { EstadoBadge } from '../../components/estado-badge';
import type { TimelineEvent } from './timeline';

interface TimelineItemProps {
  event: TimelineEvent;
  isLast: boolean;
}

export function TimelineItem({ event, isLast }: TimelineItemProps): JSX.Element {
  const usuario = event.data.usuario ?? 'Sistema';
  const absolute = formatAbsolute(event.createdAt);
  const relative = formatRelative(event.createdAt);

  if (event.kind === 'estado') {
    const e = event.data;
    return (
      <li className="relative flex gap-4 pb-6 last:pb-0">
        {!isLast && (
          <span
            aria-hidden="true"
            className="absolute left-[15px] top-9 bottom-0 w-px bg-border"
          />
        )}
        <div
          aria-hidden="true"
          className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary-subtle-foreground ring-4 ring-background"
        >
          <ArrowRightLeft className="h-3.5 w-3.5" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-tight">
            <span className="font-medium text-foreground">{usuario}</span>
            <span className="text-muted-foreground">cambió el estado a</span>
            <EstadoBadge estado={e.estado} />
            <span className="text-xs text-muted-foreground" title={absolute}>
              · {relative}
            </span>
          </div>
          {e.observacion !== undefined && e.observacion.trim() !== '' && (
            <div className="mt-2 rounded-lg border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground whitespace-pre-wrap">
              {e.observacion}
            </div>
          )}
        </div>
      </li>
    );
  }

  const c = event.data;
  const initials = getInitials(usuario);
  const avatarColor = getAvatarColor(usuario);
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute left-[15px] top-9 bottom-0 w-px bg-border"
        />
      )}
      <div
        aria-hidden="true"
        className={cn(
          'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ring-4 ring-background',
          avatarColor,
        )}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm leading-tight">
          <span className="font-medium text-foreground">{usuario}</span>
          <span className="text-xs text-muted-foreground" title={absolute}>
            {relative}
          </span>
        </div>
        <div className="mt-2 rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground whitespace-pre-wrap shadow-xs">
          {c.contenido}
        </div>
      </div>
    </li>
  );
}
