'use strict';

const analyticsService = require('../services/analyticsService');
const { sendSuccess } = require('../utils/response');

class MetricsController {
  /**
   * Get all top-level CX metrics
   */
  async getMetrics(req, res, next) {
    try {
      const metrics = await analyticsService.getOverviewMetrics();
      return sendSuccess(res, metrics, 'Top-level metrics retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get AI hero insight banner
   */
  async getHeroInsight(req, res, next) {
    try {
      const insight = await analyticsService.getHeroInsight();
      return sendSuccess(res, insight, 'AI Hero insight retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get sentiment distribution and channels
   */
  async getDistribution(req, res, next) {
    try {
      const dist = await analyticsService.getSentimentDistribution();
      return sendSuccess(res, dist, 'Sentiment distribution retrieved');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MetricsController();
