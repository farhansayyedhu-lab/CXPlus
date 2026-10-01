'use strict';

const geminiService = require('../services/geminiService');
const { sendSuccess } = require('../utils/response');

class AIController {
  /**
   * 1. Full Ticket Intelligence Analysis (Section 9)
   */
  async analyzeTicket(req, res, next) {
    try {
      const { ticketId } = req.body;
      const analysis = await geminiService.analyzeTicket(ticketId);
      return sendSuccess(res, analysis, 'Ticket analyzed successfully by Gemini AI');
    } catch (err) {
      next(err);
    }
  }

  /**
   * 2. Regenerate Contextual AI Response with requested Tone (Section 10)
   */
  async regenerateResponse(req, res, next) {
    try {
      const { ticketId, tone, customerName, issue } = req.body;
      const result = await geminiService.regenerateResponse({ ticketId, tone, customerName, issue });
      return sendSuccess(res, result, 'AI response generated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * 3. Response Composer helper (for frontend composer)
   */
  async generateResponse(req, res, next) {
    try {
      const { ticketId, tone = 'default', customerName, issue } = req.body;
      const result = await geminiService.regenerateResponse({
        ticketId,
        tone,
        customerName: customerName || 'Customer',
        issue: issue || 'General Customer Service'
      });
      return sendSuccess(res, result, 'AI response synthesized');
    } catch (err) {
      next(err);
    }
  }

  /**
   * 4. Aggregate Business Insights (Section 12)
   */
  async generateInsights(req, res, next) {
    try {
      const insights = await geminiService.generateInsights();
      return sendSuccess(res, insights, 'AI business insights generated successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AIController();
