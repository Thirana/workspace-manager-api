import type { RequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';

export const requireRole =
    (...allowed: Array<'user' | 'admin'>): RequestHandler =>
        (req, _res, next) => {
            const role = req.auth?.role;
            if (!role) throw new AppError('Unauthenticated', 401);

            if (!allowed.includes(role)) throw new AppError('Forbidden', 403);

            next();
        };
