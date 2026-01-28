import crypto from 'crypto';
import mongoose from 'mongoose';

import { WorkspaceModel } from '../models/workspace.model.js';
import { WorkspaceMembershipModel } from '../models/workspaceMembership.model.js';
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from '../schemas/workspace.schema.js';
import { makeWorkspaceSlug } from '../schemas/workspace.schema.js';
import { AppError } from '../utils/AppError.js';

function isDuplicateKeyError(err: unknown): boolean {
    return typeof err === 'object' && err !== null && (err as any).code === 11000;
}

function slugSuffix() {
    return crypto.randomBytes(3).toString('hex'); // 6 chars
}

export class WorkspaceService {
    static async createWorkspace(input: CreateWorkspaceInput, userId: string) {
        // Keep transactions short. Mongo will abort long-running ones by default. :contentReference
        const session = await mongoose.startSession(); // :contentReference

        try {
            let createdWorkspace: any;

            await session.withTransaction(async () => {
                // Retry slug creation a few times on collisions
                const base = makeWorkspaceSlug(input.name);
                let slug = base || `workspace-${slugSuffix()}`;

                for (let attempt = 0; attempt < 5; attempt++) {
                    try {
                        const [ws] = await WorkspaceModel.create(
                            [
                                {
                                    name: input.name,
                                    slug,
                                    createdByUserId: new mongoose.Types.ObjectId(userId),
                                },
                            ],
                            { session },
                        );
                        if (!ws) {
                            throw new AppError('Workspace creation failed', 500);
                        }

                        // Owner membership (multi-document invariant → transaction justified) :contentReference
                        await WorkspaceMembershipModel.create(
                            [
                                {
                                    workspaceId: ws._id,
                                    userId: new mongoose.Types.ObjectId(userId),
                                    role: 'owner',
                                    status: 'active',
                                },
                            ],
                            { session },
                        );

                        createdWorkspace = ws;
                        return; // success
                    } catch (err) {
                        if (isDuplicateKeyError(err)) {
                            slug = `${base}-${slugSuffix()}`;
                            continue;
                        }
                        throw err;
                    }
                }

                throw new AppError('Could not generate unique workspace slug', 409);
            });

            return createdWorkspace;
        } finally {
            session.endSession();
        }
    }

    static async listMyWorkspaces(userId: string) {
        const memberships = await WorkspaceMembershipModel.find({
            userId: new mongoose.Types.ObjectId(userId),
            status: 'active',
        }).select('workspaceId');

        const workspaceIds = memberships.map((m) => m.workspaceId);

        // Deny-by-default: only return workspaces the caller is a member of
        return WorkspaceModel.find({ _id: { $in: workspaceIds }, isDeleted: false }).sort({
            createdAt: -1,
            _id: -1,
        });
    }

    static async getWorkspaceByID(workspaceId: string) {

        const ws = WorkspaceModel.findOne({
            _id: new mongoose.Types.ObjectId(workspaceId),
            isDeleted: false,
        })

        if (!ws) throw new AppError("Workspace not found", 404)
        return ws
    }

    static async updateWorkspace(workspaceId: string, patch: UpdateWorkspaceInput) {
        const update: Record<string, unknown> = {};

        if (patch.name !== undefined) update.name = patch.name;

        const ws = await WorkspaceModel.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(workspaceId), isDeleted: false },
            { $set: update },
            {
                new: true,
                runValidators: true, // important: update validators are OFF by default :contentReference[oaicite:3]{index=3}
            },
        );

        if (!ws) throw new AppError('Workspace not found', 404);
        return ws;
    }

    static async softDeleteWorkspace(workspaceId: string) {
        // Idempotent: if already deleted, treat as success.
        await WorkspaceModel.updateOne(
            { _id: new mongoose.Types.ObjectId(workspaceId), isDeleted: false },
            { $set: { isDeleted: true, deletedAt: new Date() } },
        );
    }
}
