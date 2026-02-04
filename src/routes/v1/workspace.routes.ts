import { Router } from 'express';

import { createWorkspace, listWorkspaces, getWorkspace, updateWorkspace, deleteWorkspace } from '../../controllers/workspace.controller.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { requireWorkspaceMember } from '../../middlewares/requireWorkspaceMember.js';
import { requireWorkspaceCreator } from '../../middlewares/requireWorkspaceCreator.js';
import { validateBody, validateParams } from '../../middlewares/validate.js';
import { createWorkspaceSchema, updateWorkspaceSchema, workspaceIdParamSchema } from '../../schemas/workspace.schema.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireWorkspaceRole } from '../../middlewares/requireWorkspaceRole.js';

export const workspaceRouter = Router();

// Create requires: authenticated + creator capability (or system_admin)
workspaceRouter.post(
    '/',
    requireAuth,
    requireWorkspaceCreator,
    validateBody(createWorkspaceSchema),
    asyncHandler(createWorkspace),
);

// List my workspaces (membership-driven)
workspaceRouter.get('/', requireAuth, asyncHandler(listWorkspaces));

workspaceRouter.get(
    '/:workspaceId',
    requireAuth,
    validateParams(workspaceIdParamSchema),
    requireWorkspaceMember('workspaceId'),
    asyncHandler(getWorkspace),
);

// Owner/Admin update
workspaceRouter.patch(
    '/:workspaceId',
    requireAuth,
    validateParams(workspaceIdParamSchema),
    requireWorkspaceMember('workspaceId'),
    requireWorkspaceRole('owner', 'admin'),
    validateBody(updateWorkspaceSchema),
    asyncHandler(updateWorkspace),
);

// Owner-only delete (soft)
workspaceRouter.delete(
    '/:workspaceId',
    requireAuth,
    validateParams(workspaceIdParamSchema),
    requireWorkspaceMember('workspaceId'),
    requireWorkspaceRole('owner'),
    asyncHandler(deleteWorkspace),
);
