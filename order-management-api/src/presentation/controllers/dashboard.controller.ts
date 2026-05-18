import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@infrastructure/database/prisma.client';
import { GetDashboardMetricsUseCase } from '@application/use-cases/get-dashboard-metrics.use-case';
import { DashboardQuerySchema } from '@presentation/validators/dashboard.validator';
import { ValidationError } from '@domain/errors/app-error';

const useCase = new GetDashboardMetricsUseCase(prisma);

export async function getDashboardMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = DashboardQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return next(new ValidationError(parsed.error.errors.map(e => e.message).join(', ')));
    }
    const data = await useCase.execute({ months: parsed.data.months as 3 | 6 | 12 });
    res.json({ data });
  } catch (err) {
    next(err);
  }
}
