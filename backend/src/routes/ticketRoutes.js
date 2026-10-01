'use strict';

const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/ticketsController');
const { createTicketSchema, updateTicketSchema, validate } = require('../validators/ticketValidator');

router.get('/priority-queue', ticketsController.getPriorityQueue);
router.get('/:id', ticketsController.getTicketById);
router.post('/', validate(createTicketSchema), ticketsController.createTicket);
router.patch('/:id', validate(updateTicketSchema), ticketsController.updateTicket);
router.post('/:id/resolve', ticketsController.resolveTicket);

module.exports = router;
