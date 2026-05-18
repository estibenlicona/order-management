import { z } from 'zod';

export const CargaCsvBodySchema = z.object({
  rows: z.array(z.record(z.string(), z.unknown())).min(1, 'El batch debe contener al menos una fila'),
});
