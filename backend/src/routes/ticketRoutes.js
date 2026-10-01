'use strict';

const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const {
  createTicketSchema,
  updateTicketSchema,
  createMessageSchema,
  assignTicketSchema,
  useAiResponseSchema
} = require('../validators/ticketValidator');

// Priority Queue shortcut (for frontend)
router.get('/priority-queue', ticketController.getPriorityQueue);

// List & Create
router.get('/', ticketController.getTickets);
router.post('/', validate(createTicketSchema), ticketController.createTicket);

// Detail & Update/Delete
router.get('/:id', ticketController.getTicketById);
router.put('/:id', requireAuth, validate(updateTicketSchema), ticketController.updateTicket);
router.delete('/:id', requireAuth, requireRole('admin'), ticketController.deleteTicket);

// Messages
router.get('/:id/messages', ticketController.getMessages);
router.post('/:id/messages', validate(createMessageSchema), ticketController.addMessage);

// Workflow Actions
router.post('/:id/escalate', ticketController.escalateTicket);
router.post('/:id/resolve', ticketController.resolveTicket);
router.post('/:id/assign', validate(assignTicketSchema), ticketController.assignTicket);
router.post('/:id/use-ai-response', validate(useAiResponseSchema), ticketController.useAiResponse);

module.exports = router;
