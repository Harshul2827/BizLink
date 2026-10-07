const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Signs a payload to generate a JWT token.
 * @param {object} payload 
 * @param {object} options 
 * @returns {string}
 */
function signToken(payload, options = {}) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    ...options
  });
}

/**
 * Verifies and decodes a JWT token.
 * @param {string} token 
 * @returns {object}
 */
function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

module.exports = {
  signToken,
  verifyToken
};
