import type { RequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';
import { getAuth } from '../utils/getAuth.js';

export const requireSystemRole =
    (...allowed: Array<'system_admin' | 'user'>): RequestHandler =>
        (req, _res, next) => {
            const { systemRole } = getAuth(req);

            if (!allowed.includes(systemRole)) throw new AppError('Forbidden', 403);

            next();
        };
