import crypto from 'crypto';
import type { RequestHandler } from 'express';

export const requestId: RequestHandler = (req, res, next) => {
    const incoming = req.get('x-request-id');
    const requestId = incoming && incoming.trim().length > 0 ? incoming : crypto.randomUUID();

    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    next();
};
