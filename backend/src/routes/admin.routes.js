const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticate, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createReportSchema,
  listReportsQuerySchema,
  updateBusinessStatusSchema,
  updateUserStatusSchema
} = require('../validators/admin.validator');

const router = express.Router();

// POST /api/v1/reports (or /admin/reports) - Any authenticated user can submit a report
router.post(
  '/reports',
  authenticate,
  validate(createReportSchema),
  adminController.submitReport
);

// Admin-only endpoints below
router.use(authenticate, requireRole('ADMIN'));

// GET /api/v1/admin/reports - List reports
router.get(
  '/reports',
  validate(listReportsQuerySchema, 'query'),
  adminController.listReports
);

// PATCH /api/v1/admin/reports/:id/resolve - Resolve report
router.patch(
  '/reports/:id/resolve',
  adminController.resolveReport
);

// PATCH /api/v1/admin/businesses/:id/status - Moderate business status
router.patch(
  '/businesses/:id/status',
  validate(updateBusinessStatusSchema),
  adminController.updateBusinessStatus
);

// PATCH /api/v1/admin/users/:id/status - Moderate user status
router.patch(
  '/users/:id/status',
  validate(updateUserStatusSchema),
  adminController.updateUserStatus
);

module.exports = router;
