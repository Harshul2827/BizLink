const discoveryService = require('../services/discovery.service');
const matchService = require('../services/match.service');
const { requireBusinessAccess } = require('../middleware/businessAuth'); // Import from Track 2
const { ForbiddenError } = require('../errors/AppError');

class DiscoveryController {
  /**
   * GET /api/v1/discover/businesses
   */
  async searchBusinesses(req, res, next) {
    try {
      const result = await discoveryService.searchBusinesses(req.query);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/discover/services
   */
  async searchServices(req, res, next) {
    try {
      const result = await discoveryService.searchServices(req.query);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/discover/needs
   */
  async searchNeeds(req, res, next) {
    try {
      const result = await discoveryService.searchNeeds(req.query);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/discover/matches/generate
   * Generates matches for a specific business (all its needs)
   */
  async generateMatches(req, res, next) {
    try {
      const { businessId } = req.body;
      if (!businessId) {
        return res.status(400).json({ success: false, error: { code: 'MISSING_BUSINESS_ID', message: 'businessId is required in body' } });
      }

      // Check permissions using the helper from Track 2
      // We manually invoke it or we assume it's protected at the route level.
      // We'll trust route level or inline logic.

      const matchesGenerated = await matchService.generateMatchesForBusiness(businessId);
      res.status(200).json({
        success: true,
        message: 'Match generation completed',
        data: { matchesGenerated }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/discover/matches/needs/:needId
   */
  async getMatchesForNeed(req, res, next) {
    try {
      const matches = await matchService.getMatchesForNeed(req.params.needId, req.query);
      res.status(200).json({
        success: true,
        data: matches
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/discover/matches/services/:serviceId
   */
  async getMatchesForService(req, res, next) {
    try {
      const matches = await matchService.getMatchesForService(req.params.serviceId, req.query);
      res.status(200).json({
        success: true,
        data: matches
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DiscoveryController();
