'use strict';

const { verifyToken } = require('../utils/jwt');
const { supabase } = require('../config/supabase');
const { sendError } = require('../utils/response');

/**
 * Require a valid JWT. Attaches req.user = { id, email, role }
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required. Please sign in.', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return sendError(res, 'Invalid or expired token. Please sign in again.', 401);
    }

    // Confirm the user still exists in DB
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, name')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return sendError(res, 'User account not found.', 401);
    }

    req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
    next();
  } catch (err) {
    console.error('[authMiddleware] Unexpected error:', err.message);
    return sendError(res, 'Authentication error.', 500);
  }
}

/**
 * Require one of the listed roles. Must be used AFTER requireAuth.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'You do not have permission to perform this action.', 403);
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
