import { ConflictError, NotFoundError } from '@domain/errors/app-error';

export class PedidoDuplicadoError extends ConflictError {
  constructor(formula: string) {
    super(`Ya existe un pedido con la fórmula "${formula}"`);
  }
}

export class PedidoNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Pedido con id "${id}" no encontrado`);
  }
}
