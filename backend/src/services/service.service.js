const serviceRepository = require('../repositories/service.repository');
const categoryRepository = require('../repositories/category.repository');
const { NotFoundError, BadRequestError } = require('../errors/AppError');

class ServiceService {
  /**
   * Creates a service offering for a business.
   * @param {number|string} businessId 
   * @param {object} data 
   */
  async createService(businessId, data) {
    if (data.category_id) {
      const category = await categoryRepository.findById(data.category_id);
      if (!category) {
        throw new NotFoundError('Category not found', 'CATEGORY_NOT_FOUND');
      }
    }

    return serviceRepository.create({
      businessId,
      categoryId: data.category_id || null,
      title: data.title,
      priceMin: data.price_min ?? null,
      priceMax: data.price_max ?? null,
      status: data.status || 'ACTIVE'
    });
  }

  /**
   * Retrieves a service by ID.
   * @param {number|string} serviceId 
   */
  async getServiceById(serviceId) {
    const service = await serviceRepository.findById(serviceId);
    if (!service) {
      throw new NotFoundError('Service not found', 'SERVICE_NOT_FOUND');
    }
    return service;
  }

  /**
   * Lists all services for a business.
   * @param {number|string} businessId 
   * @param {object} options 
   */
  async getBusinessServices(businessId, options = {}) {
    return serviceRepository.findByBusinessId(businessId, options);
  }

  /**
   * Updates a service record.
   * @param {number|string} serviceId 
   * @param {number|string} businessId 
   * @param {object} updates 
   */
  async updateService(serviceId, businessId, updates) {
    const existing = await serviceRepository.findById(serviceId);
    if (!existing || existing.business_id !== parseInt(businessId, 10)) {
      throw new NotFoundError('Service not found for this business', 'SERVICE_NOT_FOUND');
    }

    if (updates.category_id) {
      const category = await categoryRepository.findById(updates.category_id);
      if (!category) {
        throw new NotFoundError('Category not found', 'CATEGORY_NOT_FOUND');
      }
    }

    return serviceRepository.update(serviceId, {
      title: updates.title,
      categoryId: updates.category_id,
      priceMin: updates.price_min,
      priceMax: updates.price_max,
      status: updates.status
    });
  }

  /**
   * Deletes a service offering.
   * @param {number|string} serviceId 
   * @param {number|string} businessId 
   */
  async deleteService(serviceId, businessId) {
    const existing = await serviceRepository.findById(serviceId);
    if (!existing || existing.business_id !== parseInt(businessId, 10)) {
      throw new NotFoundError('Service not found for this business', 'SERVICE_NOT_FOUND');
    }

    await serviceRepository.delete(serviceId);
    return { message: 'Service deleted successfully' };
  }
}

module.exports = new ServiceService();
