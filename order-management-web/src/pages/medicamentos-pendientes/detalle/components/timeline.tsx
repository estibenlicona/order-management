import { MessagesSquare } from 'lucide-react';
import type { ComentarioPedido, EstadoPedido } from '../../../../types/pedido.types';
import { TimelineItem } from './timeline-item';

export type TimelineEvent =
  | { kind: 'estado'; createdAt: string; data: EstadoPedido }
  | { kind: 'comentario'; createdAt: string; data: ComentarioPedido };

interface TimelineProps {
  estados: EstadoPedido[];
  comentarios: ComentarioPedido[];
}

function buildEvents(estados: EstadoPedido[], comentarios: ComentarioPedido[]): TimelineEvent[] {
  const eventos: TimelineEvent[] = [
    ...estados.map<TimelineEvent>(e => ({ kind: 'estado', createdAt: e.createdAt, data: e })),
    ...comentarios.map<TimelineEvent>(c => ({ kind: 'comentario', createdAt: c.createdAt, data: c })),
  ];
  return eventos.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function Timeline({ estados, comentarios }: TimelineProps): JSX.Element {
  const events = buildEvents(estados, comentarios);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <MessagesSquare className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <div className="space-y-1 max-w-sm">
          <p className="text-sm font-medium text-foreground">
            Sin observaciones ni cambios de estado
          </p>
          <p className="text-xs text-muted-foreground">
            Usa el cuadro de arriba para dejar la primera observación.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ol className="relative">
      {events.map((event, idx) => (
        <TimelineItem
          key={`${event.kind}-${event.data.id}-${idx}`}
          event={event}
          isLast={idx === events.length - 1}
        />
      ))}
    </ol>
  );
}
