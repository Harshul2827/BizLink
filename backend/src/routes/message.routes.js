const express = require('express');
const connectionController = require('../controllers/connection.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { sendMessageSchema } = require('../validators/connection.validator');

const router = express.Router();

// All conversation/messaging endpoints require authenticated session
router.use(authenticate);

// API-MSG-001: List recent conversation threads for user's businesses
router.get('/', connectionController.getConversations);

// Retrieve messages in a connection with pagination
router.get('/:connectionId/messages', connectionController.getMessages);

// API-MSG-002: Send message within an accepted connection
router.post(
  '/:connectionId/messages',
  validate(sendMessageSchema),
  connectionController.sendMessage
);

module.exports = router;
