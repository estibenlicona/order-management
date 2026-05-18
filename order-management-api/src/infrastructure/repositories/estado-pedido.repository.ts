import { PrismaClient } from '@prisma/client';
import { EstadoPedido } from '@domain/entities/estado-pedido.entity';
import { IEstadoPedidoRepository, CreateEstadoPedidoData } from '@domain/repositories/i-estado-pedido.repository';

type EstadoPedidoRecord = {
  id: string;
  pedidoId: string;
  estado: string;
  fecha: Date | null;
  observacion: string | null;
  usuario: string | null;
  usuarioId: string | null;
  createdAt: Date;
};

function toDateString(d: Date): string {
  return d.toISOString().substring(0, 10);
}

function prismaToEntity(r: EstadoPedidoRecord): EstadoPedido {
  return new EstadoPedido({
    id: r.id,
    pedidoId: r.pedidoId,
    estado: r.estado,
    ...(r.fecha !== null && { fecha: toDateString(r.fecha) }),
    ...(r.observacion !== null && { observacion: r.observacion }),
    ...(r.usuario !== null && { usuario: r.usuario }),
    ...(r.usuarioId !== null && { usuarioId: r.usuarioId }),
    createdAt: r.createdAt,
  });
}

export class EstadoPedidoRepository implements IEstadoPedidoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createMany(entries: CreateEstadoPedidoData[]): Promise<EstadoPedido[]> {
    if (entries.length === 0) return [];
    await this.prisma.estadoPedido.createMany({
      data: entries.map(e => ({
        pedidoId: e.pedidoId,
        estado: e.estado,
        ...(e.fecha !== undefined && { fecha: new Date(e.fecha) }),
        ...(e.observacion !== undefined && { observacion: e.observacion }),
        ...(e.usuario !== undefined && { usuario: e.usuario }),
      })),
    });
    // createMany no devuelve los registros creados; hacemos fetch por pedidoId del primer entry
    const rows = await this.prisma.estadoPedido.findMany({
      where: { pedidoId: entries[0]!.pedidoId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(prismaToEntity);
  }

  async createOne(data: CreateEstadoPedidoData): Promise<EstadoPedido> {
    const r = await this.prisma.estadoPedido.create({
      data: {
        pedidoId: data.pedidoId,
        estado: data.estado,
        ...(data.fecha !== undefined && { fecha: new Date(data.fecha) }),
        ...(data.observacion !== undefined && { observacion: data.observacion }),
        ...(data.usuario !== undefined && { usuario: data.usuario }),
        ...(data.usuarioId !== undefined && { usuarioId: data.usuarioId }),
      },
    });
    return prismaToEntity(r);
  }

  async findByPedidoId(pedidoId: string): Promise<EstadoPedido[]> {
    const rows = await this.prisma.estadoPedido.findMany({
      where: { pedidoId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(prismaToEntity);
  }
}
