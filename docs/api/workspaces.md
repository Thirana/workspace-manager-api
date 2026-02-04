# Workspace API

Base path for versioned routes: `/api/v1`

All workspace routes require `Authorization: Bearer <accessToken>`.

## Endpoint summary

| Method | Path | Description |
| --- | --- | --- |
| POST | /api/v1/workspaces | Create a workspace |
| GET | /api/v1/workspaces | List my workspaces |
| GET | /api/v1/workspaces/:workspaceId | Get workspace by ID |
| PATCH | /api/v1/workspaces/:workspaceId | Update workspace |
| DELETE | /api/v1/workspaces/:workspaceId | Soft-delete workspace |

## Create Workspace
`POST /api/v1/workspaces`

Create a workspace. Requires `system_admin` or `canCreateWorkspaces = true`.

Middleware chain
- `requireAuth`
- `requireWorkspaceCreator`
- `validateBody(createWorkspaceSchema)`
- `asyncHandler(createWorkspace)`

Validation rules
- `name`: required, 2-80 characters (trimmed).

Request body
```json
{
  "name": "Acme Team"
}
```

Success response (201)
```json
{
  "message": "Workspace created",
  "workspace": {
    "id": "<workspaceId>",
    "name": "Acme Team",
    "slug": "acme-team",
    "createdByUserId": "<userId>",
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-25T08:54:00.000Z",
    "updatedAt": "2026-01-25T08:54:00.000Z"
  }
}
```

## List My Workspaces
`GET /api/v1/workspaces`

List workspaces where the user has active membership.

Middleware chain
- `requireAuth`
- `asyncHandler(listWorkspaces)`

Success response (200)
```json
{
  "workspaces": [
    {
      "id": "<workspaceId>",
      "name": "Acme Team",
      "slug": "acme-team",
      "createdByUserId": "<userId>",
      "isDeleted": false,
      "deletedAt": null,
      "createdAt": "2026-01-25T08:54:00.000Z",
      "updatedAt": "2026-01-25T08:54:00.000Z"
    }
  ]
}
```

## Get Workspace
`GET /api/v1/workspaces/:workspaceId`

Get a workspace by ID. Requires active membership in the workspace.

Middleware chain
- `requireAuth`
- `validateParams(workspaceIdParamSchema)`
- `requireWorkspaceMember('workspaceId')`
- `asyncHandler(getWorkspace)`

Path params
- `workspaceId`: Mongo ObjectId string

Validation rules
- `workspaceId`: must be a valid Mongo ObjectId.

Success response (200)
```json
{
  "workspace": {
    "id": "<workspaceId>",
    "name": "Acme Team",
    "slug": "acme-team",
    "createdByUserId": "<userId>",
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-25T08:54:00.000Z",
    "updatedAt": "2026-01-25T08:54:00.000Z"
  }
}
```

## Update Workspace
`PATCH /api/v1/workspaces/:workspaceId`

Update workspace fields. Requires membership + role `owner` or `admin`.

Middleware chain
- `requireAuth`
- `validateParams(workspaceIdParamSchema)`
- `requireWorkspaceMember('workspaceId')`
- `requireWorkspaceRole('owner', 'admin')`
- `validateBody(updateWorkspaceSchema)`
- `asyncHandler(updateWorkspace)`

Path params
- `workspaceId`: Mongo ObjectId string

Validation rules
- `workspaceId`: must be a valid Mongo ObjectId.
- Body must include at least one field.
- `name`: optional, 2-80 characters (trimmed).

Request body
```json
{
  "name": "Acme Team Updated"
}
```

Success response (200)
```json
{
  "message": "Workspace updated",
  "workspace": {
    "id": "<workspaceId>",
    "name": "Acme Team Updated",
    "slug": "acme-team",
    "createdByUserId": "<userId>",
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-01-25T08:54:00.000Z",
    "updatedAt": "2026-01-25T09:10:00.000Z"
  }
}
```

## Delete Workspace (Soft Delete)
`DELETE /api/v1/workspaces/:workspaceId`

Soft-delete a workspace. Requires membership + role `owner`.

Middleware chain
- `requireAuth`
- `validateParams(workspaceIdParamSchema)`
- `requireWorkspaceMember('workspaceId')`
- `requireWorkspaceRole('owner')`
- `asyncHandler(deleteWorkspace)`

Path params
- `workspaceId`: Mongo ObjectId string

Validation rules
- `workspaceId`: must be a valid Mongo ObjectId.

Success response (204)
No content.
