import { apiClient } from '@services/api.client';
import type {
  PedidoFull,
  PedidoDetailData,
  BatchValidationResult,
  BatchProcessResult,
  CsvRawRow,
  PaginatedPedidosData,
  PageSize,
} from '../types/pedido.types';

interface BackendResponse<T> {
  data: T;
}

export interface GetAllParams {
  page: number;
  pageSize: PageSize;
  search?: string;
  orderBy?: 'createdAt_desc' | 'fecha_asc' | 'fecha_desc' | 'pendiente_desc' | 'pendiente_asc';
  filtroEstado?: string;
}

export const pedidosService = {
  getAll: async (params: GetAllParams): Promise<PaginatedPedidosData> => {
    const qs = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
    });
    if (params.search !== undefined && params.search !== '') {
      qs.set('search', params.search);
    }
    if (params.orderBy !== undefined) {
      qs.set('orderBy', params.orderBy);
    }
    if (params.filtroEstado !== undefined) {
      qs.set('filtroEstado', params.filtroEstado);
    }
    const res = await apiClient.get<BackendResponse<PaginatedPedidosData>>(`/pedidos?${qs.toString()}`);
    return res.data;
  },

  validarCsv: async (rows: CsvRawRow[]): Promise<BatchValidationResult> => {
    const res = await apiClient.post<BackendResponse<BatchValidationResult>>('/carga-csv/validar', { rows });
    return res.data;
  },

  confirmarCsv: async (rows: CsvRawRow[]): Promise<BatchProcessResult> => {
    const res = await apiClient.post<BackendResponse<BatchProcessResult>>('/carga-csv/confirmar', { rows });
    return res.data;
  },

  addEstado: async (pedidoId: string, estado: string, observacion?: string): Promise<void> => {
    const body: Record<string, string> = { estado };
    if (observacion !== undefined) body['observacion'] = observacion;
    await apiClient.post(`/pedidos/${pedidoId}/estados`, body);
  },

  getById: async (id: string): Promise<PedidoDetailData> => {
    const res = await apiClient.get<BackendResponse<PedidoDetailData>>(`/pedidos/${id}`);
    return res.data;
  },

  addComentario: async (pedidoId: string, contenido: string): Promise<void> => {
    await apiClient.post(`/pedidos/${pedidoId}/comentarios`, { contenido });
  },
};

// Re-export PedidoFull so existing callers that import it from this module keep working
export type { PedidoFull };
