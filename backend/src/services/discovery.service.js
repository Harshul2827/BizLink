const discoveryRepository = require('../repositories/discovery.repository');

class DiscoveryService {
  /**
   * Search and filter businesses for discovery.
   * @param {object} filters 
   */
  async searchBusinesses(filters) {
    return discoveryRepository.searchBusinesses(filters);
  }

  /**
   * Search and filter active services across businesses.
   * @param {object} filters 
   */
  async searchServices(filters) {
    return discoveryRepository.searchServices(filters);
  }

  /**
   * Search and filter active needs across businesses.
   * @param {object} filters 
   */
  async searchNeeds(filters) {
    return discoveryRepository.searchNeeds(filters);
  }
}

module.exports = new DiscoveryService();
