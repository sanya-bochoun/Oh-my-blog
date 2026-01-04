import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import logger from './utils/logger.mjs';
import { initSentry } from './utils/sentry.mjs';
import { testConnection } from './utils/db.mjs';
import { validateAndExitIfInvalid } from './utils/validateEnv.mjs';
import routes from './routes/index.mjs';
import { errorHandler } from './middleware/errorHandler.mjs';
import { notFoundHandler } from './middleware/notFoundHandler.mjs';
import notificationRoutes from './routes/notificationRoutes.mjs';
import adminArticleRoutes from './routes/admin/articleRoutes.mjs';
import adminCommentRoutes from './routes/admin/commentRoutes.mjs';
import metricsRoutes from './routes/metricsRoutes.mjs';
import articleRoutes from './routes/articleRoutes.mjs';
import likeRoutes from './routes/likeRoutes.mjs';
import { performanceMiddleware } from './middleware/performanceMiddleware.mjs';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.mjs';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Sentry error tracking (must be after dotenv.config() to read SENTRY_DSN)
initSentry();

// Initialize Redis cache (optional - app can run without Redis)
import { initRedis } from './utils/cache.mjs';
if (process.env.REDIS_URL || process.env.REDIS_HOST) {
  initRedis();
}

// Validate environment variables
validateAndExitIfInvalid();

const app = express();
const PORT = process.env.PORT || 5000;

// Test database connection
testConnection();

// CORS configuration - ต้องมาก่อน middleware อื่นๆ
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://my-personal-blog-2025-airo.vercel.app']
    : [
        'http://localhost:5173', 
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Security Middleware
// 1. Helmet - Set HTTP headers for security
app.use(helmet());

// 2. Rate Limiting - Prevent brute force and DOS attacks
// ปิดใน development เพื่อความสะดวกในการพัฒนา
// เปิดเฉพาะใน production เพื่อความปลอดภัย
if (process.env.NODE_ENV === 'production') {
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit 100 requests per IP in 15 minutes
    message: 'Too many requests from this IP, please try again later.'
  }));
}

// 3. Data Sanitization - Prevent XSS attacks
app.use(xss());

// Body Parser Middleware
app.use(express.json({ limit: '10kb' })); // จำกัดขนาด request body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Serving static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logging Middleware
// Use Morgan for HTTP request logging, integrated with Winston
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev', { stream: logger.stream }));
} else {
  // In production, use combined format and log to Winston
  app.use(morgan('combined', { stream: logger.stream }));
}

// Swagger API Documentation
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'My Personal Blog API Documentation',
  }));
  logger.info('Swagger UI available at /api-docs');
}

// Performance monitoring middleware (apply to all routes)
app.use(performanceMiddleware);

// ลงทะเบียน API routes
app.use('/api', routes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin/articles', adminArticleRoutes);
app.use('/api/admin/comments', adminCommentRoutes);
app.use('/api/admin/metrics', metricsRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/likes', likeRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'API is running...',
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

// API Health Check
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 dbConnection:
 *                   type: string
 *                   example: connected
 *                 environment:
 *                   type: string
 *                   example: development
 */
app.get('/api/health', async (req, res) => {
  try {
    // ทดสอบการเชื่อมต่อกับฐานข้อมูล
    const dbConnected = await testConnection();

    res.json({
      status: 'ok',
      timestamp: new Date(),
      dbConnection: dbConnected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Global Error Handler
app.use(errorHandler);
app.use(notFoundHandler);

// สร้าง HTTP server จาก express app
const server = http.createServer(app);

// ตั้งค่า socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
  }
});

// ตัวอย่าง event สำหรับ dev/debug
io.on('connection', (socket) => {
  logger.info('Socket connection established', { socketId: socket.id });
  socket.on('disconnect', () => {
    logger.info('Socket disconnected', { socketId: socket.id });
  });
});

// เริ่มต้น server (สำหรับ local development)
if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    logger.info('Server started successfully', {
      environment: process.env.NODE_ENV,
      port: PORT,
      urls: {
        base: `http://localhost:${PORT}`,
        api: `http://localhost:${PORT}/api`,
        health: `http://localhost:${PORT}/api/health`
      },
      timestamp: new Date().toISOString()
    });
    // Also log the formatted message for development convenience
    console.log(`✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨\n🌈 🚀 Server is running successfully! 🚀 🌈\n🔹 Environment: ${process.env.NODE_ENV}\n🔹 Port: ${PORT}\n🔹 Status: Online and ready!\n🔹 URLs: http://localhost:${PORT}\n🔹 API: http://localhost:${PORT}/api\n🔹 Health Check: http://localhost:${PORT}/api/health\n🔹 Time: ${new Date().toLocaleString()}\n🌟 Happy coding! 💻 ✨\n✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨`);
  });
}

// Export app สำหรับ Vercel
export default app;
export { io }; 