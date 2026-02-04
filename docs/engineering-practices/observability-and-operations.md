# Observability and Operations

## Request tracing with request IDs

What
- Each request gets a `requestId`; responses include `x-request-id`.

Why
- Makes it easy to trace a single request through logs.

Where
- Middleware: `src/middlewares/requestId.ts`
- App setup: `src/app.ts`

## Structured logging

What
- Logs are JSON with timestamp and optional stack traces.

Why
- Machine-readable logs simplify debugging and log aggregation.

Where
- Logger: `src/config/logger.ts`
- Request logging: `src/app.ts`
- Error logging: `src/middlewares/errorHandler.ts`

## Config validation at startup

What
- Environment variables are validated with Zod before boot.

Why
- Prevents running the app with invalid or missing config.

Where
- Config: `src/config/env.ts`

## Graceful shutdown

What
- The server listens for SIGINT/SIGTERM and closes DB connections cleanly.

Why
- Prevents abrupt termination and reduces risk of corrupted in-flight work.

Where
- Server bootstrap: `src/server.ts`
