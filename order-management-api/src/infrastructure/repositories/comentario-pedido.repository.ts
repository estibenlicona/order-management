import type { PrismaClient } from '@prisma/client';
import { ComentarioPedido } from '@domain/entities/comentario-pedido.entity';
import type {
  IComentarioPedidoRepository,
  CreateComentarioPedidoData,
} from '@domain/repositories/i-comentario-pedido.repository';

interface ComentarioPedidoRecord {
  id: string;
  pedidoId: string;
  contenido: string;
  usuario: string | null;
  usuarioId: string | null;
  createdAt: Date;
}

function prismaToEntity(r: ComentarioPedidoRecord): ComentarioPedido {
  return new ComentarioPedido({
    id: r.id,
    pedidoId: r.pedidoId,
    contenido: r.contenido,
    ...(r.usuario !== null && { usuario: r.usuario }),
    ...(r.usuarioId !== null && { usuarioId: r.usuarioId }),
    createdAt: r.createdAt,
  });
}

export class ComentarioPedidoRepository implements IComentarioPedidoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByPedidoId(pedidoId: string): Promise<ComentarioPedido[]> {
    const rows = await this.prisma.comentarioPedido.findMany({
      where: { pedidoId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(prismaToEntity);
  }

  async createOne(data: CreateComentarioPedidoData): Promise<ComentarioPedido> {
    const r = await this.prisma.comentarioPedido.create({
      data: {
        pedidoId: data.pedidoId,
        contenido: data.contenido,
        ...(data.usuario !== undefined && { usuario: data.usuario }),
        ...(data.usuarioId !== undefined && { usuarioId: data.usuarioId }),
      },
    });
    return prismaToEntity(r);
  }
}
