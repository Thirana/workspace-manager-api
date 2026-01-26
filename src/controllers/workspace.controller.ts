import type { RequestHandler } from 'express';

import { WorkspaceService } from '../services/workspace.service.js';
import { getAuth } from '../utils/getAuth.js';

export const createWorkspace: RequestHandler = async (req, res) => {
    const { userId } = getAuth(req);

    const workspace = await WorkspaceService.createWorkspace(req.body, userId);

    res.status(201).json({
        message: 'Workspace created',
        workspace,
    });
};

export const listWorkspaces: RequestHandler = async (req, res) => {
    const { userId } = getAuth(req);

    const workspaces = await WorkspaceService.listMyWorkspaces(userId);

    res.status(200).json({
        workspaces,
    });
};
