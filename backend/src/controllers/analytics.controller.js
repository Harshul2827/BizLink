const analyticsService = require('../services/analytics.service');

class AnalyticsController {
  /**
   * GET /api/v1/analytics/overview
   */
  async getOverview(req, res, next) {
    try {
      const data = await analyticsService.getOverview();
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/analytics/collaborations
   */
  async getCollaborations(req, res, next) {
    try {
      const data = await analyticsService.getCollaborationAnalytics();
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/analytics/trust
   */
  async getTrust(req, res, next) {
    try {
      const data = await analyticsService.getTrustAnalytics();
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/analytics/growth
   */
  async getGrowth(req, res, next) {
    try {
      const data = await analyticsService.getGrowthAnalytics();
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/analytics/audit
   */
  async runAudit(req, res, next) {
    try {
      const data = await analyticsService.runAudit();
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AnalyticsController();
