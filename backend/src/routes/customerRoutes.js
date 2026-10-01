'use strict';

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createCustomerSchema, updateCustomerSchema } = require('../validators/customerValidator');

// List & Create
router.get('/', customerController.getCustomers);
router.post('/', requireAuth, validate(createCustomerSchema), customerController.createCustomer);

// Detail & Actions
router.get('/:id', customerController.getCustomerById);
router.put('/:id', requireAuth, validate(updateCustomerSchema), customerController.updateCustomer);
router.delete('/:id', requireAuth, requireRole('admin', 'Head of Customer Experience'), customerController.deleteCustomer);

// Sub-resources
router.get('/:id/tickets', customerController.getCustomerTickets);
router.get('/:id/analytics', customerController.getCustomerAnalytics);

module.exports = router;
