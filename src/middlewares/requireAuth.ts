import type { RequestHandler } from 'express';

import { verifyAccessToken } from '../services/token.service.js';
import { AppError } from '../utils/AppError.js';

export const requireAuth: RequestHandler = (req, _res, next) => {
    // Get access token from request header
    const header = req.get('authorization');
    if (!header) throw new AppError('Unauthenticated', 401);

    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) throw new AppError('Unauthenticated', 401);

    try {
        const payload = verifyAccessToken(token);

        // payload now includes systemRole
        req.auth = { userId: payload.sub, systemRole: payload.systemRole };

        next();
    } catch {
        throw new AppError('Unauthenticated', 401);
    }
};
