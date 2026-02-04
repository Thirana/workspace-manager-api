# Architecture Overview

This document provides a high-level overview of the system design, request lifecycle, and key technical decisions.

## High-level structure

Layers
- Routes: define endpoints and middleware chains.
- Controllers: translate HTTP to application actions.
- Services: business logic and data access.
- Models: Mongoose schemas and persistence.

Where
- Routes: `src/routes`
- Controllers: `src/controllers`
- Services: `src/services`
- Models: `src/models`

## Request lifecycle (typical API call)

1) App-level middlewares run (security headers, JSON parsing, cookies, request ID, rate limiting, CORS, logging).
2) Route-level middlewares validate and authorize the request.
3) Controller invokes the service layer.
4) Service reads/writes models.
5) Response is returned; errors flow to `errorHandler`.

Key entry points
- App setup: `src/app.ts`
- Error handler: `src/middlewares/errorHandler.ts`

## Authentication and session model

Access tokens
- Short-lived JWTs with `systemRole`.
- Sent via `Authorization: Bearer <token>` header.

Refresh tokens
- Stored as HttpOnly cookies, hashed in DB.
- Rotated on refresh with reuse detection.

Where
- Auth controller: `src/controllers/auth.controller.ts`
- Auth service: `src/services/auth.service.ts`
- Token utilities: `src/services/token.service.ts`
- Refresh token model: `src/models/refreshToken.model.ts`

## Authorization model

System-level
- `system_admin` and `user` roles.
- `canCreateWorkspaces` capability.

Workspace-level
- Roles: `owner`, `admin`, `member`, `viewer` stored in `workspaceMembership`.
- Membership is required before accessing a workspace.

Where
- Middleware: `src/middlewares/requireSystemRole.ts`, `src/middlewares/requireWorkspaceRole.ts`, `src/middlewares/requireWorkspaceMember.ts`
- Membership model: `src/models/workspaceMembership.model.ts`

## Data model summary

User
- Email + password (hashed) + system role + capability flag.

Workspace
- Name + slug + creator + soft delete fields.

WorkspaceMembership
- Workspace/user links with role and status.

RefreshToken
- Hashed refresh token with rotation metadata and TTL index.

Where
- Models: `src/models/*.ts`

## Observability and security

Logging
- Structured JSON logs via Winston.
- `requestId` attached to request and logs for traceability.

Security
- Helmet for basic security headers.
- CORS restricted to configured origin.
- Rate limiting to reduce abuse.

Where
- Logger: `src/config/logger.ts`
- Request ID: `src/middlewares/requestId.ts`
- Rate limit: `src/middlewares/rateLimit.ts`
- App config: `src/app.ts`

## Tradeoffs and limitations

- Rate limiter is in-memory and not distributed, so it resets on restart and does not share state across instances.
- No pagination on list endpoints yet.
- No background jobs or queues for long-running work.
- No metrics exporter (only logs).
- Success response envelopes are not fully standardized across all endpoints.

## Testing strategy (recommended)

- Unit tests for services (auth, workspace).
- Integration tests for routes with a test database.
- Contract tests for core endpoints and auth flows.

Suggested focus areas
- Auth: login, refresh rotation, reuse detection.
- Workspaces: creation, membership enforcement, role checks.
- Validation: invalid payloads and invalid ObjectId params.
