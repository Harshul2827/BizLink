const analyticsRepository = require('../repositories/analytics.repository');

class AnalyticsService {
  /**
   * Retrieves overall platform performance summary.
   */
  async getOverview() {
    const [overview, categories, locations] = await Promise.all([
      analyticsRepository.getPlatformOverview(),
      analyticsRepository.getBusinessesByCategory(),
      analyticsRepository.getBusinessesByLocation()
    ]);

    return {
      kpi_summary: overview,
      top_categories: categories.slice(0, 10),
      top_locations: locations.slice(0, 10)
    };
  }

  /**
   * Retrieves collaboration trends and duration metrics.
   */
  async getCollaborationAnalytics() {
    return analyticsRepository.getCollaborationMetrics();
  }

  /**
   * Retrieves trust, verification, and rating analytics.
   */
  async getTrustAnalytics() {
    return analyticsRepository.getTrustMetrics();
  }

  /**
   * Retrieves monthly platform growth data.
   */
  async getGrowthAnalytics() {
    return analyticsRepository.getGrowthTrends();
  }

  /**
   * Runs data cleaning and integrity audit checks.
   */
  async runAudit() {
    return analyticsRepository.runDataIntegrityAudit();
  }
}

module.exports = new AnalyticsService();
