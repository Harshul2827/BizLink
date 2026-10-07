const express = require('express');
const businessController = require('../controllers/business.controller');
const { authenticate, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createCategorySchema } = require('../validators/business.validator');

const router = express.Router();

// Public: List categories (flat or tree view with ?tree=true)
router.get('/', businessController.getCategories);

// Public: Get single category by ID
router.get('/:id', businessController.getCategoryById);

// Protected: Only platform ADMIN can create new categories
router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  validate(createCategorySchema),
  businessController.createCategory
);

module.exports = router;
