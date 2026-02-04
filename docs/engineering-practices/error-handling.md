# Error Handling

## Consistent error envelope

What
- All errors return a consistent `error` object with a `code` and `message`.

Why
- Predictable error shapes make client handling simpler.

Where
- Global handler: `src/middlewares/errorHandler.ts`
- Error type: `src/utils/AppError.ts`

## Zod error details

What
- Validation errors return `VALIDATION_ERROR` with structured field details.

Why
- Helps clients understand exactly which fields failed and why.

Where
- Error handler: `src/middlewares/errorHandler.ts`

## Async error wrapper

What
- `asyncHandler` forwards promise rejections to Express.

Why
- Avoids repetitive try/catch and prevents unhandled promise rejections.

Where
- Utility: `src/utils/asyncHandler.ts`

## Error boundaries

What
- Unknown errors return 500 with `INTERNAL_SERVER_ERROR`.

Why
- Prevents leaking internal details and keeps responses consistent.

Where
- Global handler: `src/middlewares/errorHandler.ts`
