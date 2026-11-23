const rateLimit = require('express-rate-limit');

const make = (windowMs, limit, message, extra = {}) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message },
    ...extra,
  });

const MIN = 60 * 1000;

module.exports = {
  apiLimiter: make(15 * MIN, 600, 'Too many requests. Please slow down and try again shortly.'),
  loginLimiter: make(15 * MIN, 10, 'Too many sign-in attempts. Try again in 15 minutes.', { skipSuccessfulRequests: true }),
  registerLimiter: make(60 * MIN, 20, 'Too many accounts created from this network. Try again later.'),
  // The DOB reset is guessable, so it is the strictest limiter.
  resetLimiter: make(15 * MIN, 5, 'Too many password reset attempts. Try again in 15 minutes.'),
};
