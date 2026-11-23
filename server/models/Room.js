const mongoose = require('mongoose');
const { ROOM_TYPES, ROOM_STATUSES, FIXED_CAPACITY } = require('../config/constants');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: [true, 'Room number is required'], unique: true, uppercase: true, trim: true, maxlength: 10 },
    floor: { type: Number, required: [true, 'Floor is required'], min: 0, max: 50, validate: { validator: Number.isInteger, message: 'Floor must be a whole number' } },
    roomType: { type: String, enum: ROOM_TYPES, required: [true, 'Room type is required'] },
    capacity: { type: Number, required: [true, 'Capacity is required'], min: 1, max: 200, validate: { validator: Number.isInteger, message: 'Capacity must be a whole number' } },
    occupancy: { type: Number, default: 0, min: 0 },
    availableBeds: { type: Number, min: 0 },
    assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ROOM_STATUSES, default: 'active' },
  },
  { timestamps: true }
);

roomSchema.index({ roomType: 1, status: 1, availableBeds: 1 });
roomSchema.index({ floor: 1, roomNumber: 1 });

// Keeps capacity rules and the derived counters consistent on create/save.
roomSchema.pre('validate', function checkRoom() {
  const fixed = FIXED_CAPACITY[this.roomType];
  if (fixed && this.capacity !== fixed) this.invalidate('capacity', `${this.roomType} rooms have a capacity of ${fixed}`);
  if (this.roomType === 'More Than 3 Sharing' && this.capacity < 4) {
    this.invalidate('capacity', 'Capacity must be 4 or more for this room type');
  }
  this.occupancy = this.assignedUsers.length;
  if (this.occupancy > this.capacity) this.invalidate('capacity', 'Capacity cannot be lower than the current occupancy');
  this.availableBeds = Math.max(this.capacity - this.occupancy, 0);
});

roomSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Room', roomSchema);
