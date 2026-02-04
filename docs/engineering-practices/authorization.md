# Authorization

## Global roles and capability flags

What

- System roles: `system_admin` and `user`.
- Capability flag: `canCreateWorkspaces`.

Why

- Keeps global permissions separate from workspace-level permissions.

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

Where

- Membership check: `src/middlewares/requireWorkspaceMember.ts`
- Route usage: `src/routes/v1/workspace.routes.ts`

## Workspace role checks

What

- Enforce minimum roles per action (owner/admin/member/viewer).

Why

- Allows fine-grained permissions inside a workspace.

Where

- Role middleware: `src/middlewares/requireWorkspaceRole.ts`

## Least-privilege queries

What

- List endpoints only return resources the user is a member of.

Why

- Ensures users only see their own workspaces.

Where

- Service: `src/services/workspace.service.ts`
