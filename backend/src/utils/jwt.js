'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Generate a signed JWT for the given payload
 */
function signToken(payload) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

/**
 * Verify and decode a JWT
 * Throws if invalid or expired
 */
function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

module.exports = { signToken, verifyToken };
