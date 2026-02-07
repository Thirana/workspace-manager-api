import type { RequestHandler } from 'express';

import { WorkspaceMemberService } from '../services/workspaceMember.service.js';
import { getAuth } from '../utils/getAuth.js';
import { AppError } from '../utils/AppError.js';
import { listMembersQuerySchema, workspaceMemberParamSchema } from '../schemas/workspaceMember.schema.js';
import type { CreateMemberInput, ListMembersQuery, UpdateMemberRoleInput } from '../schemas/workspaceMember.schema.js';

export const listMembers: RequestHandler = async (req, res) => {
    const workspaceId = req.workspaceAuth?.workspaceId;
    if (!workspaceId) throw new AppError('Workspace not found', 404);

    const query = listMembersQuerySchema.parse(req.query) as ListMembersQuery;

    const { items, nextCursor } = await WorkspaceMemberService.listMembers(workspaceId, query);

    res.status(200).json({ items, nextCursor });
};

export const addMember: RequestHandler = async (req, res) => {
    const workspaceId = req.workspaceAuth?.workspaceId;
    if (!workspaceId) throw new AppError('Workspace not found', 404);

    const input = req.body as CreateMemberInput;

    const member = await WorkspaceMemberService.addMember(workspaceId, input.userId, input.role);

    res.status(201).json({
        message: 'Member added',
        member,
    });
};

export const updateMemberRole: RequestHandler = async (req, res) => {
    const workspaceId = req.workspaceAuth?.workspaceId;
    if (!workspaceId) throw new AppError('Workspace not found', 404);

    const { memberId } = workspaceMemberParamSchema.parse(req.params);
    const input = req.body as UpdateMemberRoleInput;

    const updated = await WorkspaceMemberService.updateMemberRole(workspaceId, memberId, input.role);

    res.status(200).json({
        message: 'Member role updated',
        member: updated,
    });
};

export const removeMember: RequestHandler = async (req, res) => {
    const workspaceId = req.workspaceAuth?.workspaceId;
    if (!workspaceId) throw new AppError('Workspace not found', 404);

    const { memberId } = workspaceMemberParamSchema.parse(req.params);
    const { userId } = getAuth(req);

    await WorkspaceMemberService.removeMember(workspaceId, memberId, userId);

    res.status(204).send();
};
