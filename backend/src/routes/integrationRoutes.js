'use strict';

const express = require('express');
const router = express.Router();
const integrationsController = require('../controllers/integrationsController');

router.get('/', integrationsController.getIntegrations);
router.post('/:id/sync', integrationsController.syncIntegration);

module.exports = router;
