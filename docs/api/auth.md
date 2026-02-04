# Auth API

Base path for versioned routes: `/api/v1`

Auth
- Access token: send `Authorization: Bearer <accessToken>`.
- Refresh token: stored in an HttpOnly cookie named `refreshToken`.

## Endpoint summary

| Method | Path | Description |
| --- | --- | --- |
| POST | /api/v1/auth/register | Create a new user account |
| POST | /api/v1/auth/login | Authenticate and receive access token |
| POST | /api/v1/auth/refresh | Rotate refresh token and return access token |
| POST | /api/v1/auth/logout | Revoke refresh token and clear cookie |
| GET | /api/v1/auth/me | Get current user profile |

## Register
`POST /api/v1/auth/register`

Create a new user account.

Middleware chain
- `validateBody(registerSchema)`
- `asyncHandler(register)`

Validation rules
- `email`: required, valid email format, trimmed + lowercased.
- `password`: required, 8-72 characters.
- `firstName`: optional, 1-50 characters (trimmed).
- `lastName`: optional, 1-50 characters (trimmed).

Request body
```json
{
  "email": "user@example.com",
  "password": "strongpassword",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

Success response (201)
```json
{
  "message": "Registered successfully",
  "user": {
    "id": "<userId>",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "systemRole": "user",
    "canCreateWorkspaces": false,
    "createdAt": "2026-01-25T08:54:00.000Z",
    "updatedAt": "2026-01-25T08:54:00.000Z"
  }
}
```

## Login
`POST /api/v1/auth/login`

Authenticate and receive an access token. Sets `refreshToken` cookie.

Middleware chain
- `validateBody(loginSchema)`
- `asyncHandler(login)`

Validation rules
- `email`: required, valid email format, trimmed + lowercased.
- `password`: required, 1-72 characters.

Request body
```json
{
  "email": "user@example.com",
  "password": "strongpassword"
}
```

Success response (200)
```json
{
  "message": "Logged in",
  "accessToken": "<jwt>",
  "user": {
    "id": "<userId>",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "systemRole": "user",
    "canCreateWorkspaces": false,
    "createdAt": "2026-01-25T08:54:00.000Z",
    "updatedAt": "2026-01-25T08:54:00.000Z"
  }
}
```

## Refresh Access Token
`POST /api/v1/auth/refresh`

Rotate refresh token and return a new access token. Uses `refreshToken` cookie.

Middleware chain
- `asyncHandler(refresh)`

Request body
None.

Success response (200)
```json
{
  "message": "Refreshed",
  "accessToken": "<jwt>"
}
```

## Logout
`POST /api/v1/auth/logout`

Revoke refresh token (if present) and clear cookie.

Middleware chain
- `asyncHandler(logout)`

Request body
None.

Success response (200)
```json
{
  "message": "Logged out"
}
```

## Get Current User
`GET /api/v1/auth/me`

Get the current user profile. Requires access token.

Middleware chain
- `requireAuth`
- `asyncHandler(me)`

Request headers
`Authorization: Bearer <accessToken>`

Success response (200)
```json
{
  "user": {
    "id": "<userId>",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "systemRole": "user",
    "canCreateWorkspaces": false,
    "createdAt": "2026-01-25T08:54:00.000Z",
    "updatedAt": "2026-01-25T08:54:00.000Z"
  }
}
```
