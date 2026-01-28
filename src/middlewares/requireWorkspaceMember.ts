import type { RequestHandler } from 'express';
import mongoose from 'mongoose';

import { WorkspaceMembershipModel } from '../models/workspaceMembership.model.js';
import { AppError } from '../utils/AppError.js';
import { getAuth } from '../utils/getAuth.js';

/*
check if the authenticated user has an active membership in that workspace
*/
export const requireWorkspaceMember =
    (paramName: string = 'workspaceId'): RequestHandler =>
        async (req, _res, next) => {

            // get the userId from the request
            const { userId } = getAuth(req);

            // get and validate the param
            const rawIdParam = req.params[paramName];
            const rawId = Array.isArray(rawIdParam) ? rawIdParam[0] : rawIdParam;

            if (!rawId || !mongoose.isValidObjectId(rawId)) {
                throw new AppError('Invalid workspace Id', 400);
            }

            // check if there is active workspaceMembership exists for user
            const membership = await WorkspaceMembershipModel.findOne({
                workspaceId: new mongoose.Types.ObjectId(rawId),
                userId: new mongoose.Types.ObjectId(userId),
                status: 'active',
            }).select('role workspaceId userId');

            // Deny-by-default: do not reveal whether workspace exists
            if (!membership) throw new AppError('Workspace not found', 404);

            // Attach for downstream middleware/controller to reuse (avoid re-query)
            req.workspaceAuth = {
                workspaceId: rawId,
                role: membership.role,
            };

            next();
        };
