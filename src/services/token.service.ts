import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

/** Access token payload (sub = user id, typ = access). */
type AccessPayload = { sub: string; typ: 'access' };

/** Refresh token payload (sub = user id, jti = token id, typ = refresh). */
type RefreshPayload = { sub: string; jti: string; typ: 'refresh' };

/** Access payload returned after verification. */
type VerifiedAccessPayload = { sub: string; typ: 'access' };

/**
 * Hash a token for storage (sha256).
 * @param token - Raw token string.
 * @returns Hex hash.
 */
export function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Create an access token for a user.
 * @param userId - User id for the sub claim.
 * @returns Signed access token.
 */
export function signAccessToken(userId: string): string {
    const payload: AccessPayload = { sub: userId, typ: 'access' };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.ACCESS_TOKEN_TTL,
    });
}

/**
 * Create a refresh token for a user.
 * @param userId - User id for the sub claim.
 * @param tokenId - Token id for the jti claim.
 * @returns Signed refresh token.
 */
export function signRefreshToken(userId: string, tokenId: string): string {
    const payload: RefreshPayload = { sub: userId, jti: tokenId, typ: 'refresh' };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.REFRESH_TOKEN_TTL,
    });
}

/**
 * Verify a refresh token and return its payload.
 * @param token - Raw refresh token.
 * @returns Refresh payload when valid.
 * @throws Error when invalid or missing claims.
 */
export function verifyRefreshToken(token: string): RefreshPayload {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload;
    if (decoded.typ !== 'refresh' || !decoded.sub || !decoded.jti) {
        throw new Error('Invalid refresh token payload');
    }
    return decoded;
}


/**
 * Verify an access token and return its payload.
 * @param token - Raw access token.
 * @returns Access payload when valid.
 * @throws Error when invalid or missing claims.
 */
export function verifyAccessToken(token: string): VerifiedAccessPayload {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as VerifiedAccessPayload;

    if (decoded.typ !== 'access' || !decoded.sub) {
        throw new Error('Invalid access token payload');
    }

    return decoded;
}
