import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useNavigate } from 'react-router-dom';
import type { DashboardSucursalEntry } from '../../../types/dashboard.types';

interface Props {
  data: DashboardSucursalEntry[];
}

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps): JSX.Element | null {
  if (active !== true || payload === undefined || payload.length === 0) return null;
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map(item => (
        <p key={item.name} className="tabular-nums" style={{ color: item.color }}>
          {item.name}: {item.value} pedidos
        </p>
      ))}
    </div>
  );
}

export function SucursalChart({ data }: Props): JSX.Element {
  const navigate = useNavigate();
  const top = data.slice(0, 10);

  if (top.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-center">
        <p className="text-sm text-muted-foreground">Sin datos de sucursal disponibles.</p>
      </div>
    );
  }

  const chartHeight = Math.max(200, top.length * 40);

  return (
    <div style={{ height: chartHeight }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
          <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="sucursal"
            width={130}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
          <Bar
            dataKey="activos"
            name="Activos"
            fill="#d97706"
            radius={[0, 3, 3, 0]}
            cursor="pointer"
            onClick={(entry: unknown) => {
              const s = (entry as DashboardSucursalEntry).sucursal;
              void navigate(`/medicamentos-pendientes?filtroEstado=ACTIVO&sucursal=${encodeURIComponent(s)}`);
            }}
          />
          <Bar
            dataKey="entregados"
            name="Entregados"
            fill="#16a34a"
            radius={[0, 3, 3, 0]}
            cursor="pointer"
            onClick={(entry: unknown) => {
              const s = (entry as DashboardSucursalEntry).sucursal;
              void navigate(`/medicamentos-pendientes?filtroEstado=ENTREGADO&sucursal=${encodeURIComponent(s)}`);
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
