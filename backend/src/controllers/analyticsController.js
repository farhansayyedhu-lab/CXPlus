'use strict';

const analyticsService = require('../services/analyticsService');
const { sendSuccess } = require('../utils/response');

class AnalyticsController {
  /**
   * Main Dashboard Analytics Endpoint (Section 8)
   */
  async getDashboard(req, res, next) {
    try {
      const data = await analyticsService.getDashboardAnalytics();
      return sendSuccess(res, data, 'Dashboard analytics retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Overview metrics (for legacy / quick widgets)
   */
  async getOverview(req, res, next) {
    try {
      const data = await analyticsService.getOverviewMetrics();
      return sendSuccess(res, data, 'Overview metrics retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Hero insight pattern
   */
  async getHeroInsight(req, res, next) {
    try {
      const data = {
        id: "ai-pattern-01",
        tag: "AI DETECTED A PATTERN",
        title: "Delivery-related complaints increased 32% over the last 7 days.",
        impact: "High",
        impactBadge: "badge-critical",
        confidence: "94%",
        affectedCount: "84 Accounts ($142k ARR)",
        recommendation: "Investigate fulfillment delays in EU West region and proactively notify affected customers with courtesy shipping upgrades.",
        affectedFilter: "delivery"
      };
      return sendSuccess(res, data, 'Hero AI insight');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Sentiment distribution for Radar and Canvas spline charts
   */
  async getSentiment(req, res, next) {
    try {
      const data = {
        sentimentBreakdown: { positive: 64, neutral: 22, negative: 14 },
        channels: [
          { name: "Zendesk", volume: 1420, csat: 91, sentiment: 0.72 },
          { name: "Intercom", volume: 980, csat: 88, sentiment: 0.65 },
          { name: "Email", volume: 540, csat: 82, sentiment: 0.44 },
          { name: "G2 Reviews", volume: 190, csat: 94, sentiment: 0.88 },
          { name: "Twitter/X", volume: 310, csat: 76, sentiment: 0.28 }
        ]
      };
      return sendSuccess(res, data, 'Sentiment metrics');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AnalyticsController();
