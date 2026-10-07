const postService = require('../services/post.service');

class PostController {
  /**
   * POST /api/v1/posts (FR-BIZ-004)
   */
  async createPost(req, res, next) {
    try {
      const post = await postService.createPost(req.user.userId, req.body);
      res.status(201).json({
        success: true,
        data: post
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/posts
   */
  async getFeed(req, res, next) {
    try {
      const posts = await postService.getFeed(req.query);
      res.status(200).json({
        success: true,
        data: posts
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/posts/:id
   */
  async getById(req, res, next) {
    try {
      const post = await postService.getPostById(req.params.id);
      res.status(200).json({
        success: true,
        data: post
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/posts/:id/interactions
   */
  async interact(req, res, next) {
    try {
      const result = await postService.interact(req.user.userId, req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/posts/:id/interactions
   */
  async getInteractions(req, res, next) {
    try {
      const list = await postService.getInteractions(req.params.id, req.query);
      res.status(200).json({
        success: true,
        data: list
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PostController();
