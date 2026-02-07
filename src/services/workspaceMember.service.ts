import mongoose from 'mongoose';

import { WorkspaceMembershipModel, type WorkspaceRole } from '../models/workspaceMembership.model.js';
import { WorkspaceModel } from '../models/workspace.model.js';
import { UserModel } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';

type ListFilters = {
    limit: number;
    cursor?: string | undefined;
    role?: WorkspaceRole | undefined;
};

type MemberUser = {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
};

type MemberItem = {
    id: string;
    user: MemberUser | null;
    role: WorkspaceRole;
    status: 'active' | 'removed';
    createdAt: Date;
};

type ListResult = { items: MemberItem[]; nextCursor: string | null };

export class WorkspaceMemberService {
    static async addMember(workspaceId: string, userId: string, role: 'member' | 'viewer') {
        const workspace = await WorkspaceModel.findOne({
            _id: new mongoose.Types.ObjectId(workspaceId),
            isDeleted: false,
        }).select('_id');

        if (!workspace) throw new AppError('Workspace not found', 404);

        const user = await UserModel.findById(userId).select('_id');
        if (!user) throw new AppError('User not found', 404);

        const existing = await WorkspaceMembershipModel.findOne({
            workspaceId: new mongoose.Types.ObjectId(workspaceId),
            userId: new mongoose.Types.ObjectId(userId),
        });

        if (existing) {
            if (existing.status === 'active') {
                throw new AppError('Member already exists', 409);
            }

            existing.status = 'active';
            existing.role = role;
            existing.removedAt = null;
            existing.removedBy = null;
            await existing.save();
            return existing;
        }

        return WorkspaceMembershipModel.create({
            workspaceId: new mongoose.Types.ObjectId(workspaceId),
            userId: new mongoose.Types.ObjectId(userId),
            role,
            status: 'active',
        });
    }

    static async listMembers(workspaceId: string, filters: ListFilters): Promise<ListResult> {
        const query: Record<string, unknown> = {
            workspaceId: new mongoose.Types.ObjectId(workspaceId),
            status: 'active',
        };

        if (filters.role) query.role = filters.role;

        if (filters.cursor) {
            query._id = { $lt: new mongoose.Types.ObjectId(filters.cursor) };
        }

        const rows = await WorkspaceMembershipModel.find(query)
            .sort({ _id: -1 })
            .limit(filters.limit + 1)
            .populate({ path: 'userId', select: 'email firstName lastName' })
            .lean();

        const hasNext = rows.length > filters.limit;
        const slice = hasNext ? rows.slice(0, filters.limit) : rows;

        const items: MemberItem[] = slice.map((row: any) => {
            const userDoc = row.userId && typeof row.userId === 'object' ? row.userId : null;
            const user = userDoc
                ? {
                    id: userDoc._id.toString(),
                    email: userDoc.email,
                    firstName: userDoc.firstName ?? null,
                    lastName: userDoc.lastName ?? null,
                }
                : null;

            return {
                id: row._id.toString(),
                user,
                role: row.role,
                status: row.status,
                createdAt: row.createdAt,
            };
        });

        const nextCursor = hasNext ? items[items.length - 1]?.id ?? null : null;
        return { items, nextCursor };
    }

    static async updateMemberRole(
        workspaceId: string,
        memberId: string,
        role: Exclude<WorkspaceRole, 'owner'>,
    ) {
        const membership = await WorkspaceMembershipModel.findOne({
            workspaceId: new mongoose.Types.ObjectId(workspaceId),
            userId: new mongoose.Types.ObjectId(memberId),
            status: 'active',
        });

        if (!membership) throw new AppError('Member not found', 404);

        if (membership.role === 'owner') {
            throw new AppError('Cannot change owner role', 403);
        }

        if (membership.role === role) return membership;

        membership.role = role;
        await membership.save();

        return membership;
    }

    static async removeMember(workspaceId: string, memberId: string, removedByUserId: string) {
        const membership = await WorkspaceMembershipModel.findOne({
            workspaceId: new mongoose.Types.ObjectId(workspaceId),
            userId: new mongoose.Types.ObjectId(memberId),
            status: 'active',
        });

        if (!membership) throw new AppError('Member not found', 404);

        if (membership.role === 'owner') {
            throw new AppError('Cannot remove owner', 403);
        }

        membership.status = 'removed';
        membership.removedAt = new Date();
        membership.removedBy = new mongoose.Types.ObjectId(removedByUserId);
        await membership.save();
    }
}
