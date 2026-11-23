const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { setAuthCookie, clearAuthCookie } = require('../utils/generateToken');
const { loadUserWithRoom } = require('../utils/userHelpers');
const { validateRegister, validateReset, validateChangePassword } = require('../utils/validators');

// Compared against when the username does not exist, so response time does not reveal it.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const v = validateRegister(req.body);

  if (await User.exists({ username: v.username })) {
    throw new AppError(409, 'That username is already taken.', { username: 'That username is already taken' });
  }

  // Role and status are set here, never read from the request body.
  await User.create({
    fullName: v.fullName,
    username: v.username,
    dob: v.dob,
    gender: v.gender,
    phone: v.phone,
    roomType: v.roomType,
    password: v.password,
    role: 'user',
    status: 'active',
    assignedRoom: null,
  });

  res.status(201).json({ message: 'Account created. You can sign in now.' });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const username = typeof req.body.username === 'string' ? req.body.username.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!username || !password) throw new AppError(400, 'Enter your username and password.');

  const user = await User.findOne({ username }).select('+password');
  const matches = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
  if (!user || !matches) throw new AppError(401, 'Invalid username or password.');
  if (user.status !== 'active') throw new AppError(403, 'Your account is inactive. Please contact the warden.');

  setAuthCookie(res, user._id);
  res.json({ user: await loadUserWithRoom(user._id) });
});

// POST /api/auth/logout
exports.logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'You have been signed out.' });
};

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  res.json({ user: await loadUserWithRoom(req.user._id) });
});

// POST /api/auth/reset-password  (username + date of birth, no email/OTP)
exports.resetPassword = asyncHandler(async (req, res) => {
  const { username, dob, newPassword } = validateReset(req.body);

  // One generic message for every failure, so a username can never be probed.
  const generic = new AppError(400, 'The username or date of birth is incorrect.');

  const user = await User.findOne({ username });
  // Admin accounts cannot be reset with a date of birth.
  if (!user || user.role !== 'user') {
    await bcrypt.compare(newPassword, DUMMY_HASH);
    throw generic;
  }
  if (user.dob.toISOString().slice(0, 10) !== dob) throw generic;

  user.password = newPassword; // hashed by the model's pre-save hook
  await user.save();
  res.json({ message: 'Password updated. You can sign in with your new password.' });
});

// POST /api/auth/change-password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = validateChangePassword(req.body);

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError(400, 'Your current password is incorrect.', { currentPassword: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();
  setAuthCookie(res, user._id); // fresh token; older tokens are now invalid
  res.json({ message: 'Password updated.' });
});
