'use strict';

const ticketService = require('../services/ticketService');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

class TicketController {
  async getTickets(req, res, next) {
    try {
      const {
        status,
        priority,
        sentiment,
        intent,
        customerId,
        assignedTo,
        search,
        page = 1,
        limit = 20,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      const result = await ticketService.getTickets({
        status,
        priority,
        sentiment,
        intent,
        customerId,
        assignedTo,
        search,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder
      });

      return sendPaginated(res, result.tickets, result.total, result.page, result.limit);
    } catch (err) {
      next(err);
    }
  }

  async getPriorityQueue(req, res, next) {
    try {
      const { filter } = req.query;
      const queue = await ticketService.getPriorityQueue(filter);
      return sendSuccess(res, queue, 'Priority queue retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getTicketById(req, res, next) {
    try {
      const { id } = req.params;
      const ticket = await ticketService.getTicketById(id);
      if (!ticket) {
        return sendError(res, 'Ticket not found', 404);
      }
      return sendSuccess(res, ticket, 'Ticket details');
    } catch (err) {
      next(err);
    }
  }

  async createTicket(req, res, next) {
    try {
      const ticket = await ticketService.createTicket(req.body);
      return sendSuccess(res, ticket, 'Ticket created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateTicket(req, res, next) {
    try {
      const { id } = req.params;
      const ticket = await ticketService.updateTicket(id, req.body);
      return sendSuccess(res, ticket, 'Ticket updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteTicket(req, res, next) {
    try {
      const { id } = req.params;
      await ticketService.deleteTicket(id);
      return sendSuccess(res, null, 'Ticket deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  async getMessages(req, res, next) {
    try {
      const { id } = req.params;
      const messages = await ticketService.getTicketMessages(id);
      return sendSuccess(res, messages, 'Ticket messages');
    } catch (err) {
      next(err);
    }
  }

  async addMessage(req, res, next) {
    try {
      const { id } = req.params;
      const { sender_type, sender_name, message } = req.body;
      const msg = await ticketService.createTicketMessage(id, {
        sender_type: sender_type || (req.user ? 'agent' : 'customer'),
        sender_name: sender_name || req.user?.name || 'Agent',
        message
      });
      return sendSuccess(res, msg, 'Message sent successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async escalateTicket(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body || {};
      const result = await ticketService.escalateTicket(id, reason);
      return sendSuccess(res, result, 'Ticket escalated to critical priority');
    } catch (err) {
      next(err);
    }
  }

  async resolveTicket(req, res, next) {
    try {
      const { id } = req.params;
      const { resolutionNotes } = req.body || {};
      const result = await ticketService.resolveTicket(id, resolutionNotes);
      return sendSuccess(res, result, 'Ticket resolved successfully');
    } catch (err) {
      next(err);
    }
  }

  async assignTicket(req, res, next) {
    try {
      const { id } = req.params;
      const { assigned_to } = req.body;
      const result = await ticketService.assignTicket(id, assigned_to);
      return sendSuccess(res, result, 'Ticket assigned successfully');
    } catch (err) {
      next(err);
    }
  }

  async useAiResponse(req, res, next) {
    try {
      const { id } = req.params;
      const { response, sender_name } = req.body;
      const result = await ticketService.useAiResponse(id, {
        response,
        sender_name: sender_name || req.user?.name || 'Alex Morgan'
      });
      return sendSuccess(res, result, 'AI response applied and dispatched');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TicketController();
