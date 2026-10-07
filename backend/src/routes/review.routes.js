const express = require('express');
const reviewController = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createReviewSchema
} = require('../validators/review.validator');

const router = express.Router();

// POST /api/v1/reviews - Create a review
router.post(
  '/',
  authenticate,
  validate(createReviewSchema),
  reviewController.createReview
);

// GET /api/v1/reviews/:id - Get single review
router.get(
  '/:id',
  reviewController.getById
);

module.exports = router;
