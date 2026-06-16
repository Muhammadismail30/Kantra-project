const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidation } = require('../middleware/authValidator');

// Route Register dengan Validasi
router.post('/register', registerValidation, authController.register);

// Route Login
router.post('/login', authController.login);

module.exports = router;