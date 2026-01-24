import { Router } from 'express';
import { z } from 'zod';

import { validateBody } from '../middlewares/validate.js';

export const debugRouter = Router();

const echoSchema = z.object({
    name: z.string().min(1),
    age: z.coerce.number().int().positive(),
});

debugRouter.post('/echo', validateBody(echoSchema), (req, res) => {
    res.json({
        message: 'validated',
        data: req.body,
    });
});
