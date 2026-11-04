const crypto = require('crypto');
const userRepository = require('../repositories/user.repository');
const otpService = require('./otp.service');
const emailService = require('./email.service');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken, verifyToken } = require('../utils/jwt');
const { 
  ConflictError, 
  UnauthorizedError, 
  ForbiddenError, 
  NotFoundError, 
  BadRequestError 
} = require('../errors/AppError');

class AuthService {
  /**
   * Registers a new user account in an unverified state and sends a 6-digit verification OTP.
   * @param {object} param0 
   * @returns {Promise<{ requiresVerification: boolean, email: string, message: string }>}
   */
  async register({ email, phone, password, full_name, role, avatar_url }) {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check duplicate email
    const existingUserByEmail = await userRepository.findByEmail(normalizedEmail);
    if (existingUserByEmail) {
      throw new ConflictError('An account with this email address already exists', 'EMAIL_ALREADY_EXISTS');
    }

    // 2. Check duplicate phone if provided
    if (phone) {
      const existingUserByPhone = await userRepository.findByPhone(phone);
      if (existingUserByPhone) {
        throw new ConflictError('An account with this phone number already exists', 'PHONE_ALREADY_EXISTS');
      }
    }

    // 3. Hash password and persist user with email_verified = FALSE
    const passwordHash = await hashPassword(password);
    const createdUser = await userRepository.create({
      email: normalizedEmail,
      phone,
      passwordHash,
      fullName: full_name,
      role,
      avatarUrl: avatar_url,
      emailVerified: false
    });

    // 4. Generate and store 6-digit hashed OTP
    const { otp, expiresInMinutes } = await otpService.generateAndSaveOtp({
      userId: createdUser.user_id,
      email: createdUser.email,
      purpose: 'EMAIL_VERIFICATION'
    });

    // 5. Send verification OTP email (fails gracefully with descriptive error if delivery fails)
    let emailSent = false;
    try {
      const mailRes = await emailService.sendVerificationEmail(createdUser.email, otp, createdUser.full_name);
      emailSent = Boolean(mailRes && mailRes.success);
    } catch (emailErr) {
      emailSent = false;
      console.warn(`[WARNING] Verification email delivery error for ${createdUser.email}:`, emailErr.message);
      // In development mode, log notice so developer is unblocked if SMTP is not configured
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n==================================================`);
        console.log(`[DEV OTP NOTIFICATION] Email: ${createdUser.email}`);
        console.log(`[DEV OTP NOTIFICATION] 6-digit verification code: ${otp}`);
        console.log(`==================================================\n`);
      }
    }

    return {
      requiresVerification: true,
      user: {
        userId: createdUser.user_id,
        email: createdUser.email,
        fullName: createdUser.full_name,
        role: createdUser.role,
        emailVerified: false
      },
      email: createdUser.email,
      emailSent,
      devOtp: (process.env.NODE_ENV === 'development' && (!emailSent || !emailService.isConfigured)) ? otp : undefined,
      message: `Account created. A 6-digit verification code has been dispatched to ${createdUser.email}.`
    };
  }

  /**
   * Verifies the 6-digit OTP submitted by the user and activates the account.
   */
  async verifyEmail({ email, otp }) {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Verify OTP against stored hash (checks expiry, single-use, max attempts)
    const verification = await otpService.verifyOtp({
      email: normalizedEmail,
      otp,
      purpose: 'EMAIL_VERIFICATION'
    });

    // 2. Mark account as verified in MySQL
    await userRepository.markEmailVerified(verification.userId);

    const user = await userRepository.findById(verification.userId);

    return {
      verified: true,
      email: user.email,
      message: 'Your email address has been successfully verified. You may now log in.'
    };
  }

  /**
   * Generates and dispatches a new verification OTP subject to the 60s cooldown.
   */
  async resendVerificationOtp(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await userRepository.findByEmail(normalizedEmail);

    if (!user) {
      throw new NotFoundError('No account found with this email address.', 'USER_NOT_FOUND');
    }

    if (user.email_verified) {
      throw new BadRequestError('This email address is already verified. You can log in directly.', 'ALREADY_VERIFIED');
    }

    const { otp } = await otpService.generateAndSaveOtp({
      userId: user.user_id,
      email: user.email,
      purpose: 'EMAIL_VERIFICATION'
    });

    let emailSent = false;
    try {
      const mailRes = await emailService.sendVerificationEmail(user.email, otp, user.full_name);
      emailSent = Boolean(mailRes && mailRes.success);
    } catch (emailErr) {
      emailSent = false;
      console.warn(`[WARNING] Resend verification email failed for ${user.email}:`, emailErr.message);
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n==================================================`);
        console.log(`[DEV OTP NOTIFICATION] Email: ${user.email}`);
        console.log(`[DEV OTP NOTIFICATION] Resent verification code: ${otp}`);
        console.log(`==================================================\n`);
      }
    }

    return {
      success: true,
      emailSent,
      devOtp: (process.env.NODE_ENV === 'development' && (!emailSent || !emailService.isConfigured)) ? otp : undefined,
      message: 'A fresh 6-digit verification code has been sent to your email.'
    };
  }

  /**
   * Authenticates a user with email and password.
   * Blocks unverified accounts from obtaining a JWT session token.
   */
  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await userRepository.findByEmail(normalizedEmail);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (user.status === 'SUSPENDED') {
      throw new ForbiddenError('Your account has been suspended. Please contact support.', 'ACCOUNT_SUSPENDED');
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Strict Enforcement: Email MUST be verified before issuing JWT session token
    if (!user.email_verified) {
      const err = new ForbiddenError(
        'Your email address has not been verified. Please verify your email before logging in.',
        'EMAIL_NOT_VERIFIED'
      );
      err.details = [{ field: 'email', message: 'Email not verified', email: user.email, requiresVerification: true }];
      throw err;
    }

    await userRepository.updateLastLogin(user.user_id);

    const token = signToken({
      userId: user.user_id,
      email: user.email,
      role: user.role
    });

    return {
      user: {
        userId: user.user_id,
        email: user.email,
        phone: user.phone,
        fullName: user.full_name,
        role: user.role,
        status: user.status,
        emailVerified: user.email_verified,
        avatarUrl: user.avatar_url,
        lastLoginAt: user.last_login_at
      },
      token
    };
  }

  /**
   * Initiates password recovery.
   * Generic response prevents account enumeration attacks.
   */
  async forgotPassword(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await userRepository.findByEmail(normalizedEmail);

    let generatedOtp = null;
    let emailSent = false;
    if (user && user.status === 'ACTIVE') {
      try {
        const { otp } = await otpService.generateAndSaveOtp({
          userId: user.user_id,
          email: user.email,
          purpose: 'PASSWORD_RESET'
        });
        generatedOtp = otp;

        const mailRes = await emailService.sendPasswordResetEmail(user.email, otp, user.full_name);
        emailSent = Boolean(mailRes && mailRes.success);
      } catch (err) {
        emailSent = false;
        // Enforce cooldown if triggered
        if (err.code === 'OTP_COOLDOWN') {
          throw err;
        }
        console.warn(`[WARNING] Password reset email failure for ${normalizedEmail}:`, err.message);
        if (process.env.NODE_ENV === 'development' && generatedOtp) {
          console.log(`\n==================================================`);
          console.log(`[DEV OTP NOTIFICATION] Password Reset Email: ${user.email}`);
          console.log(`[DEV OTP NOTIFICATION] 6-digit reset code: ${generatedOtp}`);
          console.log(`==================================================\n`);
        }
      }
    }

    return {
      success: true,
      emailSent,
      devOtp: (process.env.NODE_ENV === 'development' && (!emailSent || !emailService.isConfigured)) ? generatedOtp : undefined,
      message: 'We have received your request. If an account exists with this email address, you will receive a password reset OTP shortly.'
    };
  }

  /**
   * Verifies the 6-digit password reset OTP and returns a short-lived single-use reset authorization token.
   */
  async verifyResetOtp({ email, otp }) {
    const normalizedEmail = email.toLowerCase().trim();

    const verification = await otpService.verifyOtp({
      email: normalizedEmail,
      otp,
      purpose: 'PASSWORD_RESET'
    });

    // Generate narrow single-use JWT reset token valid for 15 minutes
    const resetToken = signToken(
      {
        userId: verification.userId,
        email: verification.email,
        purpose: 'PASSWORD_RESET_AUTHORIZED',
        nonce: crypto.randomBytes(16).toString('hex')
      },
      { expiresIn: '15m' }
    );

    return {
      success: true,
      resetToken,
      message: 'Verification code accepted. Please enter your new password.'
    };
  }

  /**
   * Resends password reset OTP subject to 60s cooldown.
   */
  async resendResetOtp(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await userRepository.findByEmail(normalizedEmail);

    let generatedOtp = null;
    let emailSent = false;
    if (user && user.status === 'ACTIVE') {
      const { otp } = await otpService.generateAndSaveOtp({
        userId: user.user_id,
        email: user.email,
        purpose: 'PASSWORD_RESET'
      });
      generatedOtp = otp;

      try {
        const mailRes = await emailService.sendPasswordResetEmail(user.email, otp, user.full_name);
        emailSent = Boolean(mailRes && mailRes.success);
      } catch (err) {
        emailSent = false;
        console.warn(`[WARNING] Resend reset email failed:`, err.message);
        if (process.env.NODE_ENV === 'development') {
          console.log(`\n==================================================`);
          console.log(`[DEV OTP NOTIFICATION] Resent Reset Code: ${otp}`);
          console.log(`==================================================\n`);
        }
      }
    }

    return {
      success: true,
      emailSent,
      devOtp: (process.env.NODE_ENV === 'development' && (!emailSent || !emailService.isConfigured)) ? generatedOtp : undefined,
      message: 'If an account exists with this email address, a new code has been sent.'
    };
  }

  /**
   * Resets user password using the authorized single-use reset token.
   */
  async resetPassword(token, newPassword) {
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      throw new BadRequestError('Invalid or expired password reset authorization. Please restart the reset process.', 'INVALID_RESET_TOKEN');
    }

    if (decoded.purpose !== 'PASSWORD_RESET_AUTHORIZED') {
      throw new BadRequestError('Invalid authorization token provided for password reset.', 'INVALID_TOKEN_TYPE');
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      throw new NotFoundError('User account not found.', 'USER_NOT_FOUND');
    }

    const passwordHash = await hashPassword(newPassword);
    await userRepository.updatePassword(user.user_id, passwordHash);

    return {
      success: true,
      message: 'Your password has been successfully updated. You may now log in with your new password.'
    };
  }

  /**
   * Retrieves profile and associated businesses for current authenticated user.
   */
  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    const businesses = await userRepository.getUserBusinesses(userId);

    return {
      userId: user.user_id,
      email: user.email,
      phone: user.phone,
      fullName: user.full_name,
      role: user.role,
      status: user.status,
      emailVerified: user.email_verified,
      avatarUrl: user.avatar_url,
      lastLoginAt: user.last_login_at,
      createdAt: user.created_at,
      businesses: businesses.map(b => ({
        businessId: b.business_id,
        name: b.name,
        slug: b.slug,
        status: b.status,
        city: b.city,
        state: b.state,
        country: b.country,
        role: b.user_business_role
      }))
    };
  }
}

module.exports = new AuthService();
