'use strict';

const { verifyToken } = require('../utils/jwt');
const { supabase } = require('../config/supabase');
const { sendError } = require('../utils/response');

/**
 * Require a valid JWT. Attaches req.user = { id, email, role, name }
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
    } catch (tokenErr) {
      return sendError(res, 'Invalid or expired token. Please sign in again.', 401);
    }

    const userId = decoded.userId || decoded.id;

    // Fast-path demo token fallback
    if (userId === 'usr-alex-morgan' || (decoded.email && decoded.email.includes('alex.morgan'))) {
      req.user = {
        id: 'usr-alex-morgan',
        email: 'alex.morgan@cxpulse.ai',
        role: decoded.role || 'admin',
        name: 'Alex Morgan'
      };
      return next();
    }

    // Confirm user in DB if database is connected
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, role, name')
        .eq('id', userId)
        .maybeSingle();

      if (user && !error) {
        req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
        return next();
      }
    } catch (dbErr) {
      // Continue if Supabase is offline
    }

    // Fallback to decoded token payload
    req.user = {
      id: userId,
      email: decoded.email,
      role: decoded.role || 'agent',
      name: decoded.name || 'Support Agent'
    };

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
    const userRole = req.user.role;
    // Map admin/agent roles
    const hasRole = roles.includes(userRole) || 
      (userRole === 'admin' && roles.includes('support_agent')) ||
      (userRole === 'Head of Customer Experience' && roles.includes('admin'));

    if (!hasRole) {
      return sendError(res, 'You do not have permission to perform this action.', 403);
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
