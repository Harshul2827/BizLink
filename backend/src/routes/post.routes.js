const express = require('express');
const postController = require('../controllers/post.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createPostSchema,
  createInteractionSchema,
  listPostsQuerySchema
} = require('../validators/post.validator');

const router = express.Router();

// GET /api/v1/posts - Public or authenticated feed
router.get(
  '/',
  validate(listPostsQuerySchema, 'query'),
  postController.getFeed
);

// GET /api/v1/posts/:id - Public or authenticated post view
router.get(
  '/:id',
  postController.getById
);

// GET /api/v1/posts/:id/interactions - View comments/interactions
router.get(
  '/:id/interactions',
  postController.getInteractions
);

// POST /api/v1/posts - Create post (authenticated)
router.post(
  '/',
  authenticate,
  validate(createPostSchema),
  postController.createPost
);

// POST /api/v1/posts/:id/interactions - Like or comment on a post (authenticated)
router.post(
  '/:id/interactions',
  authenticate,
  validate(createInteractionSchema),
  postController.interact
);

module.exports = router;
