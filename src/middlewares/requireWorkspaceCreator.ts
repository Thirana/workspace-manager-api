import type { RequestHandler } from 'express';

import { UserModel } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';

export const requireWorkspaceCreator: RequestHandler = async (req, _res, next) => {
    const userId = req.auth?.userId;
    const systemRole = req.auth?.systemRole;

    if (!userId || !systemRole) throw new AppError('Unauthenticated', 401);

    // System admins can always create workspaces
    if (systemRole === 'system_admin') return next();

    // Everyone else must have the capability enabled in DB
    const user = await UserModel.findById(userId).select('+canCreateWorkspaces');
    if (!user) throw new AppError('Unauthenticated', 401);

    if (!user.canCreateWorkspaces) throw new AppError('Forbidden', 403);

    next();
};
