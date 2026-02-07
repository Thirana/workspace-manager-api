import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

function slugify(input: string) {
    return input
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export const createProjectSchema = z.object({
    name: z.string().trim().min(2).max(80),
});

export const updateProjectSchema = z
    .object({
        name: z.string().trim().min(2).max(80).optional(),
    })
    .refine((obj) => Object.keys(obj).length > 0, {
        message: 'At least one field must be provided',
    });

export const listProjectsQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    cursor: z.string().regex(objectIdRegex, 'Invalid cursor').optional(),
    q: z.string().trim().min(1).optional(),
});

export const workspaceProjectParamSchema = z.object({
    workspaceId: z.string().regex(objectIdRegex, 'Invalid workspace Id'),
    projectId: z.string().regex(objectIdRegex, 'Invalid project Id'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;

export function makeProjectSlug(name: string) {
    return slugify(name);
}
