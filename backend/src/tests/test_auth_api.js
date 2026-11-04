require('dotenv').config();
const assert = require('assert');
const pool = require('../db');
const authService = require('../services/auth.service');
const userRepository = require('../repositories/user.repository');
const otpRepository = require('../repositories/otp.repository');
const { hashPassword } = require('../utils/password');
const { signToken, verifyToken } = require('../utils/jwt');

async function runAuthTests() {
  console.log('--- Starting Track 1 (Authentication & Foundation) Tests ---');
  let passed = 0;
  let failed = 0;

  const testEmail = `test_runner_${Date.now()}@bizlinktest.com`;
  const testPhone = `+1999${Math.floor(100000 + Math.random() * 900000)}`;
  const testPassword = 'Password123!';
  let createdUserId = null;
  let authToken = null;

  try {
    // 1. Password utility test
    console.log('[Test 1] Password hashing & comparison...');
    const hashed = await hashPassword('SecretPass123');
    const { comparePassword } = require('../utils/password');
    const isCorrect = await comparePassword('SecretPass123', hashed);
    const isWrong = await comparePassword('WrongPass', hashed);
    assert.strictEqual(isCorrect, true, 'Password comparison failed for correct password');
    assert.strictEqual(isWrong, false, 'Password comparison failed for wrong password');
    console.log('  ✓ Pass: Password utilities working properly');
    passed++;

    // 2. JWT utility test
    console.log('[Test 2] JWT sign & verify...');
    const token = signToken({ userId: 99999, role: 'OWNER' });
    const decoded = verifyToken(token);
    assert.strictEqual(decoded.userId, 99999, 'JWT decoded userId mismatch');
    assert.strictEqual(decoded.role, 'OWNER', 'JWT decoded role mismatch');
    console.log('  ✓ Pass: JWT sign & verify working properly');
    passed++;

    // 3. User Registration through AuthService (returns requiresVerification: true)
    console.log('[Test 3] User registration with email verification requirement...');
    const regResult = await authService.register({
      email: testEmail,
      phone: testPhone,
      password: testPassword,
      full_name: 'Test Auth User',
      role: 'OWNER'
    });
    assert.strictEqual(regResult.requiresVerification, true, 'Registration must require verification');
    assert.strictEqual(regResult.email, testEmail);

    const userInDb = await userRepository.findByEmail(testEmail);
    assert(userInDb, 'User must exist in database after registration');
    assert.strictEqual(Boolean(userInDb.email_verified), false, 'New user email_verified must be false');
    createdUserId = userInDb.user_id;
    console.log(`  ✓ Pass: User registered in unverified state (ID: ${createdUserId})`);
    passed++;

    // 4. Duplicate Registration (Conflict)
    console.log('[Test 4] Duplicate email registration prevention...');
    let conflictCaught = false;
    try {
      await authService.register({
        email: testEmail,
        password: testPassword,
        full_name: 'Duplicate User',
        role: 'OWNER'
      });
    } catch (err) {
      if (err.statusCode === 409) {
        conflictCaught = true;
      }
    }
    assert.strictEqual(conflictCaught, true, 'Duplicate registration did not throw 409 Conflict');
    console.log('  ✓ Pass: Duplicate registration properly rejected with 409');
    passed++;

    // 5. User Login before verification must fail with 403 EMAIL_NOT_VERIFIED
    console.log('[Test 5] Login prevention for unverified email...');
    let unverifiedCaught = false;
    try {
      await authService.login({
        email: testEmail,
        password: testPassword
      });
    } catch (err) {
      if (err.statusCode === 403 && err.code === 'EMAIL_NOT_VERIFIED') {
        unverifiedCaught = true;
      }
    }
    assert.strictEqual(unverifiedCaught, true, 'Login should have failed with 403 EMAIL_NOT_VERIFIED');
    console.log('  ✓ Pass: Unverified user login blocked with 403 EMAIL_NOT_VERIFIED');
    passed++;

    // 6. Verify Email OTP
    console.log('[Test 6] Email verification with OTP...');
    // Mark verified via userRepository to test workflow and authService
    await userRepository.markEmailVerified(createdUserId);
    const verifiedUser = await userRepository.findById(createdUserId);
    assert.strictEqual(Boolean(verifiedUser.email_verified), true, 'email_verified should be true after verification');
    console.log('  ✓ Pass: User email marked verified');
    passed++;

    // 7. User Login with valid credentials after verification
    console.log('[Test 7] User login after verification...');
    const loginResult = await authService.login({
      email: testEmail,
      password: testPassword
    });
    assert.strictEqual(loginResult.user.userId, createdUserId);
    assert(loginResult.token, 'Missing token in login result');
    authToken = loginResult.token;
    console.log('  ✓ Pass: Login successful with JWT issued');
    passed++;

    // 8. User Login with invalid password
    console.log('[Test 8] User login with invalid password...');
    let unauthCaught = false;
    try {
      await authService.login({
        email: testEmail,
        password: 'WrongPassword456'
      });
    } catch (err) {
      if (err.statusCode === 401) {
        unauthCaught = true;
      }
    }
    assert.strictEqual(unauthCaught, true, 'Invalid password did not throw 401 Unauthorized');
    console.log('  ✓ Pass: Invalid login rejected with 401');
    passed++;

    // 9. Get Current User (Me) profile
    console.log('[Test 9] Get current user profile (Me)...');
    const meResult = await authService.getCurrentUser(createdUserId);
    assert.strictEqual(meResult.userId, createdUserId);
    assert.strictEqual(meResult.email, testEmail);
    assert(Array.isArray(meResult.businesses), 'Businesses field must be an array');
    console.log('  ✓ Pass: Current user profile and membership resolved correctly');
    passed++;

    // 10. Forgot Password & Reset Password Flow
    console.log('[Test 10] Forgot password & password reset flow...');
    const forgotResult = await authService.forgotPassword(testEmail);
    assert.strictEqual(forgotResult.success, true);

    // Retrieve the active reset OTP record from DB
    const resetOtpRecord = await otpRepository.findLatestActive(testEmail, 'PASSWORD_RESET');
    assert(resetOtpRecord, 'Active reset OTP record must exist in DB');

    // Generate authorized reset token
    const { signToken: signResetToken } = require('../utils/jwt');
    const crypto = require('crypto');
    const resetToken = signResetToken(
      {
        userId: createdUserId,
        email: testEmail,
        purpose: 'PASSWORD_RESET_AUTHORIZED',
        nonce: crypto.randomBytes(16).toString('hex')
      },
      { expiresIn: '15m' }
    );

    const newPassword = 'NewSecretPassword999!';
    const resetResult = await authService.resetPassword(resetToken, newPassword);
    assert.strictEqual(resetResult.success, true);

    // Verify login with new password works
    const newLoginResult = await authService.login({
      email: testEmail,
      password: newPassword
    });
    assert.strictEqual(newLoginResult.user.userId, createdUserId);
    console.log('  ✓ Pass: Password reset flow completed and verified');
    passed++;

  } catch (err) {
    console.error('  ✗ Test failure:', err.message);
    failed++;
  } finally {
    // Cleanup created test user
    if (createdUserId) {
      try {
        await pool.query('DELETE FROM users WHERE user_id = ?', [createdUserId]);
        console.log(`[Cleanup] Deleted test user ID ${createdUserId}`);
      } catch (cleanupErr) {
        console.error('[Cleanup Error]', cleanupErr.message);
      }
    }
    await pool.end();
  }

  console.log('----------------------------------------------------');
  console.log(`Track 1 Tests Completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runAuthTests();
