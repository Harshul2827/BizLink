const express = require('express');
const discoveryController = require('../controllers/discovery.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  discoverBusinessesSchema,
  discoverServicesSchema,
  discoverNeedsSchema,
  matchQuerySchema
} = require('../validators/discovery.validator');

const router = express.Router();

/**
 * @route   GET /api/v1/discover/businesses
 * @desc    Search businesses
 * @access  Public (Optional auth for personalized visibility in the future)
 */
router.get(
  '/businesses',
  optionalAuth,
  validate(discoverBusinessesSchema, 'query'),
  (req, res, next) => discoveryController.searchBusinesses(req, res, next)
);

/**
 * @route   GET /api/v1/discover/services
 * @desc    Search services across all businesses
 * @access  Public
 */
router.get(
  '/services',
  optionalAuth,
  validate(discoverServicesSchema, 'query'),
  (req, res, next) => discoveryController.searchServices(req, res, next)
);

/**
 * @route   GET /api/v1/discover/needs
 * @desc    Search needs across all businesses
 * @access  Public
 */
router.get(
  '/needs',
  optionalAuth,
  validate(discoverNeedsSchema, 'query'),
  (req, res, next) => discoveryController.searchNeeds(req, res, next)
);

/**
 * @route   POST /api/v1/discover/matches/generate
 * @desc    Explicitly trigger match generation for a business
 * @access  Protected
 */
router.post(
  '/matches/generate',
  authenticate,
  (req, res, next) => discoveryController.generateMatches(req, res, next)
);

/**
 * @route   GET /api/v1/discover/matches/needs/:needId
 * @desc    Get candidate services matching a specific need
 * @access  Protected
 */
router.get(
  '/matches/needs/:needId',
  authenticate,
  validate(matchQuerySchema, 'query'),
  (req, res, next) => discoveryController.getMatchesForNeed(req, res, next)
);

/**
 * @route   GET /api/v1/discover/matches/services/:serviceId
 * @desc    Get candidate needs matching a specific service
 * @access  Protected
 */
router.get(
  '/matches/services/:serviceId',
  authenticate,
  validate(matchQuerySchema, 'query'),
  (req, res, next) => discoveryController.getMatchesForService(req, res, next)
);

module.exports = router;
