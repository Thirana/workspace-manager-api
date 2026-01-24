import { Router } from 'express';

import { register } from '../../controllers/auth.controller.js';
import { validateBody } from '../../middlewares/validate.js';
import { registerSchema } from '../../schemas/auth.schema.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), asyncHandler(register));
