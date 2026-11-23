const User = require('../models/User');
const { ROOM_FIELDS } = require('../config/constants');

// The shape the frontend expects: user with assignedRoom populated, no password.
const loadUserWithRoom = (id) => User.findById(id).populate('assignedRoom', ROOM_FIELDS);

module.exports = { loadUserWithRoom };
