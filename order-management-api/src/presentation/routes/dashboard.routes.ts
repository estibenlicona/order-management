import { Router } from 'express';
import { getDashboardMetrics } from '@presentation/controllers/dashboard.controller';

export function createDashboardRouter(): Router {
  const router = Router();
  router.get('/metrics', getDashboardMetrics);
  return router;
}
