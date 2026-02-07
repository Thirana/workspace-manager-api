# Validation and Types

## Type-safe validation (schema + inferred types)

What
- Zod schemas validate runtime inputs and also provide inferred TypeScript types.

Why
- Prevents invalid data from entering the system at the boundary.
- Keeps TypeScript types aligned with runtime validation to avoid drift.
- Makes refactors safer because validation and types evolve together.

Where
- Schemas: `src/schemas/auth.schema.ts`, `src/schemas/workspace.schema.ts`
- Schemas (projects): `src/schemas/project.schema.ts`
- Example types: `RegisterInput`, `LoginInput`, `CreateWorkspaceInput`, `UpdateWorkspaceInput`
  - Projects: `CreateProjectInput`, `UpdateProjectInput`, `ListProjectsQuery`

## Centralized validation for body, params, and query

What
- `validateBody`, `validateParams`, and `validateQuery` apply schemas consistently.

Why
- Removes duplicate validation logic across routes and controllers.
- Keeps handlers focused on business logic instead of input plumbing.
- Creates a single place to update validation behavior.

Where
- Middleware: `src/middlewares/validate.ts`
- Example usage: `src/routes/v1/workspace.routes.ts`
- Project routes: `src/routes/v1/workspace.routes.ts` (projects endpoints)

## Input normalization at the edge

What
- Trim and normalize emails, names, and slugs at the schema layer.

Why
- Avoids inconsistent data storage and comparison bugs.
- Prevents accidental duplicates caused by casing or extra whitespace.
- Makes search and uniqueness checks more reliable.

Where
- Email normalization: `src/schemas/auth.schema.ts`
- Workspace name rules: `src/schemas/workspace.schema.ts`
- Slugify logic: `src/schemas/workspace.schema.ts`

## Defense-in-depth for IDs

What
- Validate `workspaceId` with a Zod regex and re-check with `mongoose.isValidObjectId`.

Why
- Stops invalid IDs early with clear 400 responses.
- Avoids unnecessary database queries and cast errors.
- Adds a second guard in case params validation is bypassed.

Where
- Param schema: `src/schemas/workspace.schema.ts`
- Membership check: `src/middlewares/requireWorkspaceMember.ts`
- Route usage: `src/routes/v1/workspace.routes.ts`
