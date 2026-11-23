const Room = require('../models/Room');
const User = require('../models/User');
const AppError = require('./AppError');

/*
 * Room allocation without transactions (works on a standalone local MongoDB).
 * Each step is a single atomic, conditional update, so two admins clicking at the
 * same moment can never overbook a room or put a resident in two rooms:
 *   1. claim a bed:   push the user, occupancy+1, availableBeds-1, ONLY IF the room is
 *                     active, the same type, the user is not in it and occupancy < capacity
 *   2. point the user at the room, ONLY IF their assignedRoom is still what we read
 *   3. release the bed in their previous room (when changing rooms)
 * If step 2 loses a race, step 1 is rolled back.
 */

const releaseBed = (roomId, userId) =>
  Room.updateOne(
    { _id: roomId, assignedUsers: userId },
    { $pull: { assignedUsers: userId }, $inc: { occupancy: -1, availableBeds: 1 } }
  );

async function assignUserToRoom(roomId, userId) {
  const user = await User.findOne({ _id: userId, role: 'user' });
  if (!user) throw new AppError(404, 'Resident not found.');
  if (user.status !== 'active') throw new AppError(400, 'Activate this resident before assigning a room.');

  const target = await Room.findById(roomId);
  if (!target) throw new AppError(404, 'Room not found.');
  if (target.status !== 'active') throw new AppError(400, 'This room is inactive and cannot receive residents.');
  if (target.roomType !== user.roomType) {
    throw new AppError(400, `This resident asked for a ${user.roomType} room, but room ${target.roomNumber} is ${target.roomType}.`);
  }
  if (user.assignedRoom && String(user.assignedRoom) === String(target._id)) {
    throw new AppError(409, 'This resident is already in that room.');
  }
  if (target.occupancy >= target.capacity) throw new AppError(409, `Room ${target.roomNumber} is full.`);

  const previousRoomId = user.assignedRoom || null;

  const claimed = await Room.findOneAndUpdate(
    {
      _id: target._id,
      status: 'active',
      roomType: user.roomType,
      assignedUsers: { $ne: user._id },
      $expr: { $lt: ['$occupancy', '$capacity'] },
    },
    { $push: { assignedUsers: user._id }, $inc: { occupancy: 1, availableBeds: -1 } },
    { new: true }
  );
  if (!claimed) throw new AppError(409, 'That room just became full or unavailable. Pick another room.');

  const updated = await User.findOneAndUpdate(
    { _id: user._id, assignedRoom: previousRoomId },
    { assignedRoom: claimed._id },
    { new: true }
  );
  if (!updated) {
    await releaseBed(claimed._id, user._id); // roll back step 1
    throw new AppError(409, 'This resident was changed by someone else. Refresh and try again.');
  }

  if (previousRoomId) await releaseBed(previousRoomId, user._id);
  return claimed;
}

async function removeUserFromRoom(roomId, userId) {
  const room = await Room.findOneAndUpdate(
    { _id: roomId, assignedUsers: userId },
    { $pull: { assignedUsers: userId }, $inc: { occupancy: -1, availableBeds: 1 } },
    { new: true }
  );
  if (!room) throw new AppError(400, 'This resident is not assigned to that room.');
  await User.updateOne({ _id: userId, assignedRoom: roomId }, { assignedRoom: null });
  return room;
}

module.exports = { assignUserToRoom, removeUserFromRoom, releaseBed };
