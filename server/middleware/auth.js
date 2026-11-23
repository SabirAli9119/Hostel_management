const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { clearAuthCookie } = require('../utils/generateToken');

// Authentication: reads the HttpOnly cookie, verifies the JWT, loads a fresh user.
const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies && req.cookies.token;
  if (!token) throw new AppError(401, 'Please sign in to continue.');

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    clearAuthCookie(res);
    throw new AppError(401, 'Your session has expired. Please sign in again.');
  }

  const user = await User.findById(decoded.id).select('+passwordChangedAt');
  if (!user) {
    clearAuthCookie(res);
    throw new AppError(401, 'This account no longer exists.');
  }
  if (user.status !== 'active') {
    clearAuthCookie(res);
    throw new AppError(401, 'Your account is inactive. Please contact the warden.');
  }
  if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
    clearAuthCookie(res);
    throw new AppError(401, 'Your password was changed. Please sign in again.');
  }

  req.user = user;
  next();
});

// Authorization: role check, always runs after protect.
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError(403, 'You do not have permission to do this.'));
  }
  return next();
};

module.exports = { protect, authorize };
