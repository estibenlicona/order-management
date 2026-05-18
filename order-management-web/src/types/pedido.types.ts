// ── Entidades del dominio normalizado ──────────────────────────────────────

export interface EstadoPedido {
  id: string;
  estado: string;
  fecha?: string;
  observacion?: string;
  usuario?: string;
  usuarioId?: string;
  createdAt: string;
}

export interface ComentarioPedido {
  id: string;
  pedidoId: string;
  contenido: string;
  usuario?: string;
  usuarioId?: string;
  createdAt: string;
}

export interface PedidoFull {
  id: string;
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
  // Joined fields
  clienteNombre: string;
  clienteIdentificacion: string;
  medicamentoCodigo: string;
  medicamentoNombre: string;
  medicamentoTipoMedica?: string;
  estadoActual?: string;
  estados: EstadoPedido[];
  createdAt: string;
}

export interface PedidoDetailData extends PedidoFull {
  comentarios: ComentarioPedido[];
}

// ── Flujo de carga CSV ─────────────────────────────────────────────────────

/** Fila del CSV mapeada por clave (tal como PapaParse la devuelve) */
export type CsvRawRow = Record<string, string>;

/** Resultado de validación por fila (viene del backend /carga-csv/validar) */
export interface RowValidationResult {
  rowIndex: number;
  valid: boolean;
  errors: string[];
  warnings: string[];
  formula?: string;
  identificacion?: string;
  paciente?: string;
  producto?: string;
}

export interface BatchValidationResult {
  rows: RowValidationResult[];
  totalValid: number;
  totalInvalid: number;
  totalWarnings: number;
}

/** Resultado de procesamiento por fila (viene del backend /carga-csv/confirmar) */
export interface BatchRowResult {
  rowIndex: number;
  status: 'created' | 'skipped' | 'error';
  formula?: string;
  reason?: string;
}

export interface BatchProcessResult {
  rows: BatchRowResult[];
  totalCreated: number;
  totalSkipped: number;
  totalErrors: number;
}

// ── Paginación ────────────────────────────────────────────────────────────

export interface PaginatedPedidosData {
  items: PedidoFull[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type PageSize = 10 | 20 | 50 | 100;

// ── Mapeo de columnas del CSV ──────────────────────────────────────────────

/** Nombres exactos de columnas del CSV (con los headers normalizados) */
export const CSV_COLUMNS = {
  identificacion: 'Identificacion',
  paciente: 'Paciente',
  direccion: 'Direccion',
  telefono: 'Telefono',
  formula: 'Formula',
  fecha: 'Fecha',
  producto: 'Producto',
  pendiente: 'Pendiente',
  entregado: 'Entregado',
  existencia: 'Existencia',
  ingresoProducto: 'IngresodelProducto',
  codigo: 'Codigo',
  cp: 'CP',
  cl: 'CL',
  estado: 'Estado',
  sucursal: 'Sucursal',
  tipoMedica: 'TipoMedica',
  condicionado: 'Condicionado',
  modalidad: 'Modalidad',
  contrato: 'Contrato',
  clasificacion: 'Clasificacion',
  fecha1: 'Fecha_1',
  observacion1: 'Observacion_1',
  usuario1: 'Usuario_1',
  fecha2: 'Fecha_2',
  observacion2: 'Observacion_2',
  usuario2: 'Usuario_2',
  fecha3: 'Fecha_3',
  observacion3: 'Observacion_3',
  usuario3: 'Usuario_3',
} as const;

export const REQUIRED_CSV_COLUMNS = [
  'Identificacion', 'Paciente', 'Formula', 'Fecha',
  'Producto', 'Codigo', 'Estado',
] as const;
