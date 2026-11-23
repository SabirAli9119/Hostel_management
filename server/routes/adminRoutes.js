const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const dashboard = require('../controllers/adminDashboardController');
const adminUsers = require('../controllers/adminUserController');
const adminRooms = require('../controllers/adminRoomController');
const adminRequests = require('../controllers/adminRequestController');

const router = express.Router();

// Every /api/admin route requires a valid session AND the admin role.
router.use(protect, authorize('admin'));

router.get('/dashboard', dashboard.getDashboard);

router.get('/users', adminUsers.listUsers);
router.get('/users/:id', validateObjectId('id'), adminUsers.getUser);
router.put('/users/:id', validateObjectId('id'), adminUsers.updateUser);
router.delete('/users/:id', validateObjectId('id'), adminUsers.deleteUser);

router.get('/rooms', adminRooms.listRooms);
router.post('/rooms', adminRooms.createRoom);
router.get('/rooms/:id', validateObjectId('id'), adminRooms.getRoom);
router.put('/rooms/:id', validateObjectId('id'), adminRooms.updateRoom);
router.delete('/rooms/:id', validateObjectId('id'), adminRooms.deleteRoom);
router.post('/rooms/:id/assign-user', validateObjectId('id'), adminRooms.assignUser);
router.post('/rooms/:id/remove-user', validateObjectId('id'), adminRooms.removeUser);

router.get('/requests', adminRequests.listRequests);
router.get('/requests/:id', validateObjectId('id'), adminRequests.getRequest);
router.put('/requests/:id', validateObjectId('id'), adminRequests.updateRequest);

module.exports = router;
