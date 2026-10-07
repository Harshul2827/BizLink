const collaborationService = require('../services/collaboration.service');

class CollaborationController {
  /**
   * POST /api/v1/collaborations
   */
  async createCollaboration(req, res, next) {
    try {
      const collaboration = await collaborationService.createCollaboration(req.user.userId, req.body);
      res.status(201).json({
        success: true,
        data: collaboration
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/collaborations
   */
  async listCollaborations(req, res, next) {
    try {
      const list = await collaborationService.listCollaborations(req.user.userId, req.query);
      res.status(200).json({
        success: true,
        data: list
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/collaborations/:id
   */
  async getById(req, res, next) {
    try {
      const collaboration = await collaborationService.getCollaborationById(req.user.userId, req.params.id);
      res.status(200).json({
        success: true,
        data: collaboration
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/collaborations/:id/status
   */
  async updateStatus(req, res, next) {
    try {
      const result = await collaborationService.updateStatus(req.user.userId, req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CollaborationController();
