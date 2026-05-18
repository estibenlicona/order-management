import { Link } from 'react-router-dom';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '@lib/cn';

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  Icon: LucideIcon;
  iconClass?: string;
  to?: string;
  loading?: boolean;
}

export function KpiCard({ label, value, hint, Icon, iconClass, to, loading }: KpiCardProps): JSX.Element {
  const body = (
    <>
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-inset transition-colors',
            iconClass ?? 'bg-primary-subtle text-primary-subtle-foreground ring-primary/10',
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
        </div>
        {to !== undefined && (
          <ArrowUpRight
            className="h-4 w-4 text-muted-foreground/60 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
            aria-hidden="true"
          />
        )}
      </div>
      <div className="space-y-0.5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        {loading === true ? (
          <div className="h-8 w-16 animate-pulse rounded bg-muted" aria-hidden="true" />
        ) : (
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">{value}</p>
        )}
        {hint !== undefined && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    </>
  );

  const cls = cn(
    'group flex flex-col gap-3 rounded-xl border border-border bg-background p-4 shadow-xs',
    to !== undefined && 'hover-lift hover:border-border-strong hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  );

  if (to !== undefined) {
    return (
      <Link to={to} className={cls}>
        {body}
      </Link>
    );
  }
  return <div className={cls}>{body}</div>;
}
