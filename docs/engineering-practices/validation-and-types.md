# Validation and Types

## Type-safe validation (schema + inferred types)

What
- Zod schemas validate runtime inputs and also provide inferred TypeScript types.

Why
- Prevents invalid data from entering the system and keeps types in sync with validation rules.

Where
- Schemas: `src/schemas/auth.schema.ts`, `src/schemas/workspace.schema.ts`
- Example types: `RegisterInput`, `LoginInput`, `CreateWorkspaceInput`, `UpdateWorkspaceInput`

## Centralized validation for body, params, and query

What
- `validateBody`, `validateParams`, and `validateQuery` apply schemas consistently.

Why
- Removes duplicate validation logic and keeps routes simple.

Where
- Middleware: `src/middlewares/validate.ts`
- Example usage: `src/routes/v1/workspace.routes.ts`

## Input normalization at the edge

What
- Trim and normalize emails, names, and slugs at the schema layer.

Why
- Avoids inconsistent data storage and comparison bugs.

Where
- Email normalization: `src/schemas/auth.schema.ts`
- Workspace name rules: `src/schemas/workspace.schema.ts`
- Slugify logic: `src/schemas/workspace.schema.ts`

## Defense-in-depth for IDs

What
- Validate `workspaceId` with a Zod regex and re-check with `mongoose.isValidObjectId`.

Why
- Stops invalid IDs early and keeps membership checks safe.

Where
- Param schema: `src/schemas/workspace.schema.ts`
- Membership check: `src/middlewares/requireWorkspaceMember.ts`
- Route usage: `src/routes/v1/workspace.routes.ts`
