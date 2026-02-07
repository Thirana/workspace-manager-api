import mongoose from 'mongoose';

import { applyToJSON } from './plugins/toJSON.js';

const projectSchema = new mongoose.Schema(
    {
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true,
            index: true,
        },
        name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },

        // Used in URLs. Normalize early (lowercase + trim).
        slug: { type: String, required: true, trim: true, lowercase: true },

        createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true },
);

applyToJSON(projectSchema);

// Unique project slug per workspace.
projectSchema.index({ workspaceId: 1, slug: 1 }, { unique: true });

// Support stable pagination by workspace.
projectSchema.index({ workspaceId: 1, _id: -1 });

export const ProjectModel = mongoose.model('Project', projectSchema);
