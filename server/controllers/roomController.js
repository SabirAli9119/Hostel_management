const Room = require('../models/Room');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { listRooms: adminListRooms } = require('./adminRoomController');

// GET /api/rooms  (resident: only their own room; admin: the full paginated list)
exports.listRooms = (req, res, next) => {
  if (req.user.role === 'admin') return adminListRooms(req, res, next);
  return asyncHandler(async () => {
    const rooms = req.user.assignedRoom ? [await Room.findById(req.user.assignedRoom).lean()] : [];
    res.json({ rooms: rooms.filter(Boolean) });
  })(req, res, next);
};

// GET /api/rooms/:id  (a resident may only open the room they are assigned to)
exports.getRoom = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin && String(req.user.assignedRoom) !== req.params.id) throw new AppError(404, 'Room not found.');

  // Roommates only expose their names to other residents.
  const room = await Room.findById(req.params.id)
    .populate('assignedUsers', isAdmin ? 'fullName username phone' : 'fullName')
    .lean();
  if (!room) throw new AppError(404, 'Room not found.');
  res.json({ room });
});
