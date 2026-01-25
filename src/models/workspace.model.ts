import mongoose from 'mongoose';

import { applyToJSON } from './plugins/toJSON.js';

const workspaceSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },

        // Used in URLs. Normalize early (lowercase + trim).
        slug: { type: String, required: true, trim: true, lowercase: true },

        createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true },
);

applyToJSON(workspaceSchema);

/**
 * Constraint: slugs are globally unique.
 * This keeps URLs simple: /workspaces/:slug never ambiguous.
 *
 * MongoDB unique indexes enforce uniqueness of indexed fields. :contentReference[oaicite:5]{index=5}
 */
workspaceSchema.index({ slug: 1 }, { unique: true });

export const WorkspaceModel = mongoose.model('Workspace', workspaceSchema);
