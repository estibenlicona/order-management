import { Request, Response, NextFunction } from 'express';
import { AppError } from '@domain/errors/app-error';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.name,
      message: error.message,
    });
    return;
  }

  console.error('[Unhandled Error]', error);
  const isDev = process.env['NODE_ENV'] !== 'production';
  const message = isDev && error instanceof Error ? error.message : 'An unexpected error occurred';
  res.status(500).json({ error: 'InternalServerError', message });
}
