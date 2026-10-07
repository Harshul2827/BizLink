const businessRepository = require('../repositories/business.repository');
const categoryRepository = require('../repositories/category.repository');
const userRepository = require('../repositories/user.repository');
const serviceRepository = require('../repositories/service.repository');
const needRepository = require('../repositories/need.repository');
const { NotFoundError, BadRequestError, ForbiddenError, ConflictError } = require('../errors/AppError');

class BusinessService {
  /**
   * Generates a URL-friendly slug.
   * @param {string} name 
   * @returns {string}
   */
  generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Creates a new business and associates the current user as owner/admin.
   * @param {number|string} userId 
   * @param {object} data 
   */
  async createBusiness(userId, data) {
    if (data.primary_category_id) {
      const category = await categoryRepository.findById(data.primary_category_id);
      if (!category) {
        throw new NotFoundError('Primary category not found', 'CATEGORY_NOT_FOUND');
      }
    }

    let baseSlug = this.generateSlug(data.name);
    let slug = baseSlug;
    let counter = 1;

    while (await businessRepository.findBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return businessRepository.createWithMembership({
      ownerUserId: userId,
      name: data.name,
      slug,
      description: data.description || null,
      city: data.city || null,
      state: data.state || null,
      country: data.country || null,
      primaryCategoryId: data.primary_category_id || null,
      status: 'UNVERIFIED'
    });
  }

  /**
   * Retrieves full business profile including services, needs, and members.
   * @param {number|string} businessId 
   */
  async getBusinessProfile(businessId) {
    const business = await businessRepository.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business not found', 'BUSINESS_NOT_FOUND');
    }

    const [services, needs, members] = await Promise.all([
      serviceRepository.findByBusinessId(businessId, { status: 'ACTIVE' }),
      needRepository.findByBusinessId(businessId),
      businessRepository.getMembers(businessId)
    ]);

    return {
      ...business,
      services,
      needs,
      members
    };
  }

  /**
   * Updates business profile fields.
   * @param {number|string} businessId 
   * @param {object} updates 
   */
  async updateBusiness(businessId, updates) {
    const business = await businessRepository.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business not found', 'BUSINESS_NOT_FOUND');
    }

    if (updates.primary_category_id) {
      const category = await categoryRepository.findById(updates.primary_category_id);
      if (!category) {
        throw new NotFoundError('Category not found', 'CATEGORY_NOT_FOUND');
      }
    }

    return businessRepository.update(businessId, {
      name: updates.name,
      description: updates.description,
      city: updates.city,
      state: updates.state,
      country: updates.country,
      primaryCategoryId: updates.primary_category_id,
      status: updates.status
    });
  }

  /**
   * Lists all businesses for a user.
   * @param {number|string} userId 
   */
  async getUserBusinesses(userId) {
    return businessRepository.findUserBusinesses(userId);
  }

  /**
   * Lists members of a business.
   * @param {number|string} businessId 
   */
  async getMembers(businessId) {
    return businessRepository.getMembers(businessId);
  }

  /**
   * Adds or updates a member in the business.
   * @param {number|string} businessId 
   * @param {object} data 
   */
  async addMember(businessId, { user_id, member_role = 'STAFF' }) {
    const user = await userRepository.findById(user_id);
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    const business = await businessRepository.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business not found', 'BUSINESS_NOT_FOUND');
    }

    if (business.owner_user_id === user_id) {
      throw new ConflictError('User is already the primary owner of this business', 'USER_ALREADY_OWNER');
    }

    return businessRepository.addMember(businessId, user_id, member_role);
  }

  /**
   * Removes a member from a business.
   * @param {number|string} businessId 
   * @param {number|string} userId 
   */
  async removeMember(businessId, userId) {
    const business = await businessRepository.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business not found', 'BUSINESS_NOT_FOUND');
    }

    if (business.owner_user_id === parseInt(userId, 10)) {
      throw new BadRequestError('Cannot remove primary owner from business', 'CANNOT_REMOVE_OWNER');
    }

    const removed = await businessRepository.removeMember(businessId, userId);
    if (!removed) {
      throw new NotFoundError('User is not a member of this business', 'MEMBER_NOT_FOUND');
    }

    return { message: 'Member removed successfully' };
  }
}

module.exports = new BusinessService();
