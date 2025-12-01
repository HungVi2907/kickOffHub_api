/**
 * =============================================================================
 * FILE: src/app.js
 * =============================================================================
 * 
 * @fileoverview Express Application Configuration - Core của Kick Off Hub API
 * 
 * @description
 * File này cấu hình và khởi tạo Express application với đầy đủ các middleware,
 * security layers, API documentation, và routing system. Đây là trung tâm điều
 * phối của toàn bộ API.
 * 
 * @module app
 * 
 * ## Kiến trúc tổng quan:
 * 
 * ```
 * Request → CORS → Helmet → Rate Limit → JSON Parser → Router → Response
 *                                                         ↓
 *                                              Module Routes (DI Container)
 *                                                         ↓
 *                                              Controllers → Services → DB
 * ```
 * 
 * ## Các tính năng chính:
 * - **Security**: Helmet (HTTP headers), CORS, Rate Limiting
 * - **Logging**: Pino HTTP logger với request tracing
 * - **Metrics**: Prometheus metrics cho monitoring
 * - **Documentation**: Swagger/OpenAPI tự động sinh từ JSDoc
 * - **DI Container**: Dependency Injection cho loose coupling
 * - **Modular Routes**: Tự động load routes từ các modules
 * 
 * ## Health Endpoints:
 * - GET /healthz - Liveness probe (always OK)
 * - GET /readyz - Readiness probe (kiểm tra DB + Redis)
 * - GET /metrics - Prometheus metrics
 * 
 * @requires express - Web framework
 * @requires cors - Cross-Origin Resource Sharing
 * @requires helmet - Security HTTP headers
 * @requires express-rate-limit - Rate limiting
 * @requires pino-http - HTTP request logging
 * @requires prom-client - Prometheus metrics
 * @requires swagger-ui-express - API documentation UI
 * @requires swagger-jsdoc - Generate OpenAPI spec from JSDoc
 * 
 * =============================================================================
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

// =============================================================================
// KHỞI TẠO EXPRESS APPLICATION
// =============================================================================

/**
 * Express application instance
 * @type {Express}
 */
const app = express();

// =============================================================================
// DEPENDENCY INJECTION CONTAINER SETUP
// =============================================================================

/**
 * Tạo DI Container để quản lý dependencies
 * Container này lưu trữ và cung cấp các services, models, và infrastructure
 */
const container = createContainer();

/**
 * Đăng ký các infrastructure services (sequelize, redis, logger)
 * Các services này được inject vào container để sử dụng xuyên suốt app
 */
registerInfrastructure(container);

/**
 * Load tất cả modules từ thư mục src/modules
 * Mỗi module export một manifest chứa routes, services, và tasks
 * @type {Array<ModuleManifest>}
 */
const moduleManifests = await loadModules(container);

/**
 * Build HTTP router từ các module manifests
 * Router này mount tất cả routes của các modules vào một router chung
 * @type {Router}
 */
const modularRouter = buildHttpRouter(moduleManifests);

/**
 * Chạy các scheduled tasks của modules (nếu có)
 * Ví dụ: cron jobs, background workers
 */
runModuleTasks(moduleManifests).catch((err) => {
  logger.error({ err }, 'Failed to start module tasks');
});

// Lưu container vào app để có thể truy cập từ middleware/controllers
app.set('container', container);

/**
 * Export container để sử dụng bên ngoài app context
 * @type {Container}
 */
export const diContainer = container;

// =============================================================================
// PROMETHEUS METRICS
// =============================================================================

/**
 * Thu thập các metrics mặc định của Node.js
 * Bao gồm: memory usage, event loop lag, GC stats, etc.
 * Prefix 'kickoffhub_' để phân biệt với metrics của services khác
 */
collectDefaultMetrics({ prefix: 'kickoffhub_' });

// =============================================================================
// MIDDLEWARE SETUP
// =============================================================================

/**
 * Trust proxy - Cho phép Express nhận đúng IP client khi đứng sau reverse proxy
 * Giá trị 1 = trust 1 hop (ví dụ: Nginx, AWS ELB)
 */
app.set('trust proxy', 1);

/**
 * Pino HTTP Logger - Log tất cả HTTP requests
 * Tự động log: method, url, status, response time
 */
app.use(pinoHttp({ logger }));

/**
 * Helmet - Thiết lập các security HTTP headers
 * Bao gồm: X-XSS-Protection, X-Frame-Options, Content-Security-Policy, etc.
 */
app.use(helmet());

// =============================================================================
// CORS CONFIGURATION
// =============================================================================

/**
 * Danh sách các origins được phép gọi API
 * Bao gồm cả production domains và localhost cho development
 * @constant {string[]}
 */
const allowedOrigins = [
  'https://kickoffhub.space',
  'https://www.kickoffhub.space',
  'https://api.kickoffhub.space',
  'http://localhost:5173',  // Vite dev server
  'http://localhost:3000'   // Local API testing
];

/**
 * CORS options configuration
 * @type {CorsOptions}
 */
const corsOptions = {
  /**
   * Origin callback - Xác định request có được phép không
   * @param {string|undefined} origin - Origin của request
   * @param {Function} callback - Callback function
   */
  origin: function (origin, callback) {
    // Cho phép requests không có origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    // Kiểm tra origin có trong whitelist không
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Log và reject các origin không được phép
    logger.warn({ origin }, 'Blocked by CORS');
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,  // Cho phép gửi cookies cross-origin
  methods: "GET,POST,PUT,DELETE,OPTIONS",  // Các HTTP methods được phép
  allowedHeaders: "Content-Type, Authorization",  // Headers được phép
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests cho tất cả routes
app.options('*', cors(corsOptions));

// =============================================================================
// REQUEST PARSING MIDDLEWARE
// =============================================================================

/**
 * Parse JSON request bodies
 * Tự động parse req.body từ JSON string thành JavaScript object
 */
app.use(express.json());

/**
 * Parse cookies từ request headers
 * Cookies được đọc vào req.cookies
 */
app.use(cookieParser());

// =============================================================================
// RATE LIMITING
// =============================================================================

/**
 * API Rate Limiter - Giới hạn số requests per IP
 * Bảo vệ API khỏi DDoS và abuse
 * @type {RateLimitMiddleware}
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,  // Cửa sổ thời gian: 1 phút
  max: 200,  // Tối đa 200 requests/phút/IP (tăng lên để hỗ trợ React Strict Mode)
  standardHeaders: true,  // Return rate limit info trong headers (RateLimit-*)
  legacyHeaders: false,   // Không dùng X-RateLimit-* headers cũ
});

// Apply rate limiter cho tất cả routes bắt đầu bằng /api
app.use('/api', apiLimiter);

// =============================================================================
// SWAGGER/OPENAPI DOCUMENTATION
// =============================================================================

/**
 * Swagger definition - Thông tin cơ bản của API
 * @type {SwaggerDefinition}
 */
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

/**
 * Swagger options - Cấu hình swagger-jsdoc
 * apis: đường dẫn tới các files chứa JSDoc annotations
 */
const swaggerOptions = {
  swaggerDefinition,
  apis: ['./src/modules/**/*.js'],  // Scan tất cả files trong modules
};

/**
 * Generate OpenAPI specification từ JSDoc annotations
 * @type {OpenAPIObject}
 */
const swaggerSpec = swaggerJSDoc(swaggerOptions);

/**
 * Mount Swagger UI tại /api/docs
 * Cung cấp giao diện web để explore và test API
 */
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: { operationsSorter: 'alpha' },  // Sắp xếp endpoints theo alphabet
}));

// =============================================================================
// MODULE ROUTES
// =============================================================================

/**
 * Mount tất cả module routes vào /api prefix
 * Các routes được tự động load từ modules thông qua DI container
 */
if (moduleManifests.length) {
  app.use('/api', modularRouter);
}

// =============================================================================
// HEALTH CHECK ENDPOINTS
// =============================================================================

/**
 * @route GET /healthz
 * @description Liveness probe - Kiểm tra server có đang chạy không
 * @purpose Được sử dụng bởi Kubernetes/Docker để xác định container còn sống
 * @returns {Object} status: 'ok'
 */
app.get('/healthz', (_req, res) => {
  return ApiResponse.success(res, { status: 'ok' }, 'Service healthy');
});

/**
 * @route GET /readyz
 * @description Readiness probe - Kiểm tra server sẵn sàng nhận traffic
 * @purpose Được sử dụng bởi load balancer để route traffic
 * @details Kiểm tra:
 *   - Database connection (Sequelize authenticate)
 *   - Redis connection (nếu REDIS_URL được set)
 * @returns {Object} status: 'ok' nếu tất cả dependencies sẵn sàng
 * @throws {503} Nếu database hoặc Redis không ready
 */
app.get('/readyz', async (_req, res, next) => {
  try {
    // Kiểm tra kết nối database
    await sequelize.authenticate();
    
    // Kiểm tra Redis nếu được cấu hình
    const redisStatus = getRedisStatus();
    if (process.env.REDIS_URL && !redisStatus.isReady) {
      throw new AppException('Redis connection not ready', 'REDIS_UNREADY', 503);
    }
    
    return ApiResponse.success(res, { status: 'ok' }, 'Service ready');
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /metrics
 * @description Prometheus metrics endpoint
 * @purpose Cung cấp metrics cho monitoring system (Prometheus, Grafana)
 * @returns {string} Prometheus format metrics
 */
app.get('/metrics', async (_req, res, next) => {
  try {
    const metrics = await register.metrics();
    res.setHeader('Content-Type', register.contentType);
    res.send(metrics);
  } catch (err) {
    next(new AppException('Failed to collect metrics', 'METRICS_ERROR', 500));
  }
});

/**
 * @route GET /
 * @description Root endpoint - Welcome message
 * @returns {Object} Thông tin chào mừng
 */
app.get('/', (_req, res) => {
  return ApiResponse.success(
    res,
    { info: 'Chào mừng đến với Kick Off Hub API -> EC2 Version!' },
    'Kick Off Hub API'
  );
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Global error handler middleware
 * Bắt tất cả errors và trả về response format chuẩn
 * Phải đặt cuối cùng sau tất cả routes
 */
app.use(errorHandler);

export default app;
