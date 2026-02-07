# Authorization

## Global roles and capability flags

What

- System roles: `system_admin` and `user`.
- Capability flag: `canCreateWorkspaces`.

Why

- Keeps global permissions separate from workspace-level permissions.
- Capability flags allow granular control without promoting a user to admin.
- Makes the auth model easier to evolve as new features appear.

Where

- Role middleware: `src/middlewares/requireSystemRole.ts`
- Capability middleware: `src/middlewares/requireWorkspaceCreator.ts`
- User model: `src/models/user.model.ts`

## Workspace membership enforcement (deny by default)

What

- Access to a workspace requires active membership.
- If not a member of the workspace, the API returns 404 (does not reveal existence).

Why

- Prevents resource enumeration and keeps data access strict.
- Avoids leaking whether a workspace exists to non-members.
- Enforces a clear security boundary before any data access.

Where

- Membership check: `src/middlewares/requireWorkspaceMember.ts`
- Route usage: `src/routes/v1/workspace.routes.ts`
- Project routes: `src/routes/v1/workspace.routes.ts` (projects endpoints)

## Workspace role checks

What

- Enforce minimum roles per action (owner/admin/member/viewer).
- Admins can manage roles, but owner role is protected from changes or removal.

Why

- Allows fine-grained permissions inside a workspace.
- Centralizes role checks to avoid missed authorization in handlers.
- Makes permission changes explicit and auditable.
- Prevents privilege escalation by ensuring only owners control ownership.

Where

- Role middleware: `src/middlewares/requireWorkspaceRole.ts`
- Member service checks: `src/services/workspaceMember.service.ts`
- Project service checks (owner/admin or creator): `src/services/project.service.ts`

## Least-privilege queries

What

- List endpoints only return resources the user is a member of.

Why

- Ensures users only see their own workspaces.
- Reduces the chance of accidental data leakage in list endpoints.
- Aligns queries with the principle of least privilege.

Where

- Service: `src/services/workspace.service.ts`
- Project service (workspace scoping): `src/services/project.service.ts`

## Membership lifecycle rules

What

- Members can be reactivated if previously removed.
- Removal is a soft state transition, not a hard delete.

Why

- Preserves history while allowing safe re-joins.
- Avoids duplicate membership records for the same user and workspace.
- Keeps permission changes explicit and traceable.

Where

- Membership model: `src/models/workspaceMembership.model.ts`
- Member service: `src/services/workspaceMember.service.ts`
