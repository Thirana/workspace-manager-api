import type { RequestHandler } from 'express';

import { WorkspaceService } from '../services/workspace.service.js';
import { AppError } from '../utils/AppError.js';
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


export const getWorkspace: RequestHandler = async (req, res) => {
    const workspaceId = req.workspaceAuth?.workspaceId;
    if (!workspaceId) throw new AppError('Workspace not found', 404);

    // membership already verified by middleware
    const ws = await WorkspaceService.getWorkspaceByID(workspaceId);

    res.status(200).json({ workspace: ws });
};

export const updateWorkspace: RequestHandler = async (req, res) => {
    const workspaceId = req.workspaceAuth?.workspaceId;
    if (!workspaceId) throw new AppError('Workspace not found', 404);

    const updated = await WorkspaceService.updateWorkspace(workspaceId, req.body);

    res.status(200).json({
        message: 'Workspace updated',
        workspace: updated,
    });
};

export const deleteWorkspace: RequestHandler = async (req, res) => {
    const workspaceId = req.workspaceAuth?.workspaceId;
    if (!workspaceId) throw new AppError('Workspace not found', 404);

    await WorkspaceService.softDeleteWorkspace(workspaceId);

    // common REST practice: 204 No Content for successful delete
    res.status(204).send();
};