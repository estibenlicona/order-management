import { EstadoPedido } from '@domain/entities/estado-pedido.entity';

export interface CreateEstadoPedidoData {
  pedidoId: string;
  estado: string;
  fecha?: string;
  observacion?: string;
  usuario?: string;
  usuarioId?: string;
}

export interface IEstadoPedidoRepository {
  createMany(entries: CreateEstadoPedidoData[]): Promise<EstadoPedido[]>;
  findByPedidoId(pedidoId: string): Promise<EstadoPedido[]>;
  createOne(data: CreateEstadoPedidoData): Promise<EstadoPedido>;
}
