import { z } from 'zod';

export const AddEstadoSchema = z.object({
  estado: z.string().trim().min(1),
  observacion: z.string().trim().optional(),
  usuario: z.string().trim().optional(),
});

export const AddComentarioSchema = z.object({
  contenido: z.string().trim().min(1).max(2000),
  usuario: z.string().trim().max(100).optional(),
});

export const GetPedidosQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform(v => (v !== undefined ? parseInt(v, 10) : 1))
    .pipe(z.number().int().min(1)),
  pageSize: z
    .string()
    .optional()
    .transform(v => (v !== undefined ? parseInt(v, 10) : 20))
    .pipe(
      z.number().int().refine(n => [10, 20, 50, 100].includes(n), {
        message: 'pageSize must be 10, 20, 50 or 100',
      }),
    ),
  search: z.string().trim().max(100).optional(),
  soloPendientes: z
    .string()
    .optional()
    .transform(v => v === 'true'),
  orderBy: z.enum(['createdAt_desc', 'fecha_asc', 'fecha_desc', 'pendiente_desc', 'pendiente_asc']).optional(),
  filtroEstado: z.string().trim().max(50).optional(),
  sucursal: z.string().trim().max(100).optional(),
});
