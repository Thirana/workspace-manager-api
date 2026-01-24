import type { RequestHandler } from 'express';

import { AuthService } from '../services/auth.service.js';

export const register: RequestHandler = async (req, res) => {
    const user = await AuthService.register(req.body);
    res.status(201).json({
        message: 'Registered successfully',
        user,
    });
};
