import { Badge, type BadgeVariant } from '@components/ui/badge';

const VARIANT_MAP: Record<string, BadgeVariant> = {
  ACTIVO: 'warning',
  ENTREGADO: 'success',
};

interface EstadoBadgeProps {
  estado: string;
}

export function EstadoBadge({ estado }: EstadoBadgeProps): JSX.Element {
  const variant: BadgeVariant = VARIANT_MAP[estado.toUpperCase()] ?? 'default';
  return (
    <Badge variant={variant} className="min-w-[90px] justify-center">
      {estado}
    </Badge>
  );
}
