'use strict';

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Main Dashboard API (Section 8)
router.get('/dashboard', analyticsController.getDashboard);

// Backward compatible endpoints
router.get('/overview', analyticsController.getOverview);
router.get('/hero-insight', analyticsController.getHeroInsight);
router.get('/sentiment', analyticsController.getSentiment);

module.exports = router;
