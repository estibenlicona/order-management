import type { ComentarioPedido } from '@domain/entities/comentario-pedido.entity';
import type { EstadoPedido } from '@domain/entities/estado-pedido.entity';
import { PedidoNotFoundError } from '@domain/errors/pedido.errors';
import type { IComentarioPedidoRepository } from '@domain/repositories/i-comentario-pedido.repository';
import type { IEstadoPedidoRepository } from '@domain/repositories/i-estado-pedido.repository';
import type { IPedidoRepository, PedidoWithRelations } from '@domain/repositories/i-pedido.repository';
import type { Result } from '@shared/types/result';
import { err, ok } from '@shared/types/result';

export interface PedidoDetail extends PedidoWithRelations {
  readonly estados: EstadoPedido[];
  readonly comentarios: ComentarioPedido[];
}

export class GetPedidoDetailUseCase {
  constructor(
    private readonly pedidoRepo: IPedidoRepository,
    private readonly estadoRepo: IEstadoPedidoRepository,
    private readonly comentarioRepo: IComentarioPedidoRepository,
  ) {}

  async execute(pedidoId: string): Promise<Result<PedidoDetail, PedidoNotFoundError>> {
    const pedido = await this.pedidoRepo.findById(pedidoId);
    if (pedido === null) return err(new PedidoNotFoundError(pedidoId));

    const [estados, comentarios] = await Promise.all([
      this.estadoRepo.findByPedidoId(pedidoId),
      this.comentarioRepo.findByPedidoId(pedidoId),
    ]);

    return ok({ ...pedido, estados, comentarios });
  }
}
