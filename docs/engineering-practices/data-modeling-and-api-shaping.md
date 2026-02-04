# Data Modeling and API Shaping

## API-ready JSON serialization

What

- `applyToJSON` removes internal fields and normalizes `id`.

Why

- Keeps API responses clean and prevents leaking internal Mongo fields.

Where

- Plugin: `src/models/plugins/toJSON.ts`
- Applied in: `src/models/user.model.ts`, `src/models/workspace.model.ts`, `src/models/workspaceMembership.model.ts`

## Sensitive field protection

What

- Passwords are `select: false` and removed during JSON serialization.

Why

- Prevents accidental exposure of sensitive data.

Where

- User model: `src/models/user.model.ts`
- JSON plugin: `src/models/plugins/toJSON.ts`

## Model-level password comparison

What

- Password comparison is a model instance method not a service level logic.

Why

- Encapsulates security logic at the data layer.

Where

- User model: `src/models/user.model.ts`

## Normalized fields

What

- Email lowercasing and trimming.
- Slug normalization (lowercase, trimmed) for workspaces.

Why

- Prevents duplicates caused by inconsistent casing or spacing.

Where

- User schema: `src/models/user.model.ts`
- Workspace schema: `src/models/workspace.model.ts`
- Slugify: `src/schemas/workspace.schema.ts`

## Soft delete fields

What

- Workspaces use `isDeleted` and `deletedAt` rather than hard deletes.

Why

- Enables recovery and preserves references.

Where

- Workspace model: `src/models/workspace.model.ts`
- Workspace service: `src/services/workspace.service.ts`
