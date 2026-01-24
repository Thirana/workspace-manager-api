// src/services/token.service.ts
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

export type SystemRole = 'system_admin' | 'user';

/** Access token payload (sub = user id, systemRole = global role, typ = access). */
type AccessPayload = { sub: string; systemRole: SystemRole; typ: 'access' };

/** Refresh token payload (sub = user id, jti = token id, typ = refresh). */
type RefreshPayload = { sub: string; jti: string; typ: 'refresh' };

// If you ever switch to RS256, this list changes accordingly.
const JWT_ALG: jwt.Algorithm = 'HS256';

/**
 * Hash a token for storage (sha256).
 * Store only hashes of refresh tokens in DB (never raw tokens).
 */
export function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Create an access token for a user.
 * Includes `systemRole` so global auth checks don't require a DB hit per request.
 */
export function signAccessToken(userId: string, systemRole: SystemRole): string {
    const payload: AccessPayload = { sub: userId, systemRole, typ: 'access' };

    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        algorithm: JWT_ALG,
        expiresIn: env.ACCESS_TOKEN_TTL,
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
    });
}

/**
 * Create a refresh token for a user.
 * Keep refresh tokens long-lived but rotate them on /refresh.
 */
export function signRefreshToken(userId: string, tokenId: string): string {
    const payload: RefreshPayload = { sub: userId, jti: tokenId, typ: 'refresh' };

    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        algorithm: JWT_ALG,
        expiresIn: env.REFRESH_TOKEN_TTL,
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
    });
}

/**
 * Verify an access token and return its payload.
 * Validates signature + exp + iss + aud, and checks typ/required claims.
 */
export function verifyAccessToken(token: string): AccessPayload {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
        algorithms: [JWT_ALG],
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
    }) as AccessPayload;

    if (decoded.typ !== 'access' || !decoded.sub || !decoded.systemRole) {
        throw new Error('Invalid access token payload');
    }

    return decoded;
}

/**
 * Verify a refresh token and return its payload.
 * Validates signature + exp + iss + aud, and checks typ/required claims.
 */
export function verifyRefreshToken(token: string): RefreshPayload {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
        algorithms: [JWT_ALG],
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
    }) as RefreshPayload;

    if (decoded.typ !== 'refresh' || !decoded.sub || !decoded.jti) {
        throw new Error('Invalid refresh token payload');
    }

    return decoded;
}
