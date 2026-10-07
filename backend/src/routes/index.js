const express = require('express');
const authRoutes = require('./auth.routes');
const businessRoutes = require('./business.routes');
const categoryRoutes = require('./category.routes');
const discoveryRoutes = require('./discovery.routes');
const connectionRoutes = require('./connection.routes');
const messageRoutes = require('./message.routes');

const router = express.Router();

// Mount routes under /api/v1
router.use('/auth', authRoutes);
router.use('/businesses', businessRoutes);
router.use('/categories', categoryRoutes);
router.use('/discover', discoveryRoutes);
router.use('/connections', connectionRoutes);
router.use('/conversations', messageRoutes);

module.exports = router;

