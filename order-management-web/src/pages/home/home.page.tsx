import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
} from 'lucide-react';
import { dashboardService } from '@services/dashboard.service';
import type { DashboardRange } from '../../types/dashboard.types';
import { Card } from '@components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@components/ui/alert';
import { Button } from '@components/ui/button';
import { KpiCard } from './components/kpi-card';
import { CriticidadChart } from './components/criticidad-chart';
import { MensualChart } from './components/mensual-chart';
import { TopUsuarios } from './components/top-usuarios';
import { SucursalChart } from './components/sucursal-chart';

function SkeletonBlock({ className }: { className?: string }): JSX.Element {
  return <div className={`animate-pulse rounded-xl bg-muted ${className ?? ''}`} aria-hidden="true" />;
}

export function HomePage(): JSX.Element {
  const [months, setMonths] = useState<DashboardRange>(6);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', months],
    queryFn: () => dashboardService.getMetrics(months),
  });

  return (
    <div className="space-y-6 py-2 sm:py-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Resumen general del estado de los pedidos.
        </p>
      </header>

      {error !== null && !isLoading && (
        <Alert variant="destructive">
          <AlertTitle>No fue posible cargar el dashboard</AlertTitle>
          <AlertDescription>
            <p className="mb-3">Verifica tu conexión o reintenta en un momento.</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-12 gap-4">
          <SkeletonBlock className="col-span-12 h-[108px] sm:col-span-6 lg:col-span-3" />
          <SkeletonBlock className="col-span-12 h-[108px] sm:col-span-6 lg:col-span-3" />
          <SkeletonBlock className="col-span-12 h-[108px] sm:col-span-6 lg:col-span-3" />
          <SkeletonBlock className="col-span-12 h-[108px] sm:col-span-6 lg:col-span-3" />
          <SkeletonBlock className="col-span-12 h-[320px] lg:col-span-4" />
          <SkeletonBlock className="col-span-12 h-[320px] lg:col-span-8" />
          <SkeletonBlock className="col-span-12 h-[260px]" />
          <SkeletonBlock className="col-span-12 h-[300px]" />
        </div>
      ) : data !== undefined ? (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <KpiCard
              label="Activos"
              value={data.totals.activos}
              Icon={Activity}
              iconClass="bg-warning-subtle text-warning-subtle-foreground ring-warning/15"
              to="/medicamentos-pendientes?filtroEstado=ACTIVO"
              hint={`de ${data.totals.total} en total`}
            />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <KpiCard
              label="Entregados"
              value={data.totals.entregados}
              Icon={CheckCircle2}
              iconClass="bg-success-subtle text-success-subtle-foreground ring-success/15"
              to="/medicamentos-pendientes?filtroEstado=ENTREGADO"
              hint={`de ${data.totals.total} en total`}
            />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <KpiCard
              label="Atendidos"
              value={`${data.atendidos.porcentaje}%`}
              Icon={ClipboardCheck}
              hint={`${data.atendidos.atendidos} de ${data.totals.total}`}
            />
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <KpiCard
              label="Críticos"
              value={data.criticidad.mayor60}
              Icon={AlertTriangle}
              iconClass="bg-destructive-subtle text-destructive-subtle-foreground ring-destructive/15"
              hint="con más de 60 días"
              to="/medicamentos-pendientes?filtroEstado=ACTIVO&orderBy=fecha_asc"
            />
          </div>

          <Card className="col-span-12 p-5 lg:col-span-4">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-foreground">Por criticidad</h2>
              <span className="text-xs text-muted-foreground">Activos</span>
            </div>
            <CriticidadChart data={data.criticidad} />
          </Card>

          <Card className="col-span-12 p-5 lg:col-span-8">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-foreground">Histórico mensual</h2>
            </div>
            <MensualChart data={data.mensual} months={months} onMonthsChange={setMonths} />
          </Card>

          <Card className="col-span-12 p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground">Top usuarios</h2>
              <p className="text-xs text-muted-foreground">
                Ranking por suma de cambios de estado y observaciones.
              </p>
            </div>
            <TopUsuarios data={data.topUsuarios} />
          </Card>

          <Card className="col-span-12 p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-foreground">Por sucursal</h2>
              <span className="text-xs text-muted-foreground">Clic en barra para ver detalle</span>
            </div>
            <SucursalChart data={data.porSucursal ?? []} />
          </Card>
        </div>
      ) : null}
    </div>
  );
}
