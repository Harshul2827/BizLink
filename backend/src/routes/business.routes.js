const express = require('express');
const businessController = require('../controllers/business.controller');
const { authenticate, optionalAuth, requireRole } = require('../middleware/auth');
const { requireBusinessRole } = require('../middleware/businessAuth');
const validate = require('../middleware/validate');
const {
  createBusinessSchema,
  updateBusinessSchema,
  addMemberSchema,
  createServiceSchema,
  updateServiceSchema,
  createNeedSchema,
  updateNeedSchema
} = require('../validators/business.validator');

const router = express.Router();

// ─── Businesses Profile & Ownership ──────────────────────────────────────────
router.post(
  '/',
  authenticate,
  validate(createBusinessSchema),
  businessController.create
);

router.get(
  '/user/me',
  authenticate,
  businessController.getMyBusinesses
);

router.get(
  '/:id',
  optionalAuth,
  businessController.getById
);

router.patch(
  '/:id',
  authenticate,
  requireBusinessRole('ADMIN'),
  validate(updateBusinessSchema),
  businessController.update
);

// ─── Business Memberships ───────────────────────────────────────────────────
router.get(
  '/:id/members',
  authenticate,
  requireBusinessRole('ANY'),
  businessController.getMembers
);

router.post(
  '/:id/members',
  authenticate,
  requireBusinessRole('ADMIN'),
  validate(addMemberSchema),
  businessController.addMember
);

router.delete(
  '/:id/members/:userId',
  authenticate,
  requireBusinessRole('ADMIN'),
  businessController.removeMember
);

// ─── Business Services / Offers ─────────────────────────────────────────────
router.post(
  '/:id/services',
  authenticate,
  requireBusinessRole('ADMIN'),
  validate(createServiceSchema),
  businessController.createService
);

router.get(
  '/:id/services',
  optionalAuth,
  businessController.getBusinessServices
);

router.patch(
  '/:id/services/:serviceId',
  authenticate,
  requireBusinessRole('ADMIN'),
  validate(updateServiceSchema),
  businessController.updateService
);

router.delete(
  '/:id/services/:serviceId',
  authenticate,
  requireBusinessRole('ADMIN'),
  businessController.deleteService
);

// ─── Business Needs ─────────────────────────────────────────────────────────
router.post(
  '/:id/needs',
  authenticate,
  requireBusinessRole('ADMIN'),
  validate(createNeedSchema),
  businessController.createNeed
);

router.get(
  '/:id/needs',
  optionalAuth,
  businessController.getBusinessNeeds
);

router.patch(
  '/:id/needs/:needId',
  authenticate,
  requireBusinessRole('ADMIN'),
  validate(updateNeedSchema),
  businessController.updateNeed
);

router.delete(
  '/:id/needs/:needId',
  authenticate,
  requireBusinessRole('ADMIN'),
  businessController.deleteNeed
);

module.exports = router;
