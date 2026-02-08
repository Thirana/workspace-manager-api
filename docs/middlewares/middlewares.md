# Middlewares

This project uses Express middlewares for authentication, authorization, validation, and error handling. Each item below can be expanded to see details.

## App Level Middleware Stack

These middlewares are applied globally to all routes:

- `helmet()` security headers
- `express.json({ limit: '1mb' })` JSON parsing
- `cookieParser()` cookie parsing
- `requestId` assigns or propagates `x-request-id`
- `rateLimit()` basic in-memory rate limiting
- `cors({ origin: env.CORS_ORIGIN, credentials: true })`
- request logger (`logger.info`)

## Request Context

<details>
<summary>requestId</summary>

File: `src/middlewares/requestId.ts`

Purpose
- Assigns or propagates a request ID for traceable logs.
- Sets the `x-request-id` response header.

Input
- Header (optional): `x-request-id`

Output (request mutation)
- `req.requestId = string`

Typical usage
```ts
app.use(requestId);
```
</details>

<details>
<summary>rateLimit</summary>

File: `src/middlewares/rateLimit.ts`

Purpose
- Basic in-memory rate limiting per IP.

Behavior
- Uses a fixed window (`RATE_LIMIT_WINDOW_MS`) and limit (`RATE_LIMIT_MAX`).
- Adds `X-RateLimit-*` headers to responses.

Errors
- 429 `Too many requests` when the limit is exceeded.

Notes
- In-memory only (resets on restart, not shared across instances).

Typical usage
```ts
app.use(rateLimit());
```
</details>

## Authentication

<details>
<summary>requireAuth</summary>

File: `src/middlewares/requireAuth.ts`

Purpose
- Enforces Bearer access token authentication.
- Attaches `req.auth` on success.

Input
- Header: `Authorization: Bearer <accessToken>`

Output (request mutation)
- `req.auth = { userId: string, systemRole: 'system_admin' | 'user' }`

Errors
- 401 `Unauthenticated` if header is missing, malformed, or token invalid.

Typical usage
```ts
router.get('/me', requireAuth, asyncHandler(me));
```
</details>

<details>
<summary>requireSystemRole</summary>

File: `src/middlewares/requireSystemRole.ts`

Purpose
- Enforces system-wide role checks (global roles only).

Input
- Requires `req.auth` set by `requireAuth`.

Behavior
- Allows only if `req.auth.systemRole` is in the allowed list.

Errors
- 401 `Unauthenticated` if `req.auth` is missing.
- 403 `Forbidden` if role is not allowed.

Typical usage
```ts
router.get('/admin', requireAuth, requireSystemRole('system_admin'), handler);
```
</details>

## Workspace Authorization

<details>
<summary>requireWorkspaceCreator</summary>

File: `src/middlewares/requireWorkspaceCreator.ts`

Purpose
- Allows workspace creation only if user is a system admin or has the `canCreateWorkspaces` capability.

Input
- Requires `req.auth` set by `requireAuth`.

Behavior
- System admins are always allowed.
- Otherwise loads user and checks `canCreateWorkspaces`.

Errors
- 401 `Unauthenticated` if user not found.
- 403 `Forbidden` if capability is missing.

Typical usage
```ts
router.post('/', requireAuth, requireWorkspaceCreator, validateBody(schema), handler);
```
</details>

<details>
<summary>requireWorkspaceMember</summary>

File: `src/middlewares/requireWorkspaceMember.ts`

Purpose
- Ensures the authenticated user has active membership in a workspace.
- Deny-by-default: does not reveal whether a workspace exists if membership is missing.

Input
- Requires `req.auth` set by `requireAuth`.
- Uses a route param (default `workspaceId`) to locate membership.

Output (request mutation)
- `req.workspaceAuth = { workspaceId: string, role: 'owner' | 'admin' | 'member' | 'viewer' }`

Errors
- 400 `Invalid workspace Id` if param is not a valid Mongo ObjectId.
- 404 `Workspace not found` if no active membership.

Typical usage
```ts
router.get('/:workspaceId', requireAuth, requireWorkspaceMember('workspaceId'), handler);
```
</details>

<details>
<summary>requireWorkspaceRole</summary>

File: `src/middlewares/requireWorkspaceRole.ts`

Purpose
- Enforces minimum workspace role for a member.

Input
- Requires `req.workspaceAuth` set by `requireWorkspaceMember`.

Behavior
- Allows only if `req.workspaceAuth.role` is in the allowed list.

Errors
- 401 `Unauthenticated` if `req.workspaceAuth` is missing.
- 403 `Forbidden` if role is not allowed.

Typical usage
```ts
router.patch(
  '/:workspaceId',
  requireAuth,
  requireWorkspaceMember('workspaceId'),
  requireWorkspaceRole('owner', 'admin'),
  validateBody(schema),
  handler,
);
```
</details>

## Validation

<details>
<summary>validateBody / validateQuery / validateParams</summary>

File: `src/middlewares/validate.ts`

Purpose
- Validates request body, query, or params using Zod schemas.

Behavior
- Parses the input and assigns the parsed value back to `req.body`, `req.query`, or `req.params`.

Errors
- 400 `Validation failed` (Zod error) with details in response.

Typical usage
```ts
router.post('/register', validateBody(registerSchema), asyncHandler(register));
```
</details>

## Error Handling

<details>
<summary>errorHandler</summary>

File: `src/middlewares/errorHandler.ts`

Purpose
- Centralized error handler.

Behavior
- Zod errors -> 400 with `code: VALIDATION_ERROR` and `details`.
- AppError -> uses `statusCode` with `code: APP_ERROR`.
- Unknown errors -> 500 with `code: INTERNAL_SERVER_ERROR`.

Example response
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "fieldErrors": {
        "email": ["Invalid email"]
      }
    }
  }
}
```
</details>

## Utility

<details>
<summary>asyncHandler</summary>

File: `src/utils/asyncHandler.ts`

Purpose
- Wraps async route handlers and forwards rejections to `next()` so `errorHandler` can process them.

Typical usage
```ts
router.get('/me', requireAuth, asyncHandler(me));
```
</details>
