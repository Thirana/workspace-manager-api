# Database Integrity and Consistency

## Transactions for multi-document invariants

What
- Workspace creation runs inside a transaction to create both the workspace and owner membership.

Why
- Ensures data consistency when multiple documents must be created together.
- Prevents orphaned memberships or workspaces on partial failures.
- Makes the create flow safe under concurrent requests.

Where
- Workspace service: `src/services/workspace.service.ts`

## Unique and partial unique indexes

What
- Unique slug for workspaces.
- Unique membership per workspace/user.
- Partial unique index for a single active owner.
- Unique project slug per workspace.

Why
- Enforces data invariants at the database level, not just in code.
- Prevents race conditions that can bypass application checks.
- Partial indexes let you express rules like "only one active owner".

Where
- Workspace model: `src/models/workspace.model.ts`
- Membership model: `src/models/workspaceMembership.model.ts`
- Project model: `src/models/project.model.ts`

## TTL index for refresh tokens

What
- Refresh tokens expire automatically via a TTL index.

Why
- Keeps token storage small without manual cleanup jobs.
- Enforces expiration even if application logic fails.
- Reduces risk of long-lived stale tokens.

Where
- Refresh token model: `src/models/refreshToken.model.ts`

## Deterministic ordering and filtering

What
- Workspace list is sorted and filters out soft-deleted records.
- Member list uses cursor pagination with `_id` ordering for stability.

Why
- Stable ordering helps pagination and reduces surprises in clients.
- Consistent ordering makes testing and UI behavior deterministic.
- Filtering out soft-deleted data prevents accidental exposure.
- Cursor pagination avoids costly `skip` queries on large collections.

Where
- Workspace service: `src/services/workspace.service.ts`
- Member service: `src/services/workspaceMember.service.ts`
- Project service: `src/services/project.service.ts`

## Environment-specific DB behavior

What
- `strictQuery` enabled and `autoIndex` disabled in production.

Why
- `strictQuery` reduces the risk of accidental or unsafe query shapes.
- Disabling autoIndex in production avoids expensive startup index builds.
- Encourages deliberate index management as the dataset grows.

Where
- Server bootstrap: `src/server.ts`
