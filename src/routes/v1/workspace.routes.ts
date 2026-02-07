import { Router } from 'express';

import { createWorkspace, listWorkspaces, getWorkspace, updateWorkspace, deleteWorkspace } from '../../controllers/workspace.controller.js';
import { createProject, listProjects, getProject, updateProject, deleteProject } from '../../controllers/project.controller.js';
import { addMember, listMembers, updateMemberRole, removeMember } from '../../controllers/workspaceMember.controller.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { requireWorkspaceMember } from '../../middlewares/requireWorkspaceMember.js';
import { requireWorkspaceCreator } from '../../middlewares/requireWorkspaceCreator.js';
import { validateBody, validateParams, validateQuery } from '../../middlewares/validate.js';
import { createWorkspaceSchema, updateWorkspaceSchema, workspaceIdParamSchema } from '../../schemas/workspace.schema.js';
import {
    createProjectSchema,
    listProjectsQuerySchema,
    updateProjectSchema,
    workspaceProjectParamSchema,
} from '../../schemas/project.schema.js';
import {
    createMemberSchema,
    listMembersQuerySchema,
    updateMemberRoleSchema,
    workspaceMemberParamSchema,
} from '../../schemas/workspaceMember.schema.js';
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

// Create project (owner/admin/member)
workspaceRouter.post(
    '/:workspaceId/projects',
    requireAuth,
    validateParams(workspaceIdParamSchema),
    requireWorkspaceMember('workspaceId'),
    requireWorkspaceRole('owner', 'admin', 'member'),
    validateBody(createProjectSchema),
    asyncHandler(createProject),
);

// List projects
workspaceRouter.get(
    '/:workspaceId/projects',
    requireAuth,
    validateParams(workspaceIdParamSchema),
    requireWorkspaceMember('workspaceId'),
    validateQuery(listProjectsQuerySchema),
    asyncHandler(listProjects),
);

// Get project
workspaceRouter.get(
    '/:workspaceId/projects/:projectId',
    requireAuth,
    validateParams(workspaceProjectParamSchema),
    requireWorkspaceMember('workspaceId'),
    asyncHandler(getProject),
);

// List workspace members
workspaceRouter.get(
    '/:workspaceId/members',
    requireAuth,
    validateParams(workspaceIdParamSchema),
    requireWorkspaceMember('workspaceId'),
    validateQuery(listMembersQuerySchema),
    asyncHandler(listMembers),
);

// Add member (owner/admin only)
workspaceRouter.post(
    '/:workspaceId/members',
    requireAuth,
    validateParams(workspaceIdParamSchema),
    requireWorkspaceMember('workspaceId'),
    requireWorkspaceRole('owner', 'admin'),
    validateBody(createMemberSchema),
    asyncHandler(addMember),
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

// Update project (owner/admin or creator)
workspaceRouter.patch(
    '/:workspaceId/projects/:projectId',
    requireAuth,
    validateParams(workspaceProjectParamSchema),
    requireWorkspaceMember('workspaceId'),
    validateBody(updateProjectSchema),
    asyncHandler(updateProject),
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

// Delete project (owner/admin or creator)
workspaceRouter.delete(
    '/:workspaceId/projects/:projectId',
    requireAuth,
    validateParams(workspaceProjectParamSchema),
    requireWorkspaceMember('workspaceId'),
    asyncHandler(deleteProject),
);

// Update member role (owner/admin only)
workspaceRouter.patch(
    '/:workspaceId/members/:memberId',
    requireAuth,
    validateParams(workspaceMemberParamSchema),
    requireWorkspaceMember('workspaceId'),
    requireWorkspaceRole('owner', 'admin'),
    validateBody(updateMemberRoleSchema),
    asyncHandler(updateMemberRole),
);

// Remove member (owner/admin only)
workspaceRouter.delete(
    '/:workspaceId/members/:memberId',
    requireAuth,
    validateParams(workspaceMemberParamSchema),
    requireWorkspaceMember('workspaceId'),
    requireWorkspaceRole('owner', 'admin'),
    asyncHandler(removeMember),
);
