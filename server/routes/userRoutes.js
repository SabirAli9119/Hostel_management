const express = require('express');
const users = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/profile', users.getProfile);
router.put('/profile', users.updateProfile);
router.get('/dashboard', authorize('user'), users.getDashboard);

module.exports = router;
