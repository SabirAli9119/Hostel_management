const express = require('express');
const auth = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginLimiter, registerLimiter, resetLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/register', registerLimiter, auth.register);
router.post('/login', loginLimiter, auth.login);
router.post('/logout', auth.logout);
router.post('/reset-password', resetLimiter, auth.resetPassword);
router.get('/me', protect, auth.me);
router.post('/change-password', protect, auth.changePassword);

module.exports = router;
