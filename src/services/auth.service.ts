import mongoose from 'mongoose';

import { RefreshTokenModel } from '../models/refreshToken.model.js';
import { UserModel } from '../models/user.model.js';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import {
    hashToken,
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} from './token.service.js';

type RequestMeta = { ip?: string | undefined; userAgent?: string | undefined };

function isDuplicateKeyError(err: unknown): boolean {
    return typeof err === 'object' && err !== null && (err as any).code === 11000;
}

export class AuthService {
    static async register(input: RegisterInput) {
        try {
            const user = await UserModel.create({
                email: input.email,
                password: input.password,
                firstName: input.firstName ?? null,
                lastName: input.lastName ?? null,
            });

            return user; // safe because toJSON transform removes password
        } catch (err) {
            if (isDuplicateKeyError(err)) {
                throw new AppError('Email already registered', 409);
            }
            throw err;
        }
    }

    static async login(input: LoginInput, meta?: RequestMeta) {
        // validate email
        const user = await UserModel.findOne({ email: input.email }).select('+password');
        if (!user) throw new AppError('Invalid email or password', 401);

        // validate password
        const ok = await user.comparePassword(input.password);
        if (!ok) throw new AppError('Invalid email or password', 401);

        // create refresh token record (rotation-ready)
        const tokenId = new mongoose.Types.ObjectId();
        const refreshToken = signRefreshToken(user.id, tokenId.toString());

        await RefreshTokenModel.create({
            _id: tokenId,
            user: user._id,
            tokenHash: hashToken(refreshToken),
            expiresAt: new Date(Date.now() + parseTtlToMs(env.REFRESH_TOKEN_TTL)),
            ip: meta?.ip ?? null,
            userAgent: meta?.userAgent ?? null,
        });

        // create access token with current system role
        const systemRole = user.systemRole ?? 'user';
        const accessToken = signAccessToken(user.id, systemRole);

        // Return user WITHOUT password
        return { user: user.toJSON(), accessToken, refreshToken };
    }

    static async refresh(refreshToken: string, meta?: RequestMeta) {
        // decode payload from refresh token
        const payload = verifyRefreshToken(refreshToken);

        // get refresh token doc
        const tokenDoc = await RefreshTokenModel.findById(payload.jti);
        if (!tokenDoc || tokenDoc.revokedAt) throw new AppError('Unauthenticated', 401);

        // token theft/replay detection: hash must match stored hash
        if (tokenDoc.tokenHash !== hashToken(refreshToken)) {
            await RefreshTokenModel.updateMany(
                { user: tokenDoc.user, revokedAt: null },
                { revokedAt: new Date() },
            );
            throw new AppError('Unauthenticated', 401);
        }

        // load user to get CURRENT system role
        const user = await UserModel.findById(tokenDoc.user);
        if (!user) {
            // conservative: revoke this token and deny
            tokenDoc.revokedAt = new Date();
            await tokenDoc.save();
            throw new AppError('Unauthenticated', 401);
        }

        // rotate: revoke old token + create new one
        tokenDoc.revokedAt = new Date();

        const newTokenId = new mongoose.Types.ObjectId();
        tokenDoc.replacedByTokenId = newTokenId;
        await tokenDoc.save();

        const newRefreshToken = signRefreshToken(user.id, newTokenId.toString());

        await RefreshTokenModel.create({
            _id: newTokenId,
            user: tokenDoc.user,
            tokenHash: hashToken(newRefreshToken),
            expiresAt: new Date(Date.now() + parseTtlToMs(env.REFRESH_TOKEN_TTL)),
            ip: meta?.ip ?? null,
            userAgent: meta?.userAgent ?? null,
        });

        // create new access token with current system role
        const systemRole = user.systemRole ?? 'user';
        const newAccessToken = signAccessToken(user.id, systemRole);

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }

    static async logout(refreshToken: string) {
        const payload = verifyRefreshToken(refreshToken);

        const tokenDoc = await RefreshTokenModel.findById(payload.jti);
        if (!tokenDoc || tokenDoc.revokedAt) return; // idempotent logout

        // Only revoke if it matches stored hash
        if (tokenDoc.tokenHash !== hashToken(refreshToken)) return;

        tokenDoc.revokedAt = new Date();
        await tokenDoc.save();
    }

    static async getMe(userId: string) {
        const user = await UserModel.findById(userId);
        if (!user) throw new AppError('Unauthenticated', 401);
        return user;
    }
}

function parseTtlToMs(ttl: string): number {
    // supports '15m', '30d' (simple parser)
    const m = ttl.match(/^(\d+)([smhd])$/);
    if (!m) return 30 * 24 * 60 * 60 * 1000;

    const value = Number(m[1]);
    const unit = m[2];
    const mult = unit === 's' ? 1000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;
    return value * mult;
}
