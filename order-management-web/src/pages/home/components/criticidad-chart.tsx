import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { DashboardCriticidad } from '../../../types/dashboard.types';

interface Props {
  data: DashboardCriticidad;
}

interface Slice {
  name: string;
  value: number;
  color: string;
}

interface TooltipPayloadItem {
  name?: string | number;
  value?: string | number;
  payload?: Slice;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomTooltip({ active, payload }: TooltipProps): JSX.Element | null {
  if (active !== true || payload === undefined || payload.length === 0) return null;
  const item = payload[0];
  if (item === undefined) return null;
  const slice = item.payload;
  if (slice === undefined) return null;
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">{slice.name}</p>
      <p className="tabular-nums text-muted-foreground">{slice.value} pedidos</p>
    </div>
  );
}

export function CriticidadChart({ data }: Props): JSX.Element {
  const slices: Slice[] = [
    { name: '≤15 días',   value: data.menor15,    color: '#16a34a' },
    { name: '16–30 días', value: data.entre16y30, color: '#d97706' },
    { name: '31–60 días', value: data.entre31y60, color: '#fb923c' },
    { name: '>60 días',   value: data.mayor60,    color: '#dc2626' },
  ];

  const total = slices.reduce((acc, s) => acc + s.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-center">
        <p className="text-sm text-muted-foreground">
          Sin pedidos activos para clasificar.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            stroke="var(--background, #fff)"
            strokeWidth={2}
          >
            {slices.map(s => (
              <Cell key={s.name} fill={s.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
