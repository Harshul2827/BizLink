const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require('../validators/auth.validator');

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
router.post('/register', validate(registerSchema), (req, res, next) => authController.register(req, res, next));

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and return JWT
 * @access  Public
 */
router.post('/login', validate(loginSchema), (req, res, next) => authController.login(req, res, next));

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Log out current user
 * @access  Protected
 */
router.post('/logout', authenticate, (req, res, next) => authController.logout(req, res, next));

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get currently authenticated user's profile and businesses
 * @access  Protected
 */
router.get('/me', authenticate, (req, res, next) => authController.me(req, res, next));

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Initiate password reset process
 * @access  Public
 */
router.post('/forgot-password', validate(forgotPasswordSchema), (req, res, next) => authController.forgotPassword(req, res, next));

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Complete password reset with token
 * @access  Public
 */
router.post('/reset-password', validate(resetPasswordSchema), (req, res, next) => authController.resetPassword(req, res, next));

module.exports = router;
