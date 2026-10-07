const adminService = require('../services/admin.service');

class AdminController {
  /**
   * POST /api/v1/reports - Submit a user report
   */
  async submitReport(req, res, next) {
    try {
      const report = await adminService.submitReport(req.user.userId, req.body);
      res.status(201).json({
        success: true,
        data: report
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/reports - Admin list reports
   */
  async listReports(req, res, next) {
    try {
      const list = await adminService.listReports(req.query);
      res.status(200).json({
        success: true,
        data: list
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/reports/:id/resolve - Admin resolve report
   */
  async resolveReport(req, res, next) {
    try {
      const result = await adminService.resolveReport(req.user.userId, req.params.id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/businesses/:id/status - Admin moderate business status
   */
  async updateBusinessStatus(req, res, next) {
    try {
      const result = await adminService.updateBusinessStatus(req.user.userId, req.params.id, req.body.status);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/users/:id/status - Admin moderate user status
   */
  async updateUserStatus(req, res, next) {
    try {
      const result = await adminService.updateUserStatus(req.user.userId, req.params.id, req.body.status);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
