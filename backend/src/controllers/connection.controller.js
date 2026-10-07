const connectionService = require('../services/connection.service');
const messageService = require('../services/message.service');

class ConnectionController {
  // ─── Connections ────────────────────────────────────────────────────────────

  /**
   * POST /api/v1/connections (API-CONN-001)
   */
  async createRequest(req, res, next) {
    try {
      const result = await connectionService.createRequest(req.user.userId, req.body);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/connections
   */
  async listConnections(req, res, next) {
    try {
      const connections = await connectionService.listConnections(req.user.userId, req.query);
      res.status(200).json({
        success: true,
        data: connections
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/connections/:id
   */
  async getById(req, res, next) {
    try {
      const connection = await connectionService.getConnectionById(req.user.userId, req.params.id);
      res.status(200).json({
        success: true,
        data: connection
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/connections/:id (API-CONN-002)
   */
  async updateStatus(req, res, next) {
    try {
      const result = await connectionService.updateStatus(req.user.userId, req.params.id, req.body.status);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  // ─── Conversations & Messaging ──────────────────────────────────────────────

  /**
   * GET /api/v1/conversations (API-MSG-001)
   */
  async getConversations(req, res, next) {
    try {
      const conversations = await messageService.getUserConversations(req.user.userId);
      res.status(200).json({
        success: true,
        data: conversations
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/conversations/:connectionId/messages
   */
  async getMessages(req, res, next) {
    try {
      const messages = await messageService.getConversationMessages(req.user.userId, req.params.connectionId, req.query);
      res.status(200).json({
        success: true,
        data: messages
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/conversations/:connectionId/messages (API-MSG-002)
   */
  async sendMessage(req, res, next) {
    try {
      const message = await messageService.sendMessage(req.user.userId, req.params.connectionId, req.body);
      res.status(201).json({
        success: true,
        data: message
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ConnectionController();
