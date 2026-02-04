import type { Request, RequestHandler } from 'express';

import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

type RateLimitOptions = {
    windowMs?: number;
    max?: number;
    keyGenerator?: (req: Request) => string;
};

type RateEntry = { count: number; resetAt: number };

const store = new Map<string, RateEntry>();

export const rateLimit = (options: RateLimitOptions = {}): RequestHandler => {
    const windowMs = options.windowMs ?? env.RATE_LIMIT_WINDOW_MS;
    const max = options.max ?? env.RATE_LIMIT_MAX;
    const keyGenerator = options.keyGenerator ?? ((req) => req.ip);

    return (req, res, next) => {
        const key = keyGenerator(req) || 'unknown';
        const now = Date.now();

        let entry = store.get(key);
        if (!entry || now > entry.resetAt) {
            entry = { count: 0, resetAt: now + windowMs };
            store.set(key, entry);
        }

        entry.count += 1;

        res.setHeader('X-RateLimit-Limit', String(max));
        res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - entry.count)));
        res.setHeader('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

        if (entry.count > max) {
            return next(new AppError('Too many requests', 429));
        }

        if (store.size > 10000) {
            for (const [candidateKey, candidate] of store) {
                if (now > candidate.resetAt) store.delete(candidateKey);
            }
        }

        next();
    };
};
