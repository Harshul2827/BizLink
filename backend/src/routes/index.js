const express = require('express');
const authRoutes = require('./auth.routes');
const businessRoutes = require('./business.routes');
const categoryRoutes = require('./category.routes');
const discoveryRoutes = require('./discovery.routes');
const connectionRoutes = require('./connection.routes');
const messageRoutes = require('./message.routes');
const collaborationRoutes = require('./collaboration.routes');
const reviewRoutes = require('./review.routes');
const postRoutes = require('./post.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

// Mount routes under /api/v1
router.use('/auth', authRoutes);
router.use('/businesses', businessRoutes);
router.use('/categories', categoryRoutes);
router.use('/discover', discoveryRoutes);
router.use('/connections', connectionRoutes);
router.use('/conversations', messageRoutes);
router.use('/collaborations', collaborationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/posts', postRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', adminRoutes);

module.exports = router;

