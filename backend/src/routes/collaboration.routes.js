const express = require('express');
const collaborationController = require('../controllers/collaboration.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createCollaborationSchema,
  updateCollaborationStatusSchema,
  listCollaborationsQuerySchema
} = require('../validators/collaboration.validator');

const router = express.Router();

// All collaboration endpoints require authentication
router.use(authenticate);

// POST /api/v1/collaborations - Create a collaboration
router.post(
  '/',
  validate(createCollaborationSchema),
  collaborationController.createCollaboration
);

// GET /api/v1/collaborations - List collaborations for business
router.get(
  '/',
  validate(listCollaborationsQuerySchema, 'query'),
  collaborationController.listCollaborations
);

// GET /api/v1/collaborations/:id - Get collaboration details
router.get(
  '/:id',
  collaborationController.getById
);

// PATCH /api/v1/collaborations/:id/status - Transition collaboration status
router.patch(
  '/:id/status',
  validate(updateCollaborationStatusSchema),
  collaborationController.updateStatus
);

module.exports = router;
