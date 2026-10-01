'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const apiRoutes = require('./routes');
const errorMiddleware = require('./middleware/errorMiddleware');
const env = require('./config/env');

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Cross-Origin Resource Sharing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// HTTP request logger in dev
if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Request parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Root Information
app.get('/', (req, res) => {
  res.json({
    name: 'CXPulse API',
    tagline: 'Turn every customer conversation into an opportunity',
    version: '1.0.0',
    documentation: '/api/v1/health',
    endpoints: {
      auth: '/api/v1/auth',
      metrics: '/api/v1/metrics',
      tickets: '/api/v1/tickets',
      customers: '/api/v1/customers',
      feedback: '/api/v1/feedback',
      ai: '/api/v1/ai',
      team: '/api/v1/team',
      integrations: '/api/v1/integrations'
    }
  });
});

// API Routes
app.use('/api/v1', apiRoutes);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;
