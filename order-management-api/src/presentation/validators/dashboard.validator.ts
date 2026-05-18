import { z } from 'zod';

export const DashboardQuerySchema = z.object({
  months: z
    .string()
    .optional()
    .transform(v => (v !== undefined ? parseInt(v, 10) : 6))
    .pipe(
      z.number().int().refine(n => [3, 6, 12].includes(n), {
        message: 'months must be 3, 6 or 12',
      }),
    ),
});
