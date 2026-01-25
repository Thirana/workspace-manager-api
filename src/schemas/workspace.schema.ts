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

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export function makeWorkspaceSlug(name: string) {
    return slugify(name);
}
