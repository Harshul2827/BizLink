/**
 * Deterministic Rule-Based Matching Engine.
 * Computes compatibility scores (0.0000 to 1.0000) and human-readable match explanations.
 */
class MatchingEngine {
  /**
   * Calculates a match score and detailed explanation between a Need and a Service.
   * @param {object} need - Need object with posting business details
   * @param {object} service - Service object with offering business details
   * @returns {{ score: number, explanations: string[], factors: object }}
   */
  evaluateNeedAndService(need, service) {
    let earnedPoints = 0;
    const explanations = [];
    const factors = {};

    // Factor 1: Category Match (Max 40 points)
    if (need.category_id && service.category_id && Number(need.category_id) === Number(service.category_id)) {
      earnedPoints += 40;
      factors.category = { matched: true, score: 0.40 };
      explanations.push('Service category directly satisfies the required need');
    } else {
      factors.category = { matched: false, score: 0.00 };
    }

    // Factor 2: Budget & Price Compatibility (Max 30 points)
    const needBudgetMin = need.budget_min !== null ? Number(need.budget_min) : null;
    const needBudgetMax = need.budget_max !== null ? Number(need.budget_max) : null;
    const servicePriceMin = service.price_min !== null ? Number(service.price_min) : null;
    const servicePriceMax = service.price_max !== null ? Number(service.price_max) : null;

    if (needBudgetMin !== null && needBudgetMax !== null && servicePriceMin !== null && servicePriceMax !== null) {
      if (servicePriceMin <= needBudgetMax && servicePriceMax >= needBudgetMin) {
        earnedPoints += 30;
        factors.budget = { matched: true, score: 0.30 };
        explanations.push(`Pricing ($${servicePriceMin} - $${servicePriceMax}) fits comfortably within need budget ($${needBudgetMin} - $${needBudgetMax})`);
      } else if (servicePriceMin <= needBudgetMax) {
        earnedPoints += 15;
        factors.budget = { matched: 'partial', score: 0.15 };
        explanations.push('Minimum price threshold overlaps with the target budget');
      } else {
        factors.budget = { matched: false, score: 0.00 };
      }
    } else {
      // Neutral budget compatibility when bounds are open/flexible
      earnedPoints += 15;
      factors.budget = { matched: 'flexible', score: 0.15 };
      explanations.push('Flexible pricing and budget specifications');
    }

    // Factor 3: Location Proximity (Max 15 points)
    const nCity = need.business_city ? need.business_city.toLowerCase().trim() : '';
    const sCity = service.business_city ? service.business_city.toLowerCase().trim() : '';
    const nState = need.business_state ? need.business_state.toLowerCase().trim() : '';
    const sState = service.business_state ? service.business_state.toLowerCase().trim() : '';
    const nCountry = need.business_country ? need.business_country.toLowerCase().trim() : '';
    const sCountry = service.business_country ? service.business_country.toLowerCase().trim() : '';

    if (nCity && sCity && nCity === sCity) {
      earnedPoints += 15;
      factors.location = { matched: 'city', score: 0.15 };
      explanations.push(`Both businesses are located in ${need.business_city}`);
    } else if (nState && sState && nState === sState) {
      earnedPoints += 10;
      factors.location = { matched: 'state', score: 0.10 };
      explanations.push(`Both businesses operate within ${need.business_state}`);
    } else if (nCountry && sCountry && nCountry === sCountry) {
      earnedPoints += 5;
      factors.location = { matched: 'country', score: 0.05 };
      explanations.push(`Both businesses operate within ${need.business_country}`);
    } else {
      factors.location = { matched: 'remote', score: 0.00 };
    }

    // Factor 4: Business Verification & Status (Max 15 points)
    if (service.business_status === 'VERIFIED') {
      earnedPoints += 15;
      factors.trust = { matched: 'verified', score: 0.15 };
      explanations.push('Service provider is a verified business on BizLink');
    } else if (service.business_status === 'ACTIVE') {
      earnedPoints += 10;
      factors.trust = { matched: 'active', score: 0.10 };
      explanations.push('Service provider is an active business partner');
    } else {
      factors.trust = { matched: false, score: 0.00 };
    }

    const finalScore = Number((earnedPoints / 100).toFixed(4));

    return {
      score: finalScore,
      explanations,
      factors
    };
  }
}

module.exports = new MatchingEngine();
