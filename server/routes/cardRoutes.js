const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const cardController = require('../controllers/cardController');
const auth = require('../middleware/auth');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const createCardValidation = [
  body('column_id').isInt({ min: 1 }).withMessage('column_id wajib berupa angka positif'),
  body('title').isString().trim().notEmpty().withMessage('Judul card wajib diisi'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority harus low, medium, atau high'),
];

const updateCardValidation = [
  body('title').optional().isString().trim().notEmpty().withMessage('Judul card tidak boleh kosong'),
  body('column_id').optional().isInt({ min: 1 }).withMessage('column_id wajib berupa angka positif'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority harus low, medium, atau high'),
  body('is_completed').optional().isBoolean().withMessage('is_completed harus berupa boolean'),
];

router.post('/', auth, createCardValidation, validate, cardController.createCard);
router.get('/column/:columnId', auth, cardController.getCardsByColumn);
router.put('/:id', auth, updateCardValidation, validate, cardController.updateCard);
router.delete('/:id', auth, cardController.deleteCard);

router.post('/:id/comments', auth, cardController.addComment);
router.get('/:id/comments', auth, cardController.getComments);
module.exports = router;
