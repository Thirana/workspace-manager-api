import type { RequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';

export const requireSystemRole =
    (...allowed: Array<'system_admin' | 'user'>): RequestHandler =>
        (req, _res, next) => {
            const systemRole = req.auth?.systemRole;
            if (!systemRole) throw new AppError('Unauthenticated', 401);

            if (!allowed.includes(systemRole)) throw new AppError('Forbidden', 403);

            next();
        };
