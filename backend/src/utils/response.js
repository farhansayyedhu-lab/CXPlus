'use strict';

/**
 * Standard success response
 */
function sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
}

/**
 * Standard error response
 */
function sendError(res, message = 'An error occurred', statusCode = 500, details = null) {
  const payload = { success: false, message };
  if (details && process.env.NODE_ENV === 'development') {
    payload.details = details;
  }
  return res.status(statusCode).json(payload);
}

/**
 * Paginated response wrapper
 */
function sendPaginated(res, data, total, page, limit) {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit),
    },
  });
}

module.exports = { sendSuccess, sendError, sendPaginated };
