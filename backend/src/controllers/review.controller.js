const reviewService = require('../services/review.service');

class ReviewController {
  /**
   * POST /api/v1/reviews (FR-REV-001)
   */
  async createReview(req, res, next) {
    try {
      const review = await reviewService.createReview(req.user.userId, req.body);
      res.status(201).json({
        success: true,
        data: review
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/businesses/:id/reviews
   */
  async getBusinessReviews(req, res, next) {
    try {
      const result = await reviewService.getBusinessReviews(req.params.id, req.query);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/reviews/:id
   */
  async getById(req, res, next) {
    try {
      const review = await reviewService.getReviewById(req.params.id);
      res.status(200).json({
        success: true,
        data: review
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReviewController();
