import { Router } from 'express';

import { createWorkspace, listWorkspaces } from '../../controllers/workspace.controller.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { requireWorkspaceCreator } from '../../middlewares/requireWorkspaceCreator.js';
import { validateBody } from '../../middlewares/validate.js';
import { createWorkspaceSchema } from '../../schemas/workspace.schema.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

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
