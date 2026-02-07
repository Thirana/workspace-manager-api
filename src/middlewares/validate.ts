import type { RequestHandler } from "express";
import type { ZodType } from "zod";

type AnyZodSchema = ZodType<any, any>;

// Validate request body with the given schema.
export const validateBody =
    (schema: AnyZodSchema): RequestHandler =>
        (req, _res, next) => {
            req.body = schema.parse(req.body);
            next()
        }


// Validate query string with the given schema.
export const validateQuery =
    (schema: AnyZodSchema): RequestHandler =>
        (req, _res, next) => {
            const parsed = schema.parse(req.query);
            // Express v5 exposes req.query as a getter-only property.
            // Mutate the existing object to keep compatibility.
            Object.assign(req.query, parsed);
            next();
        };

// Validate route params with the given schema.
export const validateParams =
    (schema: AnyZodSchema): RequestHandler =>
        (req, _res, next) => {
            req.params = schema.parse(req.params);
            next();
        };
