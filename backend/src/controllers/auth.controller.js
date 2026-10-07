const authService = require('../services/auth.service');

class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req, res, next) {
    try {
      // In a stateless JWT setup, client discards token; if token blacklist is introduced, handle here
      res.status(200).json({
        success: true,
        message: 'Successfully logged out'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  async me(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.userId);
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const result = await authService.resetPassword(req.body.token, req.body.newPassword);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
