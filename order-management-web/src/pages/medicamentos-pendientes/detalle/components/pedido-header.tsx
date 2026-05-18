import type { ReactNode } from 'react';
import type { PedidoDetailData } from '../../../../types/pedido.types';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { EstadoBadge } from '../../components/estado-badge';
import { cn } from '@lib/cn';

function diasDesde(fecha: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const origen = new Date(fecha + 'T00:00:00');
  return Math.floor((hoy.getTime() - origen.getTime()) / 86_400_000);
}

function criticidadClass(dias: number): string {
  if (dias <= 15) return 'bg-success-subtle text-success-subtle-foreground ring-success/20';
  if (dias <= 30) return 'bg-warning-subtle text-warning-subtle-foreground ring-warning/20';
  if (dias <= 60) return 'bg-warning-subtle text-warning-subtle-foreground ring-warning/40';
  return 'bg-destructive-subtle text-destructive-subtle-foreground ring-destructive/20';
}

interface FieldProps {
  label: string;
  value: ReactNode;
  className?: string;
}

function Field({ label, value, className }: FieldProps): JSX.Element {
  return (
    <div className={cn('min-w-0 space-y-0.5', className)}>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground truncate" title={typeof value === 'string' ? value : undefined}>
        {value}
      </dd>
    </div>
  );
}

interface Props {
  pedido: PedidoDetailData;
}

export function PedidoHeader({ pedido }: Props): JSX.Element {
  const dias = diasDesde(pedido.fecha);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-gradient-to-br from-muted/40 to-background px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Paciente</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground truncate" title={pedido.clienteNombre}>
              {pedido.clienteNombre}
            </h2>
            <p className="font-mono text-xs text-muted-foreground">
              Documento {pedido.clienteIdentificacion} · Fórmula {pedido.formula}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset tabular-nums',
                criticidadClass(dias),
              )}
              title={`${dias} días desde la solicitud`}
            >
              {dias}d
            </span>
            <EstadoBadge estado={pedido.estadoActual ?? 'SIN ESTADO'} />
            {pedido.medicamentoTipoMedica !== undefined && (
              <Badge
                variant={pedido.medicamentoTipoMedica === 'POS' ? 'success' : 'info'}
                className="min-w-[52px] justify-center"
              >
                {pedido.medicamentoTipoMedica}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-5 sm:grid-cols-3 lg:grid-cols-4">
        <Field label="Medicamento" value={pedido.medicamentoNombre} className="col-span-2" />
        <Field label="Código" value={<span className="font-mono">{pedido.medicamentoCodigo}</span>} />
        <Field label="Fecha" value={<span className="tabular-nums">{pedido.fecha}</span>} />
        <Field label="Pendiente" value={<span className="font-semibold tabular-nums">{pedido.cantidadPendiente}</span>} />
        <Field label="Entregado" value={<span className="tabular-nums text-muted-foreground">{pedido.cantidadEntregada}</span>} />
        <Field label="Sucursal" value={pedido.sucursal ?? '—'} />
        <Field label="Modalidad" value={pedido.modalidad ?? '—'} />
      </dl>
    </Card>
  );
}
