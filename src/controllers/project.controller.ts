import type { RequestHandler } from 'express';

import { ProjectService } from '../services/project.service.js';
import { AppError } from '../utils/AppError.js';
import { getAuth } from '../utils/getAuth.js';
import {
    createProjectSchema,
    listProjectsQuerySchema,
    updateProjectSchema,
    workspaceProjectParamSchema,
} from '../schemas/project.schema.js';
import type { CreateProjectInput, ListProjectsQuery, UpdateProjectInput } from '../schemas/project.schema.js';

export const createProject: RequestHandler = async (req, res) => {
    const workspaceId = req.workspaceAuth?.workspaceId;
    if (!workspaceId) throw new AppError('Workspace not found', 404);

    const input = createProjectSchema.parse(req.body) as CreateProjectInput;
    const { userId } = getAuth(req);

    const project = await ProjectService.createProject(workspaceId, input, userId);

    res.status(201).json({
        message: 'Project created',
        project,
    });
};

export const listProjects: RequestHandler = async (req, res) => {
    const workspaceId = req.workspaceAuth?.workspaceId;
    if (!workspaceId) throw new AppError('Workspace not found', 404);

    const query = listProjectsQuerySchema.parse(req.query) as ListProjectsQuery;

    const { items, nextCursor } = await ProjectService.listProjects(workspaceId, query);

    res.status(200).json({ items, nextCursor });
};

export const getProject: RequestHandler = async (req, res) => {
    const workspaceId = req.workspaceAuth?.workspaceId;
    if (!workspaceId) throw new AppError('Workspace not found', 404);

    const { projectId } = workspaceProjectParamSchema.parse(req.params);

    const project = await ProjectService.getProject(workspaceId, projectId);

    res.status(200).json({ project });
};

export const updateProject: RequestHandler = async (req, res) => {
    const workspaceId = req.workspaceAuth?.workspaceId;
    const role = req.workspaceAuth?.role;
    if (!workspaceId || !role) throw new AppError('Workspace not found', 404);

    const { projectId } = workspaceProjectParamSchema.parse(req.params);
    const patch = updateProjectSchema.parse(req.body) as UpdateProjectInput;
    const { userId } = getAuth(req);

    const project = await ProjectService.updateProject(workspaceId, projectId, patch, { userId, role });

    res.status(200).json({
        message: 'Project updated',
        project,
    });
};

export const deleteProject: RequestHandler = async (req, res) => {
    const workspaceId = req.workspaceAuth?.workspaceId;
    const role = req.workspaceAuth?.role;
    if (!workspaceId || !role) throw new AppError('Workspace not found', 404);

    const { projectId } = workspaceProjectParamSchema.parse(req.params);
    const { userId } = getAuth(req);

    await ProjectService.softDeleteProject(workspaceId, projectId, { userId, role });

    res.status(204).send();
};
