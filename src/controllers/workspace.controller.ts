import type { RequestHandler } from 'express';

import { AppError } from '../utils/AppError.js';
import { WorkspaceService } from '../services/workspace.service.js';

export const createWorkspace: RequestHandler = async (req, res) => {
    const userId = req.auth?.userId;
    if (!userId) throw new AppError('Unauthenticated', 401);

    const workspace = await WorkspaceService.createWorkspace(req.body, userId);

    res.status(201).json({
        message: 'Workspace created',
        workspace,
    });
};

export const listWorkspaces: RequestHandler = async (req, res) => {
    const userId = req.auth?.userId;
    if (!userId) throw new AppError('Unauthenticated', 401);

    const workspaces = await WorkspaceService.listMyWorkspaces(userId);

    res.status(200).json({
        workspaces,
    });
};
