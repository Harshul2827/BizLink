require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { NotFoundError } = require('./errors/AppError');

const app = express();

app.use(cors());
app.use(express.json());

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
  app.listen(config.port, () => {
    console.log(`BizLink API server is running on port ${config.port} [${config.env}]`);
  });
}

module.exports = app;
