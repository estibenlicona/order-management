import { PrismaClient, Prisma } from '@prisma/client';
import { Pedido } from '@domain/entities/pedido.entity';
import { IPedidoRepository, CreatePedidoData, PedidoWithRelations, PedidoQueryParams, PaginatedPedidos, PedidoOrderBy } from '@domain/repositories/i-pedido.repository';

type PedidoFull = Prisma.PedidoGetPayload<{
  include: {
    cliente: true;
    medicamento: true;
    estados: { orderBy: { createdAt: 'desc' }; take: 1 };
  };
}>;

function toDateString(d: Date): string {
  return d.toISOString().substring(0, 10);
}

function prismaToEntity(r: PedidoFull): Pedido {
  return new Pedido({
    id: r.id,
    formula: r.formula,
    clienteId: r.clienteId,
    medicamentoId: r.medicamentoId,
    fecha: toDateString(r.fecha),
    cantidadPendiente: r.cantidadPendiente,
    cantidadEntregada: r.cantidadEntregada,
    existencia: r.existencia,
    condicionado: r.condicionado,
    ...(r.sucursal !== null && { sucursal: r.sucursal }),
    ...(r.modalidad !== null && { modalidad: r.modalidad }),
    ...(r.contrato !== null && { contrato: r.contrato }),
    ...(r.clasificacion !== null && { clasificacion: r.clasificacion }),
    ...(r.cp !== null && { cp: r.cp }),
    ...(r.cl !== null && { cl: r.cl }),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  });
}

function prismaToRelations(r: PedidoFull): PedidoWithRelations {
  const base = prismaToEntity(r);
  const estadoActual = r.estados[0]?.estado;
  return Object.assign(Object.create(Object.getPrototypeOf(base)) as Pedido, base, {
    clienteNombre: r.cliente.nombre,
    clienteIdentificacion: r.cliente.identificacion,
    medicamentoCodigo: r.medicamento.codigo,
    medicamentoNombre: r.medicamento.nombre,
    ...(r.medicamento.tipoMedica !== null && { medicamentoTipoMedica: r.medicamento.tipoMedica }),
    ...(estadoActual !== undefined && { estadoActual }),
  });
}

function buildOrderBy(orderBy: PedidoOrderBy | undefined): Prisma.PedidoOrderByWithRelationInput {
  switch (orderBy) {
    case 'fecha_asc': return { fecha: 'asc' };
    case 'fecha_desc': return { fecha: 'desc' };
    case 'pendiente_desc': return { cantidadPendiente: 'desc' };
    case 'pendiente_asc': return { cantidadPendiente: 'asc' };
    default: return { createdAt: 'desc' };
  }
}

const includeRelations = {
  cliente: true,
  medicamento: true,
  estados: {
    orderBy: [{ createdAt: 'desc' as const }, { id: 'desc' as const }],
    take: 1,
  },
} satisfies Prisma.PedidoInclude;

export class PedidoRepository implements IPedidoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreatePedidoData): Promise<Pedido> {
    const r = await this.prisma.pedido.create({
      data: {
        formula: data.formula,
        clienteId: data.clienteId,
        medicamentoId: data.medicamentoId,
        fecha: new Date(data.fecha),
        cantidadPendiente: data.cantidadPendiente,
        cantidadEntregada: data.cantidadEntregada,
        existencia: data.existencia,
        condicionado: data.condicionado,
        ...(data.sucursal !== undefined && { sucursal: data.sucursal }),
        ...(data.modalidad !== undefined && { modalidad: data.modalidad }),
        ...(data.contrato !== undefined && { contrato: data.contrato }),
        ...(data.clasificacion !== undefined && { clasificacion: data.clasificacion }),
        ...(data.cp !== undefined && { cp: data.cp }),
        ...(data.cl !== undefined && { cl: data.cl }),
      },
      include: includeRelations,
    });
    return prismaToEntity(r);
  }

  async findAll(): Promise<PedidoWithRelations[]> {
    const rows = await this.prisma.pedido.findMany({
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(prismaToRelations);
  }

  async findPaginated(params: PedidoQueryParams): Promise<PaginatedPedidos> {
    const { page, pageSize, search, soloPendientes, orderBy, filtroEstado } = params;
    const skip = (page - 1) * pageSize;

    // When filtering by latest estado, resolve matching IDs via subquery
    let idFilter: string[] | undefined;
    if (filtroEstado !== undefined) {
      const rows = await this.prisma.$queryRaw<Array<{ pedido_id: string }>>(
        Prisma.sql`
          SELECT pedido_id::text
          FROM (
            SELECT pedido_id, estado,
              ROW_NUMBER() OVER (PARTITION BY pedido_id ORDER BY created_at DESC, id DESC) AS rn
            FROM estados_pedido
          ) t
          WHERE rn = 1 AND estado = ${filtroEstado}
        `,
      );
      idFilter = rows.map(r => r.pedido_id);
    }

    const where: Prisma.PedidoWhereInput = {
      ...(idFilter !== undefined && { id: { in: idFilter } }),
      ...(search && {
        OR: [
          { cliente: { identificacion: { startsWith: search } } },
          { cliente: { nombre: { contains: search, mode: 'insensitive' } } },
          { medicamento: { codigo: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...(soloPendientes === true && { cantidadPendiente: { gt: 0 } }),
    };

    const prismaOrderBy = buildOrderBy(orderBy);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.pedido.findMany({
        where,
        include: includeRelations,
        orderBy: prismaOrderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.pedido.count({ where }),
    ]);

    return {
      items: rows.map(prismaToRelations),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string): Promise<PedidoWithRelations | null> {
    const r = await this.prisma.pedido.findUnique({ where: { id }, include: includeRelations });
    return r ? prismaToRelations(r) : null;
  }

  async findByFormula(formula: string): Promise<Pedido | null> {
    const r = await this.prisma.pedido.findUnique({ where: { formula }, include: includeRelations });
    return r ? prismaToEntity(r) : null;
  }

  async existsByFormula(formula: string): Promise<boolean> {
    const r = await this.prisma.pedido.findUnique({ where: { formula }, select: { id: true } });
    return r !== null;
  }

  async existsByClienteAndMedicamento(clienteId: string, medicamentoId: string): Promise<boolean> {
    const r = await this.prisma.pedido.findFirst({
      where: { clienteId, medicamentoId },
      select: { id: true },
    });
    return r !== null;
  }

  async existsFormulas(formulas: string[]): Promise<Set<string>> {
    if (formulas.length === 0) return new Set();
    const rows = await this.prisma.pedido.findMany({
      where: { formula: { in: formulas } },
      select: { formula: true },
    });
    return new Set(rows.map(r => r.formula));
  }
}
