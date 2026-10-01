'use strict';

const { sendError } = require('../utils/response');
const env = require('../config/env');

/**
 * Global error handler. Register as the LAST middleware in app.js.
 */
// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  console.error('[error]', err.message);
  if (env.isDev) console.error(err.stack);

  // Zod validation errors surface here when thrown manually
  if (err.name === 'ZodError') {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    return sendError(res, `Validation error: ${messages}`, 422);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return sendError(res, 'Invalid or expired token.', 401);
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode < 500 ? err.message : 'Internal server error';
  return sendError(res, message, statusCode, env.isDev ? err.stack : undefined);
}

module.exports = errorMiddleware;
