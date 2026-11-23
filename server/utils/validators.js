const AppError = require('./AppError');
const {
  ROOM_TYPES, FIXED_CAPACITY, GENDERS, REQUEST_CATEGORIES, PRIORITIES,
  REQUEST_STATUSES, ACCOUNT_STATUSES, ROOM_STATUSES,
} = require('../config/constants');

const USERNAME = /^[a-zA-Z0-9_]{4,20}$/;
const PHONE = /^\+?[0-9]{10,13}$/;
const NAME = /^[A-Za-z .'-]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ROOM_NUMBER = /^[A-Za-z0-9 _\-/]{1,10}$/;

// Only plain strings are accepted; objects/arrays (NoSQL injection attempts) become ''.
const s = (v) => (typeof v === 'string' ? v.trim() : '');
const raw = (v) => (typeof v === 'string' ? v : '');
const has = (b, k) => Object.prototype.hasOwnProperty.call(b, k);
const toInt = (v) =>
  typeof v === 'number' || (typeof v === 'string' && v.trim() !== '') ? Number(v) : NaN;

const put = (errors, key, msg) => {
  if (msg) errors[key] = msg;
};
const finish = (errors) => {
  if (Object.keys(errors).length) throw new AppError(400, 'Please correct the highlighted fields.', errors);
};

const nameErr = (v) =>
  !v ? 'Enter the full name'
  : v.length < 3 ? 'Name must be at least 3 characters'
  : v.length > 60 ? 'Name must be 60 characters or fewer'
  : !NAME.test(v) ? "Use letters, spaces and . ' - only" : '';

const normalizePhone = (v) => v.replace(/[\s-]/g, '');
const phoneErr = (v) =>
  !v ? 'Enter a phone number' : !PHONE.test(v) ? 'Enter a valid phone number (10–13 digits)' : '';

const passwordErr = (v) =>
  !v ? 'Enter a password'
  : v.length < 8 ? 'Use at least 8 characters'
  : v.length > 72 ? 'Password must be 72 characters or fewer'
  : !/[a-z]/.test(v) || !/[A-Z]/.test(v) || !/[0-9]/.test(v)
    ? 'Include an upper case letter, a lower case letter and a number' : '';

const enumErr = (v, list, label) => (list.includes(v) ? '' : `Select a valid ${label}`);

// "YYYY-MM-DD" -> { date } or { error }. Stored as UTC midnight.
const parseDob = (v) => {
  if (!DATE.test(v)) return { error: 'Enter a valid date of birth' };
  const d = new Date(`${v}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) return { error: 'Enter a valid date of birth' };
  if (d > new Date()) return { error: 'Date of birth cannot be in the future' };
  if (d.getUTCFullYear() < 1940) return { error: 'Enter a valid date of birth' };
  return { date: d };
};

const validateRegister = (b = {}) => {
  const errors = {};
  const v = {
    fullName: s(b.fullName),
    username: s(b.username).toLowerCase(),
    gender: s(b.gender),
    phone: normalizePhone(s(b.phone)),
    roomType: s(b.roomType),
    password: raw(b.password),
  };
  const confirmPassword = raw(b.confirmPassword);
  put(errors, 'fullName', nameErr(v.fullName));
  put(errors, 'username', !v.username ? 'Choose a username' : !USERNAME.test(v.username) ? '4–20 characters: letters, numbers or underscore' : '');
  const dob = parseDob(s(b.dob));
  put(errors, 'dob', dob.error);
  put(errors, 'gender', enumErr(v.gender, GENDERS, 'gender'));
  put(errors, 'phone', phoneErr(v.phone));
  put(errors, 'roomType', enumErr(v.roomType, ROOM_TYPES, 'room type'));
  put(errors, 'password', passwordErr(v.password));
  put(errors, 'confirmPassword', !confirmPassword ? 'Confirm the password' : confirmPassword !== v.password ? 'Passwords do not match' : '');
  finish(errors);
  return { ...v, dob: dob.date };
};

const validateReset = (b = {}) => {
  const errors = {};
  const username = s(b.username).toLowerCase();
  const dob = s(b.dob);
  const newPassword = raw(b.newPassword);
  const confirmPassword = raw(b.confirmPassword);
  put(errors, 'username', username ? '' : 'Enter your username');
  put(errors, 'dob', parseDob(dob).error);
  put(errors, 'newPassword', passwordErr(newPassword));
  put(errors, 'confirmPassword', !confirmPassword ? 'Confirm the password' : confirmPassword !== newPassword ? 'Passwords do not match' : '');
  finish(errors);
  return { username, dob, newPassword };
};

const validateChangePassword = (b = {}) => {
  const errors = {};
  const currentPassword = raw(b.currentPassword);
  const newPassword = raw(b.newPassword);
  const confirmPassword = raw(b.confirmPassword);
  put(errors, 'currentPassword', currentPassword ? '' : 'Enter your current password');
  put(errors, 'newPassword', passwordErr(newPassword) || (newPassword === currentPassword ? 'Choose a password you have not used here' : ''));
  put(errors, 'confirmPassword', !confirmPassword ? 'Confirm the password' : confirmPassword !== newPassword ? 'Passwords do not match' : '');
  finish(errors);
  return { currentPassword, newPassword };
};

// Shared by resident profile update and admin user update: only keys present are validated.
const buildPartialUser = (b, allowed) => {
  const errors = {};
  const values = {};
  if (allowed.includes('fullName') && has(b, 'fullName')) {
    values.fullName = s(b.fullName);
    put(errors, 'fullName', nameErr(values.fullName));
  }
  if (allowed.includes('phone') && has(b, 'phone')) {
    values.phone = normalizePhone(s(b.phone));
    put(errors, 'phone', phoneErr(values.phone));
  }
  if (allowed.includes('gender') && has(b, 'gender')) {
    values.gender = s(b.gender);
    put(errors, 'gender', enumErr(values.gender, GENDERS, 'gender'));
  }
  if (allowed.includes('dob') && has(b, 'dob')) {
    const dob = parseDob(s(b.dob));
    put(errors, 'dob', dob.error);
    values.dob = dob.date;
  }
  if (allowed.includes('roomType') && has(b, 'roomType')) {
    values.roomType = s(b.roomType);
    put(errors, 'roomType', enumErr(values.roomType, ROOM_TYPES, 'room type'));
  }
  if (allowed.includes('status') && has(b, 'status')) {
    values.status = s(b.status);
    put(errors, 'status', enumErr(values.status, ACCOUNT_STATUSES, 'status'));
  }
  if (!Object.keys(values).length && !Object.keys(errors).length) errors.general = 'Nothing to update';
  finish(errors);
  return values;
};

const validateProfile = (b = {}) => buildPartialUser(b, ['fullName', 'phone', 'gender']);
const validateAdminUserUpdate = (b = {}) =>
  buildPartialUser(b, ['fullName', 'phone', 'gender', 'dob', 'roomType', 'status']);

const validateRequest = (b = {}) => {
  const errors = {};
  const v = { title: s(b.title), category: s(b.category), priority: s(b.priority), description: s(b.description) };
  put(errors, 'title', !v.title ? 'Give the request a short title' : v.title.length < 5 ? 'Title must be at least 5 characters' : v.title.length > 100 ? 'Title must be 100 characters or fewer' : '');
  put(errors, 'category', enumErr(v.category, REQUEST_CATEGORIES, 'category'));
  put(errors, 'priority', enumErr(v.priority, PRIORITIES, 'priority'));
  put(errors, 'description', !v.description ? 'Describe the problem' : v.description.length < 10 ? 'Add a little more detail (at least 10 characters)' : v.description.length > 1000 ? 'Description must be 1000 characters or fewer' : '');
  finish(errors);
  return v;
};

const validateRequestUpdate = (b = {}) => {
  const errors = {};
  const v = { status: s(b.status), adminResponse: s(b.adminResponse), rejectionReason: s(b.rejectionReason) };
  put(errors, 'status', enumErr(v.status, REQUEST_STATUSES, 'status'));
  put(errors, 'adminResponse', v.adminResponse.length > 1000 ? 'Response must be 1000 characters or fewer' : '');
  put(errors, 'rejectionReason', v.status === 'Rejected' && !v.rejectionReason ? 'Give the resident a reason for rejecting' : v.rejectionReason.length > 500 ? 'Reason must be 500 characters or fewer' : '');
  finish(errors);
  return v;
};

const validateRoom = (b = {}) => {
  const errors = {};
  const roomNumber = s(b.roomNumber).toUpperCase();
  const floor = toInt(b.floor);
  const roomType = s(b.roomType);
  const status = has(b, 'status') ? s(b.status) : 'active';
  put(errors, 'roomNumber', !roomNumber ? 'Enter the room number' : !ROOM_NUMBER.test(roomNumber) ? 'Use up to 10 letters, numbers, spaces or - _ /' : '');
  put(errors, 'floor', !Number.isInteger(floor) || floor < 0 || floor > 50 ? 'Enter a floor between 0 and 50' : '');
  put(errors, 'roomType', enumErr(roomType, ROOM_TYPES, 'room type'));
  put(errors, 'status', enumErr(status, ROOM_STATUSES, 'status'));

  let capacity = toInt(b.capacity);
  const fixed = FIXED_CAPACITY[roomType];
  if (fixed) {
    if (Number.isNaN(capacity)) capacity = fixed;
    put(errors, 'capacity', capacity !== fixed ? `${roomType} rooms have a capacity of ${fixed}` : '');
  } else if (roomType === 'More Than 3 Sharing') {
    put(errors, 'capacity', !Number.isInteger(capacity) || capacity < 4 ? 'Capacity must be 4 or more for this room type' : capacity > 200 ? 'Capacity cannot exceed 200' : '');
  }
  finish(errors);
  return { roomNumber, floor, roomType, capacity, status };
};

const isObjectId = (v) => typeof v === 'string' && /^[a-f\d]{24}$/i.test(v);

module.exports = {
  validateRegister, validateReset, validateChangePassword, validateProfile, validateAdminUserUpdate,
  validateRequest, validateRequestUpdate, validateRoom, isObjectId, parseDob,
};
