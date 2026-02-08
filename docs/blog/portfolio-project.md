# Workspace Task Manager API (Self Learning Project)

This is a self learning project built to practice and implement real world, industry standard backend practices beyond basic CRUD, and to mimic the real world backend standards I learned during my work experience.

## Project overview

This backend is a workspace based project management system. It is designed for collaborative teams: users authenticate, create workspaces, manage members, and organize projects inside each workspace. I built it to focus on clean architecture, secure authentication, and consistent data access patterns while keeping the API easy to use.

## Tech stack

- **Runtime/Framework:** Node.js, Express v5
- **Language:** TypeScript
- **Database:** MongoDB + Mongoose
- **Validation:** Zod
- **Auth:** JWT access + refresh tokens
- **Logging:** Winston

## Core user features

- **Authentication:** register/login/logout, refresh token rotation, “me” endpoint
- **Workspaces:** create, list, get, update, soft delete
- **Members:** add, list, update role, remove (with role safety)
- **Projects:** create, list, get, update, soft delete

## Engineering practices and concepts

I intentionally prioritized structure and correctness over “just making it work.” These are the practices I focused on:

### Validation and type safety

- Centralized validation for body/query/params, for blocking incorrect data before it reaches the controller layer.
- Schema driven types, for avoiding type mismatches during refactors.

### Authentication and session design

- Short lived access tokens and refresh rotation with reuse detection, for reducing damage if a token leaks.
- Refresh tokens stored hashed with TTL cleanup, for DB safety and automatic expiry.
- HttpOnly refresh token cookies, for reduced XSS exposure in browsers.

### Authorization model

- Global system roles vs workspace roles, for clear separation of platform access from workspace access.
- Membership checks first, for blocking non members before accessing any workspace data.
- Role checks for sensitive actions, for ensuring only owners or admins can make critical changes.

### Data consistency and integrity

- Transactions for multi document invariants, for keeping related records in sync if something fails.
- Unique and partial indexes for ownership and slug constraints, for enforcing rules even under race conditions.
- Cursor based pagination, for stable paging without slow skip queries.

### API ready data shaping

- Consistent JSON output via `applyToJSON`, for hiding internal fields and giving consistent ids.
- Soft deletes for workspaces/projects/members, for recovery and history without hard deletes.

### Observability and safety

- Request IDs, for tracing a single request across logs.
- Structured logging and centralized error handling, for faster debugging with consistent error output.
- CORS and security headers and rate limiting, for safer defaults out of the box.
- Config validation at startup, for identify incorrect env configurations early.
- Graceful shutdown, for finishing in flight work before exit.

### Middleware design

- Higher order middlewares (auth/role/validation), for declarative and reusable routes.
- Request context enrichment (`req.auth`, `req.workspaceAuth`, `req.requestId`), for sharing auth and workspace info across middlewares and avoiding repeated DB queries or re processing the same logic.

## Why this matters

Most CRUD apps work in the happy path but fall apart under real constraints like permissions, validation, token handling, logging, and schema drift. This project was built to internalize those concerns and apply them in a focused, production style architecture.

If you want to explore the implementation details, the repository includes structured documentation for APIs, middleware, and engineering practices.
