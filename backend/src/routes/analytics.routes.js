const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { authenticate, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { analyticsQuerySchema } = require('../validators/analytics.validator');

const router = express.Router();

// Analytics endpoints require authentication
router.use(authenticate);

// Platform Overview KPIs
router.get(
  '/overview',
  validate(analyticsQuerySchema, 'query'),
  analyticsController.getOverview
);

// Collaboration Trends
router.get(
  '/collaborations',
  analyticsController.getCollaborations
);

// Trust and Verification Metrics
router.get(
  '/trust',
  analyticsController.getTrust
);

// Growth Trends
router.get(
  '/growth',
  validate(analyticsQuerySchema, 'query'),
  analyticsController.getGrowth
);

// Data Integrity / Cleaning Audit (Admin restricted)
router.get(
  '/audit',
  requireRole('ADMIN'),
  analyticsController.runAudit
);

module.exports = router;
