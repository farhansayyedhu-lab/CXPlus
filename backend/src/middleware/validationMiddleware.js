'use strict';

const { sendError } = require('../utils/response');

/**
 * Zod validation middleware factory
 * @param {import('zod').ZodSchema} schema - Zod schema to validate req.body against
 * @param {'body'|'query'|'params'} source - Request property to validate (default: 'body')
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    if (!schema) return next();

    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const formattedErrors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      const firstMessage = formattedErrors[0]?.message || 'Validation failed';
      return sendError(res, firstMessage, 400, formattedErrors);
    }

    // Overwrite with parsed and sanitized data
    req[source] = result.data;
    next();
  };
}

module.exports = { validate };
