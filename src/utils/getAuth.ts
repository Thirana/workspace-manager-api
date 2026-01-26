import type { Request } from 'express';

import { AppError } from './AppError.js';

export function getAuth(req: Request) {
    if (!req.auth) throw new AppError('Unauthenticated', 401);
    return req.auth;
}
