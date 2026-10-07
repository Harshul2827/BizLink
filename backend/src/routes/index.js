const express = require('express');
const authRoutes = require('./auth.routes');
const businessRoutes = require('./business.routes');
const categoryRoutes = require('./category.routes');
const discoveryRoutes = require('./discovery.routes');

const router = express.Router();

// Mount routes under /api/v1
router.use('/auth', authRoutes);
router.use('/businesses', businessRoutes);
router.use('/categories', categoryRoutes);
router.use('/discover', discoveryRoutes);

module.exports = router;
