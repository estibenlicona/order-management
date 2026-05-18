import type { Request, Response, NextFunction } from 'express';
import { supabase } from '@infrastructure/auth/supabase.client';
import { UnauthorizedError } from '@domain/errors/app-error';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header === undefined) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || token === undefined || token === '') return null;
  return token;
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractToken(req);
    if (token === null) {
      return next(new UnauthorizedError('Token de autenticación faltante'));
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error !== null || data.user === null) {
      return next(new UnauthorizedError('Token inválido o expirado'));
    }

    const meta = data.user.user_metadata ?? {};
    const fullNameMeta = (meta['full_name'] ?? meta['name']) as string | undefined;
    const email = data.user.email ?? '';
    const fullName = fullNameMeta !== undefined && fullNameMeta.trim() !== ''
      ? fullNameMeta
      : email;

    req.user = {
      id: data.user.id,
      email,
      fullName,
    };

    next();
  } catch (err) {
    next(err);
  }
}
