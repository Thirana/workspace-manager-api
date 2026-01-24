import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { logger } from "../config/logger";
import { AppError } from "../utils/AppError";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {

    // zod validation error
    if (err instanceof ZodError) {
        return res.status(400).json({
            error: {
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: err.flatten(),
            },
        })
    }

    // Our Known/app errors
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: {
                message: err.message,
                code: 'APP_ERROR',
            },
        })
    }

    // Unknown/unexpected errors
    logger.error('unhandled_error', { message: err.message, stack: err.stack });

    return res.status(500).json({
        error: {
            message: 'Internal server error',
            code: 'INTERNAL_SERVER_ERROR',
        },
    });

}