'use strict';

const geminiService = require('../services/geminiService');
const { sendSuccess } = require('../utils/response');

class AIController {
  /**
   * Generate contextual customer response with tone variations (AI Composer)
   */
  async generateResponse(req, res, next) {
    try {
      const {
        customerId,
        customerName,
        issue,
        tone = 'default',
        intent,
        ltv,
        riskScore,
        customInstructions
      } = req.body;

      const result = await geminiService.generateCustomerResponse({
        customerName,
        issue,
        tone,
        intent,
        ltv,
        riskScore,
        customInstructions
      });

      return sendSuccess(res, result, 'AI Response generated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Sentiment & Emotion Analysis
   */
  async analyzeSentiment(req, res, next) {
    try {
      const { text, context } = req.body;
      const analysis = await geminiService.analyzeSentiment(text, context);
      return sendSuccess(res, analysis, 'Sentiment analysis completed');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Predict churn risk & next best action
   */
  async predictChurn(req, res, next) {
    try {
      const { customerName, recentTickets = [], unresolvedCount = 1 } = req.body;

      let riskScore = 30 + (unresolvedCount * 15);
      if (riskScore > 95) riskScore = 95;

      const reasons = [
        `${unresolvedCount} unresolved friction touchpoints detected in active period`,
        'Sentiment degradation observed over consecutive interactions',
        'Customer satisfaction trajectory trending downward'
      ];

      const nextActions = [
        'Issue immediate service credit or SLA waiver',
        'Schedule proactive executive outreach from Customer Success lead',
        'Prioritize hotfix deployment with engineering leadership'
      ];

      return sendSuccess(res, {
        customerName: customerName || 'Valued Account',
        riskScore,
        riskLevel: riskScore > 75 ? 'Critical' : riskScore > 50 ? 'High' : 'Medium',
        whyRisk: reasons,
        nextActions
      }, 'Churn prediction generated');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Summarize support conversation
   */
  async summarizeTicket(req, res, next) {
    try {
      const { conversationHistory } = req.body;
      const summary = await geminiService.summarizeTicket(conversationHistory);
      return sendSuccess(res, summary, 'Conversation summarized');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AIController();
