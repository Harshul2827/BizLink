const needRepository = require('../repositories/need.repository');
const categoryRepository = require('../repositories/category.repository');
const { NotFoundError, BadRequestError } = require('../errors/AppError');

class NeedService {
  /**
   * Creates a need for a business.
   * @param {number|string} businessId 
   * @param {object} data 
   */
  async createNeed(businessId, data) {
    if (data.category_id) {
      const category = await categoryRepository.findById(data.category_id);
      if (!category) {
        throw new NotFoundError('Category not found', 'CATEGORY_NOT_FOUND');
      }
    }

    return needRepository.create({
      businessId,
      categoryId: data.category_id || null,
      title: data.title,
      budgetMin: data.budget_min ?? null,
      budgetMax: data.budget_max ?? null,
      deadline: data.deadline || null
    });
  }

  /**
   * Retrieves a need by ID.
   * @param {number|string} needId 
   */
  async getNeedById(needId) {
    const need = await needRepository.findById(needId);
    if (!need) {
      throw new NotFoundError('Need not found', 'NEED_NOT_FOUND');
    }
    return need;
  }

  /**
   * Lists all needs for a business.
   * @param {number|string} businessId 
   */
  async getBusinessNeeds(businessId) {
    return needRepository.findByBusinessId(businessId);
  }

  /**
   * Updates a need record.
   * @param {number|string} needId 
   * @param {number|string} businessId 
   * @param {object} updates 
   */
  async updateNeed(needId, businessId, updates) {
    const existing = await needRepository.findById(needId);
    if (!existing || existing.business_id !== parseInt(businessId, 10)) {
      throw new NotFoundError('Need not found for this business', 'NEED_NOT_FOUND');
    }

    if (updates.category_id) {
      const category = await categoryRepository.findById(updates.category_id);
      if (!category) {
        throw new NotFoundError('Category not found', 'CATEGORY_NOT_FOUND');
      }
    }

    return needRepository.update(needId, {
      title: updates.title,
      categoryId: updates.category_id,
      budgetMin: updates.budget_min,
      budgetMax: updates.budget_max,
      deadline: updates.deadline
    });
  }

  /**
   * Deletes a need.
   * @param {number|string} needId 
   * @param {number|string} businessId 
   */
  async deleteNeed(needId, businessId) {
    const existing = await needRepository.findById(needId);
    if (!existing || existing.business_id !== parseInt(businessId, 10)) {
      throw new NotFoundError('Need not found for this business', 'NEED_NOT_FOUND');
    }

    await needRepository.delete(needId);
    return { message: 'Need deleted successfully' };
  }
}

module.exports = new NeedService();
