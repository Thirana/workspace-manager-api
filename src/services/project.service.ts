import crypto from 'crypto';
import mongoose from 'mongoose';

import { ProjectModel } from '../models/project.model.js';
import type { CreateProjectInput, ListProjectsQuery, UpdateProjectInput } from '../schemas/project.schema.js';
import { makeProjectSlug } from '../schemas/project.schema.js';
import { AppError } from '../utils/AppError.js';
import type { WorkspaceRole } from '../models/workspaceMembership.model.js';

type ListResult<T> = { items: T[]; nextCursor: string | null };

function isDuplicateKeyError(err: unknown): boolean {
    return typeof err === 'object' && err !== null && (err as any).code === 11000;
}

function slugSuffix() {
    return crypto.randomBytes(3).toString('hex');
}

function escapeRegex(input: string) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class ProjectService {
    static async createProject(workspaceId: string, input: CreateProjectInput, userId: string) {
        const base = makeProjectSlug(input.name);
        let slug = base || `project-${slugSuffix()}`;

        for (let attempt = 0; attempt < 5; attempt++) {
            try {
                const project = await ProjectModel.create({
                    workspaceId: new mongoose.Types.ObjectId(workspaceId),
                    name: input.name,
                    slug,
                    createdByUserId: new mongoose.Types.ObjectId(userId),
                });

                return project;
            } catch (err) {
                if (isDuplicateKeyError(err)) {
                    slug = `${base}-${slugSuffix()}`;
                    continue;
                }
                throw err;
            }
        }

        throw new AppError('Could not generate unique project slug', 409);
    }

    static async listProjects(workspaceId: string, filters: ListProjectsQuery): Promise<ListResult<any>> {
        const query: Record<string, unknown> = {
            workspaceId: new mongoose.Types.ObjectId(workspaceId),
            isDeleted: false,
        };

        if (filters.cursor) {
            query._id = { $lt: new mongoose.Types.ObjectId(filters.cursor) };
        }

        if (filters.q) {
            const safe = escapeRegex(filters.q);
            query.name = { $regex: new RegExp(safe, 'i') };
        }

        const rows = await ProjectModel.find(query)
            .sort({ _id: -1 })
            .limit(filters.limit + 1);

        const hasNext = rows.length > filters.limit;
        const slice = hasNext ? rows.slice(0, filters.limit) : rows;
        const nextCursor = hasNext ? slice[slice.length - 1]?.id ?? null : null;

        return { items: slice, nextCursor };
    }

    static async getProject(workspaceId: string, projectId: string) {
        const project = await ProjectModel.findOne({
            _id: new mongoose.Types.ObjectId(projectId),
            workspaceId: new mongoose.Types.ObjectId(workspaceId),
            isDeleted: false,
        });

        if (!project) throw new AppError('Project not found', 404);
        return project;
    }

    static async updateProject(
        workspaceId: string,
        projectId: string,
        patch: UpdateProjectInput,
        actor: { userId: string; role: WorkspaceRole },
    ) {
        const project = await ProjectModel.findOne({
            _id: new mongoose.Types.ObjectId(projectId),
            workspaceId: new mongoose.Types.ObjectId(workspaceId),
            isDeleted: false,
        });

        if (!project) throw new AppError('Project not found', 404);

        const isPrivileged = actor.role === 'owner' || actor.role === 'admin';
        const isCreator = project.createdByUserId.toString() === actor.userId;

        if (!isPrivileged && !isCreator) throw new AppError('Forbidden', 403);

        if (patch.name !== undefined) project.name = patch.name;

        await project.save();
        return project;
    }

    static async softDeleteProject(
        workspaceId: string,
        projectId: string,
        actor: { userId: string; role: WorkspaceRole },
    ) {
        const project = await ProjectModel.findOne({
            _id: new mongoose.Types.ObjectId(projectId),
            workspaceId: new mongoose.Types.ObjectId(workspaceId),
            isDeleted: false,
        });

        if (!project) throw new AppError('Project not found', 404);

        const isPrivileged = actor.role === 'owner' || actor.role === 'admin';
        const isCreator = project.createdByUserId.toString() === actor.userId;

        if (!isPrivileged && !isCreator) throw new AppError('Forbidden', 403);

        project.isDeleted = true;
        project.deletedAt = new Date();
        await project.save();
    }
}
