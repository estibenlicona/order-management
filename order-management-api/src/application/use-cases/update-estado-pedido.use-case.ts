import type { EstadoPedido } from '@domain/entities/estado-pedido.entity';
import { PedidoNotFoundError } from '@domain/errors/pedido.errors';
import type { IPedidoRepository } from '@domain/repositories/i-pedido.repository';
import type { IEstadoPedidoRepository } from '@domain/repositories/i-estado-pedido.repository';
import type { Result} from '@shared/types/result';
import { ok, err } from '@shared/types/result';

export interface UpdateEstadoPedidoDto {
  estado: string;
  observacion?: string;
  usuario?: string;
  usuarioId?: string;
}

export class UpdateEstadoPedidoUseCase {
  constructor(
    private readonly pedidoRepo: IPedidoRepository,
    private readonly estadoRepo: IEstadoPedidoRepository,
  ) {}

  async execute(pedidoId: string, dto: UpdateEstadoPedidoDto): Promise<Result<EstadoPedido, PedidoNotFoundError>> {
    const pedido = await this.pedidoRepo.findById(pedidoId);
    if (!pedido) return err(new PedidoNotFoundError(pedidoId));

    const estado = await this.estadoRepo.createOne({
      pedidoId,
      estado: dto.estado,
      ...(dto.observacion !== undefined && { observacion: dto.observacion }),
      ...(dto.usuario !== undefined && { usuario: dto.usuario }),
      ...(dto.usuarioId !== undefined && { usuarioId: dto.usuarioId }),
    });

    return ok(estado);
  }
}
