const crypto = require('crypto');
const bcrypt = require('bcrypt');
const otpRepository = require('../repositories/otp.repository');
const { BadRequestError } = require('../errors/AppError');

const OTP_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

class OtpService {
  /**
   * Generates a cryptographically random 6-digit numeric OTP.
   * @returns {string} 6-digit numeric string (e.g. '481920')
   */
  generateNumericOtp() {
    return crypto.randomInt(100000, 1000000).toString();
  }

  /**
   * Hashes an OTP using bcrypt for safe persistent storage.
   * @param {string} otp 
   * @returns {Promise<string>}
   */
  async hashOtp(otp) {
    return bcrypt.hash(otp, 10);
  }

  /**
   * Generates, stores, and returns a new 6-digit OTP for the given user, email, and purpose.
   * Enforces a 60-second cooldown between generation requests.
   * Invalidates any previously active OTPs for the same purpose.
   */
  async generateAndSaveOtp({ userId, email, purpose }) {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check resend cooldown
    const latestActive = await otpRepository.findLatestActive(normalizedEmail, purpose);
    if (latestActive && latestActive.age_seconds != null && latestActive.age_seconds < RESEND_COOLDOWN_SECONDS) {
      const waitSeconds = Math.max(1, RESEND_COOLDOWN_SECONDS - latestActive.age_seconds);
      const err = new BadRequestError(
        `Please wait ${waitSeconds} seconds before requesting a new code.`,
        'OTP_COOLDOWN'
      );
      err.details = [{ field: 'cooldown', message: `Wait ${waitSeconds}s`, waitSeconds }];
      throw err;
    }

    // 2. Generate random 6-digit OTP and hash it
    const plainOtp = this.generateNumericOtp();
    const otpHash = await this.hashOtp(plainOtp);

    // 3. Save hashed OTP to database
    await otpRepository.create({
      userId,
      email: normalizedEmail,
      otpHash,
      purpose,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
      maxAttempts: MAX_ATTEMPTS
    });

    // Return the plain OTP ONLY to the calling service for email transmission.
    // It is NEVER returned in API responses.
    return {
      otp: plainOtp,
      expiresInMinutes: OTP_EXPIRY_MINUTES
    };
  }

  /**
   * Verifies a submitted OTP against the stored hash.
   * Enforces expiry, single-use, max failed attempts, and purpose matching.
   */
  async verifyOtp({ email, otp, purpose }) {
    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp || '').trim();

    if (!cleanOtp || !/^\d{6}$/.test(cleanOtp)) {
      throw new BadRequestError('Verification code must be a 6-digit number.', 'INVALID_OTP_FORMAT');
    }

    // 1. Find active OTP
    const record = await otpRepository.findLatestActive(normalizedEmail, purpose);
    if (!record) {
      throw new BadRequestError('No active verification code found. Please request a new code.', 'OTP_NOT_FOUND');
    }

    // 2. Check if already consumed
    if (record.consumed_at) {
      throw new BadRequestError('This verification code has already been used. Please request a new code.', 'OTP_ALREADY_USED');
    }

    // 3. Check expiration
    if (record.remaining_seconds != null && record.remaining_seconds <= 0) {
      throw new BadRequestError('Verification code has expired. Please request a new code.', 'OTP_EXPIRED');
    }

    // 4. Check if max attempts reached
    if (record.attempts >= record.max_attempts) {
      await otpRepository.markConsumed(record.otp_id);
      throw new BadRequestError('Maximum verification attempts exceeded. Please request a new code.', 'OTP_MAX_ATTEMPTS_EXCEEDED');
    }

    // 5. Compare submitted OTP with stored hash
    const isMatch = await bcrypt.compare(cleanOtp, record.otp_hash);

    if (!isMatch) {
      await otpRepository.incrementAttempts(record.otp_id);
      const remainingAttempts = record.max_attempts - (record.attempts + 1);

      if (remainingAttempts <= 0) {
        await otpRepository.markConsumed(record.otp_id);
        throw new BadRequestError('Incorrect code. Maximum attempts exceeded. Please request a new code.', 'OTP_MAX_ATTEMPTS_EXCEEDED');
      }

      const err = new BadRequestError(
        `Incorrect verification code. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`,
        'INVALID_OTP'
      );
      err.details = [{ field: 'otp', message: `Incorrect code (${remainingAttempts} attempts left)`, remainingAttempts }];
      throw err;
    }

    // 6. Valid OTP — Mark consumed and return authorized user details
    await otpRepository.markConsumed(record.otp_id);

    return {
      success: true,
      userId: record.user_id,
      email: record.email,
      purpose: record.purpose
    };
  }
}

module.exports = new OtpService();

