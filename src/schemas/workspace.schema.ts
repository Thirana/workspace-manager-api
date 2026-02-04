import { z } from 'zod';

function slugify(input: string) {
    return input
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')   // non-alphanumeric-> "-"
        .replace(/(^-|-$)/g, '');     // trim dashes
}

export const createWorkspaceSchema = z.object({
    name: z.string().trim().min(2).max(80),
});

export const updateWorkspaceSchema = z
    .object({
        name: z.string().trim().min(2).max(80).optional(),
    })
    .refine((obj) => Object.keys(obj).length > 0, {
        message: 'At least one field must be provided',
    });

export const workspaceIdParamSchema = z.object({
    workspaceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid workspace Id'),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;

export function makeWorkspaceSlug(name: string) {
    return slugify(name);
}
