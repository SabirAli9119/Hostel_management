const User = require('../models/User');
const Room = require('../models/Room');
const Request = require('../models/Request');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/admin/dashboard
// Bed figures count active rooms only, so Occupied + Available always adds up to Total.
exports.getDashboard = asyncHandler(async (req, res) => {
  const [totalUsers, activeUsers, totalRooms, occupiedRooms, availableRooms, bedTotals, requestGroups, recentRequests] =
    await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', status: 'active' }),
      Room.countDocuments(),
      Room.countDocuments({ occupancy: { $gt: 0 } }),
      Room.countDocuments({ status: 'active', availableBeds: { $gt: 0 } }),
      Room.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, totalBeds: { $sum: '$capacity' }, occupiedBeds: { $sum: '$occupancy' }, availableBeds: { $sum: '$availableBeds' } } },
      ]),
      Request.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Request.find().populate('user', 'fullName username').sort('-createdAt').limit(5).lean(),
    ]);

  const beds = bedTotals[0] || { totalBeds: 0, occupiedBeds: 0, availableBeds: 0 };
  const by = Object.fromEntries(requestGroups.map((g) => [g._id, g.count]));

  res.json({
    stats: {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      totalRooms,
      occupiedRooms,
      availableRooms,
      totalBeds: beds.totalBeds,
      occupiedBeds: beds.occupiedBeds,
      availableBeds: beds.availableBeds,
      totalRequests: requestGroups.reduce((sum, g) => sum + g.count, 0),
      pendingRequests: by.Pending || 0,
      inProgressRequests: by['In Progress'] || 0,
      resolvedRequests: by.Resolved || 0,
      rejectedRequests: by.Rejected || 0,
    },
    recentRequests,
  });
});
