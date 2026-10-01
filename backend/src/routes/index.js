'use strict';

const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const geminiService = require('../services/geminiService');

const authRoutes = require('./authRoutes');
const customerRoutes = require('./customerRoutes');
const ticketRoutes = require('./ticketRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const aiRoutes = require('./aiRoutes');
const userRoutes = require('./userRoutes');

// API Health Check with Real Service Status
router.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let aiStatus = 'disconnected';

  // 1. Check Database (Supabase PostgreSQL)
  try {
    const { error } = await Promise.race([
      supabase.from('users').select('id').limit(1),
      new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 2500))
    ]);
    if (!error || error.code === 'PGRST116') {
      dbStatus = 'connected';
    }
  } catch (e) {
    dbStatus = 'disconnected';
  }

  // 2. Check AI (Gemini)
  try {
    if (geminiService.hasApiKey()) {
      aiStatus = 'connected';
    }
  } catch (e) {
    aiStatus = 'disconnected';
  }

  res.json({
    success: true,
    message: 'CXPulse API is running',
    services: {
      database: dbStatus,
      ai: aiStatus
    }
  });
});

// Mount resource routers
router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/tickets', ticketRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/metrics', analyticsRoutes);
router.use('/ai', aiRoutes);
router.use('/users', userRoutes);
router.use('/team', userRoutes);

module.exports = router;
