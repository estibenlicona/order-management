import {
  IPedidoRepository,
  PedidoWithRelations,
  PedidoQueryParams,
  PedidoOrderBy,
} from '@domain/repositories/i-pedido.repository';
import { IEstadoPedidoRepository } from '@domain/repositories/i-estado-pedido.repository';
import { ok, Result } from '@shared/types/result';

export interface GetPedidosDto {
  readonly page: number;
  readonly pageSize: number;
  readonly search?: string;
  readonly soloPendientes?: boolean;
  readonly orderBy?: PedidoOrderBy;
  readonly filtroEstado?: string;
  readonly sucursal?: string;
}

export interface PedidoFull extends PedidoWithRelations {
  estados: Array<{
    id: string;
    estado: string;
    fecha?: string;
    observacion?: string;
    usuario?: string;
    createdAt: Date;
  }>;
}

export interface PaginatedPedidosResult {
  readonly items: PedidoFull[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

export class GetAllPedidosUseCase {
  constructor(
    private readonly pedidoRepo: IPedidoRepository,
    private readonly estadoRepo: IEstadoPedidoRepository,
  ) {}

  async execute(dto: GetPedidosDto): Promise<Result<PaginatedPedidosResult>> {
    const params: PedidoQueryParams = {
      page: dto.page,
      pageSize: dto.pageSize,
      ...(dto.search !== undefined && { search: dto.search }),
      ...(dto.soloPendientes !== undefined && { soloPendientes: dto.soloPendientes }),
      ...(dto.orderBy !== undefined && { orderBy: dto.orderBy }),
      ...(dto.filtroEstado !== undefined && { filtroEstado: dto.filtroEstado }),
      ...(dto.sucursal !== undefined && { sucursal: dto.sucursal }),
    };

    const paginated = await this.pedidoRepo.findPaginated(params);

    const items: PedidoFull[] = await Promise.all(
      paginated.items.map(async pedido => {
        const estados = await this.estadoRepo.findByPedidoId(pedido.id);
        return {
          ...pedido,
          estados: estados.map(e => ({
            id: e.id,
            estado: e.estado,
            ...(e.fecha !== undefined && { fecha: e.fecha }),
            ...(e.observacion !== undefined && { observacion: e.observacion }),
            ...(e.usuario !== undefined && { usuario: e.usuario }),
            createdAt: e.createdAt,
          })),
        };
      }),
    );

    return ok({
      items,
      total: paginated.total,
      page: paginated.page,
      pageSize: paginated.pageSize,
      totalPages: paginated.totalPages,
    });
  }
}
