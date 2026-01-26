import type { RequestHandler } from 'express';

import { env } from '../config/env.js';
import { AuthService } from '../services/auth.service.js';

import { AppError } from '../utils/AppError.js';

import { getAuth } from '../utils/getAuth.js';

function refreshCookieOptions() {
    return {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
        sameSite: env.COOKIE_SAMESITE,
        path: '/api/v1/auth/refresh',
    } as const;
}


export const register: RequestHandler = async (req, res) => {
    const user = await AuthService.register(req.body);
    res.status(201).json({
        message: 'Registered successfully',
        user,
    });
};

export const login: RequestHandler = async (req, res) => {
    const { user, accessToken, refreshToken } = await AuthService.login(req.body, {
        ip: req.ip,
        userAgent: req.get('user-agent') ?? undefined,
    });

    res.cookie('refreshToken', refreshToken, refreshCookieOptions());
    res.status(200).json({ message: 'Logged in', accessToken, user });
};

export const refresh: RequestHandler = async (req, res) => {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) throw new AppError('Unauthenticated', 401);

    const { accessToken, refreshToken } = await AuthService.refresh(token, {
        ip: req.ip,
        userAgent: req.get('user-agent') ?? undefined,
    });

    res.cookie('refreshToken', refreshToken, refreshCookieOptions());
    res.status(200).json({ message: 'Refreshed', accessToken });
};

export const logout: RequestHandler = async (req, res) => {
    const token = req.cookies?.refreshToken as string | undefined;

    if (token) {
        await AuthService.logout(token);
    }

    res.clearCookie('refreshToken', refreshCookieOptions());
    res.status(200).json({ message: 'Logged out' });
};

export const me: RequestHandler = async (req, res) => {
    const { userId } = getAuth(req);

    const user = await AuthService.getMe(userId);
    res.status(200).json({ user });
};
