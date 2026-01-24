import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

/** JWT payload for access tokens. */
type AccessPayload = { sub: string; typ: 'access' };
/** JWT payload for refresh tokens. */
type RefreshPayload = { sub: string; jti: string; typ: 'refresh' };

/**
 * Create a SHA-256 hash of a token for safe storage/comparison.
 * @param token - Raw token string.
 * @returns Hex-encoded hash.
 */
export function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Sign a short-lived access token for a user.
 * @param userId - User id to embed as the subject.
 * @returns Signed JWT access token.
 */
export function signAccessToken(userId: string): string {
    const payload: AccessPayload = { sub: userId, typ: 'access' };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.ACCESS_TOKEN_TTL,
    });
}

/**
 * Sign a refresh token linked to a stored token id.
 * @param userId - User id to embed as the subject.
 * @param tokenId - Refresh token id (jti) for revocation tracking.
 * @returns Signed JWT refresh token.
 */
export function signRefreshToken(userId: string, tokenId: string): string {
    const payload: RefreshPayload = { sub: userId, jti: tokenId, typ: 'refresh' };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.REFRESH_TOKEN_TTL,
    });
}

/**
 * Verify a refresh token and assert required claims.
 * @param token - Raw JWT refresh token.
 * @returns Decoded and validated refresh payload.
 * @throws Error when the token is invalid or has a bad payload.
 */
export function verifyRefreshToken(token: string): RefreshPayload {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload;
    if (decoded.typ !== 'refresh' || !decoded.sub || !decoded.jti) {
        throw new Error('Invalid refresh token payload');
    }
    return decoded;
}
