import { Router } from 'express';
import { healthCheck } from '@presentation/controllers/health.controller';
import { createCargaCsvRouter } from '@presentation/routes/carga-csv.routes';
import { createPedidosRouter } from '@presentation/routes/pedidos.routes';
import { createDashboardRouter } from '@presentation/routes/dashboard.routes';
import { authMiddleware } from '@presentation/middleware/auth.middleware';

export function createRouter(): Router {
  const router = Router();
  router.get('/health', healthCheck);

  // Todo lo que sigue requiere autenticación
  router.use(authMiddleware);
  router.use('/dashboard',  createDashboardRouter());
  router.use('/carga-csv',  createCargaCsvRouter());
  router.use('/pedidos',    createPedidosRouter());
  return router;
}
