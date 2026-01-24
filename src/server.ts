import mongoose from 'mongoose';

import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

async function start() {
    try {
        // Mongoose strict defaults (safe)
        mongoose.set('strictQuery', true);

        mongoose.set('autoIndex', env.NODE_ENV !== 'production');

        await mongoose.connect(env.MONGODB_URI);
        logger.info('mongodb_connected');

        const server = app.listen(env.PORT, () => {
            logger.info('server_started', { port: env.PORT, env: env.NODE_ENV });
        });

        // Graceful shutdown
        const shutdown = async (signal: string) => {
            logger.info('shutdown_start', { signal });
            server.close(async () => {
                await mongoose.connection.close();
                logger.info('shutdown_complete');
                process.exit(0);
            });
        };

        process.on('SIGINT', () => void shutdown('SIGINT'));
        process.on('SIGTERM', () => void shutdown('SIGTERM'));
    } catch (err) {
        logger.error('startup_error', { err });
        process.exit(1);
    }
}

void start();
