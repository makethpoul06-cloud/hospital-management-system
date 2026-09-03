const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

/**
 * Rate limiter for login attempts
 * Prevents brute-force attacks on the login endpoint
 * - 5 failed attempts per 15 minutes per IP
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => ipKeyGenerator(req, res),
  skip: (req) => {
    // Skip rate limiting for successful login attempts (optional)
    return false;
  }
});

/**
 * Rate limiter for strict actions
 * Prevents abuse of sensitive endpoints like password changes, refresh tokens
 * - 10 requests per 1 hour per IP
 */
const strictActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per windowMs
  message: 'Too many requests for this action. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => req.user?._id || ipKeyGenerator(req, res),
  skip: (req) => {
    // Skip rate limiting for admin users (optional)
    return req.user?.role === 'ADMIN';
  }
});

/**
 * Global API rate limiter
 * - 100 requests per 15 minutes per IP
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  loginLimiter,
  strictActionLimiter,
  globalLimiter
};
