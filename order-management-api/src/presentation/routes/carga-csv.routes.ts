import { Router } from 'express';
import { validarCsv, confirmarCsv } from '@presentation/controllers/carga-csv.controller';

export function createCargaCsvRouter(): Router {
  const router = Router();
  router.post('/validar',   validarCsv);
  router.post('/confirmar', confirmarCsv);
  return router;
}
