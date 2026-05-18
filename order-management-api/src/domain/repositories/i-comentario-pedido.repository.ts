import type { ComentarioPedido } from '@domain/entities/comentario-pedido.entity';

export interface CreateComentarioPedidoData {
  pedidoId: string;
  contenido: string;
  usuario?: string;
  usuarioId?: string;
}

export interface IComentarioPedidoRepository {
  findByPedidoId(pedidoId: string): Promise<ComentarioPedido[]>;
  createOne(data: CreateComentarioPedidoData): Promise<ComentarioPedido>;
}
