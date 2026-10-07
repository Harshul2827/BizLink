const businessRepository = require('../repositories/business.repository');
const { ForbiddenError, NotFoundError, UnauthorizedError } = require('../errors/AppError');

/**
 * Middleware factory to enforce business membership and roles.
 * @param {'ANY'|'ADMIN'|'OWNER'} minimumRole - Required permission level in the business
 * @param {string} paramKey - Key in req.params containing businessId (default: 'id' or 'businessId')
 */
function requireBusinessRole(minimumRole = 'ANY', paramKey = 'id') {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError('Authentication required'));
      }

      // Platform admins have full administrative access
      if (req.user.role === 'ADMIN') {
        const businessId = req.params[paramKey] || req.params.businessId || req.params.id;
        const business = await businessRepository.findById(businessId);
        if (!business) {
          return next(new NotFoundError('Business not found', 'BUSINESS_NOT_FOUND'));
        }
        req.business = business;
        req.businessMembership = { isOwner: true, isMember: true, memberRole: 'ADMIN' };
        return next();
      }

      const businessId = req.params[paramKey] || req.params.businessId || req.params.id;
      if (!businessId) {
        return next(new NotFoundError('Business ID is missing in route parameters'));
      }

      const business = await businessRepository.findById(businessId);
      if (!business) {
        return next(new NotFoundError('Business not found', 'BUSINESS_NOT_FOUND'));
      }

      const membership = await businessRepository.getUserMembership(businessId, req.user.userId);
      if (!membership || !membership.isMember) {
        return next(new ForbiddenError('You are not a member of this business', 'FORBIDDEN_BUSINESS_ACCESS'));
      }

      if (minimumRole === 'OWNER' && !membership.isOwner) {
        return next(new ForbiddenError('Only the business owner can perform this action', 'FORBIDDEN_NOT_OWNER'));
      }

      if (minimumRole === 'ADMIN' && !membership.isOwner && membership.memberRole !== 'ADMIN') {
        return next(new ForbiddenError('Business admin privileges required', 'FORBIDDEN_NOT_ADMIN'));
      }

      req.business = business;
      req.businessMembership = membership;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  requireBusinessRole
};
