const AppError = require('../utils/AppError');

const allowedOrigins = () =>
  (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

// A few standard hardening headers (no extra dependency needed for an API).
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setHeader('Cache-Control', 'no-store');
  next();
};

const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    // No Origin header = same-origin, curl or Postman.
    if (!origin || allowedOrigins().includes(origin)) return callback(null, true);
    return callback(new AppError(403, 'This origin is not allowed.'));
  },
};

// CSRF defence in depth: reject state-changing calls from foreign origins.
const originCheck = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (origin && !allowedOrigins().includes(origin)) return next(new AppError(403, 'Request origin is not allowed.'));
  return next();
};

module.exports = { securityHeaders, corsOptions, originCheck };
