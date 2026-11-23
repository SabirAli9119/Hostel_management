const Room = require('../models/Room');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, paginationMeta } = require('../utils/pagination');
const { qs, searchRegex, pickEnum } = require('../utils/query');
const { validateRoom, isObjectId } = require('../utils/validators');
const { assignUserToRoom, removeUserFromRoom } = require('../utils/roomAllocation');
const { ROOM_TYPES, ROOM_STATUSES } = require('../config/constants');

const withResidents = (id) => Room.findById(id).populate('assignedUsers', 'fullName username phone').lean();

// GET /api/admin/rooms?search=&roomType=&status=&availability=&floor=&page=&limit=
const listRooms = asyncHandler(async (req, res) => {
  const filter = {};
  if (qs(req.query.search)) filter.roomNumber = searchRegex(req.query.search);
  const roomType = pickEnum(req.query.roomType, ROOM_TYPES);
  if (roomType) filter.roomType = roomType;
  const status = pickEnum(req.query.status, ROOM_STATUSES);
  if (status) filter.status = status;
  if (req.query.availability === 'available') filter.availableBeds = { $gt: 0 };
  if (req.query.availability === 'full') filter.availableBeds = 0;
  if (qs(req.query.floor) !== '' && Number.isInteger(Number(req.query.floor))) filter.floor = Number(req.query.floor);

  const { page, limit, skip } = getPagination(req.query);
  const [rooms, total] = await Promise.all([
    Room.find(filter)
      .collation({ locale: 'en', numericOrdering: true })
      .sort({ floor: 1, roomNumber: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Room.countDocuments(filter),
  ]);
  res.json({ rooms, pagination: paginationMeta(page, limit, total) });
});

// POST /api/admin/rooms
const createRoom = asyncHandler(async (req, res) => {
  const v = validateRoom(req.body);
  const room = await Room.create({ ...v, assignedUsers: [] });
  res.status(201).json({ room });
});

// GET /api/admin/rooms/:id
const getRoom = asyncHandler(async (req, res) => {
  const room = await withResidents(req.params.id);
  if (!room) throw new AppError(404, 'Room not found.');
  res.json({ room });
});

// PUT /api/admin/rooms/:id
const updateRoom = asyncHandler(async (req, res) => {
  const v = validateRoom(req.body);
  const room = await Room.findById(req.params.id);
  if (!room) throw new AppError(404, 'Room not found.');

  const typeChanged = v.roomType !== room.roomType;
  if (typeChanged && room.occupancy > 0) {
    throw new AppError(409, 'Room type cannot change while residents are assigned.', { roomType: 'Remove the residents first' });
  }
  if (v.capacity < room.occupancy) {
    throw new AppError(400, 'Capacity cannot be lower than the current occupancy.', {
      capacity: `Capacity cannot be lower than the ${room.occupancy} current residents`,
    });
  }

  // One atomic update. The filter re-checks occupancy so a simultaneous assignment cannot slip past.
  const updated = await Room.findOneAndUpdate(
    { _id: room._id, occupancy: typeChanged ? 0 : { $lte: v.capacity } },
    [
      {
        $set: {
          roomNumber: v.roomNumber,
          floor: v.floor,
          roomType: v.roomType,
          capacity: v.capacity,
          status: v.status,
          availableBeds: { $subtract: [v.capacity, '$occupancy'] },
        },
      },
    ],
    { new: true }
  );
  if (!updated) throw new AppError(409, 'The room was just assigned a resident. Refresh and try again.');
  res.json({ room: await withResidents(updated._id) });
});

// DELETE /api/admin/rooms/:id  (empty rooms only)
const deleteRoom = asyncHandler(async (req, res) => {
  const result = await Room.deleteOne({ _id: req.params.id, occupancy: 0, 'assignedUsers.0': { $exists: false } });
  if (!result.deletedCount) {
    const exists = await Room.exists({ _id: req.params.id });
    throw exists ? new AppError(409, 'Remove all residents before deleting this room.') : new AppError(404, 'Room not found.');
  }
  res.json({ message: 'Room deleted.' });
});

// POST /api/admin/rooms/:id/assign-user  { userId }
// Also moves a resident who is already in another room (the old bed is released).
const assignUser = asyncHandler(async (req, res) => {
  if (!isObjectId(req.body.userId)) throw new AppError(400, 'A valid userId is required.');
  await assignUserToRoom(req.params.id, req.body.userId);
  res.json({ room: await withResidents(req.params.id) });
});

// POST /api/admin/rooms/:id/remove-user  { userId }
const removeUser = asyncHandler(async (req, res) => {
  if (!isObjectId(req.body.userId)) throw new AppError(400, 'A valid userId is required.');
  await removeUserFromRoom(req.params.id, req.body.userId);
  res.json({ room: await withResidents(req.params.id) });
});

module.exports = { listRooms, createRoom, getRoom, updateRoom, deleteRoom, assignUser, removeUser };
