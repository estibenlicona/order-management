import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@infrastructure/database/prisma.client';
import { PedidoRepository } from '@infrastructure/repositories/pedido.repository';
import { EstadoPedidoRepository } from '@infrastructure/repositories/estado-pedido.repository';
import { ComentarioPedidoRepository } from '@infrastructure/repositories/comentario-pedido.repository';
import type { GetPedidosDto } from '@application/use-cases/get-all-pedidos.use-case';
import { GetAllPedidosUseCase } from '@application/use-cases/get-all-pedidos.use-case';
import type { UpdateEstadoPedidoDto } from '@application/use-cases/update-estado-pedido.use-case';
import { UpdateEstadoPedidoUseCase } from '@application/use-cases/update-estado-pedido.use-case';
import { GetPedidoDetailUseCase } from '@application/use-cases/get-pedido-detail.use-case';
import type { AddComentarioPedidoDto } from '@application/use-cases/add-comentario-pedido.use-case';
import { AddComentarioPedidoUseCase } from '@application/use-cases/add-comentario-pedido.use-case';
import {
  AddEstadoSchema,
  AddComentarioSchema,
  GetPedidosQuerySchema,
} from '@presentation/validators/pedidos.validator';
import { ValidationError } from '@domain/errors/app-error';

const pedidoRepo     = new PedidoRepository(prisma);
const estadoRepo     = new EstadoPedidoRepository(prisma);
const comentarioRepo = new ComentarioPedidoRepository(prisma);

const getAllUseCase           = new GetAllPedidosUseCase(pedidoRepo, estadoRepo);
const getPedidoDetailUseCase  = new GetPedidoDetailUseCase(pedidoRepo, estadoRepo, comentarioRepo);
const updateEstadoUseCase     = new UpdateEstadoPedidoUseCase(pedidoRepo, estadoRepo);
const addComentarioUseCase    = new AddComentarioPedidoUseCase(pedidoRepo, comentarioRepo);

export async function getAllPedidos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = GetPedidosQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return next(new ValidationError(parsed.error.errors.map(e => e.message).join(', ')));
    }

    const dto: GetPedidosDto = {
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
      ...(parsed.data.search !== undefined && { search: parsed.data.search }),
      ...(parsed.data.soloPendientes === true && { soloPendientes: true }),
      ...(parsed.data.orderBy !== undefined && { orderBy: parsed.data.orderBy }),
      ...(parsed.data.filtroEstado !== undefined && { filtroEstado: parsed.data.filtroEstado }),
    };

    const result = await getAllUseCase.execute(dto);
    if (!result.ok) return next(result.error);
    res.json({ data: result.value });
  } catch (err) {
    next(err);
  }
}

export async function getPedidoDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const result = await getPedidoDetailUseCase.execute(id);
    if (!result.ok) return next(result.error);
    res.json({ data: result.value });
  } catch (err) {
    next(err);
  }
}

export async function addEstadoPedido(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const parsed = AddEstadoSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new ValidationError(parsed.error.errors.map(e => e.message).join(', ')));
    }
    const dto: UpdateEstadoPedidoDto = {
      estado: parsed.data.estado,
    };
    if (parsed.data.observacion !== undefined) dto.observacion = parsed.data.observacion;
    if (req.user !== undefined) {
      dto.usuarioId = req.user.id;
      dto.usuario = req.user.fullName;
    }
    const result = await updateEstadoUseCase.execute(id, dto);
    if (!result.ok) return next(result.error);
    res.status(201).json({ data: result.value });
  } catch (err) {
    next(err);
  }
}

export async function addComentarioPedido(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const parsed = AddComentarioSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new ValidationError(parsed.error.errors.map(e => e.message).join(', ')));
    }
    const dto: AddComentarioPedidoDto = {
      contenido: parsed.data.contenido,
    };
    if (req.user !== undefined) {
      dto.usuarioId = req.user.id;
      dto.usuario = req.user.fullName;
    }
    const result = await addComentarioUseCase.execute(id, dto);
    if (!result.ok) return next(result.error);
    res.status(201).json({ data: result.value });
  } catch (err) {
    next(err);
  }
}
