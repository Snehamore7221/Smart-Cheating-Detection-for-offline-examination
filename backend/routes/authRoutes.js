const express = require('express');
const router = express.Router();
const { registerFaculty, loginFaculty, getMe } = require('../controllers/authController');
const { protectFaculty } = require('../middleware/authMiddleware');

// Faculty authentication routes
router.post('/register', registerFaculty);
router.post('/login', loginFaculty);
router.get('/me', protectFaculty, getMe);

module.exports = router;
