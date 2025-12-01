/* ============================================================================
 * FILE: src/app.js
 * ============================================================================
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { collectDefaultMetrics, register } from 'prom-client';

import sequelize from './common/db.js';
import { getRedisStatus } from './common/redisClient.js';
import { logger } from './common/logger.js';
import ApiResponse from './common/response.js';
import { AppException } from './common/exceptions/index.js';
import errorHandler from './common/errorHandler.js';
import createContainer from './bootstrap/container.js';
import registerInfrastructure from './bootstrap/registerInfrastructure.js';
import loadModules from './bootstrap/moduleLoader.js';
import buildHttpRouter from './pipelines/httpRouter.js';
import runModuleTasks from './pipelines/jobScheduler.js';
import uploadRoutes from "./modules/upload/upload.routes.js";

// ----------------------------
// Express App
// ----------------------------
const app = express();

// ----------------------------
// Dependency Injection
// ----------------------------
const container = createContainer();
registerInfrastructure(container);

const moduleManifests = await loadModules(container);
const modularRouter = buildHttpRouter(moduleManifests);

runModuleTasks(moduleManifests).catch((err) => {
  logger.error({ err }, 'Failed to start module tasks');
});

app.set('container', container);
export const diContainer = container;

// ----------------------------
// Prometheus metrics
// ----------------------------
collectDefaultMetrics({ prefix: 'kickoffhub_' });

// ----------------------------
// Middleware
// ----------------------------
app.set('trust proxy', 1);

// Logger
app.use(pinoHttp({ logger }));

// Security
app.use(helmet());

// ----------------------------
// CORS
// ----------------------------
const allowedOrigins = [
  'https://kickoffhub.space',
  'https://www.kickoffhub.space',
  'https://api.kickoffhub.space',
  'http://localhost:5173',
  'http://localhost:3000'
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);

    logger.warn({ origin }, "Blocked by CORS");
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ----------------------------
// Body parsing
// ----------------------------
app.use("/api/upload", uploadRoutes);
app.use(express.json());
app.use(cookieParser());

// ----------------------------
// Rate Limiting
// ----------------------------
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);

// ----------------------------
// Swagger Documentation
// ----------------------------
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Kick Off Hub API',
    version: '1.0.0',
    description: 'Kick Off Hub backend API documentation',
  },
  servers: [
    { url: 'https://api.kickoffhub.space', description: 'Production Server' },
    { url: 'http://localhost:3000', description: 'Local Development Server' }
  ],
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./src/modules/**/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: { operationsSorter: 'alpha' }
}));

// ----------------------------
// MODULE ROUTES
// ----------------------------
if (moduleManifests.length) {
  app.use('/api', modularRouter);
}



// ----------------------------
// HEALTH CHECK
// ----------------------------
app.get('/healthz', (_req, res) => {
  return ApiResponse.success(res, { status: 'ok' }, 'Service healthy');
});

app.get('/readyz', async (_req, res, next) => {
  try {
    await sequelize.authenticate();

    const redisStatus = getRedisStatus();
    if (process.env.REDIS_URL && !redisStatus.isReady) {
      throw new AppException('Redis connection not ready', 'REDIS_UNREADY', 503);
    }

    return ApiResponse.success(res, { status: 'ok' }, 'Service ready');
  } catch (err) {
    next(err);
  }
});

// Prometheus
app.get('/metrics', async (_req, res, next) => {
  try {
    const metrics = await register.metrics();
    res.setHeader('Content-Type', register.contentType);
    res.send(metrics);
  } catch (err) {
    next(new AppException('Failed to collect metrics', 'METRICS_ERROR', 500));
  }
});

// Root
app.get('/', (_req, res) => {
  return ApiResponse.success(
    res,
    { info: 'Chào mừng đến với Kick Off Hub API -> EC2 Version!' },
    'Kick Off Hub API'
  );
});

// ----------------------------
// ERROR HANDLER (must be last)
// ----------------------------
app.use(errorHandler);

export default app;
