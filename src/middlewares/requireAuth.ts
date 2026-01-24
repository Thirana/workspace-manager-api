import type { RequestHandler } from "express";

import { AppError } from "../utils/AppError";
import { verifyAccessToken } from "../services/token.service";

export const requireAuth: RequestHandler = (req, _rest, next) => {

    //get access token from request header
    const header = req.get("authorization")
    if (!header) throw new AppError("Unauthenticated", 401)

    const [scheme, token] = header.split(" ")
    if (scheme !== 'Bearer' || !token) throw new AppError('Unauthenticated', 401);

    try {

        const payload = verifyAccessToken(token)
        req.auth = { userId: payload.sub }
        next()

    } catch {
        throw new AppError('Unauthenticated', 401);
    }
}