const businessService = require('../services/business.service');
const categoryService = require('../services/category.service');
const serviceService = require('../services/service.service');
const needService = require('../services/need.service');

class BusinessController {
  // ─── Businesses ─────────────────────────────────────────────────────────────

  /**
   * POST /api/v1/businesses (API-BIZ-001)
   */
  async create(req, res, next) {
    try {
      const business = await businessService.createBusiness(req.user.userId, req.body);
      res.status(201).json({
        success: true,
        data: business
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/businesses/:id (API-BIZ-002)
   */
  async getById(req, res, next) {
    try {
      const business = await businessService.getBusinessProfile(req.params.id);
      res.status(200).json({
        success: true,
        data: business
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/businesses/:id (API-BIZ-003)
   */
  async update(req, res, next) {
    try {
      const updated = await businessService.updateBusiness(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/businesses/user/me
   */
  async getMyBusinesses(req, res, next) {
    try {
      const businesses = await businessService.getUserBusinesses(req.user.userId);
      res.status(200).json({
        success: true,
        data: businesses
      });
    } catch (err) {
      next(err);
    }
  }

  // ─── Business Members ───────────────────────────────────────────────────────

  /**
   * GET /api/v1/businesses/:id/members
   */
  async getMembers(req, res, next) {
    try {
      const members = await businessService.getMembers(req.params.id);
      res.status(200).json({
        success: true,
        data: members
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/businesses/:id/members
   */
  async addMember(req, res, next) {
    try {
      const member = await businessService.addMember(req.params.id, req.body);
      res.status(201).json({
        success: true,
        data: member
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/businesses/:id/members/:userId
   */
  async removeMember(req, res, next) {
    try {
      const result = await businessService.removeMember(req.params.id, req.params.userId);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  // ─── Services ───────────────────────────────────────────────────────────────

  /**
   * POST /api/v1/businesses/:id/services (API-SVC-001)
   */
  async createService(req, res, next) {
    try {
      const service = await serviceService.createService(req.params.id, req.body);
      res.status(201).json({
        success: true,
        data: service
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/businesses/:id/services
   */
  async getBusinessServices(req, res, next) {
    try {
      const services = await serviceService.getBusinessServices(req.params.id, req.query);
      res.status(200).json({
        success: true,
        data: services
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/services/:serviceId
   */
  async getServiceById(req, res, next) {
    try {
      const service = await serviceService.getServiceById(req.params.serviceId);
      res.status(200).json({
        success: true,
        data: service
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/businesses/:id/services/:serviceId
   */
  async updateService(req, res, next) {
    try {
      const updated = await serviceService.updateService(req.params.serviceId, req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/businesses/:id/services/:serviceId
   */
  async deleteService(req, res, next) {
    try {
      const result = await serviceService.deleteService(req.params.serviceId, req.params.id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  // ─── Needs ──────────────────────────────────────────────────────────────────

  /**
   * POST /api/v1/businesses/:id/needs (API-NEED-001)
   */
  async createNeed(req, res, next) {
    try {
      const need = await needService.createNeed(req.params.id, req.body);
      res.status(201).json({
        success: true,
        data: need
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/businesses/:id/needs
   */
  async getBusinessNeeds(req, res, next) {
    try {
      const needs = await needService.getBusinessNeeds(req.params.id);
      res.status(200).json({
        success: true,
        data: needs
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/needs/:needId
   */
  async getNeedById(req, res, next) {
    try {
      const need = await needService.getNeedById(req.params.needId);
      res.status(200).json({
        success: true,
        data: need
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/businesses/:id/needs/:needId
   */
  async updateNeed(req, res, next) {
    try {
      const updated = await needService.updateNeed(req.params.needId, req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/businesses/:id/needs/:needId
   */
  async deleteNeed(req, res, next) {
    try {
      const result = await needService.deleteNeed(req.params.needId, req.params.id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  // ─── Categories ─────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/categories
   */
  async getCategories(req, res, next) {
    try {
      if (req.query.tree === 'true') {
        const tree = await categoryService.getCategoryTree();
        return res.status(200).json({ success: true, data: tree });
      }
      const categories = await categoryService.getAllCategories();
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/categories/:id
   */
  async getCategoryById(req, res, next) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      res.status(200).json({
        success: true,
        data: category
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/categories
   */
  async createCategory(req, res, next) {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json({
        success: true,
        data: category
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BusinessController();
