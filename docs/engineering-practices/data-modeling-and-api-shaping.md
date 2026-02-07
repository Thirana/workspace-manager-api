# Data Modeling and API Shaping

## API-ready JSON serialization

What

- `applyToJSON` removes internal fields and normalizes `id`.

Why

- Keeps API responses clean and consistent for clients.
- Prevents leaking internal Mongo fields like `_id` and `__v`.
- Reduces response formatting work in controllers.

Where

- Plugin: `src/models/plugins/toJSON.ts`
- Applied in: `src/models/user.model.ts`, `src/models/workspace.model.ts`, `src/models/workspaceMembership.model.ts`

## Sensitive field protection

What

- Passwords are `select: false` and removed during JSON serialization.

Why

- `select: false` avoids fetching passwords by default.
- JSON sanitization provides a second layer of protection.
- Reduces the chance of accidental leaks in new endpoints.

Where

- User model: `src/models/user.model.ts`
- JSON plugin: `src/models/plugins/toJSON.ts`

## Model-level password comparison

What

- Password comparison is a model instance method not a service level logic.

Why

- Encapsulates hashing behavior close to the data model.
- Avoids duplicated comparison logic across services.
- Makes future hash upgrades easier to implement in one place.

Where

- User model: `src/models/user.model.ts`

## Normalized fields

What

- Email lowercasing and trimming.
- Slug normalization (lowercase, trimmed) for workspaces.

Why

- Prevents duplicates caused by inconsistent casing or spacing.
- Makes indexing and lookup behavior predictable.
- Simplifies comparisons across the system.

Where

- User schema: `src/models/user.model.ts`
- Workspace schema: `src/models/workspace.model.ts`
- Slugify: `src/schemas/workspace.schema.ts`

## Soft delete fields

What

- Workspaces use `isDeleted` and `deletedAt` rather than hard deletes.
- Memberships use `status`, `removedAt`, and `removedBy` for soft removal.

Why

- Enables recovery and audit trails without restoring from backups.
- Preserves references that might still exist in related data.
- Lets the app hide deleted records without destructive operations.
- Keeps membership history intact for compliance or audit needs.

Where

- Workspace model: `src/models/workspace.model.ts`
- Workspace service: `src/services/workspace.service.ts`
- Membership model: `src/models/workspaceMembership.model.ts`
