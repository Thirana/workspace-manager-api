import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    MONGODB_URI: z.string().min(1),
    CORS_ORIGIN: z.string().min(1),

    JWT_ACCESS_SECRET: z.string().min(20),
    JWT_REFRESH_SECRET: z.string().min(20),
    ACCESS_TOKEN_TTL: z.string().min(1).default('15m'),
    REFRESH_TOKEN_TTL: z.string().min(1).default('30d'),
    BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),

    COOKIE_SECURE: z.coerce.boolean().default(false),
    COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    // Don’t start the server with bad config
    // eslint-disable-next-line no-console
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsed.data;
