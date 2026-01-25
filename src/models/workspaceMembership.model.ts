import mongoose from 'mongoose';

import { applyToJSON } from './plugins/toJSON.js';

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

const membershipSchema = new mongoose.Schema(
    {
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true,
            index: true,
        },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

        role: {
            type: String,
            enum: ['owner', 'admin', 'member', 'viewer'],
            required: true,
        },

        status: { type: String, enum: ['active', 'removed'], default: 'active' },
    },
    { timestamps: true },
);

applyToJSON(membershipSchema);

/**
 * Constraint: a user can be a member only once per workspace.
 * Unique compound indexes enforce uniqueness on the combination of fields
 */
membershipSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

/**
 * Performance index: list my workspaces quickly.
 * Typical query: find memberships by userId, then fetch workspaces.
 */
membershipSchema.index({ userId: 1, workspaceId: 1 });

/**
 * Only one ACTIVE owner per workspace.
 * Achieve this using a PARTIAL UNIQUE index:
 * - only applies to docs where role='owner' AND status='active'
 * Partial indexes are created with partialFilterExpression
 */
membershipSchema.index(
    { workspaceId: 1, role: 1 },
    {
        unique: true,
        partialFilterExpression: { role: 'owner', status: 'active' },
    },
);

export const WorkspaceMembershipModel = mongoose.model('WorkspaceMembership', membershipSchema);
