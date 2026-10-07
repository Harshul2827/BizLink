const userRepository = require('../repositories/user.repository');
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
   * Registers a new user.
   * @param {object} param0 
   * @returns {Promise<{ user: object, token: string }>}
   */
  async register({ email, phone, password, full_name, role, avatar_url }) {
    const existingUserByEmail = await userRepository.findByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictError('An account with this email address already exists', 'EMAIL_ALREADY_EXISTS');
    }

    if (phone) {
      const existingUserByPhone = await userRepository.findByPhone(phone);
      if (existingUserByPhone) {
        throw new ConflictError('An account with this phone number already exists', 'PHONE_ALREADY_EXISTS');
      }
    }

    const passwordHash = await hashPassword(password);
    const createdUser = await userRepository.create({
      email,
      phone,
      passwordHash,
      fullName: full_name,
      role,
      avatarUrl: avatar_url
    });

    const token = signToken({
      userId: createdUser.user_id,
      email: createdUser.email,
      role: createdUser.role
    });

    return {
      user: {
        userId: createdUser.user_id,
        email: createdUser.email,
        phone: createdUser.phone,
        fullName: createdUser.full_name,
        role: createdUser.role,
        status: createdUser.status,
        avatarUrl: createdUser.avatar_url
      },
      token
    };
  }

  /**
   * Authenticates a user with email and password.
   * @param {object} param0 
   * @returns {Promise<{ user: object, token: string }>}
   */
  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
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
        avatarUrl: user.avatar_url,
        lastLoginAt: user.last_login_at
      },
      token
    };
  }

  /**
   * Retrieves profile and associated businesses for current authenticated user.
   * @param {number|string} userId 
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

  /**
   * Enumeration-safe forgot password request.
   * Generates a password reset token for valid accounts.
   * @param {string} email 
   */
  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (user && user.status === 'ACTIVE') {
      const resetToken = signToken(
        { userId: user.user_id, type: 'PASSWORD_RESET' },
        { expiresIn: '1h' }
      );
      // In production, send email with reset link. In dev, token can be used in reset-password endpoint.
      return {
        message: 'If an account with that email exists, password reset instructions have been generated.',
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      };
    }

    return {
      message: 'If an account with that email exists, password reset instructions have been generated.'
    };
  }

  /**
   * Resets user password using a valid reset token.
   * @param {string} token 
   * @param {string} newPassword 
   */
  async resetPassword(token, newPassword) {
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      throw new BadRequestError('Invalid or expired password reset token', 'INVALID_RESET_TOKEN');
    }

    if (decoded.type !== 'PASSWORD_RESET') {
      throw new BadRequestError('Invalid token type provided', 'INVALID_TOKEN_TYPE');
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    const passwordHash = await hashPassword(newPassword);
    await userRepository.updatePassword(user.user_id, passwordHash);

    return {
      message: 'Password has been successfully updated. You may now log in.'
    };
  }
}

module.exports = new AuthService();
