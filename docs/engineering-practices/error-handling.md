# Error Handling

## Consistent error envelope

What
- All errors return a consistent `error` object with a `code` and `message`.

Why
- Predictable error shapes make client handling simpler and more robust.
- Error codes allow client logic to branch without parsing messages.
- Central formatting reduces inconsistencies across endpoints.

Where
- Global handler: `src/middlewares/errorHandler.ts`
- Error type: `src/utils/AppError.ts`

## Zod error details

What
- Validation errors return `VALIDATION_ERROR` with structured field details.

Why
- Helps clients understand exactly which fields failed and why.
- Reduces back-and-forth by providing actionable field-level feedback.
- Speeds up debugging during development and QA.

Where
- Error handler: `src/middlewares/errorHandler.ts`

## Async error wrapper

What
- `asyncHandler` forwards promise rejections to Express.

Why
- Avoids repetitive try/catch in each controller.
- Ensures async errors flow through the same handler as sync errors.
- Prevents unhandled promise rejections from crashing the process.

Where
- Utility: `src/utils/asyncHandler.ts`

## Error boundaries

What
- Unknown errors return 500 with `INTERNAL_SERVER_ERROR`.

Why
- Prevents leaking internal details to clients.
- Keeps responses consistent even for unexpected failures.
- Ensures errors are logged server-side for diagnosis.

Where
- Global handler: `src/middlewares/errorHandler.ts`
