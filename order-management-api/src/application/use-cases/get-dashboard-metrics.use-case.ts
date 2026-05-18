import type { PrismaClient} from '@prisma/client';
import { Prisma } from '@prisma/client';

export interface DashboardMetrics {
  readonly totals: { activos: number; entregados: number; total: number };
  readonly criticidad: {
    menor15: number;
    entre16y30: number;
    entre31y60: number;
    mayor60: number;
  };
  readonly atendidos: {
    atendidos: number;
    sinAtender: number;
    porcentaje: number;
  };
  readonly mensual: Array<{
    mes: string;
    creados: number;
    entregados: number;
  }>;
  readonly topUsuarios: Array<{
    usuario: string;
    total: number;
  }>;
}

export interface GetDashboardMetricsDto {
  months: 3 | 6 | 12;
}

interface TotalsRow {
  activos: bigint;
  entregados: bigint;
  total: bigint;
}

interface CriticidadRow {
  menor15: bigint;
  entre16y30: bigint;
  entre31y60: bigint;
  mayor60: bigint;
}

interface AtendidosRow {
  atendidos: bigint;
  total: bigint;
}

interface MensualRow {
  mes: string;
  count: bigint;
}

interface TopUsuarioRow {
  usuario: string;
  total: bigint;
}

function toInt(v: bigint | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  return typeof v === 'bigint' ? Number(v) : v;
}

function buildMonthBuckets(months: number): string[] {
  const out: string[] = [];
  const now = new Date();
  now.setUTCDate(1);
  now.setUTCHours(0, 0, 0, 0);
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCMonth(d.getUTCMonth() - i);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    out.push(`${yyyy}-${mm}`);
  }
  return out;
}

export class GetDashboardMetricsUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(dto: GetDashboardMetricsDto): Promise<DashboardMetrics> {
    const months = dto.months;

    const [totalsRows, criticidadRows, atendidosRows, creadosRows, entregadosRows, topRows] =
      await Promise.all([
        this.prisma.$queryRaw<TotalsRow[]>(Prisma.sql`
          WITH ultimo_estado AS (
            SELECT DISTINCT ON (pedido_id) pedido_id, estado
            FROM estados_pedido
            ORDER BY pedido_id, created_at DESC, id DESC
          )
          SELECT
            COUNT(*) FILTER (WHERE COALESCE(ue.estado, 'ACTIVO') = 'ACTIVO')::bigint AS activos,
            COUNT(*) FILTER (WHERE ue.estado = 'ENTREGADO')::bigint AS entregados,
            COUNT(*)::bigint AS total
          FROM pedidos p
          LEFT JOIN ultimo_estado ue ON ue.pedido_id = p.id
        `),

        this.prisma.$queryRaw<CriticidadRow[]>(Prisma.sql`
          WITH ultimo_estado AS (
            SELECT DISTINCT ON (pedido_id) pedido_id, estado
            FROM estados_pedido
            ORDER BY pedido_id, created_at DESC, id DESC
          )
          SELECT
            COUNT(*) FILTER (WHERE (CURRENT_DATE - p.fecha) <= 15)::bigint AS menor15,
            COUNT(*) FILTER (WHERE (CURRENT_DATE - p.fecha) BETWEEN 16 AND 30)::bigint AS entre16y30,
            COUNT(*) FILTER (WHERE (CURRENT_DATE - p.fecha) BETWEEN 31 AND 60)::bigint AS entre31y60,
            COUNT(*) FILTER (WHERE (CURRENT_DATE - p.fecha) > 60)::bigint AS mayor60
          FROM pedidos p
          LEFT JOIN ultimo_estado ue ON ue.pedido_id = p.id
          WHERE COALESCE(ue.estado, 'ACTIVO') = 'ACTIVO'
        `),

        this.prisma.$queryRaw<AtendidosRow[]>(Prisma.sql`
          SELECT
            COUNT(DISTINCT p.id) FILTER (
              WHERE EXISTS (
                SELECT 1 FROM estados_pedido e
                WHERE e.pedido_id = p.id AND e.usuario_id IS NOT NULL
              ) OR EXISTS (
                SELECT 1 FROM comentarios_pedido c
                WHERE c.pedido_id = p.id AND c.usuario_id IS NOT NULL
              )
            )::bigint AS atendidos,
            COUNT(*)::bigint AS total
          FROM pedidos p
        `),

        this.prisma.$queryRaw<MensualRow[]>(Prisma.sql`
          SELECT
            TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS mes,
            COUNT(*)::bigint AS count
          FROM pedidos
          WHERE created_at >= DATE_TRUNC('month', NOW()) - (${months - 1} || ' months')::interval
          GROUP BY DATE_TRUNC('month', created_at)
          ORDER BY mes ASC
        `),

        this.prisma.$queryRaw<MensualRow[]>(Prisma.sql`
          SELECT
            TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS mes,
            COUNT(*)::bigint AS count
          FROM estados_pedido
          WHERE estado = 'ENTREGADO'
            AND created_at >= DATE_TRUNC('month', NOW()) - (${months - 1} || ' months')::interval
          GROUP BY DATE_TRUNC('month', created_at)
          ORDER BY mes ASC
        `),

        this.prisma.$queryRaw<TopUsuarioRow[]>(Prisma.sql`
          WITH eventos AS (
            SELECT COALESCE(usuario, '—') AS usuario
            FROM estados_pedido
            WHERE usuario_id IS NOT NULL
            UNION ALL
            SELECT COALESCE(usuario, '—') AS usuario
            FROM comentarios_pedido
            WHERE usuario_id IS NOT NULL
          )
          SELECT usuario, COUNT(*)::bigint AS total
          FROM eventos
          GROUP BY usuario
          ORDER BY total DESC, usuario ASC
          LIMIT 10
        `),
      ]);

    const totalsRow = totalsRows[0] ?? { activos: 0n, entregados: 0n, total: 0n };
    const criticidadRow = criticidadRows[0] ?? {
      menor15: 0n, entre16y30: 0n, entre31y60: 0n, mayor60: 0n,
    };
    const atendidosRow = atendidosRows[0] ?? { atendidos: 0n, total: 0n };

    const atendidosCount = toInt(atendidosRow.atendidos);
    const totalCount = toInt(atendidosRow.total);
    const porcentaje = totalCount === 0 ? 0 : Math.round((atendidosCount / totalCount) * 100);

    const creadosByMes = new Map(creadosRows.map(r => [r.mes, toInt(r.count)]));
    const entregadosByMes = new Map(entregadosRows.map(r => [r.mes, toInt(r.count)]));
    const buckets = buildMonthBuckets(months);
    const mensual = buckets.map(mes => ({
      mes,
      creados: creadosByMes.get(mes) ?? 0,
      entregados: entregadosByMes.get(mes) ?? 0,
    }));

    return {
      totals: {
        activos: toInt(totalsRow.activos),
        entregados: toInt(totalsRow.entregados),
        total: toInt(totalsRow.total),
      },
      criticidad: {
        menor15: toInt(criticidadRow.menor15),
        entre16y30: toInt(criticidadRow.entre16y30),
        entre31y60: toInt(criticidadRow.entre31y60),
        mayor60: toInt(criticidadRow.mayor60),
      },
      atendidos: {
        atendidos: atendidosCount,
        sinAtender: totalCount - atendidosCount,
        porcentaje,
      },
      mensual,
      topUsuarios: topRows.map(r => ({ usuario: r.usuario, total: toInt(r.total) })),
    };
  }
}
