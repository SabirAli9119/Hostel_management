const express = require('express');
const rooms = require('../controllers/roomController');
const { protect } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();
router.use(protect);

router.get('/', rooms.listRooms);
router.get('/:id', validateObjectId('id'), rooms.getRoom);

module.exports = router;
