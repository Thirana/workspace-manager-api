import type { RequestHandler } from 'express';

import { AppError } from '../utils/AppError.js';

type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

/*
requires a minimum role inside this workspace
*/
export const requireWorkspaceRole =
    (...allowed: WorkspaceRole[]): RequestHandler =>
        (req, _res, next) => {
            const role = req.workspaceAuth?.role;
            if (!role) throw new AppError('Unauthenticated', 401); // should never happen if requireWorkspaceMember ran

            if (!allowed.includes(role)) throw new AppError('Forbidden', 403);

            next();
        };
