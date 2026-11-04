const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationOtpSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resendResetOtpSchema,
  resetPasswordSchema
} = require('../validators/auth.validator');

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user account (unverified) & send verification OTP
 * @access  Public
 */
router.post('/register', validate(registerSchema), (req, res, next) => authController.register(req, res, next));

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify 6-digit registration OTP to activate account
 * @access  Public
 */
router.post('/verify-email', validate(verifyEmailSchema), (req, res, next) => authController.verifyEmail(req, res, next));

/**
 * @route   POST /api/v1/auth/resend-verification-otp
 * @desc    Resend registration verification OTP with 60s cooldown
 * @access  Public
 */
router.post('/resend-verification-otp', validate(resendVerificationOtpSchema), (req, res, next) => authController.resendVerificationOtp(req, res, next));

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and return JWT (blocked for unverified emails)
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
 * @desc    Initiate password reset process (enumeration-safe, sends 6-digit OTP)
 * @access  Public
 */
router.post('/forgot-password', validate(forgotPasswordSchema), (req, res, next) => authController.forgotPassword(req, res, next));

/**
 * @route   POST /api/v1/auth/verify-reset-otp
 * @desc    Verify password reset OTP and receive short-lived single-use reset token
 * @access  Public
 */
router.post('/verify-reset-otp', validate(verifyResetOtpSchema), (req, res, next) => authController.verifyResetOtp(req, res, next));

/**
 * @route   POST /api/v1/auth/resend-reset-otp
 * @desc    Resend password reset OTP with 60s cooldown
 * @access  Public
 */
router.post('/resend-reset-otp', validate(resendResetOtpSchema), (req, res, next) => authController.resendResetOtp(req, res, next));

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Complete password reset with authorized single-use reset token
 * @access  Public
 */
router.post('/reset-password', validate(resetPasswordSchema), (req, res, next) => authController.resetPassword(req, res, next));

module.exports = router;
