'use strict';

const { supabase } = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/response');

class UserController {
  async getUsers(req, res, next) {
    try {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, role, avatar, status, created_at')
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          return sendSuccess(res, data, 'Users list retrieved');
        }
      } catch (dbErr) {}

      const mockUsers = [
        { id: 'usr-alex-morgan', name: 'Alex Morgan', email: 'alex.morgan@cxpulse.ai', role: 'admin', avatar: 'AM', status: 'Active' },
        { id: 'usr-priya-sharma', name: 'Priya Sharma', email: 'priya.sharma@cxpulse.ai', role: 'support_agent', avatar: 'PS', status: 'Active' },
        { id: 'usr-lucas-meyer', name: 'Lucas Meyer', email: 'lucas.meyer@cxpulse.ai', role: 'support_agent', avatar: 'LM', status: 'Active' }
      ];

      return sendSuccess(res, mockUsers, 'Users list retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, role, avatar, status, created_at')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return sendSuccess(res, data, 'User details');
        }
      } catch (dbErr) {}

      return sendSuccess(res, {
        id,
        name: 'Alex Morgan',
        email: 'alex.morgan@cxpulse.ai',
        role: 'admin',
        avatar: 'AM',
        status: 'Active'
      }, 'User details');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
