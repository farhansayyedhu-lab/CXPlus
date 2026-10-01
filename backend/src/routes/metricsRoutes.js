'use strict';

const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');

router.get('/overview', metricsController.getMetrics);
router.get('/hero-insight', metricsController.getHeroInsight);
router.get('/distribution', metricsController.getDistribution);

module.exports = router;
