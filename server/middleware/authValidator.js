// middleware/authValidator.js
const { body } = require('express-validator');
exports.registerValidation = [
    body('email').isEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
];
