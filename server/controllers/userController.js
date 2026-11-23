const Request = require('../models/Request');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { loadUserWithRoom } = require('../utils/userHelpers');
const { validateProfile } = require('../utils/validators');

// GET /api/users/profile
exports.getProfile = asyncHandler(async (req, res) => {
  res.json({ user: await loadUserWithRoom(req.user._id) });
});

// PUT /api/users/profile  (only fullName, phone, gender; role/status/room can never be changed here)
exports.updateProfile = asyncHandler(async (req, res) => {
  const values = validateProfile(req.body);
  await User.updateOne({ _id: req.user._id }, { $set: values }, { runValidators: true });
  res.json({ user: await loadUserWithRoom(req.user._id) });
});

// GET /api/users/dashboard  (resident request statistics)
exports.getDashboard = asyncHandler(async (req, res) => {
  const [grouped, recentRequests] = await Promise.all([
    Request.aggregate([{ $match: { user: req.user._id } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Request.find({ user: req.user._id }).sort('-createdAt').limit(5).lean(),
  ]);
  const by = Object.fromEntries(grouped.map((g) => [g._id, g.count]));
  res.json({
    stats: {
      totalRequests: grouped.reduce((sum, g) => sum + g.count, 0),
      pendingRequests: by.Pending || 0,
      inProgressRequests: by['In Progress'] || 0,
      resolvedRequests: by.Resolved || 0,
      rejectedRequests: by.Rejected || 0,
    },
    recentRequests,
  });
});
