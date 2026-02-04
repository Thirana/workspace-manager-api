# Database Integrity and Consistency

## Transactions for multi-document invariants

What
- Workspace creation runs inside a transaction to create both the workspace and owner membership.

Why
- Ensures data consistency when multiple documents must be created together.

Where
- Workspace service: `src/services/workspace.service.ts`

## Unique and partial unique indexes

What
- Unique slug for workspaces.
- Unique membership per workspace/user.
- Partial unique index for a single active owner.

Why
- Enforces data invariants at the database level.

Where
- Workspace model: `src/models/workspace.model.ts`
- Membership model: `src/models/workspaceMembership.model.ts`

## TTL index for refresh tokens

What
- Refresh tokens expire automatically via a TTL index.

Why
- Keeps token storage small and enforces expiry at the DB level.

Where
- Refresh token model: `src/models/refreshToken.model.ts`

## Deterministic ordering and filtering

What
- Workspace list is sorted and filters out soft-deleted records.

Why
- Stable ordering helps pagination and reduces surprises in clients.

Where
- Workspace service: `src/services/workspace.service.ts`

## Environment-specific DB behavior

What
- `strictQuery` enabled and `autoIndex` disabled in production.

Why
- Prevents unsafe queries and avoids heavy index builds on startup.

Where
- Server bootstrap: `src/server.ts`
