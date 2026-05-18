import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DashboardMensualEntry, DashboardRange } from '../../../types/dashboard.types';
import { cn } from '@lib/cn';

interface Props {
  data: DashboardMensualEntry[];
  months: DashboardRange;
  onMonthsChange: (next: DashboardRange) => void;
}

const MONTH_LABEL_ES: Record<string, string> = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
};

function formatMes(mes: string): string {
  const parts = mes.split('-');
  if (parts.length !== 2) return mes;
  const mm = parts[1] ?? '';
  return MONTH_LABEL_ES[mm] ?? mes;
}

const RANGE_OPTIONS: DashboardRange[] = [3, 6, 12];

interface TooltipPayloadItem {
  name?: string | number;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
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
      <p className="mb-1 font-medium text-foreground">{label !== undefined ? formatMes(String(label)) : ''}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} aria-hidden="true" />
          <span className="text-muted-foreground">
            {p.dataKey === 'creados' ? 'Creados' : 'Entregados'}:
          </span>
          <span className="tabular-nums font-medium text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function MensualChart({ data, months, onMonthsChange }: Props): JSX.Element {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Pedidos creados y entregados por mes
        </p>
        <div className="inline-flex h-7 items-center rounded-md border border-border bg-muted/40 p-0.5" role="group">
          {RANGE_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => onMonthsChange(opt)}
              className={cn(
                'inline-flex h-6 items-center rounded px-2 text-xs font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                months === opt
                  ? 'bg-background text-foreground shadow-xs ring-1 ring-inset ring-border'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {opt}m
            </button>
          ))}
        </div>
      </div>

      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
            <XAxis
              dataKey="mes"
              tickFormatter={formatMes}
              tick={{ fontSize: 11, fill: '#71717a' }}
              axisLine={{ stroke: '#e4e4e7' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#71717a' }}
              axisLine={{ stroke: '#e4e4e7' }}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.06)' }} />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
              formatter={(value) => value === 'creados' ? 'Creados' : 'Entregados'}
            />
            <Bar dataKey="creados" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={36} />
            <Bar dataKey="entregados" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
