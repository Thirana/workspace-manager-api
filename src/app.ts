import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';
import { logger } from './config/logger.js';

export const app = express();

// Security headers
app.use(helmet());

// Body parsing with size limit (basic hardening)
app.use(express.json({ limit: '1mb' }));

// CORS (explicit origin)
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

// Minimal request logging (we’ll enhance later with correlation IDs)
app.use((req, _res, next) => {
  logger.info('request', { method: req.method, path: req.path });
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});
