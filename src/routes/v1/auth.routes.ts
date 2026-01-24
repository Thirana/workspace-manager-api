import { Router } from 'express';

import { register, login, refresh, logout, me } from '../../controllers/auth.controller.js';

import { validateBody } from '../../middlewares/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/requireAuth.js';


import { registerSchema } from '../../schemas/auth.schema.js';
import { loginSchema } from '../../schemas/auth.schema.js';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), asyncHandler(register));
authRouter.post('/login', validateBody(loginSchema), asyncHandler(login));
authRouter.post('/refresh', asyncHandler(refresh));
authRouter.post('/logout', asyncHandler(logout));
authRouter.get('/me', requireAuth, asyncHandler(me));
