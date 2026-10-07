const matchRepository = require('../repositories/match.repository');
const matchingEngine = require('./matching.engine');
const { NotFoundError, BadRequestError } = require('../errors/AppError');
const pool = require('../db');

class MatchService {
  /**
   * Generates and saves matches for a specific need against all eligible candidate services.
   * @param {number|string} needId 
   * @returns {Promise<number>} Number of matches generated
   */
  async generateMatchesForNeed(needId) {
    const need = await matchRepository.getNeedWithBusiness(needId);
    if (!need) {
      throw new NotFoundError('Need not found', 'NEED_NOT_FOUND');
    }

    const candidateServices = await matchRepository.getCandidateServicesForNeed(need.business_id);
    const matchesToSave = [];

    for (const service of candidateServices) {
      const evaluation = matchingEngine.evaluateNeedAndService(need, service);
      if (evaluation.score > 0) { // Only save if there's some level of compatibility
        matchesToSave.push({
          needId: need.need_id,
          serviceId: service.service_id,
          score: evaluation.score,
          explanations: evaluation.explanations, // In a real app, we might persist explanations or recompute them on the fly
          factors: evaluation.factors
        });
      }
    }

    await matchRepository.saveMatches(matchesToSave);
    return matchesToSave.length;
  }

  /**
   * Generates and saves matches for all needs of a specific business.
   * @param {number|string} businessId 
   * @returns {Promise<number>} Total matches generated
   */
  async generateMatchesForBusiness(businessId) {
    const needs = await matchRepository.getNeedsByBusinessId(businessId);
    let totalMatches = 0;

    for (const need of needs) {
      const count = await this.generateMatchesForNeed(need.need_id);
      totalMatches += count;
    }

    return totalMatches;
  }

  /**
   * Retrieves paginated matches for a specific need.
   * @param {number|string} needId 
   * @param {object} query - minScore, limit
   */
  async getMatchesForNeed(needId, { minScore = 0.3, limit = 20 }) {
    // We re-join to get fresh explanations and details
    const [rows] = await pool.query(
      `SELECT 
         m.match_id, m.score, m.generated_at,
         s.service_id, s.title AS service_title, s.price_min, s.price_max, s.status AS service_status,
         b.business_id, b.name AS business_name, b.slug AS business_slug, b.city, b.state, b.country, b.status AS business_status,
         c.name AS category_name
       FROM matches m
       JOIN services s ON m.service_id = s.service_id
       JOIN businesses b ON s.business_id = b.business_id
       LEFT JOIN categories c ON s.category_id = c.category_id
       WHERE m.need_id = ? AND m.score >= ? AND s.status = 'ACTIVE' AND b.status IN ('ACTIVE', 'VERIFIED')
       ORDER BY m.score DESC
       LIMIT ?`,
      [needId, minScore, limit]
    );

    // In a production environment, we might want to attach the explanations array here 
    // by re-running the engine or fetching persisted JSON explanations.
    
    return rows;
  }

  /**
   * Retrieves paginated matches for a specific service (who needs this service).
   * @param {number|string} serviceId 
   * @param {object} query 
   */
  async getMatchesForService(serviceId, { minScore = 0.3, limit = 20 }) {
    const [rows] = await pool.query(
      `SELECT 
         m.match_id, m.score, m.generated_at,
         n.need_id, n.title AS need_title, n.budget_min, n.budget_max, n.deadline,
         b.business_id, b.name AS business_name, b.slug AS business_slug, b.city, b.state, b.country, b.status AS business_status,
         c.name AS category_name
       FROM matches m
       JOIN needs n ON m.need_id = n.need_id
       JOIN businesses b ON n.business_id = b.business_id
       LEFT JOIN categories c ON n.category_id = c.category_id
       WHERE m.service_id = ? AND m.score >= ? AND b.status IN ('ACTIVE', 'VERIFIED')
       ORDER BY m.score DESC
       LIMIT ?`,
      [serviceId, minScore, limit]
    );
    return rows;
  }
}

module.exports = new MatchService();
