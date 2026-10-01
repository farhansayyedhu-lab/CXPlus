'use strict';

const customerService = require('../services/customerService');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

class CustomerController {
  async getCustomers(req, res, next) {
    try {
      const { search, risk, page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
      const result = await customerService.getCustomers({
        search,
        risk,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder
      });

      return sendPaginated(res, result.customers, result.total, result.page, result.limit);
    } catch (err) {
      next(err);
    }
  }

  async getCustomerById(req, res, next) {
    try {
      const { id } = req.params;
      const customer = await customerService.getCustomerById(id);
      if (!customer) {
        return sendError(res, 'Customer not found', 404);
      }
      return sendSuccess(res, customer, 'Customer profile');
    } catch (err) {
      next(err);
    }
  }

  async createCustomer(req, res, next) {
    try {
      const customer = await customerService.createCustomer(req.body);
      return sendSuccess(res, customer, 'Customer created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateCustomer(req, res, next) {
    try {
      const { id } = req.params;
      const customer = await customerService.updateCustomer(id, req.body);
      return sendSuccess(res, customer, 'Customer updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteCustomer(req, res, next) {
    try {
      const { id } = req.params;
      await customerService.deleteCustomer(id);
      return sendSuccess(res, null, 'Customer deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  async getCustomerTickets(req, res, next) {
    try {
      const { id } = req.params;
      const tickets = await customerService.getCustomerTickets(id);
      return sendSuccess(res, tickets, 'Customer tickets');
    } catch (err) {
      next(err);
    }
  }

  async getCustomerAnalytics(req, res, next) {
    try {
      const { id } = req.params;
      const analytics = await customerService.getCustomerAnalytics(id);
      return sendSuccess(res, analytics, 'Customer analytics');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CustomerController();
