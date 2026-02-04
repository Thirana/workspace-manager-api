# API Docs

Base path for versioned routes: `/api/v1`

Auth
- Access token: send `Authorization: Bearer <accessToken>`.
- Refresh token: stored in an HttpOnly cookie named `refreshToken`.

Global middlewares (applied to all routes)
- `helmet()` security headers
- `express.json({ limit: '1mb' })` JSON parsing
- `cookieParser()` cookie parsing
- `requestId` assigns/propagates `x-request-id`
- `rateLimit()` basic in-memory rate limiting
- `cors({ origin: env.CORS_ORIGIN, credentials: true })`
- request logger (`logger.info`)

Sections
- Auth API: `docs/api/auth.md`
- Workspace API: `docs/api/workspaces.md`
- Engineering practices: `docs/engineering-practices/README.md`
- Architecture: `docs/architecture.md`
- Middlewares: `docs/middlewares/middlewares.md`

## Utility

### Health Check
`GET /health`

Middleware chain
- (route handler only; app-level middlewares still apply)

Success response (200)
```json
{ "status": "ok" }
```

### Debug Echo
`POST /debug/echo`

Validates and echoes request payload (dev utility).

Middleware chain
- `validateBody(echoSchema)`
- route handler

Validation rules
- `name`: required, non-empty string.
- `age`: required, positive integer.

Request body
```json
{
  "name": "Alice",
  "age": 30
}
```

Success response (200)
```json
{
  "message": "validated",
  "data": {
    "name": "Alice",
    "age": 30
  }
}
```
