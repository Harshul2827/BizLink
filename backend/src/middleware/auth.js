const { verifyToken } = require('../utils/jwt');
const { UnauthorizedError, ForbiddenError } = require('../errors/AppError');
const userRepository = require('../repositories/user.repository');

/**
 * Middleware to authenticate requests using JWT Bearer token.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Authentication token is missing or malformed'));
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new UnauthorizedError('Authentication token has expired', 'TOKEN_EXPIRED'));
      }
      return next(new UnauthorizedError('Invalid authentication token', 'INVALID_TOKEN'));
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      return next(new UnauthorizedError('User account not found', 'USER_NOT_FOUND'));
    }

    if (user.status === 'SUSPENDED') {
      return next(new ForbiddenError('User account has been suspended', 'ACCOUNT_SUSPENDED'));
    }

    req.user = {
      userId: user.user_id,
      email: user.email,
      phone: user.phone,
      fullName: user.full_name,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatar_url
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware to restrict route access by user role.
 * @param  {...string} roles - Permitted roles (e.g. 'ADMIN', 'OWNER', 'PARTNER')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action', 'FORBIDDEN_ROLE'));
    }

    next();
  };
}

/**
 * Middleware for optional authentication. Attaches user if valid token exists, proceeds regardless.
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = verifyToken(token);
        const user = await userRepository.findById(decoded.userId);
        if (user && user.status === 'ACTIVE') {
          req.user = {
            userId: user.user_id,
            email: user.email,
            phone: user.phone,
            fullName: user.full_name,
            role: user.role,
            status: user.status,
            avatarUrl: user.avatar_url
          };
        }
      } catch (e) {
        // Ignore invalid token in optional mode
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  authenticate,
  requireRole,
  optionalAuth
};
