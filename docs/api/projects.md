# Project API

Base path for versioned routes: `/api/v1`

All project routes require `Authorization: Bearer <accessToken>` and workspace membership.

## Endpoint summary

| Method | Path | Description |
| --- | --- | --- |
| POST | /api/v1/workspaces/:workspaceId/projects | Create project |
| GET | /api/v1/workspaces/:workspaceId/projects | List projects |
| GET | /api/v1/workspaces/:workspaceId/projects/:projectId | Get project |
| PATCH | /api/v1/workspaces/:workspaceId/projects/:projectId | Update project |
| DELETE | /api/v1/workspaces/:workspaceId/projects/:projectId | Delete project |

## Create Project
`POST /api/v1/workspaces/:workspaceId/projects`

Create a project in a workspace. Requires membership with role `owner`, `admin`, or `member`.

Middleware chain
- `requireAuth`
- `validateParams(workspaceIdParamSchema)`
- `requireWorkspaceMember('workspaceId')`
- `requireWorkspaceRole('owner', 'admin', 'member')`
- `validateBody(createProjectSchema)`
- `asyncHandler(createProject)`

Request body
```json
{ "name": "Sprint Alpha" }
```

Success response (201)
```json
{
  "message": "Project created",
  "project": {
    "id": "<projectId>",
    "workspaceId": "<workspaceId>",
    "name": "Sprint Alpha",
    "slug": "sprint-alpha",
    "createdByUserId": "<userId>",
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-02-04T00:00:00.000Z",
    "updatedAt": "2026-02-04T00:00:00.000Z"
  }
}
```

## List Projects
`GET /api/v1/workspaces/:workspaceId/projects`

Middleware chain
- `requireAuth`
- `validateParams(workspaceIdParamSchema)`
- `requireWorkspaceMember('workspaceId')`
- `validateQuery(listProjectsQuerySchema)`
- `asyncHandler(listProjects)`

Query params (optional)
- `limit`: number of results to return (default 20, max 100)
- `cursor`: pagination cursor (use `nextCursor` from a previous response)
- `q`: search by project name (case-insensitive)

Example request
```
GET /api/v1/workspaces/64f1b2c3d4e5f60718293a4b/projects?limit=20&q=sprint
```

Success response (200)
```json
{
  "items": [
    {
      "id": "<projectId>",
      "workspaceId": "<workspaceId>",
      "name": "Sprint Alpha",
      "slug": "sprint-alpha"
    }
  ],
  "nextCursor": "<cursor>"
}
```

## Get Project
`GET /api/v1/workspaces/:workspaceId/projects/:projectId`

Middleware chain
- `requireAuth`
- `validateParams(workspaceProjectParamSchema)`
- `requireWorkspaceMember('workspaceId')`
- `asyncHandler(getProject)`

Path params
- `workspaceId`: Mongo ObjectId string
- `projectId`: Mongo ObjectId string

Success response (200)
```json
{
  "project": {
    "id": "<projectId>",
    "workspaceId": "<workspaceId>",
    "name": "Sprint Alpha",
    "slug": "sprint-alpha",
    "createdByUserId": "<userId>",
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-02-04T00:00:00.000Z",
    "updatedAt": "2026-02-04T00:00:00.000Z"
  }
}
```

## Update Project
`PATCH /api/v1/workspaces/:workspaceId/projects/:projectId`

Allowed for workspace `owner`/`admin` or the original creator.

Middleware chain
- `requireAuth`
- `validateParams(workspaceProjectParamSchema)`
- `requireWorkspaceMember('workspaceId')`
- `validateBody(updateProjectSchema)`
- `asyncHandler(updateProject)`

Request body
```json
{ "name": "Sprint Alpha Updated" }
```

Success response (200)
```json
{
  "message": "Project updated",
  "project": {
    "id": "<projectId>",
    "workspaceId": "<workspaceId>",
    "name": "Sprint Alpha Updated",
    "slug": "sprint-alpha",
    "createdByUserId": "<userId>",
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-02-04T00:00:00.000Z",
    "updatedAt": "2026-02-04T01:00:00.000Z"
  }
}
```

## Delete Project (Soft Delete)
`DELETE /api/v1/workspaces/:workspaceId/projects/:projectId`

Allowed for workspace `owner`/`admin` or the original creator.

Middleware chain
- `requireAuth`
- `validateParams(workspaceProjectParamSchema)`
- `requireWorkspaceMember('workspaceId')`
- `asyncHandler(deleteProject)`

Success response (204)
No content.
