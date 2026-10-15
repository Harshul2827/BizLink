require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { NotFoundError } = require('./errors/AppError');

const app = express();

// Security headers
app.use(helmet());

// CORS — allow configured origins and all localhost/127.0.0.1 ports in development
const isDev = (process.env.NODE_ENV || 'development') === 'development';
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests (no origin) and listed origins
    if (!origin) return callback(null, true);

    // In development, allow any localhost or 127.0.0.1 port (e.g. 5173, 5174)
    if (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true
}));

app.use(express.json());

// Rate limiting on auth endpoints — 20 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests. Please try again after 15 minutes.' }
  }
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'BizLink API is running',
    environment: config.env,
    timestamp: new Date().toISOString()
  });
});

// API v1 root
app.use('/api/v1', apiRoutes);

// Catch-all 404 for unhandled routes
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND'));
});

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(config.port, () => {
    console.log(`BizLink API server is running on port ${config.port} [${config.env}]`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n[ERROR] Port ${config.port} is already in use by another process.`);
      console.error(`A BizLink backend instance is likely already running.`);
      console.error(`To fix: kill the running process or change PORT in .env.\n`);
    } else {
      console.error('[ERROR] Server failed to start:', err.message);
    }
    process.exit(1);
  });
}

module.exports = app;
