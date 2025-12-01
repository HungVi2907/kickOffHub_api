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

app.use("/api/upload", uploadRoutes);

const app = express();
const container = createContainer();
registerInfrastructure(container);
const moduleManifests = await loadModules(container);
const modularRouter = buildHttpRouter(moduleManifests);
runModuleTasks(moduleManifests).catch((err) => {
  logger.error({ err }, 'Failed to start module tasks');
});
app.set('container', container);
export const diContainer = container;

collectDefaultMetrics({ prefix: 'kickoffhub_' });

app.set('trust proxy', 1);
app.use(pinoHttp({ logger }));
app.use(helmet());

// ===================== CORS FIXED =====================
const allowedOrigins = [
  'https://kickoffhub.space',
  'https://www.kickoffhub.space',
  'https://api.kickoffhub.space',
  'http://localhost:5173',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow requests without origin (Postman etc.)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    logger.warn({ origin }, 'Blocked by CORS');
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
// =====================================================

app.use(express.json());
app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200, // Tăng từ 60 lên 200 requests/phút để hỗ trợ React Strict Mode
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);

// ===================== SWAGGER CONFIG =====================
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Kick Off Hub API',
    version: '1.0.0',
    description: 'Kick Off Hub backend API documentation',
  },
  servers: [
    {
      url: 'https://api.kickoffhub.space',
      description: 'Production Server',
    },
    {
      url: 'http://localhost:3000',
      description: 'Local Development Server',
    }
  ],
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./src/modules/**/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: { operationsSorter: 'alpha' },
}));
// ==============================================================

// ===================== ROUTES =====================
if (moduleManifests.length) {
  app.use('/api', modularRouter);
}
// =====================================================

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

app.get('/metrics', async (_req, res, next) => {
  try {
    const metrics = await register.metrics();
    res.setHeader('Content-Type', register.contentType);
    res.send(metrics);
  } catch (err) {
    next(new AppException('Failed to collect metrics', 'METRICS_ERROR', 500));
  }
});

// Default route
app.get('/', (_req, res) => {
  return ApiResponse.success(
    res,
    { info: 'Chào mừng đến với Kick Off Hub API -> EC2 Version!' },
    'Kick Off Hub API'
  );
});

app.use(errorHandler);

export default app;
