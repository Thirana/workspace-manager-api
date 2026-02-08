# Workspace Task Manager API

This is a self learning project built to practice and implement real world, industry standard backend practices beyond basic CRUD, and to mimic the real world backend standards I learned during my work experience. The goal was to design a system that feels production ready in structure, not just functional.

## Project overview

This backend is a workspace based task management system. It is designed for collaborative teams: users authenticate, create workspaces, manage members, and organize projects inside each workspace. I built it to focus on clean architecture, secure authentication, and consistent data access patterns while keeping the API easy to use.

## Tech stack

- **Runtime/Framework:** Node.js, Express v5
- **Language:** TypeScript
- **Database:** MongoDB + Mongoose
- **Validation:** Zod
- **Auth:** JWT access + refresh tokens
- **Logging:** Winston

## Core user features

- **Authentication:** register/login/logout, refresh token rotation, "me" endpoint
- **Workspaces:** create, list, get, update, soft delete
- **Members:** add, list, update role, remove (with role safety)
- **Projects:** create, list, get, update, soft delete

## Engineering practices and concepts

A selection of the practices implemented in this project:

### Validation and type safety

- Centralized validation for body/query/params, for blocking incorrect data before it reaches the controller layer.
- Schema driven types, for avoiding type mismatches during refactors.

### Authentication and session design

- Short lived access tokens and refresh rotation with reuse detection, for reducing damage if a token leaks.
- Refresh tokens stored hashed with TTL cleanup, for keeping stolen database data useless and expiring automatically.
- HttpOnly refresh token cookies, for keeping tokens out of browser scripts.

### Authorization model

- Global system roles vs workspace roles, for clear separation of platform access from workspace access.
- Membership checks first, for blocking non members before any workspace data is touched.
- Role checks for sensitive actions, for ensuring only owners or admins can make risky changes.

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
- Config validation at startup, for catching bad env settings early.
- Graceful shutdown, for finishing in flight work before exit.

### Middleware design

- Higher order middlewares (auth/role/validation), for declarative and reusable routes.
- Request context enrichment (`req.auth`, `req.workspaceAuth`, `req.requestId`), for sharing auth and workspace info across middlewares and avoiding repeated DB queries or re processing the same logic.

For deeper details, see the documentation links below.

## Local setup

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local instance or MongoDB Atlas)

### 1) Clone the repository

```bash
git clone https://github.com/Thirana/workspace-manager-api.git
cd workspace-manager-api
```

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment variables

Create a `.env` file in the project root with the following variables:

```
NODE_ENV=development
PORT=4000
MONGODB_URI=

CORS_ORIGIN=http://localhost:5173

# Auth
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=30d
BCRYPT_SALT_ROUNDS=12

# Cookies
COOKIE_SECURE=false
COOKIE_SAMESITE=lax

JWT_ISSUER=workspace-task-manager-api
JWT_AUDIENCE=workspace-task-manager-api
```

For `MONGODB_URI`, you can use a local MongoDB connection or a MongoDB Atlas connection string.

### 4) Run the server

```bash
npm run dev
```

The API will be available at `http://localhost:4000` by default.

## Scripts

- `npm run dev` - start the dev server (watch mode)
- `npm run build` - typecheck and build
- `npm run start` - run the compiled server from `dist/`
- `npm run lint` - run ESLint

## Documentation

- Auth API: `docs/api/auth.md` ([link](https://github.com/Thirana/workspace-manager-api/blob/main/docs/api/auth.md))
- Workspace API: `docs/api/workspaces.md` ([link](https://github.com/Thirana/workspace-manager-api/blob/main/docs/api/workspaces.md))
- Project API: `docs/api/projects.md` ([link](https://github.com/Thirana/workspace-manager-api/blob/main/docs/api/projects.md))
- Engineering practices: `docs/engineering-practices/README.md` ([link](https://github.com/Thirana/workspace-manager-api/blob/main/docs/engineering-practices/README.md))
- Middleware: `docs/middlewares/middlewares.md` ([link](https://github.com/Thirana/workspace-manager-api/blob/main/docs/middlewares/middlewares.md))
