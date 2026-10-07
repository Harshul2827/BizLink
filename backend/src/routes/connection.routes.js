const express = require('express');
const connectionController = require('../controllers/connection.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createConnectionSchema,
  updateConnectionStatusSchema,
  listConnectionsSchema
} = require('../validators/connection.validator');

const router = express.Router();

// All connection endpoints require authenticated session
router.use(authenticate);

// API-CONN-001: Initiate connection request
router.post(
  '/',
  validate(createConnectionSchema),
  connectionController.createRequest
);

// List connections for a business
router.get(
  '/',
  validate(listConnectionsSchema, 'query'),
  connectionController.listConnections
);

// Get single connection details
router.get(
  '/:id',
  connectionController.getById
);

// API-CONN-002: Transition connection status (ACCEPTED, REJECTED, CANCELLED, BLOCKED)
router.patch(
  '/:id',
  validate(updateConnectionStatusSchema),
  connectionController.updateStatus
);

module.exports = router;
