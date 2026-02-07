import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const workspaceMemberParamSchema = z.object({
    workspaceId: z.string().regex(objectIdRegex, 'Invalid workspace Id'),
    memberId: z.string().regex(objectIdRegex, 'Invalid member Id'),
});

export const listMembersQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    cursor: z.string().regex(objectIdRegex, 'Invalid cursor').optional(),
    role: z.enum(['owner', 'admin', 'member', 'viewer']).optional(),
});

export const createMemberSchema = z.object({
    userId: z.string().regex(objectIdRegex, 'Invalid user Id'),
    role: z.enum(['member', 'viewer']).default('member'),
});

export const updateMemberRoleSchema = z.object({
    role: z.enum(['admin', 'member', 'viewer']),
});

export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>;
export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
