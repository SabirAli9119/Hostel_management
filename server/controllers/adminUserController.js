const User = require('../models/User');
const Request = require('../models/Request');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, paginationMeta } = require('../utils/pagination');
const { qs, searchRegex, pickEnum } = require('../utils/query');
const { validateAdminUserUpdate } = require('../utils/validators');
const { releaseBed } = require('../utils/roomAllocation');
const { loadUserWithRoom } = require('../utils/userHelpers');
const { ROOM_FIELDS, ROOM_TYPES, ACCOUNT_STATUSES } = require('../config/constants');

// These endpoints only ever touch residents (role "user"), never admin accounts.

// GET /api/admin/users?search=&status=&roomType=&allocation=&page=&limit=
exports.listUsers = asyncHandler(async (req, res) => {
  const filter = { role: 'user' };
  if (qs(req.query.search)) {
    const rx = searchRegex(req.query.search);
    filter.$or = [{ fullName: rx }, { username: rx }, { phone: rx }];
  }
  const status = pickEnum(req.query.status, ACCOUNT_STATUSES);
  if (status) filter.status = status;
  const roomType = pickEnum(req.query.roomType, ROOM_TYPES);
  if (roomType) filter.roomType = roomType;
  if (req.query.allocation === 'assigned') filter.assignedRoom = { $ne: null };
  if (req.query.allocation === 'unassigned') filter.assignedRoom = null;

  const { page, limit, skip } = getPagination(req.query);
  // Residents who have waited longest for a room come first.
  const sort = req.query.allocation === 'unassigned' ? { createdAt: 1 } : { createdAt: -1 };
  const [users, total] = await Promise.all([
    User.find(filter).populate('assignedRoom', ROOM_FIELDS).sort(sort).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  res.json({ users, pagination: paginationMeta(page, limit, total) });
});

// GET /api/admin/users/:id
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'user' }).populate('assignedRoom', ROOM_FIELDS).lean();
  if (!user) throw new AppError(404, 'Resident not found.');
  const requests = await Request.find({ user: user._id }).sort('-createdAt').limit(20).lean();
  res.json({ user, requests });
});

// PUT /api/admin/users/:id  (fullName, phone, gender, dob, roomType, status; role can never be changed)
exports.updateUser = asyncHandler(async (req, res) => {
  const values = validateAdminUserUpdate(req.body);
  const current = await User.findOne({ _id: req.params.id, role: 'user' });
  if (!current) throw new AppError(404, 'Resident not found.');

  const typeChanging = values.roomType && values.roomType !== current.roomType;
  if (typeChanging && current.assignedRoom) {
    throw new AppError(409, 'Remove the resident from their room before changing the room type.', {
      roomType: 'Remove the resident from their room first',
    });
  }

  const updated = await User.findOneAndUpdate(
    { _id: current._id, role: 'user', ...(typeChanging ? { assignedRoom: null } : {}) },
    { $set: values },
    { new: true, runValidators: true }
  );
  if (!updated) throw new AppError(409, 'The resident was just assigned a room. Refresh and try again.');
  res.json({ user: await loadUserWithRoom(updated._id) });
});

// DELETE /api/admin/users/:id  (frees their bed and removes their requests)
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'user' });
  if (!user) throw new AppError(404, 'Resident not found.');

  if (user.assignedRoom) await releaseBed(user.assignedRoom, user._id);
  await Request.deleteMany({ user: user._id });
  await User.deleteOne({ _id: user._id });
  res.json({ message: 'Resident deleted.' });
});
