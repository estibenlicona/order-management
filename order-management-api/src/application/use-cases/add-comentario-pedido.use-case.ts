import type { ComentarioPedido } from '@domain/entities/comentario-pedido.entity';
import { PedidoNotFoundError } from '@domain/errors/pedido.errors';
import type { IComentarioPedidoRepository } from '@domain/repositories/i-comentario-pedido.repository';
import type { IPedidoRepository } from '@domain/repositories/i-pedido.repository';
import type { Result } from '@shared/types/result';
import { err, ok } from '@shared/types/result';

export interface AddComentarioPedidoDto {
  contenido: string;
  usuario?: string;
  usuarioId?: string;
}

export class AddComentarioPedidoUseCase {
  constructor(
    private readonly pedidoRepo: IPedidoRepository,
    private readonly comentarioRepo: IComentarioPedidoRepository,
  ) {}

  async execute(
    pedidoId: string,
    dto: AddComentarioPedidoDto,
  ): Promise<Result<ComentarioPedido, PedidoNotFoundError>> {
    const pedido = await this.pedidoRepo.findById(pedidoId);
    if (pedido === null) return err(new PedidoNotFoundError(pedidoId));

    const comentario = await this.comentarioRepo.createOne({
      pedidoId,
      contenido: dto.contenido,
      ...(dto.usuario !== undefined && { usuario: dto.usuario }),
      ...(dto.usuarioId !== undefined && { usuarioId: dto.usuarioId }),
    });

    return ok(comentario);
  }
}
