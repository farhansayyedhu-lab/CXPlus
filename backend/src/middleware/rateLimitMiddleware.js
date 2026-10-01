'use strict';

const rateLimit = require('express-rate-limit');

/**
 * Standard API rate limiter
 * Limits each IP to 200 requests per 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

/**
 * Stricter rate limiter for authentication endpoints (login, register)
 * Limits each IP to 20 attempts per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes'
  }
});

/**
 * Stricter rate limiter for Gemini AI inference endpoints
 * Limits each IP to 40 AI analysis requests per 10 minutes
 */
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI inference quota reached for this window. Please wait a moment.'
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  aiLimiter
};
