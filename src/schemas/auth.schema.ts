import { z } from 'zod';

export const registerSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email(),

    password: z
        .string()
        .min(8)
        .max(72), // bcrypt effective limit is 72 bytes (practical safeguard)

    firstName: z.string().trim().min(1).max(50).optional(),
    lastName: z.string().trim().min(1).max(50).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
