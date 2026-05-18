import { Pedido } from '@domain/entities/pedido.entity';

export type PedidoOrderBy = 'createdAt_desc' | 'fecha_asc' | 'fecha_desc' | 'pendiente_desc' | 'pendiente_asc';

export interface PedidoQueryParams {
  readonly page: number;
  readonly pageSize: number;
  readonly search?: string;
  readonly soloPendientes?: boolean;
  readonly orderBy?: PedidoOrderBy;
  readonly filtroEstado?: string;
}

export interface PaginatedPedidos {
  readonly items: PedidoWithRelations[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

export interface CreatePedidoData {
  formula: string;
  clienteId: string;
  medicamentoId: string;
  fecha: string;
  cantidadPendiente: number;
  cantidadEntregada: number;
  existencia: number;
  sucursal?: string;
  condicionado: boolean;
  modalidad?: string;
  contrato?: string;
  clasificacion?: string;
  cp?: string;
  cl?: string;
}

export interface PedidoWithRelations extends Pedido {
  readonly clienteNombre: string;
  readonly clienteIdentificacion: string;
  readonly medicamentoCodigo: string;
  readonly medicamentoNombre: string;
  readonly medicamentoTipoMedica?: string;
  readonly estadoActual?: string;
}

export interface IPedidoRepository {
  create(data: CreatePedidoData): Promise<Pedido>;
  findAll(): Promise<PedidoWithRelations[]>;
  findPaginated(params: PedidoQueryParams): Promise<PaginatedPedidos>;
  findById(id: string): Promise<PedidoWithRelations | null>;
  findByFormula(formula: string): Promise<Pedido | null>;
  existsByFormula(formula: string): Promise<boolean>;
  existsByClienteAndMedicamento(clienteId: string, medicamentoId: string): Promise<boolean>;
  existsFormulas(formulas: string[]): Promise<Set<string>>;
}
