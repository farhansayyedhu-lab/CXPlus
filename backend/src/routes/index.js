'use strict';

const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const metricsRoutes = require('./metricsRoutes');
const ticketRoutes = require('./ticketRoutes');
const customerRoutes = require('./customerRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const aiRoutes = require('./aiRoutes');
const teamRoutes = require('./teamRoutes');
const integrationRoutes = require('./integrationRoutes');

// API Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CXPulse AI API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount modular sub-routers
router.use('/auth', authRoutes);
router.use('/metrics', metricsRoutes);
router.use('/tickets', ticketRoutes);
router.use('/customers', customerRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/ai', aiRoutes);
router.use('/team', teamRoutes);
router.use('/integrations', integrationRoutes);

module.exports = router;
