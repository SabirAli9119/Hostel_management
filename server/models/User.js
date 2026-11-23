const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, GENDERS, ROOM_TYPES, ACCOUNT_STATUSES } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: [true, 'Full name is required'], trim: true, minlength: 3, maxlength: 60 },
    username: {
      type: String, required: [true, 'Username is required'], unique: true, lowercase: true, trim: true,
      minlength: 4, maxlength: 20, match: [/^[a-z0-9_]+$/, 'Username may contain letters, numbers and underscore only'],
    },
    dob: { type: Date, required: [true, 'Date of birth is required'] },
    gender: { type: String, enum: GENDERS, required: [true, 'Gender is required'] },
    phone: { type: String, required: [true, 'Phone number is required'], trim: true, match: [/^\+?[0-9]{10,13}$/, 'Enter a valid phone number'] },
    // Residents choose a room type at registration. The seeded admin has none.
    roomType: { type: String, enum: ROOM_TYPES, required: function requiresRoomType() { return this.role === 'user'; } },
    assignedRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'user' },
    status: { type: String, enum: ACCOUNT_STATUSES, default: 'active' },
    passwordChangedAt: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, status: 1 });
userSchema.index({ role: 1, roomType: 1, assignedRoom: 1 });
userSchema.index({ fullName: 1 });

// Hash whenever the password is set or changed. Callers always pass the plain password.
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  // Invalidates JWTs issued before the change.
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.passwordChangedAt;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
