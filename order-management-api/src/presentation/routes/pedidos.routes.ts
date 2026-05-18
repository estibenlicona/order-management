import { Router } from 'express';
import {
  getAllPedidos,
  getPedidoDetail,
  addEstadoPedido,
  addComentarioPedido,
} from '@presentation/controllers/pedidos.controller';

export function createPedidosRouter(): Router {
  const router = Router();
  router.get('/',                  getAllPedidos);
  router.get('/:id',               getPedidoDetail);
  router.post('/:id/estados',      addEstadoPedido);
  router.post('/:id/comentarios',  addComentarioPedido);
  return router;
}
