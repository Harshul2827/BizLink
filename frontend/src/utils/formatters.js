/**
 * formatters.js
 * Standardized formatting helpers for amounts, currencies, and dates across BizLink.
 */

/**
 * Format a number into standard USD currency string ($1,250 or $1,250.50).
 * @param {number|string|null|undefined} amount 
 * @param {boolean} [showCents=false]
 * @returns {string}
 */
export function formatCurrency(amount, showCents = false) {
  if (amount == null || amount === '') return '';
  const num = Number(amount);
  if (isNaN(num)) return '';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? (num % 1 !== 0 ? 2 : 0) : 0,
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * Format a price range cleanly.
 * Examples:
 * - min & max: "$1,500 - $3,500"
 * - min only: "From $1,500"
 * - max only: "Up to $3,500"
 * - neither: "Custom Pricing"
 * @param {number|string|null|undefined} min 
 * @param {number|string|null|undefined} max 
 * @param {string} [fallback='Custom Pricing']
 * @returns {string}
 */
export function formatPriceRange(min, max, fallback = 'Custom Pricing') {
  const hasMin = min != null && min !== '';
  const hasMax = max != null && max !== '';

  if (hasMin && hasMax) {
    if (Number(min) === Number(max)) {
      return formatCurrency(min);
    }
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  }
  if (hasMin) return `From ${formatCurrency(min)}`;
  if (hasMax) return `Up to ${formatCurrency(max)}`;
  return fallback;
}

/**
 * Format a budget range cleanly.
 * Examples:
 * - min & max: "Budget: $10,000 - $25,000"
 * - min only: "Budget: From $10,000"
 * - max only: "Budget: Up to $25,000"
 * - neither: "Budget: Flexible"
 * @param {number|string|null|undefined} min 
 * @param {number|string|null|undefined} max 
 * @param {string} [fallback='Flexible']
 * @returns {string}
 */
export function formatBudgetRange(min, max, fallback = 'Flexible') {
  const hasMin = min != null && min !== '';
  const hasMax = max != null && max !== '';

  if (hasMin && hasMax) {
    if (Number(min) === Number(max)) {
      return `Budget: ${formatCurrency(min)}`;
    }
    return `Budget: ${formatCurrency(min)} - ${formatCurrency(max)}`;
  }
  if (hasMin) return `Budget: From ${formatCurrency(min)}`;
  if (hasMax) return `Budget: Up to ${formatCurrency(max)}`;
  return `Budget: ${fallback}`;
}

/**
 * Format a date string into a localized human-readable date (e.g. "Nov 10, 2026").
 * Handles Date objects, ISO strings ("2026-11-10T00:00:00.000Z"), and DATE strings ("2026-11-10").
 * @param {string|Date|null|undefined} dateInput 
 * @param {object} [options]
 * @returns {string}
 */
export function formatDate(dateInput, options = {}) {
  if (!dateInput) return '';

  let d;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    // Prevent timezone skew on pure YYYY-MM-DD
    const [year, month, day] = dateInput.split('-').map(Number);
    d = new Date(year, month - 1, day);
  } else {
    d = new Date(dateInput);
  }

  if (isNaN(d.getTime())) {
    return String(dateInput).slice(0, 10);
  }

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  return d.toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

/**
 * Safely format a date input value for <input type="date" /> ("YYYY-MM-DD").
 * @param {string|Date|null|undefined} dateInput 
 * @returns {string}
 */
export function toDateInputValue(dateInput) {
  if (!dateInput) return '';
  if (typeof dateInput === 'string') {
    return dateInput.slice(0, 10);
  }
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return dateInput.toISOString().slice(0, 10);
  }
  return '';
}

